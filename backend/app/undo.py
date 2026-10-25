"""Safe Undo functionality for SlothFlow.

Reverts applied filesystem operations by moving files back to their original paths.
Checks for conflicts and target availability before restoring.
"""
import os
import shutil
from pathlib import Path
from typing import Dict, Any, List

from .db import (
    get_session_operations,
    mark_operation_undone,
    mark_session_undone,
    get_connection
)
from .security import validate_and_resolve_folder, get_safe_destination_path

def undo_session_operations(session_id: str) -> Dict[str, Any]:
    """
    Rolls back all applied operations for a specific session.
    Checks conflicts before moving.
    """
    operations = get_session_operations(session_id)
    if not operations:
        return {
            "session_id": session_id,
            "success": False,
            "error": "No operations found for this session."
        }
        
    restored = []
    skipped = []
    failed = []
    directories_to_check = set()
    
    for op in operations:
        # Only undo operations that are currently applied
        if op.get("status") != "applied":
            continue
            
        op_id = op["id"]
        original_path = Path(op["original_path"])
        new_path = Path(op["new_path"])
        
        # Verify current location exists
        if not new_path.exists():
            skipped.append({
                "op_id": op_id,
                "file": op["new_name"],
                "reason": f"File was moved, renamed, or deleted externally: {new_path}"
            })
            continue
            
        # Verify original destination
        restore_target = original_path
        if restore_target.exists():
            # Original path is occupied! Find a safe alternate in that directory
            restore_target = get_safe_destination_path(original_path.parent, original_path.name)
            
        try:
            restore_target.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(new_path), str(restore_target))
            
            mark_operation_undone(op_id)
            directories_to_check.add(new_path.parent)
            
            restored.append({
                "op_id": op_id,
                "from_path": str(new_path),
                "restored_path": str(restore_target),
                "original_filename": op["original_name"]
            })
        except Exception as e:
            failed.append({
                "op_id": op_id,
                "file": op["new_name"],
                "error": str(e)
            })
            
    # Clean up empty category directories if they are now empty
    for d in directories_to_check:
        try:
            if d.exists() and d.is_dir() and not any(d.iterdir()):
                d.rmdir()
        except Exception:
            pass
            
    mark_session_undone(session_id)
    
    return {
        "session_id": session_id,
        "success": True,
        "restored_count": len(restored),
        "skipped_count": len(skipped),
        "failed_count": len(failed),
        "restored_files": restored,
        "skipped": skipped,
        "failed": failed
    }
