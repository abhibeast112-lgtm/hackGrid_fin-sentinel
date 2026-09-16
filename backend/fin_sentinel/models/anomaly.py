from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

RiskTier = Literal["LOW", "MEDIUM", "HIGH"]

class Anomaly(BaseModel):
    anomaly_id: str = Field(..., description="Unique anomaly identifier, e.g. ANO-1042")
    anomaly_type: str = Field(..., description="Type of anomaly, e.g. DUPLICATE_PAYMENT, UNUSUAL_EXPENSE_VARIANCE, SPLIT_PURCHASE_ORDER, GHOST_VENDOR")
    title: str = Field(..., description="Human-readable summary of the detected anomaly")
    description: str = Field(..., description="Detailed description of why engine flagged this")
    amount: float = Field(..., description="Primary financial exposure amount")
    currency: str = Field(default="INR", description="Currency code, e.g. INR, USD")
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Deterministic risk score from 0 to 100")
    risk_tier: RiskTier = Field(..., description="Categorical risk tier: LOW, MEDIUM, or HIGH")
    vendor_id: Optional[str] = Field(default=None, description="Associated vendor code if applicable")
    vendor_name: Optional[str] = Field(default=None, description="Vendor legal entity name")
    flagged_record_ids: List[str] = Field(default_factory=list, description="Specific primary ledger/invoice IDs that triggered the flag")
    associated_records: List[Dict[str, Any]] = Field(default_factory=list, description="Ground truth record context supplied by the data layer")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional contextual attributes")
    detected_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat(), description="ISO timestamp of engine detection")
