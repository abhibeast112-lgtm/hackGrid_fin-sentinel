from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from app.engine.detector import detect_duplicate_payments
from fin_sentinel.api import start_from_json


router = APIRouter(
    prefix="/detect",
    tags=["Detection"],
)


class DetectionRequest(BaseModel):
    transaction_ids: List[str]


@router.post("")
def detect_anomaly(request: DetectionRequest):
    anomaly = detect_duplicate_payments(
        request.transaction_ids
    )

    if anomaly is None:
        return {
            "status": "NO_ANOMALY",
            "message": "No duplicate payment detected.",
        }

    try:
        result = start_from_json(anomaly)

        return result

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )