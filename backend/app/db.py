"""SQLite database operations and audit logging for SlothFlow."""
import sqlite3
import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
from .config import DB_PATH

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables for sessions and operations history."""
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # Sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                folder_path TEXT NOT NULL,
                mode TEXT NOT NULL,
                total_files INTEGER DEFAULT 0,
                organized_files INTEGER DEFAULT 0,
                skipped_files INTEGER DEFAULT 0,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        
        # Operations history table (Audit trail & Undo support)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS operations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                original_path TEXT NOT NULL,
                new_path TEXT NOT NULL,
                original_name TEXT NOT NULL,
                new_name TEXT NOT NULL,
                category TEXT NOT NULL,
                reasoning TEXT,
                confidence REAL,
                status TEXT NOT NULL, -- 'applied', 'undone', 'failed'
                created_at TEXT NOT NULL,
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            )
        """)
        conn.commit()

def create_session(session_id: str, folder_path: str, mode: str, total_files: int) -> Dict[str, Any]:
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO sessions (id, folder_path, mode, total_files, organized_files, skipped_files, status, created_at)
            VALUES (?, ?, ?, ?, 0, 0, 'active', ?)
        """, (session_id, folder_path, mode, total_files, now))
        conn.commit()
    return {
        "id": session_id,
        "folder_path": folder_path,
        "mode": mode,
        "total_files": total_files,
        "status": "active",
        "created_at": now
    }

def update_session_stats(session_id: str, organized_files: int, skipped_files: int, status: str = "completed"):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE sessions
            SET organized_files = ?, skipped_files = ?, status = ?
            WHERE id = ?
        """, (organized_files, skipped_files, status, session_id))
        conn.commit()

def record_operation(
    session_id: str,
    original_path: str,
    new_path: str,
    original_name: str,
    new_name: str,
    category: str,
    reasoning: str = "",
    confidence: float = 1.0,
    status: str = "applied"
):
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO operations (
                session_id, original_path, new_path, original_name, new_name,
                category, reasoning, confidence, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id, original_path, new_path, original_name, new_name,
            category, reasoning, confidence, status, now
        ))
        conn.commit()

def get_session_operations(session_id: str) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM operations WHERE session_id = ? ORDER BY id DESC
        """, (session_id,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def mark_operation_undone(op_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE operations SET status = 'undone' WHERE id = ?", (op_id,))
        conn.commit()

def mark_session_undone(session_id: str):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE sessions SET status = 'undone' WHERE id = ?", (session_id,))
        conn.commit()

def list_recent_sessions(limit: int = 20) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM sessions ORDER BY created_at DESC LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
