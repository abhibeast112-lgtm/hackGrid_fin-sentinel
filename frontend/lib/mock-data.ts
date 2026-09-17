import { FinancialException, InvestigationDetail, DecisionRecord } from './types';

export const INITIAL_EXCEPTIONS: FinancialException[] = [
  {
    id: 'EXC-101',
    backend_transaction_ids: ['TXN-8392', 'TXN-8417'],
    risk_level: 'High Risk',
    risk_score: 94,
    exception_type: 'Potential Duplicate Payment',
    vendor: 'Acme Systems',
    vendor_code: 'VND-8821',
    invoice_no: 'INV-1042',
    amount_at_risk: 84500,
    currency: 'INR',
    formatted_amount: '₹84,500',
    agent_pipeline_status: 'Challenge Phase',
    created_at: '2026-09-12T10:31:00Z',
    summary: 'Duplicate invoice reference detected across two independent ERP payment batches within 17 minutes.',
    status: 'AWAITING_DECISION',
    requires_approval: true,
    current_step: 2,
  },
  {
    id: 'EXC-102',
    risk_level: 'High Risk',
    risk_score: 82,
    exception_type: 'Contract-PO Variance',
    vendor: 'TechCorp India',
    vendor_code: 'VND-4109',
    invoice_no: 'TC-9941',
    amount_at_risk: 15000,
    currency: 'INR',
    formatted_amount: '₹15,000',
    agent_pipeline_status: 'Evidence Ready',
    created_at: '2026-09-13T14:15:00Z',
    summary: 'Line item hourly rate (₹2,800/hr) exceeds Master Services Agreement cap (₹2,200/hr) by 27.2%.',
    status: 'AWAITING_DECISION',
    requires_approval: true,
    current_step: 3,
  },
  {
    id: 'EXC-103',
    risk_level: 'Med Risk',
    risk_score: 76,
    exception_type: 'Anomaly: Sudden Volume Spike',
    vendor: 'Global Logistics',
    vendor_code: 'VND-1903',
    invoice_no: 'GL-3420',
    amount_at_risk: 180000,
    currency: 'INR',
    formatted_amount: '₹1,80,000',
    agent_pipeline_status: 'Awaiting Review',
    created_at: '2026-09-14T09:05:00Z',
    summary: '340% month-over-month billing increase without corresponding increase in logistics delivery waybills.',
    status: 'AWAITING_DECISION',
    requires_approval: false,
    current_step: 5,
  },
];

