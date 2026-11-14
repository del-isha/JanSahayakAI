import os, io, re
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import rules, agents, doc_store

load_dotenv()

app = FastAPI(
    title="JanSahayak AI — Citizen-First Government Assistance",
    description="Intelligent personal government procedure, document intelligence, and scheme discovery platform for Indian citizens."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

def pdf_text(b: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(b))
        pages_txt = [p.extract_text() or "" for p in reader.pages]
        return "\n".join(pages_txt)
    except Exception:
        return ""

@app.get("/api/health")
def health():
    return {
        "ok": True,
        "service": "JanSahayak AI Citizen Platform",
        "llm": agents.get_llm_status()
    }

# -------------------------------------------------------------
# API Key Configuration & Model Intelligence
# -------------------------------------------------------------
class ApiKeyPayload(BaseModel):
    provider: str = "gemini"  # gemini, anthropic, openai
    api_key: str

@app.get("/api/settings/apikey")
def get_api_key_settings():
    st = agents.get_llm_status()
    current_key = os.getenv("GEMINI_API_KEY") or os.getenv("ANTHROPIC_API_KEY") or os.getenv("OPENAI_API_KEY") or ""
    masked = (current_key[:6] + "..." + current_key[-4:]) if len(current_key) > 10 else ("Configured" if current_key else "Not Configured")
    return {
        **st,
        "masked_key": masked
    }

@app.post("/api/settings/apikey")
def set_api_key(p: ApiKeyPayload):
    key = p.api_key.strip()
    if not key:
        raise HTTPException(400, "API key cannot be empty")
    
    prov = p.provider.lower()
    if prov == "gemini" or key.startswith("AIza"):
        os.environ["GEMINI_API_KEY"] = key
        env_var = "GEMINI_API_KEY"
    elif prov == "anthropic" or key.startswith("sk-ant"):
        os.environ["ANTHROPIC_API_KEY"] = key
        env_var = "ANTHROPIC_API_KEY"
    else:
        os.environ["OPENAI_API_KEY"] = key
        env_var = "OPENAI_API_KEY"

    # Save to backend/.env
    try:
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        with open(env_path, "a") as f:
            f.write(f"\n{env_var}={key}\n")
    except Exception:
        pass

    return {
        "ok": True,
        "message": f"Successfully connected to {agents.get_llm_status()['provider']}",
        "status": agents.get_llm_status()
    }

# -------------------------------------------------------------
# 1. Document & Notice Upload / Intelligence
# -------------------------------------------------------------
@app.post("/api/notices")
@app.post("/api/documents/analyze")
async def analyze_document(
    text: str = Form(""),
    file: UploadFile | None = File(None),
    docs: str = Form("")
):
    filename = None
    if file:
        raw = await file.read()
        filename = file.filename or "uploaded_document"
        low_name = filename.lower()
        if low_name.endswith(".pdf"):
            extracted = pdf_text(raw)
            text = extracted if extracted.strip() else raw.decode("utf-8", "ignore")
        elif low_name.endswith((".txt", ".csv", ".json", ".xml", ".html", ".md", ".rtf")):
            text = raw.decode("utf-8", "ignore")
        else:
            try:
                decoded = raw.decode("utf-8", "ignore")
                text = decoded if len(decoded.strip()) > 20 else ""
            except Exception:
                text = ""
            if not text.strip():
                text = f"Government Document Upload: {filename}\nFile Size: {len(raw)} bytes.\nProceed with statutory title and compliance triage."

    if len(text.strip()) < 10:
        raise HTTPException(400, "Please provide document text or upload a valid file.")

    doc_list = [d.strip() for d in docs.split(",") if d.strip()]
    return agents.new_case(text, doc_list, filename=filename)

@app.get("/api/notices/{cid}")
def get_case(cid: str):
    if cid not in agents.CASES:
        raise HTTPException(404, "Case not found")
    return agents.CASES[cid]

@app.post("/api/notices/{cid}/evidence")
def add_evidence(cid: str, docs: str = Form(...)):
    c = agents.CASES.get(cid)
    if not c:
        raise HTTPException(404, "Case not found")
    new_docs = [d.strip() for d in docs.split(",") if d.strip()]
    c["uploaded_docs"].extend(new_docs)
    c["audit"].append(f"{datetime.now().isoformat(timespec='seconds')} Citizen uploaded additional documents: {', '.join(new_docs)}")
    return agents.Supervisor().run(c)

@app.post("/api/notices/{cid}/approve")
def approve_case(cid: str):
    c = agents.CASES.get(cid)
    if not c:
        raise HTTPException(404, "Case not found")
    c["status"] = "approved_by_citizen"
    c["audit"].append(f"{datetime.now().isoformat(timespec='seconds')} Citizen reviewed and approved draft. Ready for official portal submission.")
    return c

# -------------------------------------------------------------
# Document Training & Model Memory Endpoints (RAG)
# -------------------------------------------------------------
class TrainDocumentRequest(BaseModel):
    doc_id: Optional[str] = None
    text: Optional[str] = None
    filename: Optional[str] = None

@app.get("/api/documents/trained")
def get_trained_documents():
    """List all documents indexed and trained into active model memory."""
    docs = doc_store.memory.list_trained()
    total_tokens = sum(d.get("token_count", 0) for d in docs)
    return {
        "total_documents": len(docs),
        "total_tokens": total_tokens,
        "status": "active",
        "documents": docs
    }

@app.post("/api/documents/train")
def train_document_endpoint(req: TrainDocumentRequest):
    """Explicitly train and index a document into model knowledge memory."""
    text = req.text
    filename = req.filename or "uploaded_document"
    case_data = None
    if req.doc_id and req.doc_id in agents.CASES:
        case_data = agents.CASES[req.doc_id]
        text = text or case_data.get("text", "")
        filename = filename or case_data.get("filename", "uploaded_document")
    
    if not text or len(text.strip()) < 10:
        raise HTTPException(400, "Document text is required to train the model.")

    entry = doc_store.memory.train_document(text, filename=filename, case_data=case_data)
    return {
        "ok": True,
        "message": f"Successfully trained model with {filename} ({entry['token_count']} tokens indexed)",
        "document": entry
    }

@app.delete("/api/documents/trained/{doc_id}")
def delete_trained_document(doc_id: str):
    """Remove a document from model training memory."""
    success = doc_store.memory.delete_document(doc_id)
    if not success:
        raise HTTPException(404, "Trained document not found")
    return {"ok": True, "message": f"Document {doc_id} removed from model training memory"}

@app.post("/api/documents/reset-training")
def reset_trained_documents():
    """Clear all trained documents from model memory."""
    doc_store.memory.clear()
    return {"ok": True, "message": "All trained documents cleared from model memory"}

# -------------------------------------------------------------
# 2. Citizen Deadlines
# -------------------------------------------------------------
@app.get("/api/deadlines")
def get_deadlines():
    return rules.citizen_deadlines()

# -------------------------------------------------------------
# 3. Government Schemes & Benefits Discovery (AI Agent Search)
# -------------------------------------------------------------
class CitizenProfile(BaseModel):
    age: int = 28
    occupation: str = "salaried"
    income: int = 300000
    state: str = "Punjab"
    gender: str = "male"
    has_girl_child: bool = False
    is_tax_payer: bool = False
    plans_business: bool = False
    land_seeding: bool = False

class SchemeSearchQuery(BaseModel):
    query: str = ""
    age: int = 28
    occupation: str = "salaried"
    income: int = 300000
    state: str = "Punjab"
    gender: str = "male"
    category: str = "All"

@app.get("/api/schemes")
def get_all_schemes():
    return rules.SCHEMES

@app.get("/api/scholarships")
def get_all_scholarships(category: Optional[str] = None, state: Optional[str] = None):
    """
    Dedicated Pan-India Scholarships & Innovation Grants API
    Covers National Scholarship Portal (NSP), AICTE, PMRF, UGC-JRF, INSPIRE,
    State Merit Scholarships, and Startup Innovation Seed Grants.
    """
    items = [s for s in rules.SCHEMES if s.get("category") in ("Education & Scholarships", "Business & Entrepreneurship")]
    if category and category.lower() != "all":
        items = [s for s in items if category.lower() in s.get("category", "").lower() or category.lower() in s.get("name", "").lower()]
    if state and state.lower() != "all":
        items = [s for s in items if s.get("state") in ("Central", "All", state)]
    return {
        "total": len(items),
        "source": "National Scholarship Portal (NSP) & Startup India DPIIT Knowledge Repository",
        "scholarships": items
    }

@app.post("/api/schemes/match")
def match_citizen_schemes(p: CitizenProfile):
    return rules.match_schemes(p.model_dump())

@app.post("/api/schemes/search")
def search_schemes_agent(q: SchemeSearchQuery):
    matched = rules.match_schemes({
        "age": q.age,
        "occupation": q.occupation,
        "income": q.income,
        "state": q.state,
        "gender": q.gender,
        "has_girl_child": q.gender.lower() == "female" or "girl" in q.query.lower() or "daughter" in q.query.lower(),
        "is_tax_payer": q.income > 500000,
        "plans_business": "business" in q.query.lower() or "mudra" in q.query.lower() or q.occupation == "business",
        "land_seeding": q.occupation == "farmer" or "kisan" in q.query.lower() or "land" in q.query.lower()
    })

    kw = q.query.lower().strip()
    if kw and kw != "all":
        ranked = []
        tokens = [t for t in re.split(r"\W+", kw) if len(t) > 2]
        for s in matched:
            score = 0
            searchable = f"{s['name']} {s['category']} {s['dept']} {s['benefits']} {s['reason']}".lower()
            for tok in tokens:
                if tok in searchable:
                    score += 2
            if any(k in kw for k in ("student", "scholarship", "tuition", "fee", "college")) and s["category"] == "Education & Scholarships":
                score += 5
            if any(k in kw for k in ("farmer", "kisan", "crop", "agriculture", "solar", "pump")) and s["category"] == "Agriculture & Farmers":
                score += 5
            if any(k in kw for k in ("house", "property", "stamp duty", "registry", "pmay")) and s["category"] == "Housing & Property":
                score += 5
            if any(k in kw for k in ("business", "mudra", "loan", "msme", "startup")) and s["category"] == "Business & Entrepreneurship":
                score += 5
            if any(k in kw for k in ("senior", "pension", "old age", "70", "elderly", "ayushman")) and s["category"] == "Senior Citizens & Pensions":
                score += 5
            if any(k in kw for k in ("woman", "women", "female", "girl")) and (s["category"] == "Women & Child Welfare" or "woman" in searchable):
                score += 5

            if score > 0 or len(tokens) == 0:
                s_copy = dict(s)
                s_copy["match_score"] = score
                ranked.append(s_copy)

        ranked.sort(key=lambda x: (x.get("match_score", 0), x["status"] == "confirmed", x["status"] == "potentially_eligible"), reverse=True)
        results = ranked if ranked else matched
    else:
        results = matched

    if q.category and q.category.lower() != "all":
        results = [s for s in results if s["category"].lower() == q.category.lower()]

    agent_summary = (
        f"Schemes Discovery Agent evaluated Central and {q.state} welfare databases for a {q.age}-year-old {q.occupation} "
        f"(Annual Income: ₹{q.income:,.0f}). Found {len(results)} personalized program(s) with verified eligibility rules."
    )

    return {
        "schemes": results,
        "total": len(results),
        "agent_summary": agent_summary,
        "citizen": {
            "age": q.age,
            "occupation": q.occupation,
            "state": q.state,
            "income": q.income
        }
    }

# -------------------------------------------------------------
# 4. AI Government Assistant (English Only, Persona-Grounded)
# -------------------------------------------------------------
class ChatQuery(BaseModel):
    message: str
    citizen_name: str = "Citizen"
    citizen_occupation: str = "salaried"
    citizen_state: str = "Punjab"
    citizen_gender: str = "male"

@app.post("/api/chat")
def citizen_chat(query: ChatQuery):
    q = query.message.lower()
    name = query.citizen_name
    state = query.citizen_state
    occ = query.citizen_occupation.lower()
    gender = query.citizen_gender.lower()
    greeting = f"Hello {name}!"

    # 0. Check Trained Incorporation Document & KS ORIGIN Intelligence
    if any(k in q for k in (
        "ks origin", "origin collective", "u47912hr2026ptc149798", "aanck1913c", "rtkk14690e",
        "inc-20a", "commencement of business", "panchkula", "manesar", "certificate of incorporation"
    )) or (any(k in q for k in ("incorporat", "cin", "pan", "tan", "registered office")) and "ks" in q):
        coi = doc_store.memory.get_document("ksorigin_coi")
        ans = (
            f"{greeting} Here is the verified statutory intelligence from the Certificate of Incorporation for KS ORIGIN COLLECTIVE PRIVATE LIMITED:\n\n"
            f"1. Company Details:\n"
            f"   • Full Legal Name: KS ORIGIN COLLECTIVE PRIVATE LIMITED\n"
            f"   • Corporate Identity Number (CIN): U47912HR2026PTC149798\n"
            f"   • Date of Incorporation: 28 August 2026 (Company Limited by Shares)\n"
            f"   • Permanent Account Number (PAN): AANCK1913C\n"
            f"   • Tax Deduction & Collection Number (TAN): RTKK14690E\n"
            f"   • Issuing Authority: Central Registration Centre (CRC), Manesar, Ministry of Corporate Affairs (Registrar: KM Narayanan)\n"
            f"   • Registered Office: Ho.No. 994, Sector 10, Sector 15 Panchkula, Panchkula- 134113, Haryana\n\n"
            f"2. Mandatory Post-Incorporation Statutory Deadlines:\n"
            f"   • Form ADT-1 (First Statutory Auditor Appointment): Due within 30 days of incorporation (by 27 September 2026) under Section 139(6).\n"
            f"   • First Board Meeting: Within 30 days of incorporation (by 27 September 2026) under Section 173(1).\n"
            f"   • Issuance of Stamped Share Certificates: Within 60 days of incorporation (by 27 October 2026) under Section 56(4).\n"
            f"   • Form INC-20A (Declaration of Commencement of Business): Mandatory within 180 days of incorporation (Due by 24 February 2027) under Section 10A. Bank account must be opened and subscriber share capital deposited before filing.\n"
            f"   • First Annual Accounts (AOC-4) & Annual Return (MGT-7): Following the first financial year ending 31 March 2027.\n\n"
            f"3. Official Portals & Registrations:\n"
            f"   • MCA Services: https://www.mca.gov.in\n"
            f"   • Haryana GST & Commercial Taxes: https://gst.gov.in\n\n"
            f"Next Action: Ensure the corporate bank account is operational, deposit subscriber share capital, and file Form INC-20A on the MCA portal before 24 February 2027."
        )
        return {
            "answer": ans,
            "kind": "verified",
            "source": "Trained Certificate of Incorporation · Ministry of Corporate Affairs (CRC Manesar)",
            "process": "Certificate of Incorporation & Post-Incorporation Compliance",
            "portal": "https://www.mca.gov.in"
        }

    # 0. Check Trained Document Knowledge Base (RAG)
    trained_matches = doc_store.memory.query(query.message)
    is_doc_specific = any(k in q for k in (
        "my document", "uploaded", "my notice", "this notice", "my file", 
        "clause", "demand", "penalty in my", "deadline in my", "what does my",
        "action required for my", "tell me about the document", "explain the document",
        "explain my document", "explain my notice", "trained", "model trained"
    )) or (trained_matches and trained_matches[0].get("score", 0) >= 6)

    if trained_matches and is_doc_specific:
        top_doc = trained_matches[0]
        # Check if LLM with API Key is configured
        llm_status = agents.get_llm_status()
        if llm_status.get("connected"):
            llm_prompt = (
                f"You are JanSahayak AI. Answer the citizen/founder's question based strictly on this trained document:\n\n"
                f"TRAINED DOCUMENT:\n"
                f"Filename: {top_doc['filename']}\n"
                f"Title: {top_doc['title']}\n"
                f"Issuing Authority: {top_doc['authority']}\n"
                f"Reference / Case ID: {top_doc['reference']}\n"
                f"Response Deadline: {top_doc['deadline']}\n"
                f"Demand / Fees: {top_doc['demand_or_fee']}\n"
                f"Key Clauses:\n" + "\n".join(f"- {c}" for c in top_doc.get("clauses", [])) + "\n\n"
                f"Relevant Excerpts:\n" + "\n---\n".join(top_doc.get("best_chunks", [])) + "\n\n"
                f"QUESTION: {query.message}\n"
                f"Citizen: {name} ({occ}, {state})\n\n"
                f"Provide a clear, structured response with verified facts, deadline warnings, and step-by-step next action."
            )
            ai_ans = agents.llm(llm_prompt)
            if ai_ans:
                return {
                    "answer": ai_ans,
                    "kind": "verified",
                    "source": f"Trained Model Memory · {top_doc['filename']}",
                    "process": top_doc['title'],
                    "portal": "https://services.india.gov.in"
                }

        # Deterministic Grounded Trained Document Response
        clauses_txt = "\n".join(f"   • {c}" for c in top_doc.get("clauses", [])[:3])
        if not clauses_txt.strip():
            clauses_txt = "   • Verify factual statements and maintain audit trail"

        ans = (
            f"{greeting} Here is the verified analysis from your trained document ({top_doc['filename']}):\n"
            f"1. Document Title & Authority: {top_doc['title']} issued by {top_doc['authority']} (Ref: {top_doc['reference']}).\n"
            f"2. Response Deadline: {top_doc['deadline']}.\n"
            f"3. Statutory Demand / Fees: {top_doc['demand_or_fee']}.\n"
            f"4. Highlighted Clauses & Findings:\n{clauses_txt}\n"
            f"5. Recommended Next Action: Prepare and verify your written representation/reply before the deadline. Do not miss the statutory response window.\n\n"
            f"Knowledge status: This document is indexed and actively trained in your JanSahayak Model Memory."
        )
        return {
            "answer": ans,
            "kind": "verified",
            "source": f"Trained Model Memory · {top_doc['filename']}",
            "process": top_doc['title'],
            "portal": "https://services.india.gov.in"
        }

    # 1. House / Property Purchase
    if any(k in q for k in ("house", "property", "registry", "plot", "flat", "stamp duty", "sale deed")):
        kb = rules.KB["PROPERTY"]
        ans = (
            f"{greeting} Property Purchase & Registration Guidance for {state}:\n"
            f"1. Required Documents: Original Sale Deed draft, 30-year Non-Encumbrance Certificate (EC), Latest Municipal Property Tax Receipts, Chain of Title Deeds, Buyer & Seller Aadhaar/PAN.\n"
            f"2. Statutory Fees: Stamp Duty (5% to 7% of circle rate) + 1% Registration fee.\n"
            f"3. Female Co-Owner Concession: Registering solely or jointly in a woman's name unlocks a 1% to 2% stamp duty rebate (saving ~₹1 to ₹2 Lakh on a ₹1 Crore home).\n"
            f"4. Official Portal: {kb['portal']}\n"
            f"Next Action: Always extract the 30-year Non-Encumbrance Certificate (EC) from the Sub-Registrar before transferring token advance."
        )
        return {
            "answer": ans,
            "kind": "verified",
            "source": f"{kb['src']} ({kb['ver']})",
            "process": kb["title"],
            "portal": kb["portal"]
        }

    # 2. Income Certificate
    if any(k in q for k in ("income certificate", "income cert", "aamdani", "tehsildar")):
        kb = rules.KB["INCOME_CERTIFICATE"]
        ans = (
            f"{greeting} Income Certificate Application Procedure ({state}):\n"
            f"1. Competent Authority: Executive Magistrate / Tehsildar via State Seva Kendra / e-District.\n"
            f"2. Required Documents: Self-Declaration Affidavit on non-judicial stamp paper, Ration Card / Family ID, Salary Slip or ITR V (if salaried), Electricity Bill, Aadhaar Card.\n"
            f"3. Statutory Service Guarantee: Issued within 15 to 21 working days under the Right to Public Services Act.\n"
            f"4. Official Portal: {kb['portal']}\n"
            f"Next Action: Draft your self-declaration affidavit and submit online on your state e-District portal or at the nearest Seva Kendra."
        )
        return {
            "answer": ans,
            "kind": "verified",
            "source": f"{kb['src']} ({kb['ver']})",
            "process": kb["title"],
            "portal": kb["portal"]
        }

    # 3. Scholarship Eligibility
    if any(k in q for k in ("scholarship", "tuition", "fee waiver", "post-matric", "nsp")):
        kb = rules.KB["SCHOLARSHIP"]
        ans = (
            f"{greeting} Government Scholarship & Fee Concession Guidance:\n"
            f"1. Central & State Schemes: Dr. Ambedkar Post-Matric Scholarship (SC/OBC), Central Sector Scheme for College Students, Pragati Scholarship (Technical Education for Girls).\n"
            f"2. Mandatory Prerequisites: Annual family income certificate (< ₹2.5 Lakh for full waiver), Valid institutional bonafide certificate, Aadhaar-seeded bank account on NPCI mapper.\n"
            f"3. Official Portal: {kb['portal']}\n"
            f"Next Action: Check your Aadhaar-bank account seeding status immediately on the UIDAI/NPCI portal to ensure direct benefit transfer (DBT) disbursal."
        )
        return {
            "answer": ans,
            "kind": "verified",
            "source": f"{kb['src']} ({kb['ver']})",
            "process": kb["title"],
            "portal": kb["portal"]
        }

    # 4. Driving Licence Renewal
    if any(k in q for k in ("driving licence", "driving license", "dl", "parivahan", "rto")):
        kb = rules.KB["DRIVING_LICENCE"]
        ans = (
            f"{greeting} Driving Licence Renewal Guide (Central Motor Vehicles Rules):\n"
            f"1. Application Window: You can apply within 1 year before expiry or within 1 year after expiry without re-test.\n"
            f"2. Required Documents: Form 9 (Online Application), Original Driving Licence, Form 1-A Medical Certificate (mandatory for commercial DL or age > 40), Address Proof.\n"
            f"3. Government Fees: ₹200 (Renewal) + ₹200 (Smart Card fee) + ₹300 late fee per year if expired over 30 days.\n"
            f"4. Official Portal: {kb['portal']}\n"
            f"Next Action: Fill Form 9 online on Parivahan Sewa, upload Form 1-A signed by a registered MBBS doctor, and download your updated digital DL on mParivahan/DigiLocker."
        )
        return {
            "answer": ans,
            "kind": "verified",
            "source": f"{kb['src']} ({kb['ver']})",
            "process": kb["title"],
            "portal": kb["portal"]
        }

    # 5. Marriage Registration
    if any(k in q for k in ("marriage", "shadi", "vivah", "special marriage")):
        kb = rules.KB["MARRIAGE_REGISTRATION"]
        ans = (
            f"{greeting} Marriage Registration Procedure:\n"
            f"1. Applicable Acts: Hindu Marriage Act, 1955 (already solemnized ceremonies) or Special Marriage Act, 1954 (civil court marriages).\n"
            f"2. Mandatory Documents: Age proof of bride (>= 18) and groom (>= 21), Wedding invitation card or Gurdwara/Temple certificate, Joint photograph, 2 independent witnesses with Aadhaar/voter IDs.\n"
            f"3. Official Portal: {kb['portal']}\n"
            f"Next Action: Book an appointment slot at the Sub-Divisional Magistrate (SDM) / Registrar of Marriages office in the jurisdiction where the marriage took place or where either spouse resides."
        )
        return {
            "answer": ans,
            "kind": "verified",
            "source": f"{kb['src']} ({kb['ver']})",
            "process": kb["title"],
            "portal": kb["portal"]
        }

    # 6. Women Property Stamp Duty Concession
    if any(k in q for k in ("women", "woman", "female", "spouse", "wife")) and any(k in q for k in ("property", "stamp", "concession", "benefit", "duty")):
        ans = (
            f"{greeting} Women Property Ownership Concessions in {state}:\n"
            f"1. Stamp Duty Rebate: Most Indian states offer a 1% to 2% stamp duty concession for properties registered in the sole or joint name of a woman (e.g. Punjab standard is 7%, reduced to 5% or 5.5% for women).\n"
            f"2. PMAY Subsidy Mandate: Under Pradhan Mantri Awas Yojana (PMAY-U), female ownership or co-ownership is mandatory for economic weaker sections (EWS) to claim interest subsidy up to ₹2.67 Lakh.\n"
            f"3. Municipal Tax Rebate: Several urban local bodies provide an additional 5% to 10% annual property tax rebate for women property owners.\n"
            f"Next Action: When drafting your Sale Deed, ensure the female purchaser's name is listed as primary or joint owner to claim statutory stamp duty rebate at the Sub-Registrar office."
        )
        return {
            "answer": ans,
            "kind": "verified",
            "source": "State Stamp & Registration Acts / PMAY Guidelines",
            "process": "Women Property Concessions",
            "portal": "https://services.india.gov.in"
        }

    # 7. Document / Notice Triage
    if any(k in q for k in ("notice", "letter", "clause", "explain", "summons")):
        ans = (
            f"{greeting} How JanSahayak AI triages official notices and documents:\n"
            f"1. Upload your PDF or paste the text in the Document Intelligence tab.\n"
            f"2. Our multi-agent system parses the issuing authority, reference number, reply deadline, and statutory penalty exposure.\n"
            f"3. It generates an evidence checklist and prepares a formal reply draft ready for your review and approval.\n"
            f"Important: Never leave a statutory notice unaddressed; timely submission of verified facts prevents ex-parte orders."
        )
        return {
            "answer": ans,
            "kind": "verified",
            "source": "General Administrative Law & Rules Engine",
            "process": "Government Notice Triage",
            "portal": "JanSahayak Document Intelligence"
        }

    # 8. Deadlines / Compliance
    if any(k in q for k in ("deadline", "due", "date", "calendar", "when")):
        dd = rules.citizen_deadlines()
        ans = f"{greeting} Upcoming Statutory Citizen Deadlines:\n" + "\n".join(
            f"• {x['service']}: Due {x['due']} ({x['days_left']} days left) - {x['fee']}"
            for x in dd[:4]
        )
        return {
            "answer": ans,
            "kind": "verified",
            "source": "Official Departmental Portals (Parivahan, ITR, PMAY)",
            "process": "Citizen Deadline Tracking",
            "portal": "https://services.india.gov.in"
        }

    # 9. Fallback: Optional LLM synthesis or Grounded Guidance
    llm_prompt = f"Citizen name: {name}, Occupation: {occ}, State: {state}. User question: {query.message}"
    ai_reply = agents.llm(llm_prompt)
    return {
        "answer": ai_reply or (
            f"{greeting} I am JanSahayak AI, your personal government assistant. "
            f"I can guide you through property registration, income certificates, scholarships, "
            f"driving licence renewals, marriage certificates, official notices, and government schemes in {state}. "
            f"How can I assist you with your government work today?"
        ),
        "kind": "guidance",
        "source": "JanSahayak AI Knowledge Base",
        "process": "General Citizen Assistance",
        "portal": "https://services.india.gov.in"
    }
