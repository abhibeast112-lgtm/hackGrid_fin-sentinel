"""Tests for the frozen run_investigation(anomaly) synchronous contract."""

import unittest
from fin_sentinel.demo.scenarios import (
    get_scenario_a_duplicate_payment,
    get_scenario_b_false_positive_reversal,
)
from fin_sentinel.graph.workflow import run_investigation
from fin_sentinel.models.result import InvestigationResult


class TestSynchronousContract(unittest.TestCase):
    """Verifies the single-call run_investigation(anomaly) contract."""

    def test_run_investigation_supported_case(self):
        anomaly = get_scenario_a_duplicate_payment()
        result = run_investigation(anomaly)

        self.assertIsInstance(result, InvestigationResult)
        self.assertEqual(result.anomaly_id, "ANO-1042")
        self.assertEqual(result.challenge_verdict, "supported")
        self.assertEqual(result.recommended_action, "HOLD_PAYMENT")
        self.assertTrue(result.requires_human_signoff)

    def test_run_investigation_false_positive_case(self):
        anomaly = get_scenario_b_false_positive_reversal()
        result = run_investigation(anomaly)

        self.assertIsInstance(result, InvestigationResult)
        self.assertEqual(result.anomaly_id, "ANO-2055")
        self.assertEqual(result.challenge_verdict, "contradicted")
        self.assertEqual(result.recommended_action, "CLOSE_FALSE_POSITIVE")
        self.assertIn("CREDIT-102", result.counter_evidence_ids)


if __name__ == "__main__":
    unittest.main()
