"""Generates realistic sample disorganized files for testing and demonstration."""
import os
from pathlib import Path
from typing import List, Dict, Any

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

SAMPLE_FILES = [
    {
        "filename": "doc1.pdf",
        "title": "Quarterly Financial Performance & Q3 Balance Sheet",
        "category_expected": "Finance",
        "content": (
            "ACME CORP - QUARTERLY FINANCIAL REPORT & BALANCE SHEET (Q3)\n\n"
            "Total Revenue: $2,450,000 USD\n"
            "Operating Expenses: $1,120,000 USD\n"
            "Net Operating Profit: $1,330,000 USD\n"
            "Taxes & Depreciation: $210,000 USD\n"
            "Net Net Income: $1,120,000 USD\n\n"
            "Cash flow remains positive across all SaaS recurring subscriptions. "
            "Accounts payable settled on schedule."
        )
    },
    {
        "filename": "notes_final.txt",
        "title": "Java Collections Framework and Concurrency Interview Notes",
        "category_expected": "Education",
        "content": (
            "# Java Collections & Concurrency Deep Dive\n\n"
            "1. HashMap vs ConcurrentHashMap: ConcurrentHashMap uses synchronized bucket nodes "
            "and CAS operations for lock-free reads.\n"
            "2. ArrayList amortized O(1) append vs LinkedList pointer overhead.\n"
            "3. ThreadPoolExecutor: corePoolSize, maximumPoolSize, keepAliveTime, and LinkedBlockingQueue.\n"
            "4. Java Memory Model (JMM): volatile keyword guarantees visibility and prevents instruction reordering."
        )
    },
    {
        "filename": "download_482.md",
        "title": "React Architecture and State Management Implementation Guide",
        "category_expected": "Projects",
        "content": (
            "# Frontend State Management Architecture\n\n"
            "We evaluated Zustand, Redux Toolkit, and React Context for client-side state.\n"
            "Decision: Use lightweight Zustand stores for global UI state and React Query "
            "for server-state caching.\n\n"
            "Component hierarchy guidelines:\n"
            "- Container components handle hooks and data fetching\n"
            "- Presentational components remain pure and render props\n"
            "- CSS utility classes structured via Tailwind"
        )
    },
    {
        "filename": "scan_003.pdf",
        "title": "Residential Tenancy Agreement and Apartment Lease Contract",
        "category_expected": "Personal",
        "content": (
            "RESIDENTIAL LEASE AGREEMENT\n\n"
            "This Agreement made between Landlord (Apex Properties LLC) and Tenant.\n"
            "Premises: 402 Willow Creek Blvd, Apartment 3B.\n"
            "Monthly Rent: $1,650 due on the first day of each calendar month.\n"
            "Security Deposit: $1,650 held in escrow.\n"
            "Quiet hours: 10:00 PM to 7:00 AM daily. Pets allowed upon approval."
        )
    },
    {
        "filename": "project_stuff.txt",
        "title": "SlothFlow Sprint Backlog and Product Roadmap",
        "category_expected": "Projects",
        "content": (
            "SLOTHFLOW SPRINT BACKLOG & ROADMAP - WEEK 3\n\n"
            "- [x] FastAPI backend scaffolding and path security checks\n"
            "- [x] PyMuPDF document extraction pipeline\n"
            "- [x] Ollama local model structured JSON inference\n"
            "- [ ] React + Tailwind dashboard with sloth identity\n"
            "- [ ] Interactive plan preview with inline filename editor\n"
            "- [ ] Safe undo conflict checker & audit trail in SQLite"
        )
    },
    {
        "filename": "inv_9841.pdf",
        "title": "Cloud Infrastructure Monthly Hosting Invoice",
        "category_expected": "Finance",
        "content": (
            "INVOICE #INV-9841\n"
            "Billed To: Vaibhav Engineering Labs\n"
            "Service Provider: CloudHost Global Services\n"
            "Date: October 15, 2026\n\n"
            "Items:\n"
            "- High-Performance GPU Cluster (240 hrs): $384.00\n"
            "- Managed PostgreSQL Database Cluster: $65.00\n"
            "- Bandwidth & CDN Egress (1.2 TB): $42.50\n"
            "Total Amount Due: $491.50 USD\n"
            "Status: Paid via Corporate Card ending in 4108."
        )
    },
    {
        "filename": "lab_results_2026.txt",
        "title": "Annual Comprehensive Health & Bloodwork Checkup",
        "category_expected": "Personal",
        "content": (
            "PATIENT MEDICAL LAB REPORT\n"
            "Patient: Vaibhav\n"
            "Date of Collection: Sept 12, 2026\n\n"
            "Fasting Blood Glucose: 92 mg/dL (Normal: 70-99)\n"
            "Total Cholesterol: 178 mg/dL (Desirable: <200)\n"
            "HDL: 56 mg/dL | LDL: 104 mg/dL\n"
            "Vitamin D3: 38 ng/mL (Sufficient)\n"
            "Physician Notes: All biometric markers within healthy target ranges."
        )
    },
    {
        "filename": "receipt_772.txt",
        "title": "Home Renovation Hardware Supplies Receipt",
        "category_expected": "Finance",
        "content": (
            "HARDWARE DEPOT - STORE RECEIPT #772\n"
            "Date: 2026-10-04\n\n"
            "1x Dewalt Cordless Drill Kit - $129.00\n"
            "2x Drywall Anchors 50-pk - $18.50\n"
            "1x Satin Nickel Door Handle Set - $45.00\n"
            "Sales Tax (8.25%): $15.88\n"
            "TOTAL PAID: $208.38\n"
            "Payment Method: Apple Pay"
        )
    },
    {
        "filename": "discrete_math_hw.md",
        "title": "Discrete Mathematics Graph Theory Homework Assignment",
        "category_expected": "Education",
        "content": (
            "# CS201 Discrete Mathematics - Problem Set 4\n\n"
            "## Problem 1: Euler Paths & Circuits\n"
            "Prove that a connected undirected graph G contains an Eulerian circuit if and "
            "only if every vertex has an even degree.\n\n"
            "## Problem 2: Planar Graphs & Kuratowski's Theorem\n"
            "Show that the complete bipartite graph K_{3,3} cannot be embedded in the plane "
            "without intersecting edges."
        )
    },
    {
        "filename": "kyoto_trip_itinerary.txt",
        "title": "Kyoto Travel Itinerary and Hotel Reservations",
        "category_expected": "Personal",
        "content": (
            "VACATION ITINERARY - JAPAN 2026\n\n"
            "Day 1: Arrival at Haneda Airport -> Shinkansen to Kyoto Station.\n"
            "Hotel: Hotel Granvia Kyoto (Reservation #JP-88124).\n"
            "Day 2: Fushimi Inari Shrine early morning walk, Kiyomizu-dera.\n"
            "Day 3: Arashiyama Bamboo Grove and Monkey Park Iwatayama.\n"
            "Day 4: Day trip to Nara Park and Todai-ji Temple."
        )
    },
    {
        "filename": "sourdough_guide.md",
        "title": "Artisan Sourdough Bread Hydration and Baking Guide",
        "category_expected": "Personal",
        "content": (
            "# Master Sourdough Bread Formula\n\n"
            "- 450g Bread Flour (12.7% protein)\n"
            "- 50g Whole Wheat Flour\n"
            "- 375g Water (75% hydration)\n"
            "- 100g Active Leaven\n"
            "- 10g Fine Sea Salt\n\n"
            "Process:\n"
            "1. 1-hour autolyse with flour and water.\n"
            "2. Mix starter and salt; 4 sets of stretch and folds every 30 minutes.\n"
            "3. Cold retard overnight in banneton at 4°C."
        )
    },
    {
        "filename": "consulting_msa_v2.pdf",
        "title": "Software Consulting Master Services Agreement",
        "category_expected": "Work",
        "content": (
            "MASTER SERVICES AGREEMENT (MSA)\n\n"
            "This Consulting Services Agreement is entered into by Client Corp and Consultant.\n"
            "Scope: Architecture review, AI pipeline implementation, security audits.\n"
            "Confidentiality: Mutual non-disclosure of proprietary algorithms and data.\n"
            "Intellectual Property: Deliverables vest with Client upon final invoice settlement.\n"
            "Term: Twelve (12) months from Effective Date."
        )
    },
    {
        "filename": "marketing_campaign.txt",
        "title": "Q4 Product Launch Marketing Strategy and Campaign Budget",
        "category_expected": "Work",
        "content": (
            "MARKETING STRATEGY MEMO - Q4 CAMPAIGN\n\n"
            "Objective: Acquire 10,000 developer accounts during Hacktoberfest.\n"
            "Key Channels:\n"
            "1. DEV.to sponsored technical deep-dive articles\n"
            "2. Open-source demo videos on YouTube\n"
            "3. Community hackathon workshops\n"
            "Total allocated campaign budget: $15,000 USD."
        )
    },
    {
        "filename": "receipt_uber_oct.pdf",
        "title": "Uber Airport Ride Official Trip Receipt",
        "category_expected": "Finance",
        "content": (
            "UBER TRIP RECEIPT\n"
            "Trip Date: Oct 18, 2026\n"
            "Driver: Carlos M. (Toyota Camry)\n"
            "Pickup: Terminal 2 Domestic Airport\n"
            "Dropoff: Downtown Grand Hotel\n"
            "Fare Breakdown:\n"
            "Base Fare: $12.50\n"
            "Distance & Time: $38.40\n"
            "Tolls & Surcharges: $4.50\n"
            "Total Charged: $55.40 USD (Visa ending 9921)"
        )
    },
    {
        "filename": "ml_lecture_notes.md",
        "title": "Machine Learning Backpropagation and Gradient Descent Notes",
        "category_expected": "Education",
        "content": (
            "# Lecture 8: Optimization in Deep Neural Networks\n\n"
            "## 1. Stochastic Gradient Descent with Momentum\n"
            "v_t = beta * v_{t-1} + (1 - beta) * grad(W)\n"
            "W = W - alpha * v_t\n\n"
            "## 2. Adam Optimizer\n"
            "Combines first moment (momentum) and second raw moment (RMSProp) with bias correction.\n"
            "Used as default optimizer for Transformer and Vision architectures."
        )
    },
    {
        "filename": "vacation_packing_checklist.txt",
        "title": "Personal Travel Packing Checklist and Gear",
        "category_expected": "Personal",
        "content": (
            "VACATION PACKING CHECKLIST - SUMMER 2026\n\n"
            "- Passport & International Driver's License\n"
            "- Noise-canceling headphones & USB-C charging cables\n"
            "- Hiking shoes and lightweight rain jacket\n"
            "- Daily vitamins and prescription sunscreen\n"
            "- Offline maps downloaded on phone"
        )
    },
    {
        "filename": "api_spec_v1.json",
        "title": "Payments Gateway REST API Specification",
        "category_expected": "Projects",
        "content": (
            "{\n"
            '  "openapi": "3.0.0",\n'
            '  "info": {\n'
            '    "title": "Payments Gateway Internal API",\n'
            '    "version": "1.0.0"\n'
            "  },\n"
            '  "paths": {\n'
            '    "/v1/charges": {\n'
            '      "post": {\n'
            '        "summary": "Create customer credit card charge",\n'
            '        "responses": { "200": { "description": "Successful charge" } }\n'
            "      }\n"
            "    }\n"
            "  }\n"
            "}"
        )
    },
    {
        "filename": "empty_scratch.txt",
        "title": "Empty Scratch File",
        "category_expected": "Miscellaneous",
        "content": ""
    }

]

def create_sample_pdf(file_path: Path, title: str, content: str):
    """Creates a clean test PDF with reportlab if available, or simple text."""
    if REPORTLAB_AVAILABLE:
        c = canvas.Canvas(str(file_path), pagesize=letter)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, 750, title)
        c.setFont("Helvetica", 10)
        
        y = 710
        for line in content.split("\n"):
            if y < 60:
                c.showPage()
                y = 750
            c.drawString(50, y, line[:95])
            y -= 18
        c.save()
    else:
        # Fallback text representation if reportlab is not present
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(f"=== {title} ===\n\n{content}")

def generate_sample_dataset(target_dir: Path) -> List[str]:
    """Generates all sample files inside target_dir."""
    target_dir.mkdir(parents=True, exist_ok=True)
    generated = []
    
    for item in SAMPLE_FILES:
        fpath = target_dir / item["filename"]
        if item["filename"].endswith(".pdf"):
            create_sample_pdf(fpath, item["title"], item["content"])
        else:
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(item["content"])
        generated.append(str(fpath))
        
    return generated
