import sys
import io

# Ensure UTF-8 output on Windows consoles
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import json
from fin_sentinel.models.checkpoint import HumanResponse
from fin_sentinel.graph.workflow import start_investigation, resume_investigation
from fin_sentinel.demo.scenarios import (
    get_scenario_a_duplicate_payment,
    get_scenario_b_false_positive_reversal,
    get_scenario_c_autonomous_expense_variance,
)


def print_banner():
    print("=" * 80)
    print("  FIN-SENTINEL: AI FINANCIAL INVESTIGATION & CONTROL LAYER")
    print("  Positioning: CA / CFO Augmentation | Search-Space Reduction")
    print("  100,000 Transactions -> 37 Exceptions -> 8 Cases -> Human Professional")
    print("=" * 80)


def run_scenario_demo(scenario_func, auto_approve: bool = True):
    anomaly = scenario_func()
    print(f"\n[*] INGESTING ANOMALY: {anomaly.title}")
    print(f"    Amount: {anomaly.currency} {anomaly.amount:,.2f} | Risk Score: {anomaly.risk_score} ({anomaly.risk_tier})")
    print(f"    Flagged Records: {', '.join(anomaly.flagged_record_ids)}")
    print("-" * 80)

    # Start investigation
    step = start_investigation(anomaly)
    step_num = 1

    while step.status == "WAITING_FOR_APPROVAL" and step.requires_approval:
        print(f"\n[!] CHECKPOINT {step_num} ENCOUNTERED: Step = '{step.current_step}'")
        print(f"    Prompt: {step.checkpoint_prompt}")
        print(f"    Available Options: {step.approval_options}")

        if auto_approve:
            print("    --> Human Action: [APPROVE] (Simulated CA / Finance Manager Sign-off)")
            action = "APPROVE"
            feedback = "Verified context and approved proceeding."
        else:
            action = input("    Enter Action (APPROVE / REJECT): ").strip().upper() or "APPROVE"
            feedback = "Interactive review sign-off"

        step = resume_investigation(
            step.investigation_id,
            HumanResponse(action=action, feedback=feedback, reviewer_id="CharteredAccountant_01"),
        )
        step_num += 1

    print(f"\n[+] INVESTIGATION COMPLETED! Status: {step.status}")
    if step.final_result:
        res = step.final_result
        print("=" * 80)
        print(f"  CASE FILE #{res.investigation_id}")
        print(f"  Title:              {res.title}")
        print(f"  Financial Exposure: {res.currency} {res.amount:,.2f}")
        print(f"  Risk Signal:        {res.risk_score:.0f}/100 ({res.risk_tier})")
        print(f"  Challenge Verdict:  {res.challenge_verdict.upper()}")
        print(f"  Recommended Action: {res.recommended_action}")
        print(f"  Evidence Records:   {', '.join(res.evidence_record_ids)}")
        if res.counter_evidence_ids:
            print(f"  Counter Evidence:   {', '.join(res.counter_evidence_ids)}")
        if res.alternative_explanation:
            print(f"  Alternative Expl:   {res.alternative_explanation}")
        print("-" * 80)
        print("  THE FOUR CORE QUESTIONS:")
        print(f"  1. WHAT happened? \n     {res.four_questions.what_happened}")
        print(f"  2. WHY anomalous? \n     {res.four_questions.why_anomalous}")
        print(f"  3. WHAT evidence? \n     {', '.join(res.four_questions.what_evidence)}")
        print(f"  4. WHAT could prove it wrong? \n     {res.four_questions.what_could_prove_it_wrong}")
        print("-" * 80)
        print(f"  EXECUTIVE SUMMARY:\n  {res.executive_summary}")
        print("=" * 80)


def main():
    print_banner()
    print("\nSelect a demo scenario to run:")
    print("1. [Scenario A] Duplicate Payment (High Risk -> 3 Checkpoints -> Supported -> Escalate)")
    print("2. [Scenario B] False Positive (High Risk -> Challenge Finds Reversal CREDIT-102 -> Contradicted -> Close)")
    print("3. [Scenario C] Expense Variance (Low Risk -> Fully Autonomous -> Decision-Ready)")
    print("4. Run all scenarios sequentially")

    choice = sys.argv[1] if len(sys.argv) > 1 else "4"
    if choice == "1":
        run_scenario_demo(get_scenario_a_duplicate_payment)
    elif choice == "2":
        run_scenario_demo(get_scenario_b_false_positive_reversal)
    elif choice == "3":
        run_scenario_demo(get_scenario_c_autonomous_expense_variance)
    else:
        print("\n=== RUNNING SCENARIO A: MATERIAL DUPLICATE PAYMENT ===")
        run_scenario_demo(get_scenario_a_duplicate_payment)
        print("\n=== RUNNING SCENARIO B: FALSE POSITIVE (ADVERSARIAL CONTRADICTION) ===")
        run_scenario_demo(get_scenario_b_false_positive_reversal)
        print("\n=== RUNNING SCENARIO C: AUTONOMOUS EXPENSE VARIANCE ===")
        run_scenario_demo(get_scenario_c_autonomous_expense_variance)


if __name__ == "__main__":
    main()
