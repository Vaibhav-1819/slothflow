"""Configuration settings for SlothFlow backend."""
import os
from pathlib import Path
from typing import List

# Server configuration
HOST = os.getenv("SLOTHFLOW_HOST", "127.0.0.1")
PORT = int(os.getenv("SLOTHFLOW_PORT", "8000"))

# Ollama local inference settings
OLLAMA_BASE_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
DEFAULT_MODEL = os.getenv("SLOTHFLOW_MODEL", "qwen2.5:1.5b")
RECOMMENDED_MODELS = [
    {"name": "qwen2.5:1.5b", "size": "0.9 GB", "speed": "Fast", "fit": "Best for quick classification"},
    {"name": "qwen2.5:3b", "size": "1.9 GB", "speed": "Balanced", "fit": "High accuracy, moderate RAM"},
    {"name": "gemma2:2b", "size": "1.6 GB", "speed": "Fast", "fit": "Google lightweight open-weight model"},
    {"name": "llama3.2:1b", "size": "1.3 GB", "speed": "Very Fast", "fit": "Ultra-lightweight"},
    {"name": "llama3.2:3b", "size": "2.0 GB", "speed": "Balanced", "fit": "Meta open-weight model"}
]

# Supported categories for classification
CATEGORIES: List[str] = [
    "Work",
    "Education",
    "Finance",
    "Personal",
    "Projects",
    "Miscellaneous"
]

# Supported file extensions for document processing
SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".txt",
    ".md",
    ".markdown",
    ".json",
    ".csv",
    ".docx"
}

# Maximum preview length in characters passed to AI inference prompt
MAX_TEXT_SNIPPET_LENGTH = 1800

# SQLite database path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DB_PATH = PROJECT_ROOT / "slothflow.db"
