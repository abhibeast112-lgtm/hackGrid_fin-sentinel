"""Checkpoint and step interaction models for LangGraph interrupts.

These models allow the API and frontend to observe execution step-by-step
and resume the workflow after human confirmation or feedback.
"""

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


InvestigationStatus = Literal[
    "RUNNING",
    "WAITING_FOR_APPROVAL",
    "COMPLETED",
    "REJECTED",
    "FAILED",
]

HumanAction = Literal["APPROVE", "REJECT", "REQUEST_MORE_EVIDENCE", "OVERRIDE"]


class HumanResponse(BaseModel):
    """Input provided by the human reviewer when resuming an interrupted step."""

    action: HumanAction = Field(..., description="Action chosen by the human reviewer")
    feedback: Optional[str] = Field(
        default=None, description="Optional instructions, notes, or rationale from reviewer"
    )
    reviewer_id: str = Field(
        default="finance_manager", description="ID or role of reviewer, e.g. CA, CFO, Senior Analyst"
    )
    override_verdict: Optional[str] = Field(
        default=None, description="Optional override value if action is OVERRIDE"
    )


class InvestigationStepResult(BaseModel):
    """Current state of the investigation returned to the API/UI at every step/checkpoint."""

    investigation_id: str = Field(..., description="Unique execution/thread ID")
    current_step: str = Field(
        ...,
        description="Current active step, e.g. orchestrator, specialist, evidence, challenge, cfo_narrator, completed",
    )
    step_output: Dict[str, Any] = Field(
        default_factory=dict, description="Structured payload produced by the most recent node"
    )
    status: InvestigationStatus = Field(
        ..., description="Lifecycle status of the investigation"
    )
    requires_approval: bool = Field(
        default=False,
        description="True if the graph is currently halted waiting for human confirmation",
    )
    checkpoint_prompt: Optional[str] = Field(
        default=None,
        description="Human-readable prompt explaining what decision/confirmation is needed",
    )
    approval_options: List[str] = Field(
        default_factory=lambda: ["APPROVE", "REJECT", "REQUEST_MORE_EVIDENCE"],
        description="List of available actions for the human at this gate",
    )
    risk_tier: str = Field(default="HIGH", description="Risk tier of the underlying case")
    final_result: Optional[Any] = Field(
        default=None,
        description="Full InvestigationResult when status == COMPLETED",
    )
