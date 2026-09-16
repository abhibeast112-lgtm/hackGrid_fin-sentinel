from typing import Any, Dict


CHECKPOINT_STATUSES = {
    "WAITING_FOR_APPROVAL",
}


TERMINAL_STATUSES = {
    "COMPLETED",
}


def build_checkpoint_response(
    data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Public contract for an investigation waiting for human review.
    """

    return {
        "investigation_id": data.get("investigation_id"),
        "status": data.get("status"),
        "current_step": data.get("current_step"),
        "risk_tier": data.get("risk_tier"),
        "requires_approval": data.get("requires_approval"),
        "checkpoint_prompt": data.get("checkpoint_prompt"),
        "approval_options": data.get("approval_options", []),
        "step_output": data.get("step_output"),
    }


def build_completed_response(
    data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Public contract for a completed investigation.
    """

    return {
        "investigation_id": data.get("investigation_id"),
        "status": data.get("status"),
        "current_step": data.get("current_step"),
        "risk_tier": data.get("risk_tier"),
        "requires_approval": data.get("requires_approval"),
        "final_result": data.get("final_result"),
    }


def build_api_response(
    data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Select the correct public response contract based
    on the investigation lifecycle state.
    """

    status = data.get("status")

    if status in CHECKPOINT_STATUSES:
        return build_checkpoint_response(data)

    if status in TERMINAL_STATUSES:
        return build_completed_response(data)

    raise ValueError(
        f"Unsupported investigation status: {status}"
    )
