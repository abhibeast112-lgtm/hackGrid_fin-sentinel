"""Tests for High-Risk LangGraph interrupts and multi-step human resume."""

import unittest
from fin_sentinel.demo.scenarios import get_scenario_a_duplicate_payment
from fin_sentinel.graph.workflow import start_investigation, resume_investigation
from fin_sentinel.models.checkpoint import HumanResponse


class TestHighRiskInterruptResume(unittest.TestCase):
    """Verifies that high-risk cases pause at checkpoints and resume accurately."""

    def test_three_checkpoint_human_workflow(self):
        anomaly = get_scenario_a_duplicate_payment()

        # Step 1: Start -> Pauses at Checkpoint 1 (Orchestrator Scope Approval)
        step1 = start_investigation(anomaly)
        self.assertTrue(step1.requires_approval)
        self.assertEqual(step1.status, "WAITING_FOR_APPROVAL")
        self.assertEqual(step1.current_step, "orchestrator")
        self.assertIn("SCOPE APPROVAL", step1.checkpoint_prompt)

        # Resume Step 1 -> Pauses at Checkpoint 2 (Evidence Confirmation)
        step2 = resume_investigation(
            step1.investigation_id,
            HumanResponse(action="APPROVE", feedback="Scope confirmed"),
        )
        self.assertTrue(step2.requires_approval)
        self.assertEqual(step2.status, "WAITING_FOR_APPROVAL")
        self.assertEqual(step2.current_step, "evidence")
        self.assertIn("EVIDENCE CONFIRMATION", step2.checkpoint_prompt)

        # Resume Step 2 -> Pauses at Checkpoint 3 (Challenge Review)
        step3 = resume_investigation(
            step2.investigation_id,
            HumanResponse(action="APPROVE", feedback="Evidence IDs confirmed"),
        )
        self.assertTrue(step3.requires_approval)
        self.assertEqual(step3.status, "WAITING_FOR_APPROVAL")
        self.assertEqual(step3.current_step, "challenge")
        self.assertIn("CHALLENGE REVIEW", step3.checkpoint_prompt)

        # Resume Step 3 -> Finalizes to Completion
        step4 = resume_investigation(
            step3.investigation_id,
            HumanResponse(action="APPROVE", feedback="Challenge findings verified"),
        )
        self.assertFalse(step4.requires_approval)
        self.assertEqual(step4.status, "COMPLETED")
        self.assertEqual(step4.current_step, "completed")
        self.assertIsNotNone(step4.final_result)

        res = step4.final_result
        self.assertEqual(res.recommended_action, "HOLD_PAYMENT")
        self.assertEqual(res.challenge_verdict, "supported")

        # Verify audit trail contains all human responses
        actions = [a.human_action for a in res.audit_trail if a.human_action]
        self.assertEqual(len(actions), 3)


if __name__ == "__main__":
    unittest.main()
