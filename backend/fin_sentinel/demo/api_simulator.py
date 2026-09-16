import json

from fin_sentinel import (
    resume_from_json,
    start_from_json,
)
from fin_sentinel.demo.scenarios import (
    get_scenario_a_duplicate_payment,
)


def print_json(title, data):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)
    print(json.dumps(data, indent=2, default=str))


def main():
    # ---------------------------------------------------------
    # POST /investigations
    # ---------------------------------------------------------

    anomaly = get_scenario_a_duplicate_payment()

    request_payload = anomaly.model_dump(mode="json")

    print_json(
        "POST /investigations",
        request_payload,
    )

    response = start_from_json(request_payload)

    print_json(
        "RESPONSE",
        response,
    )

    investigation_id = response["investigation_id"]

    # ---------------------------------------------------------
    # POST /investigations/{id}/resume
    # ---------------------------------------------------------

    checkpoint_number = 0

    while response["status"] == "WAITING_FOR_APPROVAL":
        checkpoint_number += 1

        print(
            f"\nHuman checkpoint #{checkpoint_number}"
        )

        resume_payload = {
            "action": "APPROVE",
            "feedback": (
                f"Checkpoint {checkpoint_number} "
                "reviewed by finance."
            ),
            "reviewer_id": "finance-reviewer",
        }

        print_json(
            f"POST /investigations/{investigation_id}/resume",
            resume_payload,
        )

        response = resume_from_json(
            investigation_id=investigation_id,
            action=resume_payload["action"],
            feedback=resume_payload["feedback"],
            reviewer_id=resume_payload["reviewer_id"],
        )

        print_json(
            "RESPONSE",
            response,
        )

    print_json(
        "FINAL API RESPONSE",
        response,
    )


if __name__ == "__main__":
    main()
