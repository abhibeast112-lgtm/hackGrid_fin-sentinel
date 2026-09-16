from fin_sentinel import (
    resume_from_json,
    start_from_json,
)
from fin_sentinel.demo.scenarios import (
    get_scenario_b_false_positive_reversal,
)


def main():
    anomaly = get_scenario_b_false_positive_reversal()

    payload = anomaly.model_dump(mode="json")

    print("\n" + "=" * 70)
    print("SCENARIO B - FALSE POSITIVE")
    print("=" * 70)

    response = start_from_json(payload)

    print("\nSTART RESPONSE:")
    print(response)

    investigation_id = response["investigation_id"]
    checkpoint = 0

    while response["status"] == "WAITING_FOR_APPROVAL":
        checkpoint += 1

        print(f"\n--- Human Checkpoint #{checkpoint} ---")
        print(f"Step: {response['current_step']}")
        print(f"Prompt: {response['checkpoint_prompt']}")

        response = resume_from_json(
            investigation_id=investigation_id,
            action="APPROVE",
            feedback=f"Checkpoint {checkpoint} reviewed.",
            reviewer_id="finance-reviewer",
        )

        print("\nRESUME RESPONSE:")
        print(response)

    print("\n" + "=" * 70)
    print("SCENARIO B - FINAL RESULT")
    print("=" * 70)

    final_result = response.get("final_result")

    print(final_result)

    if final_result:
        print("\nChallenge verdict:")
        print(final_result.get("challenge_verdict"))

        print("\nRecommended action:")
        print(final_result.get("recommended_action"))

        print("\nCounter evidence:")
        print(final_result.get("counter_evidence_ids"))

        print("\nAlternative explanation:")
        print(final_result.get("alternative_explanation"))


if __name__ == "__main__":
    main()