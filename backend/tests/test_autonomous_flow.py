"""Tests for Autonomous execution of Low/Medium risk cases."""

import unittest
from fin_sentinel.demo.scenarios import get_scenario_c_autonomous_expense_variance
from fin_sentinel.graph.workflow import start_investigation


class TestAutonomousFlow(unittest.TestCase):
    """Verifies low/medium risk anomalies execute autonomously without human interrupts."""

    def test_autonomous_completion_in_one_step(self):
        anomaly = get_scenario_c_autonomous_expense_variance()
        step = start_investigation(anomaly)

        # Autonomous case must NOT require approval
        self.assertFalse(step.requires_approval)
        self.assertEqual(step.status, "COMPLETED")
        self.assertEqual(step.current_step, "completed")
        self.assertIsNotNone(step.final_result)

        res = step.final_result
        self.assertEqual(res.risk_tier, "LOW")
        self.assertEqual(res.recommended_action, "ESCALATE")
        self.assertIn("TXN-9910", res.evidence_record_ids)
        self.assertTrue(len(res.four_questions.what_happened) > 10)


if __name__ == "__main__":
    unittest.main()
