from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ResumeInvestigationRequest(BaseModel):
    """
    Request sent when a human responds to an investigation checkpoint.
    """

    action: str = Field(
        description="Human decision at the current checkpoint."
    )

    feedback: str = Field(
        default="",
        description="Optional reviewer feedback.",
    )

    reviewer_id: str = Field(
        default="human_reviewer",
        description="Identifier of the human reviewer.",
    )


class InvestigationCheckpointResponse(BaseModel):
    """
    Response returned while an investigation is waiting for human review.
    """

    investigation_id: str
    status: str
    current_step: str
    risk_tier: str
    requires_approval: bool

    checkpoint_prompt: Optional[str] = None

    approval_options: List[str] = Field(
        default_factory=list
    )

    step_output: Dict[str, Any] = Field(
        default_factory=dict
    )


class InvestigationCompletedResponse(BaseModel):
    """
    Response returned when the investigation reaches a terminal state.
    """

    investigation_id: str
    status: str
    current_step: str
    risk_tier: str
    requires_approval: bool

    final_result: Optional[Dict[str, Any]] = None
