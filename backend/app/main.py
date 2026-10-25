"""FastAPI backend application for SlothFlow: Local AI File Organizer."""
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .config import DB_PATH, PROJECT_ROOT, DEFAULT_MODEL, RECOMMENDED_MODELS
from .db import init_db, list_recent_sessions, get_session_operations
from .security import validate_and_resolve_folder, SecurityException
from .organizer import (
    scan_directory_files,
    generate_organization_plan,
    apply_organization_plan
)
from .undo import undo_session_operations
from .classifier import check_ollama_status
from .extractors import extract_file_info
from .sample_generator import generate_sample_dataset

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="SlothFlow API",
    description="Stop organizing. Start relaxing. Local-first AI file organizer.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request schemas
class ScanRequest(BaseModel):
    folder_path: str = Field(..., description="Absolute path of the directory to scan")

class PlanRequest(BaseModel):
    folder_path: str = Field(..., description="Absolute path of directory")
    model_name: Optional[str] = None
    use_heuristic_fallback: bool = True

class PlanItem(BaseModel):
    id: str
    original_path: str
    original_filename: str
    suggested_filename: str
    category: str
    destination_folder: str
    destination_path: str
    reasoning: Optional[str] = ""
    confidence: float = 1.0
    approved: bool = True

class ApplyPlanRequest(BaseModel):
    session_id: str
    folder_path: str
    items: List[PlanItem]

class UndoRequest(BaseModel):
    session_id: str

class LazyOrganizeRequest(BaseModel):
    folder_path: str
    model_name: Optional[str] = None
    use_heuristic_fallback: bool = True

class DemoFilesRequest(BaseModel):
    target_folder: Optional[str] = None

# Endpoints
@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "app": "SlothFlow",
        "version": "1.0.0",
        "db": str(DB_PATH)
    }

@app.get("/api/model-status")
async def get_model_status():
    status = await check_ollama_status()
    return status

@app.get("/api/default-demo-path")
def get_default_demo_path():
    demo_dir = PROJECT_ROOT / "demo_files"
    return {
        "demo_path": str(demo_dir),
        "exists": demo_dir.exists(),
        "files_count": len(list(demo_dir.glob("*.*"))) if demo_dir.exists() else 0
    }

@app.post("/api/scan")
def scan_folder(req: ScanRequest):
    try:
        base_folder = validate_and_resolve_folder(req.folder_path)
    except SecurityException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid folder path: {str(e)}")

    files = scan_directory_files(base_folder)
    file_list = []
    for f in files:
        info = extract_file_info(f)
        file_list.append(info)

    return {
        "folder_path": str(base_folder),
        "total_files": len(file_list),
        "files": file_list
    }

@app.post("/api/plan")
async def create_plan(req: PlanRequest):
    try:
        plan_result = await generate_organization_plan(
            folder_path_str=req.folder_path,
            model_name=req.model_name,
            use_heuristic_fallback=req.use_heuristic_fallback
        )
        return plan_result
    except SecurityException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Plan generation error: {str(e)}")

@app.post("/api/apply")
def apply_plan(req: ApplyPlanRequest):
    try:
        approved_items = [item.model_dump() for item in req.items if item.approved]
        if not approved_items:
            raise HTTPException(status_code=400, detail="No approved items to apply.")
            
        result = apply_organization_plan(
            session_id=req.session_id,
            folder_path_str=req.folder_path,
            approved_items=approved_items
        )
        return result
    except SecurityException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply plan: {str(e)}")

@app.post("/api/lazy-organize")
async def lazy_organize(req: LazyOrganizeRequest):
    """
    Lazy Mode:
    1-Click scan, classify, and organize all supported files automatically.
    """
    try:
        # Step 1: Generate plan
        plan_result = await generate_organization_plan(
            folder_path_str=req.folder_path,
            model_name=req.model_name,
            use_heuristic_fallback=req.use_heuristic_fallback
        )
        
        plan_items = plan_result.get("plan", [])
        if not plan_items:
            return {
                "session_id": plan_result.get("session_id"),
                "folder_path": req.folder_path,
                "organized_count": 0,
                "skipped_count": 0,
                "failed_count": 0,
                "message": "No files found to organize."
            }
            
        # Step 2: Auto-approve all
        approved = [item for item in plan_items if item.get("approved", True)]
        
        # Step 3: Apply
        result = apply_organization_plan(
            session_id=plan_result["session_id"],
            folder_path_str=req.folder_path,
            approved_items=approved
        )
        result["plan_details"] = plan_items
        return result
    except SecurityException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lazy organize error: {str(e)}")

@app.post("/api/undo")
def undo_operations(req: UndoRequest):
    result = undo_session_operations(req.session_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Undo failed."))
    return result

@app.get("/api/history")
def get_history(limit: int = Query(10, ge=1, le=50)):
    sessions = list_recent_sessions(limit)
    return {"sessions": sessions}

@app.get("/api/history/{session_id}")
def get_session_detail(session_id: str):
    ops = get_session_operations(session_id)
    return {"session_id": session_id, "operations": ops}

@app.post("/api/generate-demo-files")
def generate_demo_files(req: DemoFilesRequest):
    target = Path(req.target_folder) if req.target_folder else (PROJECT_ROOT / "demo_files")
    try:
        created_paths = generate_sample_dataset(target)
        return {
            "success": True,
            "target_folder": str(target),
            "files_created": len(created_paths),
            "files": [os.path.basename(p) for p in created_paths]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not generate demo files: {str(e)}")

@app.get("/api/browse-directory")
def browse_directory(current_path: Optional[str] = None):
    """Returns subdirectories of current_path to help user pick folders quickly."""
    if not current_path or not current_path.strip():
        # Default to user projects directory
        path = PROJECT_ROOT
    else:
        path = Path(current_path).resolve()
        
    if not path.exists() or not path.is_dir():
        path = PROJECT_ROOT
        
    subdirs = []
    try:
        for entry in os.scandir(path):
            if entry.is_dir() and not entry.name.startswith("."):
                subdirs.append(entry.name)
    except Exception:
        pass
        
    return {
        "current_path": str(path),
        "parent_path": str(path.parent) if path != path.parent else None,
        "subdirectories": sorted(subdirs)
    }
