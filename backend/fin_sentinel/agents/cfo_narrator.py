"""CFO Narrator Agent: Synthesizes the Four Core Questions and prepares the case file."""

from typing import Any, Dict, List
from fin_sentinel.agents.base import BaseAgent
from fin_sentinel.models.anomaly import Anomaly
from fin_sentinel.models.challenge import ChallengeResult
from fin_sentinel.models.result import (
    FourQuestionsAnswer,
    InvestigationResult,
    RecommendedAction,
    AuditStep,
)


class CFONarratorAgent(BaseAgent):
    """Prepares decision-ready briefing answering the 4 Core Questions for CA / CFO review."""

    def __init__(self):
        super().__init__(
            name="CFONarratorAgent",
            role="Executive Case Synthesis and CA / CFO Decision Preparation",
        )

    def run(self, context: Dict[str, Any]) -> InvestigationResult:
        raw_anomaly = context.get("anomaly")
        anomaly = raw_anomaly if isinstance(raw_anomaly, Anomaly) else Anomaly(**raw_anomaly)
        challenge_res = context.get("challenge_output", {})
        if isinstance(challenge_res, dict):
            challenge = ChallengeResult(**challenge_res)
        elif isinstance(challenge_res, ChallengeResult):
            challenge = challenge_res
        else:
            raise ValueError("Challenge output missing or invalid")

        investigation_id = context.get("investigation_id", f"INV-{anomaly.anomaly_id}")
        orch_output = context.get("orchestrator_output", {})
        specialist_output = context.get("specialist_output", {})

        # Question 1: WHAT happened?
        what_happened = (
            f"On {anomaly.detected_at[:10]}, the finance control layer detected a "
            f"{anomaly.title} involving {anomaly.currency} {anomaly.amount:,.2f} "
            f"associated with vendor '{anomaly.vendor_name or anomaly.vendor_id or 'N/A'}'. "
            f"Flagged records: {', '.join(anomaly.flagged_record_ids)}."
        )

        # Question 2: WHY anomalous?
        why_anomalous = (
            f"Triggered by {anomaly.anomaly_type} rules with risk score {anomaly.risk_score:.0f}/100. "
            f"Specialist findings: {specialist_output.get('detailed_findings', anomaly.description)}"
        )

        # Question 3: WHAT evidence?
        what_evidence = challenge.supporting_evidence or anomaly.flagged_record_ids

        # Question 4: WHAT could prove it wrong?
        if challenge.challenge_result == "contradicted":
            what_could_prove_wrong = (
                f"Disproven by adversarial challenge: {challenge.adversarial_reasoning} "
                f"Counter-records identified: {', '.join(challenge.contradicting_evidence)}."
            )
            recommended_action: RecommendedAction = "CLOSE_FALSE_POSITIVE"
        elif challenge.challenge_result == "supported":
            what_could_prove_wrong = (
                "Adversarial checks actively searched for matching reversals, vendor credit notes, "
                "or authorized milestone contracts. None were found. The anomaly could only be refuted "
                "if the vendor provides an unlogged paper credit note or proof of goods return."
            )
            if anomaly.amount >= 50000.0 or anomaly.risk_tier == "HIGH":
                recommended_action = "HOLD_PAYMENT"
            else:
                recommended_action = "ESCALATE"
        else:
            what_could_prove_wrong = "Vendor documentation pending. Additional ERP reconciliation required."
            recommended_action = "REQUEST_VENDOR_INFO"

        four_questions = FourQuestionsAnswer(
            what_happened=what_happened,
            why_anomalous=why_anomalous,
            what_evidence=what_evidence,
            what_could_prove_it_wrong=what_could_prove_wrong,
        )

        # Recompile audit steps from context
        raw_audit = context.get("audit_trail", [])
        audit_trail = [AuditStep(**step) if isinstance(step, dict) else step for step in raw_audit]

        # Add narrator step
        audit_trail.append(
            AuditStep(
                step_name="cfo_narrator",
                agent_name=self.name,
                input_summary=f"Challenge verdict: {challenge.challenge_result}",
                output_summary=f"Recommended action: {recommended_action}",
            )
        )

        if challenge.challenge_result == "contradicted":
            summary = (
                f"FALSE POSITIVE RESOLVED: The flagged {anomaly.anomaly_type} of {anomaly.currency} {anomaly.amount:,.2f} "
                f"was refuted during adversarial challenge by record(s) {', '.join(challenge.contradicting_evidence)}. "
                f"Recommended human action: Close case as false positive."
            )
        else:
            summary = (
                f"MATERIAL EXCEPTION CONFIRMED: High exposure of {anomaly.currency} {anomaly.amount:,.2f} "
                f"survived adversarial challenge with zero offsetting records. "
                f"Recommended human action: {recommended_action}. CA / CFO sign-off required."
            )

        return InvestigationResult(
            investigation_id=investigation_id,
            anomaly_id=anomaly.anomaly_id,
            anomaly_type=anomaly.anomaly_type,
            title=anomaly.title,
            amount=anomaly.amount,
            currency=anomaly.currency,
            risk_score=anomaly.risk_score,
            risk_tier=anomaly.risk_tier,
            status="COMPLETED",
            four_questions=four_questions,
            challenge_verdict=challenge.challenge_result,
            recommended_action=recommended_action,
            evidence_record_ids=what_evidence,
            counter_evidence_ids=challenge.contradicting_evidence,
            alternative_explanation=challenge.alternative_explanation,
            audit_trail=audit_trail,
            executive_summary=summary,
            requires_human_signoff=True,
        )
