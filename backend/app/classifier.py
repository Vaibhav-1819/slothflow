"""AI Classification and Intelligent File Renaming using local Ollama.

Communicates with locally running open-weight models (Qwen, Gemma, Llama).
Enforces structured JSON output, privacy, and safe fallbacks.
"""
import json
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
import httpx

from .config import OLLAMA_BASE_URL, DEFAULT_MODEL, CATEGORIES, RECOMMENDED_MODELS
from .security import sanitize_filename

import time

_cached_status: Optional[Dict[str, Any]] = None
_cached_time: float = 0.0

async def check_ollama_status(force_refresh: bool = False) -> Dict[str, Any]:
    """
    Checks if local Ollama daemon is running and lists installed models.
    Caches result for 8 seconds to ensure fast UI and batch processing.
    """
    global _cached_status, _cached_time
    now = time.time()
    if not force_refresh and _cached_status is not None and (now - _cached_time < 8.0):
        return _cached_status

    try:
        async with httpx.AsyncClient(timeout=1.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name") for m in data.get("models", [])]
                res = {
                    "available": True,
                    "models": models,
                    "default_model": DEFAULT_MODEL if DEFAULT_MODEL in models else (models[0] if models else None),
                    "recommended_models": RECOMMENDED_MODELS,
                    "base_url": OLLAMA_BASE_URL,
                    "error": None if models else "Ollama is running, but no models are installed yet. Pull one (e.g. `ollama run qwen2.5:1.5b`)."
                }
                _cached_status = res
                _cached_time = now
                return res
    except Exception:
        pass

    res = {
        "available": False,
        "models": [],
        "default_model": None,
        "recommended_models": RECOMMENDED_MODELS,
        "base_url": OLLAMA_BASE_URL,
        "error": "Ollama service is not running on localhost:11434."
    }
    _cached_status = res
    _cached_time = now
    return res


def rule_based_fallback_classifier(filename: str, text_snippet: str, extension: str) -> Dict[str, Any]:
    """
    Heuristic analyzer used only if user explicitly selects offline rule mode
    or for instant testing when Ollama model is downloading.
    Analyzes document text patterns to suggest category and filename.
    """
    lower_text = (text_snippet + " " + filename).lower()
    
    # Category scoring keywords
    scores = {
        "Finance": ["invoice", "receipt", "tax", "balance sheet", "payment", "bank", "statement", "usd", "expense", "salary", "billing", "financial"],
        "Education": ["homework", "assignment", "lecture", "course", "syllabus", "exam", "quiz", "university", "tutorial", "algorithm", "calculus", "study"],
        "Work": ["meeting", "minutes", "client", "contract", "nda", "proposal", "quarterly", "report", "presentation", "review", "deliverable", "kpi"],
        "Projects": ["roadmap", "sprint", "backlog", "github", "bug", "architecture", "api", "docker", "schema", "code", "devrelay", "feature"],
        "Personal": ["health", "medical", "lease", "rent", "apartment", "vacation", "trip", "itinerary", "recipe", "family", "doctor", "gym"],
        "Miscellaneous": []
    }
    
    best_cat = "Miscellaneous"
    highest_score = 0
    matched_terms = []
    
    for cat, keywords in scores.items():
        score = sum(1 for kw in keywords if kw in lower_text)
        if score > highest_score:
            highest_score = score
            best_cat = cat
            matched_terms = [kw for kw in keywords if kw in lower_text]
            
    # Derive smart name
    p = Path(filename)
    original_stem = p.stem
    clean_stem = re.sub(r'[^a-zA-Z0-9]+', ' ', original_stem).strip()
    
    # If original name looks like a junk name (doc1, scan_003, download_482, notes_final)
    is_junk_name = bool(re.match(r'^(doc\d+|scan_\d+|download_\d+|notes_final|untitled|document_\d+|file_\d+|temp.*)$', original_stem.lower()))
    
    if is_junk_name and matched_terms:
        # Construct meaningful title from top matched terms or first line
        title_terms = "_".join([t.title().replace(" ", "_") for t in matched_terms[:3]])
        suggested_name = f"{title_terms}_Document{extension}"
    elif clean_stem:
        suggested_name = f"{clean_stem.title().replace(' ', '_')}{extension}"
    else:
        suggested_name = f"Organized_{best_cat}{extension}"
        
    confidence = min(0.92, 0.45 + (highest_score * 0.12)) if highest_score > 0 else 0.40
    reasoning = (
        f"Identified keywords ({', '.join(matched_terms[:3])}) matching {best_cat}."
        if matched_terms else "Classified into general category based on file metadata."
    )
    
    return {
        "category": best_cat,
        "suggested_filename": sanitize_filename(suggested_name, extension),
        "reasoning": f"[Local Heuristic] {reasoning}",
        "confidence": round(confidence, 2)
    }

async def classify_and_rename_file(
    filename: str,
    text_snippet: str,
    extension: str,
    model_name: Optional[str] = None,
    use_heuristic_fallback: bool = False
) -> Dict[str, Any]:
    """
    Prompts local Ollama model to classify the document and propose a clean, descriptive filename.
    Never executes document instructions. Enforces strict structured output.
    """
    # Check Ollama status
    status = await check_ollama_status()
    
    if not status["available"] or not status["models"]:
        if use_heuristic_fallback:
            return rule_based_fallback_classifier(filename, text_snippet, extension)
        else:
            return {
                "error": True,
                "message": status["error"] or "Ollama model is unavailable.",
                "category": "Miscellaneous",
                "suggested_filename": filename,
                "reasoning": "Ollama service unavailable. Please start Ollama or pull an open-weight model.",
                "confidence": 0.0
            }

    selected_model = model_name or status["default_model"] or status["models"][0]
    
    prompt = f"""You are SlothFlow, an intelligent local file organizer.
Your goal is to inspect the document snippet and filename below, determine its category, and propose a clean, human-readable, descriptive filename.

ALLOWED CATEGORIES:
- Work (contracts, business proposals, client reports, presentations, meeting notes)
- Education (study notes, assignments, university syllabi, textbooks, research papers)
- Finance (invoices, receipts, tax returns, bank statements, balance sheets, expenses)
- Personal (leases, medical records, travel itineraries, recipes, personal journal)
- Projects (software architecture, sprint backlogs, code documentation, PRDs, engineering specs)
- Miscellaneous (anything that doesn't fit the above)

RULES:
1. Preserve the original file extension: '{extension}'.
2. The suggested filename should be concise, professional, title-cased or snake_cased, e.g., 'Q3_Financial_Balance_Sheet.pdf' or 'Java_Collections_Interview_Notes.txt'.
3. Do NOT include special characters like : / \\ < > * ? | " in the filename.
4. Output MUST be strictly valid JSON matching this schema:
{{
  "category": "string (one of the 6 allowed categories)",
  "suggested_filename": "string (ending in {extension})",
  "reasoning": "string (1-2 sentence explanation)",
  "confidence": 0.95
}}

UNTRUSTED DOCUMENT DATA:
Original Filename: {filename}
Document Text Snippet:
---
{text_snippet}
---
"""

    payload = {
        "model": selected_model,
        "prompt": prompt,
        "format": "json",
        "stream": False,
        "options": {
            "temperature": 0.1,  # Low temperature for deterministic classification
            "num_predict": 250
        }
    }

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
            if resp.status_code == 200:
                result_json = resp.json()
                raw_response = result_json.get("response", "{}")
                
                # Parse JSON
                parsed = json.loads(raw_response)
                category = parsed.get("category", "Miscellaneous")
                if category not in CATEGORIES:
                    # Fuzzy match category
                    matched = [c for c in CATEGORIES if c.lower() in category.lower()]
                    category = matched[0] if matched else "Miscellaneous"
                    
                suggested_fn = parsed.get("suggested_filename", filename)
                sanitized_fn = sanitize_filename(suggested_fn, fallback_ext=extension)
                
                # Ensure extension matches original
                if not sanitized_fn.lower().endswith(extension.lower()):
                    sanitized_fn = f"{Path(sanitized_fn).stem}{extension}"
                    
                confidence = float(parsed.get("confidence", 0.85))
                confidence = max(0.1, min(1.0, confidence))
                reasoning = parsed.get("reasoning", f"Classified based on content matching {category}.")
                
                return {
                    "error": False,
                    "category": category,
                    "suggested_filename": sanitized_fn,
                    "reasoning": reasoning,
                    "confidence": confidence,
                    "model_used": selected_model
                }
            else:
                if use_heuristic_fallback:
                    return rule_based_fallback_classifier(filename, text_snippet, extension)
                return {
                    "error": True,
                    "message": f"Ollama returned HTTP {resp.status_code}",
                    "category": "Miscellaneous",
                    "suggested_filename": filename,
                    "reasoning": f"Inference failed with status {resp.status_code}",
                    "confidence": 0.0
                }
    except Exception as e:
        if use_heuristic_fallback:
            return rule_based_fallback_classifier(filename, text_snippet, extension)
        return {
            "error": True,
            "message": f"Error communicating with Ollama: {str(e)}",
            "category": "Miscellaneous",
            "suggested_filename": filename,
            "reasoning": f"Ollama connection error: {str(e)}",
            "confidence": 0.0
        }
