from fin_sentinel import resume_from_json, start_from_json
from fin_sentinel.demo.scenarios import get_scenario_b_false_positive_reversal


def test_scenario_b_false_positive_closes_case():
    anomaly = get_scenario_b_false_positive_reversal()

    response = start_from_json(
        anomaly.model_dump(mode="json")
    )

    investigation_id = response["investigation_id"]

    while response["status"] == "WAITING_FOR_APPROVAL":
        response = resume_from_json(
            investigation_id=investigation_id,
            action="APPROVE",
            feedback="Automated regression test approval.",
            reviewer_id="test_reviewer",
        )

    assert response["status"] == "COMPLETED"

    result = response["final_result"]

    assert result["anomaly_id"] == "ANO-2055"
    assert result["challenge_verdict"] == "contradicted"
    assert result["recommended_action"] == "CLOSE_FALSE_POSITIVE"
    assert "CREDIT-102" in result["counter_evidence_ids"]
    assert result["alternative_explanation"] is not None