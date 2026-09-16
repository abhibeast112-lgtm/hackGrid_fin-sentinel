"""LangGraph state schema for Fin-Sentinel investigations."""

from typing import Any, Dict, List, Optional, TypedDict


class InvestigationState(TypedDict):
    """Mutable state schema transitioned across LangGraph nodes."""

    investigation_id: str
    anomaly: Dict[str, Any]
    risk_tier: str
    requires_human_approval: bool
    current_step: str
    status: str
    checkpoint_prompt: Optional[str]
    approval_options: List[str]
    human_responses: Dict[str, Any]
    orchestrator_output: Optional[Dict[str, Any]]
    specialist_output: Optional[Dict[str, Any]]
    evidence_output: Optional[Dict[str, Any]]
    challenge_output: Optional[Dict[str, Any]]
    cfo_output: Optional[Dict[str, Any]]
    audit_trail: List[Dict[str, Any]]
    final_result: Optional[Dict[str, Any]]
