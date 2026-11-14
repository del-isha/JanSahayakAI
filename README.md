# JanSahayak AI (Trouble Shooters)
**Government processes, made simpler for every Indian.**
*Understand your documents. Discover your benefits. Manage your deadlines. Get government work done with AI.*

JanSahayak AI is an agentic, citizen-first government assistance and execution platform designed for every Indian citizen — students, working professionals, women, farmers, senior citizens, homebuyers, small business owners, and families.

A multi-agent supervisor graph coordinates specialized agents:
- **Document AI Agent**: Reads, parses and extracts key clauses, entities, and deadlines from government notices, sale deeds, certificates, and application receipts.
- **Research Agent**: Connects official government guidelines, circulars, portal links, and verified statutory fees.
- **Evidence Agent**: Compares required document checklists against uploaded papers and highlights missing items.
- **Planner Agent**: Generates actionable, personalized citizen step-by-step checklists with due dates.
- **Drafting Agent**: Prepares polite, legally framed representations, application drafts, and affidavits with citizen review.
- **QA Agent**: Enforces human-in-the-loop sign-off, alerts to deadlines, and prevents unauthorized filings.

---

## Architecture & Tech Stack
- **Frontend**: React (Vite) + Clean Citizen-First Design System.
- **Backend**: FastAPI + Python 3.10+ (uvicorn).
- **Rules Engine**: Deterministic rules engine grounding deadlines, statutory fees, and 5-state scheme eligibility.
- **Official Sources Grounded**: National Government Services Portal (services.india.gov.in), myScheme, Parivahan Sewa, e-District portals, UMANG, DigiLocker.

---

## Running Locally

### Backend:
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8001
```

### Frontend:
```bash
cd frontend
npm run dev
```
Visit: **http://localhost:5173** (proxies `/api` to `http://localhost:8001`).
