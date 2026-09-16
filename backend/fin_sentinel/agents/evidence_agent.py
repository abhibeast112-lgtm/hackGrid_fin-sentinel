"""Evidence Agent: Strict ground truth extraction with zero hallucination guarantee."""

from typing import Any, Dict, List
from fin_sentinel.agents.base import BaseAgent
from fin_sentinel.models.anomaly import Anomaly
from fin_sentinel.models.evidence import EvidenceItem, EvidenceSet, RecordType


class EvidenceAgent(BaseAgent):
    """Gathers and validates evidence strictly against underlying data layer records.

    Zero Hallucination Guarantee: Every cited record ID must exist in associated_records.
    Any fabricated ID is rejected. Computes cryptographic provenance hash.
    """

    def __init__(self):
        super().__init__(
            name="EvidenceAgent",
            role="Record Provenance and Ground Truth Verifier",
        )

    def run(self, context: Dict[str, Any]) -> EvidenceSet:
        raw_anomaly = context.get("anomaly")
        anomaly = raw_anomaly if isinstance(raw_anomaly, Anomaly) else Anomaly(**raw_anomaly)

        # Build index of genuine source records from data layer
        raw_ledger = anomaly.associated_records or []
        ledger_by_id: Dict[str, Dict[str, Any]] = {}
        for rec in raw_ledger:
            rec_id = str(rec.get("record_id") or rec.get("id") or rec.get("txn_id") or rec.get("invoice_id") or "")
            if rec_id:
                ledger_by_id[rec_id.upper()] = rec

        verified_items: List[EvidenceItem] = []
        referenced_ids: List[str] = []
        rejected_ids: List[str] = []

        # Validate flagged record IDs
        for candidate_id in anomaly.flagged_record_ids:
            cid_upper = candidate_id.upper()
            if cid_upper in ledger_by_id:
                source_record = ledger_by_id[cid_upper]
                rec_type = self._infer_record_type(cid_upper, source_record)
                item = EvidenceItem(
                    record_id=candidate_id,
                    record_type=rec_type,
                    description=f"Verified ledger entry {candidate_id}: {source_record.get('description', 'Transaction record')}",
                    raw_data=source_record,
                    relevance_score=1.0,
                    supports_anomaly=True,
                )
                verified_items.append(item)
                referenced_ids.append(candidate_id)
            else:
                rejected_ids.append(candidate_id)

        # Also index contextual related records from associated_records (e.g. credit notes, reversals, invoices)
        for rec_id, rec_data in ledger_by_id.items():
            original_id = str(rec_data.get("record_id") or rec_data.get("id") or rec_id)
            if original_id not in referenced_ids:
                rec_type = self._infer_record_type(rec_id, rec_data)
                is_counter = rec_type in ["REVERSAL", "CREDIT_NOTE"] or "REVERS" in str(rec_data).upper()
                item = EvidenceItem(
                    record_id=original_id,
                    record_type=rec_type,
                    description=f"Contextual ledger record {original_id}: {rec_data.get('description', '')}",
                    raw_data=rec_data,
                    relevance_score=0.9,
                    supports_anomaly=not is_counter,
                )
                verified_items.append(item)
                referenced_ids.append(original_id)

        evidence_set = EvidenceSet(
            anomaly_id=anomaly.anomaly_id,
            verified_records=verified_items,
            referenced_record_ids=referenced_ids,
            rejected_unsubstantiated_ids=rejected_ids,
        )
        evidence_set.provenance_hash = evidence_set.compute_hash()
        return evidence_set

    def _infer_record_type(self, record_id: str, record_data: Dict[str, Any]) -> RecordType:
        explicit_type = str(record_data.get("type") or record_data.get("record_type") or "").upper()
        if "REVERSAL" in explicit_type or record_id.startswith("REV-") or record_data.get("status") == "REVERSED":
            return "REVERSAL"
        if "CREDIT" in explicit_type or record_id.startswith("CREDIT-") or record_id.startswith("CN-"):
            return "CREDIT_NOTE"
        if "INVOICE" in explicit_type or record_id.startswith("INV-"):
            return "INVOICE"
        if "PURCHASE" in explicit_type or record_id.startswith("PO-"):
            return "PURCHASE_ORDER"
        if "VENDOR" in explicit_type or record_id.startswith("VEND-"):
            return "VENDOR_MASTER"
        if record_id.startswith("TXN-"):
            return "TRANSACTION"
        return "OTHER"
