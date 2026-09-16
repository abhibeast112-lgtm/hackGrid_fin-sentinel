from typing import Any, Dict

from fin_sentinel.api_contract import build_api_response
from fin_sentinel.api_schemas import (
    InvestigationCheckpointResponse,
    InvestigationCompletedResponse,
    ResumeInvestigationRequest,
)
from fin_sentinel.integration import (
    resume_investigation_from_dict,
    start_investigation_from_dict,
)


def start_from_json(
    payload: Dict[str, Any],
) -> Dict[str, Any]:
    """
    API-facing entry point for starting an investigation.
    """

    result = start_investigation_from_dict(payload)

    response = build_api_response(result)

    return response


def resume_from_json(
    investigation_id: str,
    action: str,
    feedback: str = "",
    reviewer_id: str = "human_reviewer",
) -> Dict[str, Any]:
    """
    API-facing entry point for resuming an investigation.
    """

    request = ResumeInvestigationRequest(
        action=action,
        feedback=feedback,
        reviewer_id=reviewer_id,
    )

    result = resume_investigation_from_dict(
        investigation_id=investigation_id,
        action=request.action,
        feedback=request.feedback,
        reviewer_id=request.reviewer_id,
    )

    return build_api_response(result)


def validate_api_response(
    response: Dict[str, Any],
):
    """
    Validate a response against the appropriate
    lifecycle schema.
    """

    if response["status"] == "WAITING_FOR_APPROVAL":
        return InvestigationCheckpointResponse.model_validate(
            response
        )

    if response["status"] == "COMPLETED":
        return InvestigationCompletedResponse.model_validate(
            response
        )

    raise ValueError(
        f"Unsupported API status: {response['status']}"
    )
