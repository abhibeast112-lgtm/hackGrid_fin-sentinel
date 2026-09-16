from fin_sentinel import resume_from_json, start_from_json
from fin_sentinel.demo.scenarios import get_scenario_a_duplicate_payment


def test_full_api_handoff_lifecycle():
    anomaly = get_scenario_a_duplicate_payment()

    response = start_from_json(
        anomaly.model_dump(mode="json")
    )

    assert response["status"] == "WAITING_FOR_APPROVAL"
    assert response["current_step"] == "orchestrator"
    assert response["requires_approval"] is True

    investigation_id = response["investigation_id"]
    checkpoints = []

    while response["status"] == "WAITING_FOR_APPROVAL":
        checkpoints.append(response["current_step"])

        response = resume_from_json(
            investigation_id=investigation_id,
            action="APPROVE",
            feedback="API handoff integration test.",
            reviewer_id="api_test_reviewer",
        )

    assert response["status"] == "COMPLETED"
    assert response["current_step"] == "completed"

    result = response["final_result"]

    assert result["anomaly_id"] == "ANO-1042"
    assert result["risk_tier"] == "HIGH"
    assert result["challenge_verdict"] == "supported"
    assert result["recommended_action"] == "HOLD_PAYMENT"

    assert checkpoints == [
        "orchestrator",
        "evidence",
        "challenge",
    ]
