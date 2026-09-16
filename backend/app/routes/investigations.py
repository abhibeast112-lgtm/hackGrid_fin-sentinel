from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from fin_sentinel.api import start_from_json, resume_from_json


router = APIRouter(
    prefix="/investigations",
    tags=["Investigations"],
)


@router.post("")
def start_investigation(payload: Dict[str, Any]):
    try:
        return start_from_json(payload)

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.post("/{investigation_id}/resume")
def resume_investigation(
    investigation_id: str,
    payload: Dict[str, Any],
):
    try:
        return resume_from_json(
            investigation_id=investigation_id,
            action=payload["action"],
            feedback=payload.get("feedback", ""),
            reviewer_id=payload.get(
                "reviewer_id",
                "human_reviewer",
            ),
        )

    except KeyError:
        raise HTTPException(
            status_code=400,
            detail="Missing required field: action",
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )