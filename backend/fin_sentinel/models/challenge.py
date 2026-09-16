"""Challenge Agent models representing adversarial disproval results.

The Challenge Agent acts as the internal defense counsel for the finding,
specifically searching for legitimate alternative explanations:
reversals, credit notes, duplicate false positives, timing offsets, and vendor credits.
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


ChallengeVerdict = Literal["supported", "contradicted", "inconclusive"]


class ChallengeResult(BaseModel):
    """Structured outcome of the adversarial challenge examination."""

    challenge_result: ChallengeVerdict = Field(
        ...,
        description="Whether the finding remains supported, is contradicted by counter-evidence, or is inconclusive",
    )
    supporting_evidence: List[str] = Field(
        default_factory=list,
        description="Record IDs supporting the anomaly hypothesis after adversarial testing",
    )
    contradicting_evidence: List[str] = Field(
        default_factory=list,
        description="Record IDs contradicting the anomaly (e.g. CREDIT-102, REV-5001)",
    )
    alternative_explanation: Optional[str] = Field(
        default=None,
        description="Legitimate business explanation discovered (e.g. 'Payment was reversed and reissued.')",
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence in the challenge verdict based on evidence completeness",
    )
    checks_performed: List[str] = Field(
        default_factory=list,
        description="Systematic disproval checks executed (reversal check, credit note check, system retry check, etc.)",
    )
    adversarial_reasoning: str = Field(
        ...,
        description="Detailed rationale explaining why the finding was confirmed or refuted",
    )
