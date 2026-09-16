from fin_sentinel import (
    build_api_response,
    resume_from_json,
    start_from_json,
)
from fin_sentinel.demo.scenarios import (
    get_scenario_a_duplicate_payment,
)


def test_checkpoint_contract():
    data = {
        "investigation_id": "INV-001",
        "status": "WAITING_FOR_APPROVAL",
        "current_step": "orchestrator",
        "risk_tier": "HIGH",
        "requires_approval": True,
        "checkpoint_prompt": "Approve investigation?",
        "approval_options": [
            "APPROVE",
            "REJECT",
            "REQUEST_MORE_EVIDENCE",
        ],
        "step_output": {
            "anomaly_id": "ANO-001",
        },
    }

    result = build_api_response(data)

    assert result["status"] == "WAITING_FOR_APPROVAL"
    assert result["current_step"] == "orchestrator"
    assert result["requires_approval"] is True

    assert "checkpoint_prompt" in result
    assert "approval_options" in result
    assert "step_output" in result

    assert "final_result" not in result


def test_completed_contract():
    data = {
        "investigation_id": "INV-001",
        "status": "COMPLETED",
        "current_step": "completed",
        "risk_tier": "HIGH",
        "requires_approval": False,
        "final_result": {
            "anomaly_id": "ANO-001",
            "recommended_action": "HOLD_PAYMENT",
        },
    }

    result = build_api_response(data)

    assert result["status"] == "COMPLETED"
    assert result["requires_approval"] is False

    assert "final_result" in result
    assert "checkpoint_prompt" not in result
    assert "approval_options" not in result


def test_api_start_returns_checkpoint_contract():
    anomaly = get_scenario_a_duplicate_payment()

    response = start_from_json(
        anomaly.model_dump(mode="json")
    )

    assert response["status"] == "WAITING_FOR_APPROVAL"
    assert response["current_step"] == "orchestrator"

    assert "checkpoint_prompt" in response
    assert "approval_options" in response
    assert "step_output" in response

    assert "final_result" not in response


def test_api_resume_returns_next_checkpoint():
    anomaly = get_scenario_a_duplicate_payment()

    started = start_from_json(
        anomaly.model_dump(mode="json")
    )

    response = resume_from_json(
        investigation_id=started["investigation_id"],
        action="APPROVE",
        feedback="Scope approved.",
        reviewer_id="finance-reviewer",
    )

    assert response["status"] == "WAITING_FOR_APPROVAL"
    assert response["current_step"] == "evidence"

    assert "checkpoint_prompt" in response
    assert "approval_options" in response
    assert "step_output" in response

    assert "final_result" not in response
