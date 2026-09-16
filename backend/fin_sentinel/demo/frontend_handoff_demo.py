from fin_sentinel import start_from_json, resume_from_json
from fin_sentinel.demo.scenarios import get_scenario_a_duplicate_payment

payload = get_scenario_a_duplicate_payment().model_dump(mode="json")

print("=" * 70)
print("FIN-SENTINEL API HANDOFF DEMO")
print("=" * 70)

response = start_from_json(payload)

print("\n[1] POST /investigations")
print("Status:", response["status"])
print("Investigation ID:", response["investigation_id"])
print("Current step:", response["current_step"])
print("Approval options:", response["approval_options"])

investigation_id = response["investigation_id"]

step = 2

while response["status"] == "WAITING_FOR_APPROVAL":
    print(f"\n[{step}] POST /investigations/{investigation_id}/resume")

    response = resume_from_json(
        investigation_id=investigation_id,
        action="APPROVE",
        feedback="Approved for next investigation step.",
        reviewer_id="demo_reviewer",
    )

    print("Status:", response["status"])
    print("Current step:", response["current_step"])

    if response["status"] == "WAITING_FOR_APPROVAL":
        print("Next approval options:", response["approval_options"])

    step += 1

print("\n" + "=" * 70)
print("FINAL RESPONSE")
print("=" * 70)

print(response)

assert response["status"] == "COMPLETED"
assert response["final_result"] is not None

print("\nAPI HANDOFF DEMO PASSED")