export const INVESTIGATION_DATABASE: Record<string, InvestigationDetail> = {
  'EXC-101': {
    id: 'EXC-101',
    title: 'Flagged Exception: Potential Duplicate Payment (INV-1042)',
    vendor: 'Acme Systems',
    vendor_category: 'Hardware & Cloud Infrastructure',
    risk_score: 94,
    risk_level: 'High Risk',
    amount_at_risk: 84500,
    currency: 'INR',
    formatted_amount: '₹84,500',
    status: 'AWAITING_HUMAN_CHECKPOINT',
    requires_approval: true,
    current_step: 2,
    timeline: [
      {
        step: 1,
        agent: 'Orchestrator Agent',
        role: 'Pipeline Coordinator',
        status: 'completed',
        timestamp: '10:31:02 AM',
        duration: '120ms',
        description: 'Triggered on ingestion batch #4819. Dispatched risk evaluation and isolated payment records.',
        badge: 'Ingestion Verified',
        model: 'Sentinel-Orchestrator-v4',
        confirmLabel: 'Confirm Dispatch Protocol',
        confirmedByHuman: true,
        reasoningDetails: [
          'Scanned incoming payment stream #4819 containing 142 remittances.',
          'Detected token match between INV-1042 and pending transaction TXN-8417.',
          'Dispatched parallel worker isolation.'
        ]
      },
      {
        step: 2,
        agent: 'Risk Investigator Agent',
        role: 'Pattern Recognition',
        status: 'awaiting_input',
        timestamp: '10:31:04 AM',
        duration: '840ms',
        description: 'Flagged Duplicate: 94% confidence. Found near-identical token signature with TXN-8392.',
        badge: 'Flagged Duplicate: 94% confidence',
        model: 'Risk-Vector-DeepAudit-v2',
        confirmLabel: 'Confirm Risk Finding (94%)',
        confirmedByHuman: false,
        reasoningDetails: [
          'Calculated token cosine similarity: 0.982 against settled record TXN-8392.',
          'Identical payee IFSC (HDFC0000240) and beneficiary account HDFC-****-9921.',
          'Requires human confirmation before evidence harvesting commitment.'
        ]
      },
      {
        step: 3,
        agent: 'Evidence Agent',
        role: 'Cross-System Retrieval',
        status: 'locked',
        timestamp: '10:31:07 AM',
        duration: '1.2s',
        description: 'Gathered 3 cross-source records: SAP ERP Ledger, HDFC Corporate Bank Feed, and PO-902 scanned artifact.',
        badge: '3 Cross-Source Records',
        model: 'DocRetrieval-RAG-Pro',
        confirmLabel: 'Accept Evidence Chain',
        confirmedByHuman: false,
        reasoningDetails: [
          'Retrieved SAP FI record for PO-902 with authorized allocation of ₹84,500.',
          'Queried HDFC Open Banking webhook for TXN-8392 cleared UTR timestamp (10:14:02 AM).',
          'Fetched digital invoice PDF from S3 vendor ingestion bucket.'
        ]
      },
      {
        step: 4,
        agent: 'Adversarial Challenge Agent',
        role: 'Counterfactual Validator',
        status: 'locked',
        timestamp: '10:31:11 AM',
        duration: '2.4s',
        description: 'Attempted to disprove finding; confirmed partial settlement mismatch. Hypothesis of split tranche rejected.',
        badge: 'Hypothesis Rejected',
        model: 'Adversarial-Refutation-Agent-4.1',
        confirmLabel: 'Accept Challenge Result',
        confirmedByHuman: false,
        reasoningDetails: [
          'Simulated hypothesis H1: TXN-8417 is a partial milestone tranche for multi-stage delivery.',
          'Evaluated PO terms: Milestone is explicitly marked "Single 100% Upfront Settlement".',
          'Conclusion: Hypothesis H1 rejected. Confidence of duplicate: 98.4%.'
        ]
      },
      {
        step: 5,
        agent: 'Human Checkpoint',
        role: 'Final Decision Authority',
        status: 'locked',
        timestamp: '10:31:12 AM',
        duration: 'Pending Gates',
        description: 'Final sign-off gate to commit decision (Approve / Reject / Escalate) to the immutable audit trail.',
        badge: 'Final Sign-off',
        confirmLabel: 'Complete Final Decision',
        confirmedByHuman: false,
      }
    ],
    comparison: {
      box_a: {
        title: 'Box A (Recorded Payment 1)',
        txn_id: 'TXN-8392',
        date: 'Sep 12, 10:14 AM',
        amount: '₹84,500',
        status: 'Cleared',
        status_color: 'emerald',
        invoice_ref: 'INV-1042',
        channel: 'HDFC RTGS Corporate',
        beneficiary_account: 'HDFC-****-9921',
        gl_code: 'GL-60124 (IT Equipment)'
      },
      box_b: {
        title: 'Box B (Flagged Payment 2)',
        txn_id: 'TXN-8417',
        date: 'Sep 12, 10:31 AM',
        amount: '₹84,500',
        status: 'Pending Approval',
        status_color: 'rose',
        invoice_ref: 'INV-1042 (Duplicate Batch)',
        channel: 'ICICI NetBanking Batch Queue',
        beneficiary_account: 'HDFC-****-9921',
        gl_code: 'GL-60124 (IT Equipment)'
      }
    },
    adversarial_verdict: {
      title: 'Challenge Agent Analysis',
      agent: 'Adversarial Challenge Agent v4.1',
      hypothesis: 'TXN-8417 was a valid partial installment under milestone delivery.',
      test_result: 'Disproved',
      verdict: 'Tested hypothesis that TXN-8417 was a valid partial installment. Disproved: Purchase Order PO-902 clearly specifies 100% upfront settlement fulfilled by TXN-8392. High confidence duplicate.',
      confidence: '98.4%',
      flags: [
        'Duplicate Invoice Reference (#INV-1042)',
        'Identical Remittance Value (₹84,500)',
        '17-Minute Batch Desynchronization',
        'Single Settlement Contract Mandate'
      ]
    },
    source_documents: [
      {
        id: 'doc-1',
        filename: 'Invoice_INV1042.pdf',
        type: 'PDF',
        size: '248 KB',
        source: 'Vendor Ingestion Gateway',
        verification: 'SHA-256 Verified',
        sha_hash: '9f83a21b369c4701e892c90fa12b',
        preview_text: 'VENDOR: Acme Systems Pvt. Ltd. | BILL TO: Acme Manufacturing Pvt. Ltd. | INVOICE: INV-1042 | DATE: 12-SEP-2026 | TOTAL: ₹84,500.00 | TERMS: Immediate Net 0',
        raw_content: 'Item 1: Enterprise Firewall Gateway (Model SG-400) x1 @ ₹84,500. GST: Included (18%). Bank: HDFC Bank A/C 502000189921, IFSC: HDFC0000240. Payment is due upon delivery.'
      },
      {
        id: 'doc-2',
        filename: 'PO_902.pdf',
        type: 'PDF',
        size: '512 KB',
        source: 'SAP S/4HANA Procurement',
        verification: '100% Upfront Term Matched',
        sha_hash: '3c19e8557b420f188172da0198f1',
        preview_text: 'PURCHASE ORDER: PO-902 | ISSUER: Acme Manufacturing | SUPPLIER: Acme Systems | AMOUNT: ₹84,500 | PAYMENT TERMS: 100% Lump Sum Upon Delivery',
        raw_content: 'Authorized by: Procurement Lead (PL-19). Line 1: Enterprise Network Appliance. Settlement Schedule: Single payment tranche. No split disbursements or recurring invoices permitted.'
      },
      {
        id: 'doc-3',
        filename: 'Bank_Feed_Sep.csv',
        type: 'CSV',
        size: '1.4 MB',
        source: 'HDFC Corporate API Host-to-Host',
        verification: 'Cleared TXN-8392 Confirmed',
        sha_hash: 'b144fae99120485764d2994c1a70',
        preview_text: '2026-09-12 10:14:02, DEBIT, 84500.00, ACME SYSTEMS PVT LTD, UTR: HDFCR52026091200192, STATUS: SETTLED',
        raw_content: 'TXN_ID,DATE_TIME,TYPE,AMOUNT,BENEFICIARY,UTR,STATUS\nTXN-8392,2026-09-12 10:14:02,DEBIT,84500.00,ACME SYSTEMS,HDFCR52026091200192,SETTLED\nTXN-8417,2026-09-12 10:31:18,DEBIT,84500.00,ACME SYSTEMS,PENDING_AUTHORIZATION,QUEUED'
      }
    ]
  },
  'EXC-102': {
    id: 'EXC-102',
    title: 'Flagged Exception: Contract-PO Variance (TC-9941)',
    vendor: 'TechCorp India',
    vendor_category: 'Software & Technology Consulting',
    risk_score: 82,
    risk_level: 'High Risk',
    amount_at_risk: 15000,
    currency: 'INR',
    formatted_amount: '₹15,000',
    status: 'AWAITING_HUMAN_CHECKPOINT',
    requires_approval: true,
    current_step: 3,
    timeline: [
      {
        step: 1,
        agent: 'Orchestrator Agent',
        role: 'Pipeline Coordinator',
        status: 'completed',
        timestamp: '02:15:02 PM',
        duration: '95ms',
        description: 'Triggered on AP ingestion batch #4823. Matched against Vendor Contract Repository.',
        badge: 'Orchestrated',
        model: 'Sentinel-Orchestrator-v4',
        confirmLabel: 'Confirm Dispatch',
        confirmedByHuman: true
      },
      {
        step: 2,
        agent: 'Risk Investigator Agent',
        role: 'Pattern Recognition',
        status: 'completed',
        timestamp: '02:15:04 PM',
        duration: '620ms',
        description: 'Flagged Rate Variance: 82% confidence. Billed rate exceeds MSA clause by 27.2%.',
        badge: 'Rate Variance (82%)',
        model: 'Risk-Vector-DeepAudit-v2',
        confirmLabel: 'Confirm Rate Variance',
        confirmedByHuman: true
      },
      {
        step: 3,
        agent: 'Evidence Agent',
        role: 'Cross-System Retrieval',
        status: 'awaiting_input',
        timestamp: '02:15:07 PM',
        duration: '1.1s',
        description: 'Retrieved 3 cross-source records: Signed MSA Schedule B, Work Order WO-4412, and Jira Timesheet.',
        badge: '3 Sources Verified',
        model: 'DocRetrieval-RAG-Pro',
        confirmLabel: 'Accept Evidence Chain',
        confirmedByHuman: false
      },
      {
        step: 4,
        agent: 'Adversarial Challenge Agent',
        role: 'Counterfactual Validator',
        status: 'locked',
        timestamp: '02:15:10 PM',
        duration: '1.8s',
        description: 'Tested whether emergency SLA surcharge applied. Disproved: No emergency sprint logged.',
        badge: 'Surcharge Disproved',
        model: 'Adversarial-Refutation-Agent-4.1',
        confirmLabel: 'Accept Refutation Result',
        confirmedByHuman: false
      },
      {
        step: 5,
        agent: 'Human Checkpoint',
        role: 'Final Decision Authority',
        status: 'locked',
        timestamp: '02:15:11 PM',
        duration: 'Pending Gates',
        description: 'Final controller sign-off to reject invoice and request re-issuance at contracted cap.',
        badge: 'Awaiting Sign-off',
        confirmLabel: 'Complete Final Decision',
        confirmedByHuman: false
      }
    ],
    comparison: {
      box_a: {
        title: 'Box A (Contract Rate - MSA Annexure B)',
        txn_id: 'MSA-2025-TC',
        date: 'Valid through Dec 2026',
        amount: '₹2,200 / hr',
        status: 'Approved Baseline',
        status_color: 'emerald',
        invoice_ref: 'Contract Rate Cap: Level 3 Senior Architect',
        channel: 'Enterprise Contract System (Ironclad)',
        beneficiary_account: 'KOTAK-****-4109',
        gl_code: 'GL-52010 (Professional IT Consulting)'
      },
      box_b: {
        title: 'Box B (Submitted Invoice TC-9941)',
        txn_id: 'TC-9941',
        date: 'Sep 13, 02:15 PM',
        amount: '₹2,800 / hr (₹15,000 Variance)',
        status: 'Pending Approval',
        status_color: 'rose',
        invoice_ref: '25 Hours Senior Cloud Migration',
        channel: 'Accounts Payable Processing Queue',
        beneficiary_account: 'KOTAK-****-4109',
        gl_code: 'GL-52010 (Professional IT Consulting)'
      }
    },
    adversarial_verdict: {
      title: 'Challenge Agent Analysis',
      agent: 'Adversarial Challenge Agent v4.1',
      hypothesis: 'Overtime rate escalation rider allowed under Q3 Cloud Migration emergency clause.',
      test_result: 'Disproved',
      verdict: 'Tested hypothesis that rate uplift was sanctioned under emergency clause. Disproved: Agreement requires written CTO authorization for rate tier elevations. No approval artifact present in ERP or Jira.',
      confidence: '94.1%',
      flags: [
        'Hourly Rate Cap Exceeded (+27.2%)',
        'Missing Executive Approval Artifact',
        'Direct Financial Variance: ₹15,000'
      ]
    },
    source_documents: [
      {
        id: 'doc-201',
        filename: 'MSA_TechCorp_Executed.pdf',
        type: 'PDF',
        size: '890 KB',
        source: 'Ironclad CLM',
        verification: 'DocuSign Digital Seal Verified',
        sha_hash: '7a11de984c20f18833912da0198f',
        preview_text: 'MASTER SERVICES AGREEMENT: Section 4.1 Rate Schedule. Senior Cloud Architect: ₹2,200/hr max billable rate. Overtime capped at standard rates unless pre-authorized.',
        raw_content: 'All rate revisions must be executed via bilateral written addendum signed by CFO or VP of Engineering.'
      },
      {
        id: 'doc-202',
        filename: 'Invoice_TC9941.pdf',
        type: 'PDF',
        size: '180 KB',
        source: 'Vendor Ingestion Gateway',
        verification: 'Non-Compliant Line Item Detected',
        sha_hash: 'ff823da091c78491820485764d29',
        preview_text: 'INVOICE: TC-9941 | VENDOR: TechCorp India | 25 Hours @ ₹2,800/hr = ₹70,000 | Baseline expected: ₹55,000 | Variance: ₹15,000',
        raw_content: 'Billable Item: Cloud Architecture Consulting. Rate: ₹2,800. Hours: 25. Line total: ₹70,000.'
      }
    ]
  },
  'EXC-103': {
    id: 'EXC-103',
    title: 'Flagged Exception: Anomaly: Sudden Volume Spike (GL-3420)',
    vendor: 'Global Logistics',
    vendor_category: 'Freight & Logistics',
    risk_score: 76,
    risk_level: 'Med Risk',
    amount_at_risk: 180000,
    currency: 'INR',
    formatted_amount: '₹1,80,000',
    status: 'AWAITING_HUMAN_CHECKPOINT',
    requires_approval: false,
    current_step: 5,
    timeline: [
      {
        step: 1,
        agent: 'Orchestrator Agent',
        role: 'Pipeline Coordinator',
        status: 'completed',
        timestamp: '09:05:01 AM',
        duration: '110ms',
        description: 'Periodic logistics ledger audit job triggered by scheduled cron.',
        badge: 'Orchestrated',
        model: 'Sentinel-Orchestrator-v4',
        confirmLabel: 'Auto-Verified',
        confirmedByHuman: true
      },
      {
        step: 2,
        agent: 'Risk Investigator Agent',
        role: 'Pattern Recognition',
        status: 'completed',
        timestamp: '09:05:04 AM',
        duration: '980ms',
        description: 'Z-score outlier detection triggered: +3.4σ above 90-day moving average.',
        badge: 'Volume Spike: 76% confidence',
        model: 'Risk-Vector-DeepAudit-v2',
        confirmLabel: 'Auto-Verified',
        confirmedByHuman: true
      },
      {
        step: 3,
        agent: 'Evidence Agent',
        role: 'Cross-System Retrieval',
        status: 'completed',
        timestamp: '09:05:07 AM',
        duration: '1.4s',
        description: 'Retrieved 3 cross-source records: Warehouse dock gate logs, TMS manifests, and vendor billing.',
        badge: '3 Sources Verified',
        model: 'DocRetrieval-RAG-Pro',
        confirmLabel: 'Auto-Verified',
        confirmedByHuman: true
      },
      {
        step: 4,
        agent: 'Adversarial Challenge Agent',
        role: 'Counterfactual Validator',
        status: 'completed',
        timestamp: '09:05:11 AM',
        duration: '2.1s',
        description: 'Tested whether festive pre-stocking explained volume surge. 26 waybills have no dock verification.',
        badge: '26 Gate Receipts Missing',
        model: 'Adversarial-Refutation-Agent-4.1',
        confirmLabel: 'Auto-Verified',
        confirmedByHuman: true
      },
      {
        step: 5,
        agent: 'Human Checkpoint',
        role: 'Final Decision Authority',
        status: 'awaiting_input',
        timestamp: '09:05:12 AM',
        duration: 'Active',
        description: 'Ready for immediate final sign-off (requires supply chain manager verification).',
        badge: 'Awaiting Decision',
        confirmLabel: 'Ready for Final Decision',
        confirmedByHuman: false
      }
    ],
    comparison: {
      box_a: {
        title: 'Box A (3-Month Historical Baseline)',
        txn_id: 'HIST-AVG-90D',
        date: 'Jun - Aug 2026',
        amount: '₹41,000 / month',
        status: 'Baseline Mean',
        status_color: 'emerald',
        invoice_ref: 'Average 14 Deliveries/Month',
        channel: 'Standard Scheduled Freight',
        beneficiary_account: 'AXIS-****-1903',
        gl_code: 'GL-70300 (Freight & Logistics Handling)'
      },
      box_b: {
        title: 'Box B (Flagged Invoice GL-3420)',
        txn_id: 'GL-3420',
        date: 'Sep 14, 09:05 AM',
        amount: '₹1,80,000 (+340% Surge)',
        status: 'Pending Approval',
        status_color: 'rose',
        invoice_ref: 'Claimed 62 Express Shipments',
        channel: 'Express Freight AP Ingestion',
        beneficiary_account: 'AXIS-****-1903',
        gl_code: 'GL-70300 (Freight & Logistics Handling)'
      }
    },
    adversarial_verdict: {
      title: 'Challenge Agent Analysis',
      agent: 'Adversarial Challenge Agent v4.1',
      hypothesis: 'Festive season pre-dispatch surge explains the 340% month-over-month billing increase.',
      test_result: 'Disproved / Unsubstantiated',
      verdict: 'Tested hypothesis that warehouse volume surge accounted for the increase. Disproved: Dock IoT scanners confirm only 36 freight arrivals vs 62 billed on GL-3420. ₹1,80,000 is unsupported by gate receipts.',
      confidence: '89.2%',
      flags: [
        'Z-Score Spike +3.4σ Over 90-Day Trend',
        '26 Unmatched Shipping Waybills',
        'Unverified Surcharge: ₹1,80,000'
      ]
    },
    source_documents: [
      {
        id: 'doc-301',
        filename: 'Invoice_GL3420.pdf',
        type: 'PDF',
        size: '310 KB',
        source: 'Vendor Ingestion Gateway',
        verification: 'OCR Parsed - Unreconciled',
        sha_hash: 'aa912837bc20f18833912da0198f',
        preview_text: 'INVOICE: GL-3420 | VENDOR: Global Logistics Pvt Ltd | 62 Express Freight Movements | Total: ₹1,80,000',
        raw_content: 'Express Logistics Services September dispatch batch. Total consignments: 62. Amount due: ₹1,80,000.'
      },
      {
        id: 'doc-302',
        filename: 'Warehouse_Dock_Inbound.csv',
        type: 'CSV',
        size: '2.2 MB',
        source: 'WMS RFID Gate Scanner',
        verification: '36 Scans Matched, 26 Missing',
        sha_hash: '55bc98124c20f18833912da0198f',
        preview_text: 'RFID GATE RECEIPTS: 36 verified vehicle ingress timestamps between Sep 01-14. Missing 26 corresponding gate entries for GL-3420.',
        raw_content: 'GATE_ID,TIMESTAMP,TRUCK_NUM,WAYBILL,STATUS\nGATE-1,2026-09-02 08:14,MH04AB1234,WB-101,CONFIRMED\nGATE-2,2026-09-05 11:32,MH04CD5678,WB-102,CONFIRMED\n... Total Verified: 36.'
      }
    ]
  }
};

