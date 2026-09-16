from fin_sentinel import (
    resume_investigation_from_dict,
    start_investigation_from_dict,
)
from fin_sentinel.demo.scenarios import (
    get_scenario_a_duplicate_payment,
)


def test_start_investigation_from_dict():
    anomaly = get_scenario_a_duplicate_payment()

    data = anomaly.model_dump(mode="json")

    result = start_investigation_from_dict(data)

    assert isinstance(result, dict)

    assert result["investigation_id"]
    assert result["status"] == "WAITING_FOR_APPROVAL"
    assert result["current_step"] == "orchestrator"

    assert "step_output" in result
    assert result["step_output"]["anomaly_id"] == anomaly.anomaly_id

    assert result["step_output"]["requires_human_approval"] is True


def test_resume_investigation_from_dict():
    anomaly = get_scenario_a_duplicate_payment()

    data = anomaly.model_dump(mode="json")

    result = start_investigation_from_dict(data)

    investigation_id = result["investigation_id"]

    assert result["status"] == "WAITING_FOR_APPROVAL"

    resumed = resume_investigation_from_dict(
        investigation_id=investigation_id,
        action="APPROVE",
        feedback="Reviewed and approved.",
        reviewer_id="finance-reviewer",
    )

    assert isinstance(resumed, dict)

    assert resumed["investigation_id"] == investigation_id

    # The investigation can pause again at another human checkpoint.
    assert resumed["status"] in {
        "WAITING_FOR_APPROVAL",
        "COMPLETED",
    }

    assert "current_step" in resumed
    assert "step_output" in resumed
