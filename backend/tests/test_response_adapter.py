from fin_sentinel import (
    result_to_dict,
    result_to_json,
    run_investigation,
)
from fin_sentinel.demo.scenarios import (
    get_scenario_a_duplicate_payment,
)


def test_result_to_dict():
    anomaly = get_scenario_a_duplicate_payment()

    result = run_investigation(anomaly)
    data = result_to_dict(result)

    assert isinstance(data, dict)

    assert data["investigation_id"]
    assert data["anomaly_id"] == anomaly.anomaly_id

    assert "risk_score" in data
    assert "audit_trail" in data


def test_result_to_json():
    anomaly = get_scenario_a_duplicate_payment()

    result = run_investigation(anomaly)
    data = result_to_json(result)

    assert isinstance(data, str)
    assert len(data) > 0

    assert result.investigation_id in data
