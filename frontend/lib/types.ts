export type RiskLevel = 'High Risk' | 'Med Risk' | 'Low Risk';

export type PipelineStatus = 
  | 'Challenge Phase'
  | 'Evidence Ready'
  | 'Awaiting Review'
  | 'Resolved: APPROVE'
  | 'Resolved: REJECT'
  | 'Resolved: ESCALATE';

export interface FinancialException {
  id: string;
  risk_level: RiskLevel;
  risk_score: number; // 0 - 100
  exception_type: string;
  vendor: string;
  vendor_code: string;
  invoice_no: string;
  amount_at_risk: number;
  currency: string;
  formatted_amount: string;
  agent_pipeline_status: PipelineStatus | string;
  created_at: string;
  summary: string;
  status: 'AWAITING_DECISION' | 'RESOLVED_APPROVE' | 'RESOLVED_REJECT' | 'RESOLVED_ESCALATE' | string;
  requires_approval: boolean;
  current_step: number;
}

export interface AgentTimelineStep {
  step: number;
  agent: string;
  role: string;
  status: 'completed' | 'awaiting_input' | 'processing' | 'failed' | 'locked';
  timestamp: string;
  duration: string;
  description: string;
  badge: string;
  reasoningDetails?: string[];
  model?: string;
  confirmLabel?: string;
  confirmedByHuman?: boolean;
}

export interface ComparisonBox {
  title: string;
  txn_id: string;
  date: string;
  amount: string;
  status: string;
  status_color: 'emerald' | 'rose' | 'amber' | 'indigo';
  invoice_ref: string;
  channel: string;
  beneficiary_account: string;
  gl_code: string;
}

export interface AdversarialVerdict {
  title: string;
  agent: string;
  hypothesis: string;
  test_result: string;
  verdict: string;
  confidence: string;
  flags: string[];
}

export interface SourceDocument {
  id: string;
  filename: string;
  type: 'PDF' | 'CSV' | 'XLSX' | 'TXT';
  size: string;
  source: string;
  verification: string;
  preview_text: string;
  raw_content?: string;
  sha_hash?: string;
}

export interface InvestigationDetail {
  id: string;
  title: string;
  vendor: string;
  vendor_category: string;
  risk_score: number;
  risk_level: RiskLevel;
  amount_at_risk: number;
  currency: string;
  formatted_amount: string;
  status: string;
  requires_approval: boolean;
  current_step: number;
  timeline: AgentTimelineStep[];
  comparison: {
    box_a: ComparisonBox;
    box_b: ComparisonBox;
  };
  adversarial_verdict: AdversarialVerdict;
  source_documents: SourceDocument[];
}

export type DecisionType = 'APPROVE' | 'REJECT' | 'ESCALATE';

export interface DecisionPayload {
  exception_id: string;
  decision: DecisionType;
  reviewer_notes: string;
}

export interface DecisionRecord {
  id: string;
  exception_id: string;
  decision: DecisionType;
  reviewer_notes: string;
  timestamp: string;
  reviewer: string;
  audit_hash: string;
  status: string;
}
