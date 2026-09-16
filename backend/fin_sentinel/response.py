from typing import Any, Dict

from fin_sentinel.models.result import InvestigationResult


def result_to_dict(result: InvestigationResult) -> Dict[str, Any]:
    """
    Convert Fin-Sentinel's internal InvestigationResult into
    a plain JSON-compatible dictionary for the API layer.
    """

    return result.model_dump(mode="json")


def result_to_json(result: InvestigationResult) -> str:
    """
    Convert InvestigationResult into a JSON string.
    """

    return result.model_dump_json()
