"""Organization planning, collision detection, and safe filesystem execution for SlothFlow."""
import os
import shutil
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional

from .config import SUPPORTED_EXTENSIONS
from .extractors import extract_file_info
from .classifier import classify_and_rename_file
from .security import (
    validate_and_resolve_folder,
    is_path_within_base,
    get_safe_destination_path,
    sanitize_filename,
    SecurityException
)
from .db import (
    create_session,
    record_operation,
    update_session_stats
)

def scan_directory_files(base_folder: Path) -> List[Path]:
    """
    Scans the selected directory for supported files.
    Only processes files in the root of the selected directory to avoid touching existing categorized subfolders.
    """
    found_files = []
    for entry in os.scandir(base_folder):
        if entry.is_file() and not entry.name.startswith("."):
            ext = Path(entry.name).suffix.lower()
            if ext in SUPPORTED_EXTENSIONS:
                found_files.append(Path(entry.path))
    return sorted(found_files, key=lambda p: p.name.lower())

async def generate_organization_plan(
    folder_path_str: str,
    model_name: Optional[str] = None,
    use_heuristic_fallback: bool = False
) -> Dict[str, Any]:
    """
    Scans the folder, extracts file info, runs classification, and builds an organization plan.
    """
    base_folder = validate_and_resolve_folder(folder_path_str)
    file_paths = scan_directory_files(base_folder)
    
    if not file_paths:
        return {
            "session_id": str(uuid.uuid4()),
            "folder_path": str(base_folder),
            "files_count": 0,
            "plan": [],
            "message": "No supported files (.pdf, .txt, .md, .json, .csv) found in this folder."
        }
        
    session_id = str(uuid.uuid4())
    create_session(session_id, str(base_folder), mode="standard", total_files=len(file_paths))
    
    plan_items = []
    # Track proposed names in destinations to prevent collisions within the same plan
    claimed_destination_paths = set()
    
    for idx, fpath in enumerate(file_paths):
        info = extract_file_info(fpath)
        
        # If extraction error or unreadable
        if info.get("error") and not info.get("text_snippet"):
            classification = {
                "category": "Miscellaneous",
                "suggested_filename": fpath.name,
                "reasoning": f"Could not read content: {info.get('error')}",
                "confidence": 0.3
            }
        else:
            classification = await classify_and_rename_file(
                filename=fpath.name,
                text_snippet=info.get("text_snippet", ""),
                extension=info.get("extension", fpath.suffix),
                model_name=model_name,
                use_heuristic_fallback=use_heuristic_fallback
            )
            
        category = classification.get("category", "Miscellaneous")
        suggested_name = classification.get("suggested_filename", fpath.name)
        sanitized_name = sanitize_filename(suggested_name, fallback_ext=fpath.suffix)
        
        # Target category directory
        cat_dir = base_folder / category
        
        # Find collision-free path
        stem = Path(sanitized_name).stem
        ext = Path(sanitized_name).suffix
        candidate_path = cat_dir / sanitized_name
        counter = 1
        
        while candidate_path.exists() or str(candidate_path) in claimed_destination_paths:
            candidate_path = cat_dir / f"{stem}_{counter}{ext}"
            counter += 1
            
        claimed_destination_paths.add(str(candidate_path))
        
        plan_items.append({
            "id": f"item-{idx + 1}",
            "original_path": str(fpath),
            "original_filename": fpath.name,
            "suggested_filename": candidate_path.name,
            "category": category,
            "destination_folder": category,
            "destination_path": str(candidate_path),
            "reasoning": classification.get("reasoning", ""),
            "confidence": classification.get("confidence", 0.5),
            "size_bytes": info.get("size_bytes", 0),
            "approved": True,  # Default to approved
            "error": classification.get("error") if isinstance(classification.get("error"), str) else None
        })
        
    return {
        "session_id": session_id,
        "folder_path": str(base_folder),
        "files_count": len(plan_items),
        "plan": plan_items
    }

def apply_organization_plan(
    session_id: str,
    folder_path_str: str,
    approved_items: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Safely executes the approved plan items on the local filesystem.
    Moves files into category directories, never overwrites, and records operations in SQLite.
    """
    base_folder = validate_and_resolve_folder(folder_path_str)
    
    successful = []
    skipped = []
    failed = []
    
    for item in approved_items:
        original_path = Path(item["original_path"])
        category = item.get("category", "Miscellaneous")
        target_name = sanitize_filename(item.get("suggested_filename", original_path.name), fallback_ext=original_path.suffix)
        
        # Security checks
        if not is_path_within_base(original_path, base_folder):
            failed.append({
                "item": item,
                "error": "Source file is outside the permitted directory."
            })
            continue
            
        if not original_path.exists():
            skipped.append({
                "item": item,
                "reason": "Original file no longer exists."
            })
            continue
            
        # Target folder inside base_folder
        target_dir = base_folder / category
        if not is_path_within_base(target_dir, base_folder):
            failed.append({
                "item": item,
                "error": "Destination category folder escapes base directory."
            })
            continue
            
        try:
            target_dir.mkdir(parents=True, exist_ok=True)
            
            # Re-verify collision at execution time
            safe_target_path = get_safe_destination_path(target_dir, target_name)
            
            # Execute move
            shutil.move(str(original_path), str(safe_target_path))
            
            # Log to DB audit trail
            record_operation(
                session_id=session_id,
                original_path=str(original_path),
                new_path=str(safe_target_path),
                original_name=original_path.name,
                new_name=safe_target_path.name,
                category=category,
                reasoning=item.get("reasoning", ""),
                confidence=item.get("confidence", 1.0),
                status="applied"
            )
            
            successful.append({
                "original_filename": original_path.name,
                "new_filename": safe_target_path.name,
                "category": category,
                "new_path": str(safe_target_path)
            })
        except Exception as e:
            failed.append({
                "item": item,
                "error": f"Filesystem move failed: {str(e)}"
            })
            
    # Update session in DB
    update_session_stats(
        session_id=session_id,
        organized_files=len(successful),
        skipped_files=len(skipped) + len(failed),
        status="completed"
    )
    
    return {
        "session_id": session_id,
        "folder_path": str(base_folder),
        "total_requested": len(approved_items),
        "organized_count": len(successful),
        "skipped_count": len(skipped),
        "failed_count": len(failed),
        "organized_files": successful,
        "skipped_files": skipped,
        "failed_files": failed
    }
