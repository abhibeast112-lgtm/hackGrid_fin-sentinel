from fin_sentinel import run_investigation
from fin_sentinel.demo.scenarios import (
    get_scenario_a_duplicate_payment,
)


def test_public_investigation_interface():
    anomaly = get_scenario_a_duplicate_payment()

    result = run_investigation(anomaly)

    assert result is not None
    assert result.investigation_id
    assert result.anomaly_id == anomaly.anomaly_id
    assert result.audit_trail
