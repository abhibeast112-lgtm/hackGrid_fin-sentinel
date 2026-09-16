# Fin-Sentinel 🛡️
## Autonomous AI Financial Control Tower

Fin-Sentinel is an enterprise-grade financial surveillance and multi-agent reconciliation control tower built for CFOs, Treasurers, and Financial Controllers. It intercepts ERP remittances, invoices, and purchase orders in real-time, subjecting every flagged anomaly to counterfactual adversarial proofing before payment commitment.

---

### Tech Stack
- **Frontend**: Next.js 16 (App Router, TypeScript), Tailwind CSS, Lucide React icons, Recharts
- **Backend**: FastAPI (Python 3.14), Pydantic, Uvicorn
- **Design System**: Bloomberg / Datadog high-density terminal dark mode
- **Theme Gradients**: `#021C4F` (Deep Midnight Navy) to `#C50337` (Crimson Sentinel Red)
- **Typography**: Space Grotesk (geometric headers) + JetBrains Mono (monospaced financial data and cryptographic hash provenance) + Inter (scannable UI copy)

---

### Architecture & Screens

1. **Executive Dashboard (`/dashboard`)**
   - **4 Top Metric Cards**: Total Cash Position (₹42.8 L, +4.2%), Monthly Revenue (₹1.82 Cr, +12.4%), Monthly Expenses (₹1.31 Cr, +18.4% amber warning), Active Exceptions Flagged (3 Critical, red pulse badge).
   - **Cashflow Outflow & Anomaly Envelope**: Recharts area telemetry tracking monthly remittance volumes against 3-sigma predictive bounds.
   - **Critical Exceptions Table**: Risk scores, exception types, affected vendor profiles, amount at risk, live agent pipeline status, and direct `[ Investigate ]` actions.

2. **Investigation Room (`/investigation/[id]`) — The Killer Demo View**
   - **3-Column Split View Layout**:
     - **Column 1 (25% width)**: Real-time Multi-Agent Stepper (Orchestrator Agent, Risk Investigator Agent, Evidence Agent, Adversarial Challenge Agent, Human Checkpoint).
     - **Column 2 (45% width)**: Side-by-side transaction diff viewer (Box A recorded payment vs Box B flagged payment), Adversarial Challenge Verdict with hypothesis refutation, and clickable cross-source document cards (`Invoice_INV1042.pdf`, `PO_902.pdf`, `Bank_Feed_Sep.csv`) with OCR & SHA-256 inspection modal.
     - **Column 3 (30% width)**: Sticky Human Decision Panel with review SLA timer, reviewer notes textarea with quick preset tags, and high-contrast actions (`[ Approve Payment ]`, `[ Reject & Block Transaction ]`, `[ Escalate to CFO ]`).
     - **Cryptographic Audit Log**: Every decision generates a tamper-evident SHA hash and locks state immediately.

3. **CFO Executive Report (`/reports`)**
   - **Audit Briefing**: Summary of total financial exposure across all exceptions (₹2,79,500 total at risk).
   - **Pipeline Breakdown**: Visual balance between "Pending Human Action" and "Resolved Exceptions".
   - **Formal CFO Prose**: Executive opinion letter addressing Board Audit Committee.
   - **Immutable Decision Ledger**: Historical audit trail with cryptographic hashes and signers.
   - **Export Actions**: `[ Export Audit Report (PDF) ]` with print CSS styling and `[ Export JSON ]`.

---

### Running Locally

#### 1. Start the FastAPI Backend (Port 8000)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Backend API endpoints:
- `GET /api/exceptions` -> Returns flagged anomalies
- `GET /api/investigation/:id` -> Returns live multi-agent trace and evidence
- `POST /api/decision` -> Payload: `{ exception_id: string, decision: 'APPROVE' | 'REJECT' | 'ESCALATE', reviewer_notes: string }`

#### 2. Start the Next.js Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (auto-redirects to `/dashboard`).
*Note: The frontend also contains built-in Next.js route handlers with fallback mock data, so it works completely seamlessly even when running standalone!*
