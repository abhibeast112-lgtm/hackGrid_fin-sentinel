"""Evidence models enforcing provenance and ground truth verification.

Every piece of evidence must reference actual records supplied in associated_records.
Agents are strictly prohibited from hallucinating record IDs.
"""

import hashlib
import json
from typing import Any, Dict, List, Literal
from pydantic import BaseModel, Field


RecordType = Literal[
    "INVOICE",
    "TRANSACTION",
    "CREDIT_NOTE",
    "REVERSAL",
    "PURCHASE_ORDER",
    "VENDOR_MASTER",
    "APPROVAL_LOG",
    "OTHER",
]


class EvidenceItem(BaseModel):
    """An individual atomic evidence record verified against source ledger data."""

    record_id: str = Field(..., description="Existing ledger/document record ID, e.g. INV-1042")
    record_type: RecordType = Field(..., description="Categorical document type")
    description: str = Field(..., description="Factual summary of what this record contains")
    raw_data: Dict[str, Any] = Field(
        default_factory=dict, description="Underlying ledger attributes for this record"
    )
    relevance_score: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Relevance of this evidence to the anomaly"
    )
    supports_anomaly: bool = Field(
        default=True,
        description="True if this record indicates an issue; False if it contradicts or excuses it",
    )


class EvidenceSet(BaseModel):
    """Collection of verified evidence items with integrity provenance."""

    anomaly_id: str = Field(..., description="Target anomaly ID")
    verified_records: List[EvidenceItem] = Field(
        default_factory=list, description="List of ground-truth validated evidence items"
    )
    referenced_record_ids: List[str] = Field(
        default_factory=list, description="List of all valid record IDs cited"
    )
    rejected_unsubstantiated_ids: List[str] = Field(
        default_factory=list,
        description="Any phantom/hallucinated IDs rejected during provenance verification",
    )
    provenance_hash: str = Field(
        default="",
        description="SHA-256 fingerprint of the verified evidence set for audit tamper resistance",
    )

    def compute_hash(self) -> str:
        payload = json.dumps(
            [{"id": r.record_id, "type": r.record_type, "data": r.raw_data} for r in self.verified_records],
            sort_keys=True,
            default=str,
        )
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()
