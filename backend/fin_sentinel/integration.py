from typing import Any, Dict

from fin_sentinel.adapter import anomaly_from_dict
from fin_sentinel.graph.workflow import (
    resume_investigation,
    start_investigation,
)
from fin_sentinel.models.checkpoint import HumanResponse
from fin_sentinel.response import result_to_dict


def start_investigation_from_dict(
    data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Start an investigation from API-compatible data.

    The returned object may represent either:
    - a completed investigation, or
    - a human-review checkpoint.
    """

    anomaly = anomaly_from_dict(data)

    result = start_investigation(anomaly)

    return result_to_dict(result)


def resume_investigation_from_dict(
    investigation_id: str,
    action: str,
    feedback: str = "",
    reviewer_id: str = "human_reviewer",
) -> Dict[str, Any]:
    """
    Resume a paused investigation after a human decision.
    """

    response = HumanResponse(
        action=action,
        feedback=feedback,
        reviewer_id=reviewer_id,
    )

    result = resume_investigation(
        investigation_id,
        response,
    )

    return result_to_dict(result)
