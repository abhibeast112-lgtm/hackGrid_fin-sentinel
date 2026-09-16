from pydantic import ValidationError

from fin_sentinel import (
    InvestigationCheckpointResponse,
    InvestigationCompletedResponse,
    ResumeInvestigationRequest,
    validate_api_response,
)


def test_resume_request_schema():
    request = ResumeInvestigationRequest(
        action="APPROVE",
        feedback="Evidence reviewed.",
        reviewer_id="finance-reviewer",
    )

    assert request.action == "APPROVE"
    assert request.feedback == "Evidence reviewed."
    assert request.reviewer_id == "finance-reviewer"


def test_resume_request_defaults():
    request = ResumeInvestigationRequest(
        action="REJECT",
    )

    assert request.action == "REJECT"
    assert request.feedback == ""
    assert request.reviewer_id == "human_reviewer"


def test_checkpoint_response_schema():
    response = InvestigationCheckpointResponse(
        investigation_id="INV-001",
        status="WAITING_FOR_APPROVAL",
        current_step="evidence",
        risk_tier="HIGH",
        requires_approval=True,
        checkpoint_prompt="Confirm evidence.",
        approval_options=["APPROVE", "REJECT"],
        step_output={
            "verified_record_ids": ["TXN-001"]
        },
    )

    assert response.investigation_id == "INV-001"
    assert response.status == "WAITING_FOR_APPROVAL"
    assert response.current_step == "evidence"


def test_completed_response_schema():
    response = InvestigationCompletedResponse(
        investigation_id="INV-001",
        status="COMPLETED",
        current_step="completed",
        risk_tier="HIGH",
        requires_approval=False,
        final_result={
            "recommended_action": "HOLD_PAYMENT"
        },
    )

    assert response.status == "COMPLETED"
    assert response.requires_approval is False
    assert response.final_result["recommended_action"] == "HOLD_PAYMENT"


def test_api_response_validation_checkpoint():
    data = {
        "investigation_id": "INV-001",
        "status": "WAITING_FOR_APPROVAL",
        "current_step": "orchestrator",
        "risk_tier": "HIGH",
        "requires_approval": True,
        "checkpoint_prompt": "Approve?",
        "approval_options": ["APPROVE", "REJECT"],
        "step_output": {},
    }

    result = validate_api_response(data)

    assert isinstance(
        result,
        InvestigationCheckpointResponse,
    )


def test_api_response_validation_completed():
    data = {
        "investigation_id": "INV-001",
        "status": "COMPLETED",
        "current_step": "completed",
        "risk_tier": "HIGH",
        "requires_approval": False,
        "final_result": {},
    }

    result = validate_api_response(data)

    assert isinstance(
        result,
        InvestigationCompletedResponse,
    )


def test_invalid_resume_action_type_is_rejected():
    try:
        ResumeInvestigationRequest(
            action=None,
        )
        assert False, "Invalid action should fail validation"
    except ValidationError:
        assert True
