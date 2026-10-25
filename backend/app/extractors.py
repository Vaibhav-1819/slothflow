"""Document text and metadata extractors for SlothFlow.

Extracts text from PDFs, text files, Markdown, JSON, and CSVs safely.
Treats all document text strictly as untrusted data.
"""
import os
import re
from pathlib import Path
from typing import Dict, Any, Optional
import datetime
from .config import MAX_TEXT_SNIPPET_LENGTH, SUPPORTED_EXTENSIONS

# Optional import of PyMuPDF
try:
    import pymupdf  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    try:
        import fitz as pymupdf
        PYMUPDF_AVAILABLE = True
    except ImportError:
        PYMUPDF_AVAILABLE = False


def extract_pdf_content(file_path: Path, max_pages: int = 5) -> Dict[str, Any]:
    """
    Extracts text and metadata from a PDF file using PyMuPDF (fitz).
    Handles encrypted, corrupt, or empty PDFs gracefully.
    """
    if not PYMUPDF_AVAILABLE:
        # Fallback if pymupdf hasn't loaded
        return {
            "text": "",
            "page_count": 0,
            "error": "PyMuPDF is not available. Please install pymupdf."
        }
        
    try:
        doc = pymupdf.open(file_path)
        total_pages = len(doc)
        if total_pages == 0:
            return {"text": "", "page_count": 0, "error": "Empty PDF document"}
        
        extracted_text = []
        pages_to_read = min(total_pages, max_pages)
        for i in range(pages_to_read):
            page = doc[i]
            extracted_text.append(page.get_text() or "")
            
        full_text = "\n".join(extracted_text).strip()
        doc.close()
        
        return {
            "text": full_text,
            "page_count": total_pages,
            "error": None
        }
    except Exception as e:
        return {
            "text": "",
            "page_count": 0,
            "error": f"Failed to extract PDF: {str(e)}"
        }

def extract_text_file(file_path: Path, max_bytes: int = 50000) -> Dict[str, Any]:
    """
    Reads plain text, markdown, json, or csv files with common encodings.
    """
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252"]
    raw_bytes = None
    
    try:
        with open(file_path, "rb") as f:
            raw_bytes = f.read(max_bytes)
    except Exception as e:
        return {"text": "", "error": f"Could not read file: {str(e)}"}
        
    for enc in encodings:
        try:
            text = raw_bytes.decode(enc)
            return {"text": text, "error": None}
        except UnicodeDecodeError:
            continue
            
    return {"text": "", "error": "Could not decode text with standard encodings"}

def extract_file_info(file_path: Path) -> Dict[str, Any]:
    """
    Extracts full metadata and a representative text snippet for classification.
    """
    stat = file_path.stat()
    size_bytes = stat.st_size
    mod_time = datetime.datetime.fromtimestamp(stat.st_mtime, tz=datetime.timezone.utc).isoformat()
    extension = file_path.suffix.lower()
    
    extracted_text = ""
    page_count = None
    error = None
    
    if extension not in SUPPORTED_EXTENSIONS:
        return {
            "filename": file_path.name,
            "original_path": str(file_path),
            "extension": extension,
            "size_bytes": size_bytes,
            "modified_time": mod_time,
            "supported": False,
            "error": f"Unsupported file extension {extension}"
        }
        
    if size_bytes == 0:
        return {
            "filename": file_path.name,
            "original_path": str(file_path),
            "extension": extension,
            "size_bytes": 0,
            "modified_time": mod_time,
            "supported": True,
            "text_snippet": "[Empty file]",
            "word_count": 0,
            "page_count": 0,
            "error": "File is empty"
        }
        
    if extension == ".pdf":
        pdf_res = extract_pdf_content(file_path)
        extracted_text = pdf_res.get("text", "")
        page_count = pdf_res.get("page_count", 0)
        error = pdf_res.get("error")
    else:
        txt_res = extract_text_file(file_path)
        extracted_text = txt_res.get("text", "")
        error = txt_res.get("error")
        
    # Clean whitespace and extract preview snippet
    cleaned_text = re.sub(r'[\r\n\t]+', ' ', extracted_text).strip()
    snippet = cleaned_text[:MAX_TEXT_SNIPPET_LENGTH]
    words = len(cleaned_text.split()) if cleaned_text else 0
    
    return {
        "filename": file_path.name,
        "original_path": str(file_path),
        "extension": extension,
        "size_bytes": size_bytes,
        "modified_time": mod_time,
        "supported": True,
        "text_snippet": snippet if snippet else "[No readable text found]",
        "word_count": words,
        "page_count": page_count,
        "error": error
    }
