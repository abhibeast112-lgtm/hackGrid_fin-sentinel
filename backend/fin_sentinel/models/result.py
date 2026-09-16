from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

RecommendedAction = Literal[
    "ESCALATE",
    "HOLD_PAYMENT",
    "REVERSE_PAYMENT",
    "REQUEST_VENDOR_INFO",
    "CLOSE_FALSE_POSITIVE",
    "NO_ACTION_REQUIRED",
]

class FourQuestionsAnswer(BaseModel):
    what_happened: str = Field(..., description="1. WHAT happened?")
    why_anomalous: str = Field(..., description="2. WHY does the system think it is anomalous?")
    what_evidence: List[str] = Field(..., description="3. WHAT evidence supports that?")
    what_could_prove_it_wrong: str = Field(..., description="4. WHAT could prove the system wrong?")

class AuditStep(BaseModel):
    step_name: str
    agent_name: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    input_summary: str
    output_summary: str
    human_action: Optional[str] = None
    human_feedback: Optional[str] = None

class InvestigationResult(BaseModel):
    investigation_id: str = Field(..., description="Unique thread/investigation ID")
    anomaly_id: str = Field(..., description="Source anomaly ID")
    anomaly_type: str = Field(..., description="Type of anomaly")
    title: str = Field(..., description="Case headline")
    amount: float = Field(..., description="Monetary value involved")
    currency: str = Field(default="INR", description="Currency code")
    risk_score: float = Field(..., description="Deterministic risk score")
    risk_tier: str = Field(..., description="Categorical risk tier: LOW, MEDIUM, HIGH")
    status: str = Field(default="COMPLETED", description="Final case status")
    four_questions: FourQuestionsAnswer = Field(..., description="Synthesis answering the 4 product identity questions")
    challenge_verdict: Literal["supported", "contradicted", "inconclusive"] = Field(..., description="Outcome of the adversarial challenge test")
    recommended_action: RecommendedAction = Field(..., description="AI recommended action for the human decision maker")
    evidence_record_ids: List[str] = Field(default_factory=list, description="Concrete record IDs proven by evidence agent")
    counter_evidence_ids: List[str] = Field(default_factory=list, description="Contradicting record IDs discovered during challenge")
    alternative_explanation: Optional[str] = Field(default=None, description="Discovered explanation if anomaly was refuted")
    audit_trail: List[AuditStep] = Field(default_factory=list, description="Complete immutable chronological step trace")
    executive_summary: str = Field(..., description="Crisp 3-line narrative suitable for executive briefing")
    requires_human_signoff: bool = Field(default=True, description="Always True: AI advises, CA / CFO owns the final decision")