export const INITIAL_DECISIONS: DecisionRecord[] = [
  {
    id: 'DEC-1001',
    exception_id: 'EXC-098',
    decision: 'REJECT',
    reviewer_notes: 'Duplicate freight fee previously cleared in August reconciliation run.',
    timestamp: '2026-09-10T11:20:00Z',
    reviewer: 'Abhinav K. (Financial Controller)',
    audit_hash: '0x8f2b7a91',
    status: 'COMMITTED'
  },
  {
    id: 'DEC-1002',
    exception_id: 'EXC-099',
    decision: 'APPROVE',
    reviewer_notes: 'Verified against signed board addendum for annual software maintenance tier.',
    timestamp: '2026-09-11T16:45:00Z',
    reviewer: 'Abhinav K. (Financial Controller)',
    audit_hash: '0x3c99e12a',
    status: 'COMMITTED'
  }
];

export const CASHFLOW_TREND_DATA = [
  { month: 'Apr', revenue: 1.45, expenses: 1.05, anomalies: 0.12 },
  { month: 'May', revenue: 1.52, expenses: 1.10, anomalies: 0.08 },
  { month: 'Jun', revenue: 1.64, expenses: 1.18, anomalies: 0.15 },
  { month: 'Jul', revenue: 1.58, expenses: 1.12, anomalies: 0.09 },
  { month: 'Aug', revenue: 1.71, expenses: 1.20, anomalies: 0.22 },
  { month: 'Sep (MTD)', revenue: 1.82, expenses: 1.31, anomalies: 0.28 },
];

export const CATEGORY_RISK_DATA = [
  { category: 'Hardware & Infrastructure', atRisk: 84500, count: 1, color: '#f43f5e' },
  { category: 'IT & Software Consulting', atRisk: 15000, count: 1, color: '#fbbf24' },
  { category: 'Freight & Logistics', atRisk: 180000, count: 1, color: '#6366f1' },
];
