"""Orchestrator Agent: Assesses risk tier, sets scope, and decides human gating."""

from typing import Any, Dict, List, Literal
from pydantic import BaseModel, Field
from fin_sentinel.agents.base import BaseAgent
from fin_sentinel.models.anomaly import Anomaly


class OrchestratorOutput(BaseModel):
    """Structured output of the Orchestrator triage."""

    anomaly_id: str
    risk_tier: Literal["LOW", "MEDIUM", "HIGH"]
    requires_human_approval: bool
    investigation_scope: str
    assigned_specialist: str
    hypothesis: str
    checkpoint_prompt: str
    reasoning: str


class OrchestratorAgent(BaseAgent):
    """Orchestrator responsible for triage, risk gating, and investigation framing."""

    def __init__(self):
        super().__init__(
            name="OrchestratorAgent",
            role="Risk Triage and Investigation Coordinator",
        )

    def run(self, context: Dict[str, Any]) -> OrchestratorOutput:
        raw_anomaly = context.get("anomaly")
        if isinstance(raw_anomaly, dict):
            anomaly = Anomaly(**raw_anomaly)
        elif isinstance(raw_anomaly, Anomaly):
            anomaly = raw_anomaly
        else:
            raise ValueError("Context must contain 'anomaly' as Anomaly model or dict")

        # Deterministic Risk Tiering
        # High Risk: risk_score >= 70 OR amount >= 50,000 INR
        # Medium Risk: 40 <= risk_score < 70
        # Low Risk: risk_score < 40
        if anomaly.risk_tier == "HIGH" or anomaly.risk_score >= 70.0 or anomaly.amount >= 50000.0:
            risk_tier = "HIGH"
            requires_human_approval = True
        elif anomaly.risk_tier == "MEDIUM" or anomaly.risk_score >= 40.0:
            risk_tier = "MEDIUM"
            requires_human_approval = False
        else:
            risk_tier = "LOW"
            requires_human_approval = False

        # Specialist assignment
        ano_type = anomaly.anomaly_type.upper()
        if "DUPLICATE" in ano_type:
            specialist = "DuplicatePaymentSpecialist"
        elif "VARIANCE" in ano_type or "EXPENSE" in ano_type:
            specialist = "ExpenseVarianceSpecialist"
        elif "SPLIT" in ano_type or "PURCHASE" in ano_type:
            specialist = "ProcurementThresholdSpecialist"
        elif "VENDOR" in ano_type:
            specialist = "VendorIntegritySpecialist"
        else:
            specialist = "GeneralLedgerSpecialist"

        hypothesis = (
            f"Potential financial irregularity of {anomaly.currency} {anomaly.amount:,.2f} "
            f"flagged under {anomaly.anomaly_type}. Requires systematic verification and adversarial disproval."
        )

        if risk_tier == "HIGH":
            prompt = (
                f"[HUMAN CHECKPOINT 1: SCOPE APPROVAL] High financial exposure ({anomaly.currency} {anomaly.amount:,.2f}, "
                f"Risk {anomaly.risk_score:.0f}/100) detected for vendor '{anomaly.vendor_name or anomaly.vendor_id or 'Unknown'}'. "
                f"Do you approve proceeding with deep forensic investigation and evidence collection?"
            )
        else:
            prompt = (
                f"Autonomous investigation scheduled for {risk_tier} risk case ({anomaly.currency} {anomaly.amount:,.2f})."
            )

        reasoning = (
            f"Classified as {risk_tier} risk based on financial exposure ({anomaly.currency} {anomaly.amount:,.2f}) "
            f"and risk score ({anomaly.risk_score}/100). Gating set to requires_human_approval={requires_human_approval}."
        )

        return OrchestratorOutput(
            anomaly_id=anomaly.anomaly_id,
            risk_tier=risk_tier,
            requires_human_approval=requires_human_approval,
            investigation_scope=f"Full ledger and vendor history analysis for {anomaly.anomaly_type}",
            assigned_specialist=specialist,
            hypothesis=hypothesis,
            checkpoint_prompt=prompt,
            reasoning=reasoning,
        )
