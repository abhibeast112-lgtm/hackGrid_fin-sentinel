from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime

app = FastAPI(title="Fin-Sentinel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DecisionPayload(BaseModel):
    exception_id: str
    decision: Literal["APPROVE", "REJECT", "ESCALATE"]
    reviewer_notes: str

# In-memory storage for decisions and exceptions
DECISIONS = []

EXCEPTIONS = [
    {
        "id": "EXC-101",
        "risk_level": "High Risk",
        "risk_score": 94,
        "exception_type": "Potential Duplicate Payment",
        "vendor": "Acme Systems",
        "vendor_code": "VND-8821",
        "invoice_no": "INV-1042",
        "amount_at_risk": 84500,
        "currency": "INR",
        "formatted_amount": "₹84,500",
        "agent_pipeline_status": "Challenge Phase",
        "created_at": "2026-09-12T10:31:00Z",
        "summary": "Duplicate invoice reference detected across two independent ERP payment batches within 17 minutes.",
        "status": "AWAITING_DECISION",
    },
    {
        "id": "EXC-102",
        "risk_level": "High Risk",
        "risk_score": 82,
        "exception_type": "Contract-PO Variance",
        "vendor": "TechCorp India",
        "vendor_code": "VND-4109",
        "invoice_no": "TC-9941",
        "amount_at_risk": 15000,
        "currency": "INR",
        "formatted_amount": "₹15,000",
        "agent_pipeline_status": "Evidence Ready",
        "created_at": "2026-09-13T14:15:00Z",
        "summary": "Line item hourly rate (₹2,800/hr) exceeds Master Services Agreement cap (₹2,200/hr) by 27.2%.",
        "status": "AWAITING_DECISION",
    },
    {
        "id": "EXC-103",
        "risk_level": "Med Risk",
        "risk_score": 76,
        "exception_type": "Anomaly: Sudden Volume Spike",
        "vendor": "Global Logistics",
        "vendor_code": "VND-1903",
        "invoice_no": "GL-3420",
        "amount_at_risk": 180000,
        "currency": "INR",
        "formatted_amount": "₹1,80,000",
        "agent_pipeline_status": "Awaiting Review",
        "created_at": "2026-09-14T09:05:00Z",
        "summary": "340% month-over-month billing increase without corresponding increase in logistics delivery waybills.",
        "status": "AWAITING_DECISION",
    },
]

INVESTIGATION_DETAILS = {
    "EXC-101": {
        "id": "EXC-101",
        "title": "Flagged Exception: Potential Duplicate Payment (INV-1042)",
        "vendor": "Acme Systems",
        "vendor_category": "Hardware & Cloud Infrastructure",
        "risk_score": 94,
        "risk_level": "High Risk",
        "amount_at_risk": 84500,
        "currency": "INR",
        "formatted_amount": "₹84,500",
        "status": "AWAITING_HUMAN_CHECKPOINT",
        "timeline": [
            {
                "step": 1,
                "agent": "Orchestrator Agent",
                "role": "Pipeline Coordinator",
                "status": "completed",
                "timestamp": "10:31:02 AM",
                "duration": "120ms",
                "description": "Triggered on ingestion batch #4819. Dispatched risk evaluation and isolated payment records.",
                "badge": "Orchestrated"
            },
            {
                "step": 2,
                "agent": "Risk Investigator Agent",
                "role": "Pattern Recognition",
                "status": "completed",
                "timestamp": "10:31:04 AM",
                "duration": "840ms",
                "description": "Flagged Duplicate: 94% confidence. Found near-identical token signature with TXN-8392.",
                "badge": "Flagged Duplicate (94%)"
            },
            {
                "step": 3,
                "agent": "Evidence Agent",
                "role": "Cross-System Retrieval",
                "status": "completed",
                "timestamp": "10:31:07 AM",
                "duration": "1.2s",
                "description": "Gathered 3 cross-source records: SAP ERP Ledger, HDFC Corporate Bank Feed, and PO-902 scanned artifact.",
                "badge": "3 Sources Verified"
            },
            {
                "step": 4,
                "agent": "Adversarial Challenge Agent",
                "role": "Counterfactual Validator",
                "status": "completed",
                "timestamp": "10:31:11 AM",
                "duration": "2.4s",
                "description": "Attempted to disprove finding; confirmed partial settlement mismatch. Hypothesis of split tranche rejected.",
                "badge": "Hypothesis Rejected"
            },
            {
                "step": 5,
                "agent": "Human Checkpoint",
                "role": "Financial Controller",
                "status": "awaiting_input",
                "timestamp": "10:31:12 AM",
                "duration": "Active",
                "description": "Awaiting Financial Controller sign-off or CFO escalation before transaction commit to payment gateway.",
                "badge": "Awaiting Input"
            }
        ],
        "comparison": {
            "box_a": {
                "title": "Box A (Recorded Payment 1)",
                "txn_id": "TXN-8392",
                "date": "Sep 12, 10:14 AM",
                "amount": "₹84,500",
                "status": "Cleared",
                "status_color": "emerald",
                "invoice_ref": "INV-1042",
                "channel": "HDFC RTGS",
                "beneficiary_account": "HDFC-****-9921",
                "gl_code": "GL-60124 (IT Equipment)"
            },
            "box_b": {
                "title": "Box B (Flagged Payment 2)",
                "txn_id": "TXN-8417",
                "date": "Sep 12, 10:31 AM",
                "amount": "₹84,500",
                "status": "Pending Approval",
                "status_color": "rose",
                "invoice_ref": "INV-1042-DUP",
                "channel": "ICICI NetBanking Batch",
                "beneficiary_account": "HDFC-****-9921",
                "gl_code": "GL-60124 (IT Equipment)"
            }
        },
        "adversarial_verdict": {
            "title": "Challenge Agent Analysis",
            "agent": "Adversarial Challenge Agent v4.1",
            "hypothesis": "TXN-8417 represents a legitimate milestone payment or contractual installment tranche.",
            "test_result": "Disproved",
            "verdict": "Purchase Order PO-902 clearly specifies 100% upfront settlement fulfilled by TXN-8392. Vendor master data does not allow recurring billing under this contract. High confidence duplicate.",
            "confidence": "98.4%",
            "flags": ["Duplicate Invoice Reference", "Identical Remittance Amount", "Sub-20min Batch Gap"]
        },
        "source_documents": [
            {
                "id": "doc-1",
                "filename": "Invoice_INV1042.pdf",
                "type": "PDF",
                "size": "248 KB",
                "source": "Vendor Portal Ingestion",
                "verification": "SHA-256 Verified",
                "preview_text": "Bill To: Acme Manufacturing Pvt. Ltd. | Invoice # INV-1042 | Amount: ₹84,500 | Terms: Net 0"
            },
            {
                "id": "doc-2",
                "filename": "PO_902.pdf",
                "type": "PDF",
                "size": "512 KB",
                "source": "SAP ERP S/4HANA",
                "verification": "100% Upfront Term Matched",
                "preview_text": "PO-902: 10x Enterprise Router Units | Total: ₹84,500 | Payment Milestone: Single Lump Sum"
            },
            {
                "id": "doc-3",
                "filename": "Bank_Feed_Sep.csv",
                "type": "CSV",
                "size": "1.4 MB",
                "source": "HDFC Corporate API",
                "verification": "Cleared TXN-8392 Confirmed",
                "preview_text": "2026-09-12 10:14:02, DEBIT, 84500.00, ACME SYSTEMS, UTR: HDFCR52026091200192"
            }
        ]
    },
    "EXC-102": {
        "id": "EXC-102",
        "title": "Flagged Exception: Contract-PO Variance (TC-9941)",
        "vendor": "TechCorp India",
        "vendor_category": "Software Consulting",
        "risk_score": 82,
        "risk_level": "High Risk",
        "amount_at_risk": 15000,
        "currency": "INR",
        "formatted_amount": "₹15,000",
        "status": "AWAITING_HUMAN_CHECKPOINT",
        "timeline": [
            {
                "step": 1,
                "agent": "Orchestrator Agent",
                "role": "Pipeline Coordinator",
                "status": "completed",
                "timestamp": "14:15:01",
                "duration": "95ms",
                "description": "Triggered by monthly contractor invoice parsing task.",
                "badge": "Orchestrated"
            },
            {
                "step": 2,
                "agent": "Risk Investigator Agent",
                "role": "Pattern Recognition",
                "status": "completed",
                "timestamp": "14:15:03",
                "duration": "620ms",
                "description": "Detected bill rate discrepancy against MSA Annexure B schedule.",
                "badge": "Rate Variance (82%)"
            },
            {
                "step": 3,
                "agent": "Evidence Agent",
                "role": "Cross-System Retrieval",
                "status": "completed",
                "timestamp": "14:15:06",
                "duration": "1.1s",
                "description": "Retrieved Signed MSA 2025-27, PO-4412, and Timesheet approval logs.",
                "badge": "3 Sources Verified"
            },
            {
                "step": 4,
                "agent": "Adversarial Challenge Agent",
                "role": "Counterfactual Validator",
                "status": "completed",
                "timestamp": "14:15:09",
                "duration": "1.8s",
                "description": "Evaluated if overtime surcharge clause applied. Confirmed no weekend work logged.",
                "badge": "Surcharge Disproved"
            },
            {
                "step": 5,
                "agent": "Human Checkpoint",
                "role": "Financial Controller",
                "status": "awaiting_input",
                "timestamp": "14:15:10",
                "duration": "Active",
                "description": "Requires adjustment credit note or vendor authorization.",
                "badge": "Awaiting Input"
            }
        ],
        "comparison": {
            "box_a": {
                "title": "Box A (Contract Rate - MSA Annexure B)",
                "txn_id": "MSA-2025-TC",
                "date": "Valid through Dec 2026",
                "amount": "₹2,200 / hr",
                "status": "Approved Baseline",
                "status_color": "emerald",
                "invoice_ref": "Cap Rate Level 3 Senior",
                "channel": "Contract Management System",
                "beneficiary_account": "TechCorp Bank A/C",
                "gl_code": "GL-52010 (Professional Fees)"
            },
            "box_b": {
                "title": "Box B (Submitted Invoice TC-9941)",
                "txn_id": "TC-9941",
                "date": "Sep 13, 02:15 PM",
                "amount": "₹2,800 / hr (+ ₹15,000 delta)",
                "status": "Pending Approval",
                "status_color": "rose",
                "invoice_ref": "25 Senior Engineer Hours",
                "channel": "Accounts Payable Queue",
                "beneficiary_account": "TechCorp Bank A/C",
                "gl_code": "GL-52010 (Professional Fees)"
            }
        },
        "adversarial_verdict": {
            "title": "Challenge Agent Analysis",
            "agent": "Adversarial Challenge Agent v4.1",
            "hypothesis": "Rate uplift allowed under Q3 emergency SLA escalation rider.",
            "test_result": "Disproved",
            "verdict": "Rider requires written CTO authorization email header. No ticket reference found in Jira or procurement ledger. Billed rate is non-compliant.",
            "confidence": "94.1%",
            "flags": ["Rate Cap Exceeded (+27.2%)", "Missing CTO Authorization", "Variance ₹15,000"]
        },
        "source_documents": [
            {
                "id": "doc-102-1",
                "filename": "MSA_TechCorp_Executed.pdf",
                "type": "PDF",
                "size": "890 KB",
                "source": "Ironclad CLM",
                "verification": "DocuSign Digital Seal",
                "preview_text": "Section 4.1: Senior Architecture Rate fixed at ₹2,200/hr for FY25-27"
            },
            {
                "id": "doc-102-2",
                "filename": "Invoice_TC9941.pdf",
                "type": "PDF",
                "size": "180 KB",
                "source": "AP Ingestion",
                "verification": "Unreconciled",
                "preview_text": "Invoice TC-9941 | Billed Rate: ₹2,800/hr | 25 Hours | Total: ₹70,000"
            }
        ]
    },
    "EXC-103": {
        "id": "EXC-103",
        "title": "Flagged Exception: Anomaly: Sudden Volume Spike (GL-3420)",
        "vendor": "Global Logistics",
        "vendor_category": "Freight & Fulfillment",
        "risk_score": 76,
        "risk_level": "Med Risk",
        "amount_at_risk": 180000,
        "currency": "INR",
        "formatted_amount": "₹1,80,000",
        "status": "AWAITING_HUMAN_CHECKPOINT",
        "timeline": [
            {
                "step": 1,
                "agent": "Orchestrator Agent",
                "role": "Pipeline Coordinator",
                "status": "completed",
                "timestamp": "09:05:01",
                "duration": "110ms",
                "description": "Periodic freight ledger audit job triggered.",
                "badge": "Orchestrated"
            },
            {
                "step": 2,
                "agent": "Risk Investigator Agent",
                "role": "Pattern Recognition",
                "status": "completed",
                "timestamp": "09:05:04",
                "duration": "980ms",
                "description": "Z-score outlier detection triggered: +3.4σ above 90-day vendor billing moving average.",
                "badge": "Volume Spike (76%)"
            },
            {
                "step": 3,
                "agent": "Evidence Agent",
                "role": "Cross-System Retrieval",
                "status": "completed",
                "timestamp": "09:05:07",
                "duration": "1.4s",
                "description": "Matched shipping manifestation logs with warehouse gate receipts.",
                "badge": "Waybill Crosscheck"
            },
            {
                "step": 4,
                "agent": "Adversarial Challenge Agent",
                "role": "Counterfactual Validator",
                "status": "completed",
                "timestamp": "09:05:11",
                "duration": "2.1s",
                "description": "Tested if festive inventory pre-stocking caused legitimate volume jump. 42% missing delivery slips.",
                "badge": "Partial Validation"
            },
            {
                "step": 5,
                "agent": "Human Checkpoint",
                "role": "Financial Controller",
                "status": "awaiting_input",
                "timestamp": "09:05:12",
                "duration": "Active",
                "description": "Requires supply chain manager corroboration.",
                "badge": "Awaiting Input"
            }
        ],
        "comparison": {
            "box_a": {
                "title": "Box A (3-Month Historical Average)",
                "txn_id": "HIST-AVG-90D",
                "date": "Jun - Aug 2026",
                "amount": "₹41,000 / month",
                "status": "Baseline Mean",
                "status_color": "emerald",
                "invoice_ref": "Avg 14 Shipments/mo",
                "channel": "Standard Freight",
                "beneficiary_account": "GL Logistics Bank",
                "gl_code": "GL-70300 (Logistics & Warehousing)"
            },
            "box_b": {
                "title": "Box B (Current Invoice GL-3420)",
                "txn_id": "GL-3420",
                "date": "Sep 14, 09:05 AM",
                "amount": "₹1,80,000 (+340% Spike)",
                "status": "Pending Approval",
                "status_color": "rose",
                "invoice_ref": "Claimed 62 Shipments",
                "channel": "Express Freight",
                "beneficiary_account": "GL Logistics Bank",
                "gl_code": "GL-70300 (Logistics & Warehousing)"
            }
        },
        "adversarial_verdict": {
            "title": "Challenge Agent Analysis",
            "agent": "Adversarial Challenge Agent v4.1",
            "hypothesis": "Festive season pre-dispatch surge explains 340% volume surge.",
            "test_result": "Inconclusive / Unverified",
            "verdict": "Warehouse dock logs only show 36 incoming trucks versus 62 claimed on GL-3420. ₹1,80,000 billing is unsupported by verifiable gate receipts.",
            "confidence": "89.2%",
            "flags": ["Volume Spike >3.4σ", "26 Missing Gate Receipts", "Unexplained ₹1,80,000"]
        },
        "source_documents": [
            {
                "id": "doc-103-1",
                "filename": "Invoice_GL3420.pdf",
                "type": "PDF",
                "size": "310 KB",
                "source": "Vendor Portal Ingestion",
                "verification": "Unverified Gate Count",
                "preview_text": "Invoice GL-3420 | 62 Express Deliveries | Total: ₹1,80,000"
            },
            {
                "id": "doc-103-2",
                "filename": "Warehouse_Dock_Inbound.csv",
                "type": "CSV",
                "size": "2.2 MB",
                "source": "WMS IoT Gate Scanner",
                "verification": "36 Matches, 26 Discrepancies",
                "preview_text": "Dock Receipt Count: 36 Verified Trucks between Sep 01-14"
            }
        ]
    }
}

@app.get("/api/exceptions")
def get_exceptions():
    return {"exceptions": EXCEPTIONS, "total_at_risk": 279500, "count": len(EXCEPTIONS)}

@app.get("/api/investigation/{exception_id}")
def get_investigation(exception_id: str):
    if exception_id not in INVESTIGATION_DETAILS:
        if "EXC-101" in INVESTIGATION_DETAILS:
            detail = dict(INVESTIGATION_DETAILS["EXC-101"])
            detail["id"] = exception_id
            return detail
        raise HTTPException(status_code=404, detail="Exception investigation not found")
    return INVESTIGATION_DETAILS[exception_id]

@app.post("/api/decision")
def record_decision(payload: DecisionPayload):
    record = {
        "id": f"DEC-{len(DECISIONS) + 1001}",
        "exception_id": payload.exception_id,
        "decision": payload.decision,
        "reviewer_notes": payload.reviewer_notes,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "reviewer": "Financial Controller (FC-84)",
        "audit_hash": f"0x{abs(hash(payload.exception_id + payload.decision)) % (16**8):08x}",
        "status": "COMMITTED"
    }
    DECISIONS.append(record)
    
    for exc in EXCEPTIONS:
        if exc["id"] == payload.exception_id:
            exc["status"] = f"RESOLVED_{payload.decision}"
            exc["agent_pipeline_status"] = f"Resolved: {payload.decision}"
            
    return {
        "success": True,
        "message": f"Decision {payload.decision} successfully committed to the immutable audit trail.",
        "record": record
    }

@app.get("/api/decisions")
def get_decisions():
    return {"decisions": DECISIONS}
