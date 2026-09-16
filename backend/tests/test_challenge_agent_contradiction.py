"""Tests for Adversarial Challenge Agent disproval capabilities."""

import unittest
from fin_sentinel.agents.evidence_agent import EvidenceAgent
from fin_sentinel.agents.challenge_agent import ChallengeAgent
from fin_sentinel.demo.scenarios import (
    get_scenario_a_duplicate_payment,
    get_scenario_b_false_positive_reversal,
)


class TestChallengeAgentContradiction(unittest.TestCase):
    """Verifies that ChallengeAgent actively discovers counter-evidence."""

    def setUp(self):
        self.evidence_agent = EvidenceAgent()
        self.challenge_agent = ChallengeAgent()

    def test_scenario_a_survives_challenge(self):
        anomaly = get_scenario_a_duplicate_payment()
        ev_set = self.evidence_agent.run({"anomaly": anomaly})
        challenge_res = self.challenge_agent.run({"anomaly": anomaly, "evidence_set": ev_set})

        self.assertEqual(challenge_res.challenge_result, "supported")
        self.assertEqual(challenge_res.contradicting_evidence, [])
        self.assertGreaterEqual(challenge_res.confidence, 0.90)
        self.assertIn("ADVERSARIAL CHALLENGE COMPLETED", challenge_res.adversarial_reasoning)

    def test_scenario_b_refuted_by_reversal_credit_note(self):
        anomaly = get_scenario_b_false_positive_reversal()
        ev_set = self.evidence_agent.run({"anomaly": anomaly})
        challenge_res = self.challenge_agent.run({"anomaly": anomaly, "evidence_set": ev_set})

        self.assertEqual(challenge_res.challenge_result, "contradicted")
        self.assertIn("CREDIT-102", challenge_res.contradicting_evidence)
        self.assertIsNotNone(challenge_res.alternative_explanation)
        self.assertGreaterEqual(challenge_res.confidence, 0.90)


if __name__ == "__main__":
    unittest.main()
