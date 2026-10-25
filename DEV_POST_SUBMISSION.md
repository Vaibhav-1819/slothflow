---
title: How I Built SlothFlow: A Local-First AI File Organizer That Cleans Your Mess While You Relax
published: false
tags: devchallenge, hf26challenge, opensource, ai
cover_image: https://raw.githubusercontent.com/Vaibhav-1819/slothflow/main/slothflow_cover.png
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady](https://dev.to/challenges/hacktoberfest-week3-2026-10-19)*

---

## What I Built

If you’ve ever opened your `Downloads` or `Desktop` folder and winced at the mountain of unorganized documents staring back at you—`doc1.pdf`, `scan_003.pdf`, `notes_final.txt`, `download_482.md`, and cryptic invoice numbers—you know the exact pain of digital chaos.

Manually opening each document, skimming its contents, thinking of a descriptive filename, and dragging it into the right subfolder is tedious, repetitive, and draining work.

Most cloud-based file organizers either require paying recurring monthly API subscriptions or, even worse, uploading your private tax filings, apartment leases, health records, and bank statements to third-party cloud servers. That is an unacceptable privacy hazard.

I built **SlothFlow** to solve this once and for all.

**SlothFlow** is a local-first web application powered by open-weight AI models (`Qwen2.5-1.5B`, `Gemma 2-2B`, or `Llama 3.2-1B`) running on `localhost` via Ollama. It inspects documents on your machine, determines their categorization, generates human-readable filenames, and safely organizes them into clean category folders—**all while ensuring zero document bytes ever leave your laptop.**

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

### The "Slow and Steady" Philosophy & Lazy Mode
The challenge theme for Week 3 is **"Slow and Steady"**—and who embodies that better than a sloth?
- **🦥 Lazy Mode (1-Click Auto-Pilot):** Select a folder and click **"Organize My Files"**. SlothFlow automatically extracts text, classifies categories, resolves filename collisions, organizes your folder, and hands you a tidy summary report while you kick back and relax.
- **🔍 Step-by-Step Preview Mode:** For detail-oriented builders, you can review the proposed moves in an interactive table, rename files inline, adjust target categories, and toggle granular approvals before anything touches your filesystem.
- **🛡️ Safe Undo & Zero Overwrites:** We guarantee zero overwrites and zero file deletions. Every single move is logged in an on-device SQLite audit trail with an instant **Safe Undo** button that verifies paths for conflicts before restoring.

---

## Demo

SlothFlow features a minimal dashboard styled in warm earth tones, glassmorphism cards, and a peaceful sloth identity:

### 1. Large Folder Drop & Pre-Packaged Demo Fixtures
Choose any disorganized folder on your machine, or click **"Load Demo Folder"** to test with the 18 realistic sample documents included directly in the repository (leases, balance sheets, discrete math homework, sprint backlogs, and cloud invoices):

```
📂 D:\Projects\SlothFlow\demo_files
├── doc1.pdf               --> [Finance]    Quarterly_Financial_Performance_Q3_Balance_Sheet.pdf
├── notes_final.txt        --> [Education]  Java_Collections_Framework_and_Concurrency_Interview_Notes.txt
├── download_482.md        --> [Projects]   React_Architecture_and_State_Management_Implementation_Guide.md
├── scan_003.pdf           --> [Personal]   Residential_Tenancy_Agreement_and_Apartment_Lease_Contract.pdf
├── project_stuff.txt      --> [Projects]   SlothFlow_Sprint_Backlog_and_Product_Roadmap.txt
└── inv_9841.pdf           --> [Finance]    Cloud_Infrastructure_Monthly_Hosting_Invoice.pdf
```

### 2. Interactive Organization Plan Preview
The local open-weight model evaluates each document and returns a structured organization plan:
- **Original Filename:** With icon badges for PDF, Markdown, JSON, and Text documents.
- **Suggested Filename:** Editable inline with live pencil action.
- **Category Badge:** Work (Blue), Education (Purple), Finance (Emerald), Personal (Rose), Projects (Amber), and Miscellaneous (Slate).
- **Target Destination:** Shows planned subfolder (`/Finance/`, `/Education/`).
- **Confidence & Reasoning:** Real-time progress bar displaying model confidence and explanation.

### 3. Safe Rollback & Audit Log
If you ever change your mind, open the **Audit Log** or click **"Undo Organization"** on the completion screen. SlothFlow cross-checks file existence, verifies destination availability, and safely restores files back to their exact original names and paths.

---

### Running It Yourself
You don't need expensive GPU clusters. SlothFlow runs smoothly on standard developer laptops:

```bash
# 1. Clone the repository
git clone https://github.com/Vaibhav-1819/slothflow.git
cd slothflow

# 2. Set up and start the FastAPI Backend
cd backend
pip install -r requirements.txt
python run.py

# 3. Set up and launch the React Frontend (in a second terminal)
cd ../frontend
npm install
npm run dev

# 4. (Recommended) Pull your favorite local open-weight model
ollama run qwen2.5:1.5b
```

*Tip: If Ollama isn't installed yet, SlothFlow's built-in **Heuristic Fallback Engine** automatically engages so you can test the entire scanning, plan generation, and safe undo workflow right out of the box!*

---

## Code

{% embed https://github.com/Vaibhav-1819/slothflow %}

The complete project is open-source under the MIT license:
- [`backend/app/classifier.py`](https://github.com/Vaibhav-1819/slothflow/blob/main/backend/app/classifier.py): Local Ollama client prompting open-weight models for structured JSON output (`format: "json"`), status caching, and heuristic fallback.
- [`backend/app/extractors.py`](https://github.com/Vaibhav-1819/slothflow/blob/main/backend/app/extractors.py): Local document text extractor using PyMuPDF (`pymupdf`) for PDFs and multi-encoding decoders for text/markdown.
- [`backend/app/security.py`](https://github.com/Vaibhav-1819/slothflow/blob/main/backend/app/security.py): Path boundary validation (`is_path_within_base`), filename sanitization, and collision-free auto-incrementing.
- [`backend/app/organizer.py`](https://github.com/Vaibhav-1819/slothflow/blob/main/backend/app/organizer.py): Plan generator and atomic filesystem executor.
- [`backend/app/undo.py`](https://github.com/Vaibhav-1819/slothflow/blob/main/backend/app/undo.py): Safe rollback engine verifying target availability before restoring.
- [`backend/app/db.py`](https://github.com/Vaibhav-1819/slothflow/blob/main/backend/app/db.py): SQLite audit logging and session persistence.
- [`frontend/src/App.tsx`](https://github.com/Vaibhav-1819/slothflow/blob/main/frontend/src/App.tsx): Main dashboard orchestrating state, inline editing, Lazy Mode, and undo modals.

---

## How I Built It

### The Open-Source AI Architecture
To make local file organization responsive and reliable on everyday hardware, I implemented four core architectural principles:

1. **Untrusted Content Isolation:**  
   Document contents are untrusted data. SlothFlow treats extracted document text strictly as passive data inside the prompt. We isolate the snippet in clear boundary tags so prompt injection instructions embedded inside a document are never executed.
2. **Bounded In-Memory Extraction:**  
   Passing a 50-page PDF to a local 1.5B LLM will throttle token speed and inflate memory usage. SlothFlow extracts text via PyMuPDF and packages a clean, bounded 1,800-character snippet capturing the title, headers, and opening paragraphs—achieving sub-second classification latency per document.
3. **Deterministic Collision Prevention:**  
   AI models can suggest identical filenames for related documents (e.g. two AWS invoices). Our filesystem layer checks the target directory and active plan claims, auto-incrementing filenames (`_1`, `_2`) before applying changes so **no file is ever overwritten.**
4. **Sandboxed Directory Boundaries:**  
   All filesystem reads and moves enforce `validate_and_resolve_folder()` and `is_path_within_base()`. It is mathematically impossible for the application to touch or escape into files outside the user's selected directory.

---

## Why Does Open Innovation Matter?

1. **Uncompromised Document Privacy:**  
   Personal files contain tax IDs, salaries, medical test results, and confidential code. Relying on centralized cloud AI requires handing over your private data. With open-weight models (`Qwen2.5`, `Gemma 2`, `Llama 3.2`), your private documents stay completely on your machine.
2. **Zero API Cost & Unlimited Usage:**  
   Organizing 2,000 messy archive documents using commercial cloud APIs would cost dollars per batch. With open-weight AI on `localhost`, you can organize thousands of documents for free without hitting rate limits or credit cards.
3. **Resilience & Offline Independence:**  
   SlothFlow functions in the woods, on a plane, or during network blackouts. Once the model is downloaded, you own your productivity pipeline.

---

## Real-World Test Run

To test SlothFlow against genuine edge cases, we built an included dataset of 18 messy files:

| Original File | Content Type | SlothFlow Proposed Name | Destination | Result |
|---|---|---|---|---|
| `doc1.pdf` | Balance sheet | `Quarterly_Financial_Performance_Q3_Balance_Sheet.pdf` | `/Finance/` | ✅ Moved |
| `scan_003.pdf` | Apartment lease | `Residential_Tenancy_Agreement_Apartment_Lease.pdf` | `/Personal/` | ✅ Moved |
| `notes_final.txt` | Java notes | `Java_Collections_Framework_Concurrency_Notes.txt` | `/Education/` | ✅ Moved |
| `project_stuff.txt` | Sprint backlog | `SlothFlow_Sprint_Backlog_Product_Roadmap.txt` | `/Projects/` | ✅ Moved |
| `empty_scratch.txt` | Empty 0-byte file | `empty_scratch.txt` | `/Miscellaneous/` | ⏭️ Skipped gracefully |

**Safe Undo Test:**  
After applying all 18 moves, clicking **"Undo Organization"** cleanly checked directory conflicts, moved all 18 files back into the root directory, deleted the now-empty category folders, and updated the SQLite audit trail to `undone`.

---

## Over to You: Let's Discuss in the Comments!

- **How messy is your `Downloads` folder right now? How many hundreds (or thousands) of files are sitting there?**
- **What open-weight model have you found best for structured JSON output on CPU (Qwen 2.5, Gemma 2, or Llama 3.2)?**
- **Which features would you love next:** automatic deduplication, optical character recognition (OCR) for scanned receipts, or a CLI daemon mode?

Star the repo on **[GitHub](https://github.com/Vaibhav-1819/slothflow)** and let me know your thoughts in the comments below! 🦥

---

## Prize Categories

- **Primary Track:** Hacktoberfest Open-Source AI Challenge Week 3 — Slow and Steady
- **Open-Source Innovation Track:** Local-first, privacy-guaranteed document processing and intelligent file reorganization using open-weight AI models.
