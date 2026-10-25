# 🦥 SlothFlow — Your Local AI File Organizer

> **"Stop organizing. Start relaxing."**  
> Built for the **Hacktoberfest Open-Source AI Challenge — Week 3: Slow and Steady**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Platform: Local-First](https://img.shields.io/badge/Platform-Local--First-blue.svg)](#privacy-first-architecture)
[![Inference: Ollama](https://img.shields.io/badge/Inference-Ollama%20Local-orange.svg)](#open-weight-ai-integration)
[![Python: 3.11+](https://img.shields.io/badge/Python-3.11+-yellow.svg)](#quickstart)
[![React: 19](https://img.shields.io/badge/React-19-cyan.svg)](#quickstart)

---

## 📖 Overview

People accumulate hundreds of disorganized files: messy PDFs (`scan_003.pdf`), ambiguous meeting notes (`notes_final.txt`), downloaded specs (`download_482.md`), and raw receipts. Manually opening, reading, renaming, and filing these documents into neat folders is tedious and draining.

Cloud-based AI organizers require uploading confidential documents, invoices, tax forms, and medical records to external corporate servers or paying monthly API fees.

**SlothFlow is a local-first, privacy-respecting file organizer powered by open-weight AI models (Qwen 2.5, Gemma 2, Llama 3.2 via Ollama).** It reads documents on your laptop CPU/GPU, determines their classification, suggests clean descriptive filenames, and organizes them into curated folders—all while ensuring **zero document bytes ever leave your machine.**

```
Disorganized Folder ──> Safe Text Extractor (PyMuPDF) ──> Bounded Content Snippet
                                                                    │
                            ┌───────────────────────────────────────┴───────────────────────────────────────┐
                            ▼                                                                               ▼
             Local Ollama (Qwen 2.5 / Gemma 2)                                              Offline Heuristic Engine
             Strict Structured JSON Response                                                 Pattern & Keyword Matcher
                            │                                                                               │
                            └───────────────────────────────────────┬───────────────────────────────────────┘
                                                                    ▼
                                                    Interactive Organization Plan
                                                    - Inline Rename & Approval
                                                    - Collision Avoidance Guard
                                                                    │
                                                                    ▼
                                                    Safe Atomic Move & SQLite Audit Log
                                                    (Instant 1-Click Safe Undo)
```

---

## ✨ Core Features

### 1. 🦥 Lazy Mode (One-Click Auto-Organization)
Select any folder with unorganized files and click **Organize My Files**. SlothFlow automatically scans, extracts text, prompts the local open-weight model, resolves name collisions, moves files into category subdirectories, and presents a comprehensive completion summary.

### 2. 🧠 AI-Powered Classification & Intelligent Renaming
- Uses local instruction-tuned models (`qwen2.5:1.5b`, `qwen2.5:3b`, `gemma2:2b`, or `llama3.2:1b`).
- Enforces strict JSON schemas: classifies into **Work**, **Education**, **Finance**, **Personal**, **Projects**, or **Miscellaneous**.
- Replaces cryptic names (`doc1.pdf` → `Quarterly_Financial_Performance_Q3_Balance_Sheet.pdf`) while strictly preserving original file extensions.
- Detects collisions and auto-increments (`_1`, `_2`) to prevent accidental overwrites.

### 3. 🔍 Interactive Step-by-Step Preview
- Inspect proposed moves in a clean dashboard table before executing any filesystem changes.
- **Inline Editing:** Edit any suggested filename directly in the table.
- **Granular Approvals:** Approve or reject individual files or select/deselect all with one click.
- **Transparent Reasoning:** View AI confidence percentages and classification reasoning snippets.

### 4. 🛡️ Safe Execution & Conflict-Checked Undo
- **Zero Overwrite Guarantee:** Files are never overwritten or deleted.
- **Path Traversal Protection:** All source and target operations are strictly confined within the selected directory.
- **Persistent SQLite Audit Trail:** Every move is recorded with timestamps, original paths, and new paths.
- **One-Click Safe Undo:** Reverse any operation safely; verifies original paths for conflicts before restoring.

### 5. 🔒 100% Local Privacy
- Operates entirely on `localhost`.
- No telemetry, no cloud API keys, and no internet connection required once the model is pulled.
- Clear model status indicator with one-click setup guide for installing Ollama.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite | Interactive UI, inline renaming, real-time metrics |
| **Styling** | Tailwind CSS + Lucide Icons | Warm sloth-inspired aesthetic, glassmorphism, responsive cards |
| **Backend** | Python 3.11 + FastAPI + Uvicorn | High-performance async REST API, path security checks |
| **AI Inference** | Ollama (`qwen2.5:1.5b` / `gemma2:2b`) | On-device structured JSON classification & renaming |
| **PDF Extraction** | PyMuPDF (`pymupdf`) | Fast, local text and metadata extraction from PDF files |
| **Audit & Storage** | SQLite 3 | Operation history, session state, and safe undo metadata |

---

## 🚀 Quickstart Guide

### Prerequisites
1. **Python 3.11+** installed
2. **Node.js v18+** & npm installed
3. *(Optional but recommended)* [Ollama](https://ollama.com) installed for local LLM inference

### Step 1: Clone the Repository
```bash
git clone https://github.com/Vaibhav-1819/slothflow.git
cd slothflow
```

### Step 2: Set Up Backend
```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```
*The backend API server will start at `http://127.0.0.1:8000`.*

### Step 3: Set Up Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend application will be live at `http://localhost:5173`.*

### Step 4: Run Local Ollama Model (Recommended)
```bash
# Pull the recommended ultra-fast model (0.9 GB)
ollama run qwen2.5:1.5b
```

> **Note:** If you haven't installed Ollama yet, SlothFlow's **Built-in Heuristic Engine** will automatically engage so you can explore and test the entire workflow immediately without setup!

---

## 🧪 Testing with Included Demo Files

SlothFlow includes 18 realistic, disorganized test documents inside the `demo_files/` directory, including:
- `doc1.pdf` (Quarterly balance sheet & financial statement)
- `notes_final.txt` (Java Collections & Concurrency deep dive)
- `download_482.md` (React architecture & state management guide)
- `scan_003.pdf` (Apartment tenancy lease contract)
- `project_stuff.txt` (SlothFlow roadmap & sprint backlog)
- `inv_9841.pdf` (Cloud infrastructure hosting invoice)
- `receipt_772.txt` (Hardware depot renovation materials receipt)
- `receipt_uber_oct.pdf` (Airport ride receipt)
- `discrete_math_hw.md` (Graph theory homework assignment)
- `kyoto_trip_itinerary.txt` (Vacation hotel reservations & travel plans)
- `sourdough_guide.md` (Bread hydration formula)
- `consulting_msa_v2.pdf` (Consulting Master Services Agreement)
- `empty_scratch.txt` (Empty file edge case)

**Testing in 3 Clicks:**
1. Open `http://localhost:5173`.
2. Click **Load Demo Folder (18 sample files)**.
3. Click **Organize My Files** (Lazy Mode) or **Preview Organization** to watch the local AI organize and rename them in seconds!
4. Click **Undo Organization** on the completion screen to restore all files back to their original state.

---

## 🔒 Security & Privacy Guarantees

- **No Prompt Injection Execution:** Document text is treated strictly as passive, untrusted input. Instructions inside document content are ignored.
- **Path Sanitization:** Filenames are stripped of illegal characters (`<>:"/\|?*`) and path traversal sequences (`..`).
- **Bounded In-Memory Extraction:** Only the first 1,800 characters of sanitized text are provided to the model prompt to keep inference latency low and memory usage predictable.
- **Sandboxed File Operations:** Moves are strictly checked against `is_path_within_base()` before any execution.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.
