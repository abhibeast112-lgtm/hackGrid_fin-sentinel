from fin_sentinel import (
    resume_from_json,
    start_from_json,
)
from fin_sentinel.demo.scenarios import (
    get_scenario_a_duplicate_payment,
)


def test_api_start():
    anomaly = get_scenario_a_duplicate_payment()

    response = start_from_json(
        anomaly.model_dump(mode="json")
    )

    assert response["investigation_id"]
    assert response["status"] == "WAITING_FOR_APPROVAL"
    assert response["current_step"] == "orchestrator"

    assert response["requires_approval"] is True
    assert response["checkpoint_prompt"]
    assert response["approval_options"]


def test_api_resume():
    anomaly = get_scenario_a_duplicate_payment()

    started = start_from_json(
        anomaly.model_dump(mode="json")
    )

    investigation_id = started["investigation_id"]

    response = resume_from_json(
        investigation_id=investigation_id,
        action="APPROVE",
        feedback="Scope approved.",
        reviewer_id="finance-reviewer",
    )

    assert response["investigation_id"] == investigation_id
    assert response["status"] == "WAITING_FOR_APPROVAL"
    assert response["current_step"] == "evidence"
    assert response["requires_approval"] is True
