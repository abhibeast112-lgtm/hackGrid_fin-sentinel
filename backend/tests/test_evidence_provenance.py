"""Tests for Evidence Provenance and Zero Hallucination Guarantee."""

import unittest
from fin_sentinel.agents.evidence_agent import EvidenceAgent
from fin_sentinel.models.anomaly import Anomaly


class TestEvidenceProvenance(unittest.TestCase):
    """Verifies EvidenceAgent strictly validates records and computes provenance hash."""

    def setUp(self):
        self.agent = EvidenceAgent()

    def test_rejects_hallucinated_record_ids(self):
        anomaly = Anomaly(
            anomaly_id="ANO-TEST-01",
            anomaly_type="DUPLICATE_PAYMENT",
            title="Duplicate Test",
            description="Test description",
            amount=10000.0,
            risk_score=80.0,
            risk_tier="HIGH",
            flagged_record_ids=["REAL-TXN-1", "FAKE-HALLUCINATED-999"],
            associated_records=[
                {"record_id": "REAL-TXN-1", "type": "TRANSACTION", "amount": 10000.0, "description": "Genuine ledger entry"}
            ],
        )

        evidence_set = self.agent.run({"anomaly": anomaly})

        # Provenance guarantees:
        self.assertIn("REAL-TXN-1", evidence_set.referenced_record_ids)
        self.assertIn("FAKE-HALLUCINATED-999", evidence_set.rejected_unsubstantiated_ids)
        self.assertTrue(len(evidence_set.provenance_hash) > 20, "Must calculate SHA-256 hash")
        self.assertEqual(len(evidence_set.verified_records), 1)
        self.assertEqual(evidence_set.verified_records[0].record_id, "REAL-TXN-1")

    def test_provenance_hash_is_deterministic(self):
        anomaly = Anomaly(
            anomaly_id="ANO-TEST-02",
            anomaly_type="DUPLICATE_PAYMENT",
            title="Deterministic Test",
            description="Test description",
            amount=5000.0,
            risk_score=75.0,
            risk_tier="HIGH",
            flagged_record_ids=["TXN-101"],
            associated_records=[
                {"record_id": "TXN-101", "type": "TRANSACTION", "amount": 5000.0}
            ],
        )
        set1 = self.agent.run({"anomaly": anomaly})
        set2 = self.agent.run({"anomaly": anomaly})
        self.assertEqual(set1.provenance_hash, set2.provenance_hash)


if __name__ == "__main__":
    unittest.main()
