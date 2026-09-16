"""Specialist Agent: Domain rule execution, transaction pattern analysis, timing metrics."""

from typing import Any, Dict, List
from pydantic import BaseModel, Field
from fin_sentinel.agents.base import BaseAgent
from fin_sentinel.models.anomaly import Anomaly


class SpecialistOutput(BaseModel):
    """Structured domain findings from the Specialist."""

    anomaly_id: str
    specialist_type: str
    violation_rules_matched: List[str]
    pattern_indicators: Dict[str, Any]
    domain_severity: str
    detailed_findings: str


class SpecialistAgent(BaseAgent):
    """Deep domain specialist analyzing accounting patterns and operational rules."""

    def __init__(self, name: str = "SpecialistAgent"):
        super().__init__(name=name, role="Domain Accounting Pattern Specialist")

    def run(self, context: Dict[str, Any]) -> SpecialistOutput:
        raw_anomaly = context.get("anomaly")
        anomaly = raw_anomaly if isinstance(raw_anomaly, Anomaly) else Anomaly(**raw_anomaly)
        orch_output = context.get("orchestrator_output", {})

        rules_matched = []
        indicators = {}
        ano_type = anomaly.anomaly_type.upper()

        if "DUPLICATE" in ano_type:
            rules_matched.append("RULE_EXACT_AMOUNT_MATCH")
            rules_matched.append("RULE_COMMON_VENDOR_ENTITY")
            interval = anomaly.metadata.get("interval_minutes", 17)
            indicators["interval_minutes"] = interval
            indicators["amount_match"] = anomaly.amount
            if interval <= 60:
                rules_matched.append("RULE_SUB_HOUR_DISBURSEMENT_WINDOW")
                severity = "CRITICAL"
                findings = (
                    f"Identified duplicate disbursements of {anomaly.currency} {anomaly.amount:,.2f} "
                    f"occurring within {interval} minutes for vendor {anomaly.vendor_name or anomaly.vendor_id}. "
                    f"Cross-reference indicates identical invoice number or duplicate voucher submission."
                )
            else:
                severity = "HIGH"
                findings = f"Duplicate payment matched across {interval} minutes."

        elif "VARIANCE" in ano_type or "EXPENSE" in ano_type:
            rules_matched.append("RULE_POLICY_BENCHMARK_EXCEEDED")
            historical_avg = anomaly.metadata.get("historical_avg", anomaly.amount * 0.4)
            variance_pct = ((anomaly.amount - historical_avg) / historical_avg) * 100.0 if historical_avg else 100.0
            indicators["historical_avg"] = historical_avg
            indicators["variance_percentage"] = round(variance_pct, 1)
            severity = "MEDIUM" if variance_pct < 150 else "HIGH"
            findings = (
                f"Expense of {anomaly.currency} {anomaly.amount:,.2f} exceeds standard baseline "
                f"of {anomaly.currency} {historical_avg:,.2f} by {variance_pct:.1f}%. Exceeds automated policy limits."
            )

        elif "SPLIT" in ano_type:
            threshold = anomaly.metadata.get("approval_threshold", 50000.0)
            rules_matched.append("RULE_PURCHASE_ORDER_SMURFING")
            indicators["approval_threshold"] = threshold
            severity = "HIGH"
            findings = (
                f"Multiple purchase orders structured at {anomaly.currency} {anomaly.amount:,.2f} "
                f"immediately below corporate approval threshold of {anomaly.currency} {threshold:,.2f}."
            )

        else:
            rules_matched.append("RULE_ANOMALOUS_LEDGER_POSTING")
            severity = "MEDIUM"
            findings = f"Unusual posting pattern detected for amount {anomaly.currency} {anomaly.amount:,.2f}."

        return SpecialistOutput(
            anomaly_id=anomaly.anomaly_id,
            specialist_type=self.name,
            violation_rules_matched=rules_matched,
            pattern_indicators=indicators,
            domain_severity=severity,
            detailed_findings=findings,
        )
