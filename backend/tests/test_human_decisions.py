from fin_sentinel import (
    resume_investigation_from_dict,
    start_investigation_from_dict,
)
from fin_sentinel.demo.scenarios import (
    get_scenario_a_duplicate_payment,
)


def start_high_risk_investigation():
    anomaly = get_scenario_a_duplicate_payment()
    data = anomaly.model_dump(mode="json")

    return start_investigation_from_dict(data)


def test_human_reject_stops_investigation():
    result = start_high_risk_investigation()

    assert result["status"] == "WAITING_FOR_APPROVAL"
    assert result["current_step"] == "orchestrator"

    investigation_id = result["investigation_id"]

    rejected = resume_investigation_from_dict(
        investigation_id=investigation_id,
        action="REJECT",
        feedback="Investigation not authorized by reviewer.",
        reviewer_id="finance-reviewer",
    )

    assert rejected["investigation_id"] == investigation_id

    # Current workflow contract represents a human rejection
    # as a terminal completed investigation rather than a
    # separate REJECTED status.
    assert rejected["status"] == "COMPLETED"
    assert rejected["requires_approval"] is False


def test_request_more_evidence_keeps_investigation_open():
    result = start_high_risk_investigation()

    investigation_id = result["investigation_id"]

    response = resume_investigation_from_dict(
        investigation_id=investigation_id,
        action="REQUEST_MORE_EVIDENCE",
        feedback="Need additional vendor payment records.",
        reviewer_id="finance-reviewer",
    )

    assert response["investigation_id"] == investigation_id

    assert response["status"] in {
        "WAITING_FOR_APPROVAL",
        "COMPLETED",
    }

    assert "step_output" in response


def test_approval_path_reaches_challenge_checkpoint():
    result = start_high_risk_investigation()

    investigation_id = result["investigation_id"]

    evidence_checkpoint = resume_investigation_from_dict(
        investigation_id=investigation_id,
        action="APPROVE",
        feedback="Scope approved.",
        reviewer_id="finance-reviewer",
    )

    assert evidence_checkpoint["status"] == "WAITING_FOR_APPROVAL"
    assert evidence_checkpoint["current_step"] == "evidence"

    challenge_checkpoint = resume_investigation_from_dict(
        investigation_id=investigation_id,
        action="APPROVE",
        feedback="Evidence verified.",
        reviewer_id="finance-reviewer",
    )

    assert challenge_checkpoint["status"] == "WAITING_FOR_APPROVAL"
    assert challenge_checkpoint["current_step"] == "challenge"

    assert challenge_checkpoint["step_output"]["challenge_result"] == "supported"


def test_override_at_challenge_completes_investigation():
    result = start_high_risk_investigation()

    investigation_id = result["investigation_id"]

    evidence_checkpoint = resume_investigation_from_dict(
        investigation_id=investigation_id,
        action="APPROVE",
        feedback="Scope approved.",
        reviewer_id="finance-reviewer",
    )

    assert evidence_checkpoint["current_step"] == "evidence"

    challenge_checkpoint = resume_investigation_from_dict(
        investigation_id=investigation_id,
        action="APPROVE",
        feedback="Evidence verified.",
        reviewer_id="finance-reviewer",
    )

    assert challenge_checkpoint["current_step"] == "challenge"

    final = resume_investigation_from_dict(
        investigation_id=investigation_id,
        action="OVERRIDE",
        feedback="Reviewer determined the finding should not be treated as confirmed.",
        reviewer_id="senior-reviewer",
    )

    assert final["investigation_id"] == investigation_id
    assert final["status"] == "COMPLETED"
    assert final["requires_approval"] is False
    assert final["final_result"] is not None
