import json

from fin_sentinel import (
    resume_investigation_from_dict,
    start_investigation_from_dict,
)
from fin_sentinel.demo.scenarios import (
    get_scenario_a_duplicate_payment,
)


def print_response(label, response):
    print(f"\n{'=' * 70}")
    print(label)
    print('=' * 70)
    print(json.dumps(response, indent=2, default=str))


def main():
    # Simulate the payload that the teammate's detection engine
    # would send to Fin-Sentinel.
    anomaly = get_scenario_a_duplicate_payment()

    incoming_payload = anomaly.model_dump(mode="json")

    print_response(
        "1. INCOMING ANOMALY",
        incoming_payload,
    )

    # Start investigation.
    response = start_investigation_from_dict(
        incoming_payload
    )

    print_response(
        "2. INVESTIGATION STARTED",
        response,
    )

    investigation_id = response["investigation_id"]

    # Continue approving human checkpoints until the
    # investigation reaches a terminal state.
    checkpoint_count = 0

    while response.get("status") == "WAITING_FOR_APPROVAL":
        checkpoint_count += 1

        print(
            f"\nHuman checkpoint #{checkpoint_count}: "
            f"{response.get('current_step')}"
        )

        response = resume_investigation_from_dict(
            investigation_id=investigation_id,
            action="APPROVE",
            feedback=f"Checkpoint #{checkpoint_count} reviewed.",
            reviewer_id="integration-test-user",
        )

        print_response(
            f"3.{checkpoint_count} CHECKPOINT RESUMED",
            response,
        )

    print_response(
        "4. FINAL INVESTIGATION RESULT",
        response,
    )

    print(
        f"\nFinal status: {response.get('status')}"
    )
    print(
        f"Investigation ID: {investigation_id}"
    )
    print(
        f"Human checkpoints: {checkpoint_count}"
    )


if __name__ == "__main__":
    main()
