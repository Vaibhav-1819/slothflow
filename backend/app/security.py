"""Path sanitization and security enforcement for SlothFlow.

Ensures all filesystem operations remain strictly confined to the user-selected folder.
Prevents path traversal, malicious characters, and overwriting.
"""
import os
import re
from pathlib import Path
from typing import Tuple

class SecurityException(Exception):
    pass

def validate_and_resolve_folder(folder_path_str: str) -> Path:
    """
    Validates that the provided folder string exists and is a directory.
    Resolves canonical path to avoid any symlink or path traversal tricks.
    """
    if not folder_path_str or not folder_path_str.strip():
        raise SecurityException("Folder path cannot be empty.")
    
    path = Path(folder_path_str.strip()).resolve()
    if not path.exists():
        raise SecurityException(f"Selected folder does not exist: {path}")
    if not path.is_dir():
        raise SecurityException(f"Selected path is not a directory: {path}")
    
    return path

def is_path_within_base(target_path: Path, base_dir: Path) -> bool:
    """
    Strictly verifies that target_path is within base_dir or a descendant.
    """
    try:
        resolved_target = target_path.resolve()
        resolved_base = base_dir.resolve()
        return resolved_base == resolved_target or resolved_base in resolved_target.parents
    except Exception:
        return False

def sanitize_filename(name: str, fallback_ext: str = "") -> str:
    """
    Sanitizes proposed filenames:
    - Strips invalid Windows/Linux characters: < > : " / \\ | ? *
    - Prevents directory traversal components like '..' or '.'
    - Collapses consecutive whitespace or underscores
    - Truncates base name if overly long (keeping max 100 characters + extension)
    """
    if not name:
        name = "unnamed_document"
    
    # Strip any directory path components (only take file name)
    name = os.path.basename(name.strip())
    
    # Replace dangerous characters with underscore
    name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '_', name)
    
    # Collapse multiple spaces or underscores
    name = re.sub(r'[\s_]+', '_', name)
    name = name.strip('._')
    
    if not name:
        name = "unnamed_file"
        
    p = Path(name)
    ext = p.suffix
    stem = p.stem
    
    # If no extension was in the name, use fallback_ext
    if not ext and fallback_ext:
        ext = fallback_ext if fallback_ext.startswith('.') else f".{fallback_ext}"
        
    # Enforce safe stem length
    if len(stem) > 100:
        stem = stem[:100]
        
    sanitized = f"{stem}{ext}"
    return sanitized

def get_safe_destination_path(destination_dir: Path, filename: str) -> Path:
    """
    Finds a collision-free path in destination_dir.
    If 'report.pdf' exists, tries 'report_1.pdf', 'report_2.pdf', etc.
    Never overwrites existing files!
    """
    p = Path(filename)
    stem = p.stem
    ext = p.suffix
    
    target = destination_dir / filename
    counter = 1
    while target.exists():
        target = destination_dir / f"{stem}_{counter}{ext}"
        counter += 1
        
    return target
