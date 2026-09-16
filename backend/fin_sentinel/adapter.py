from typing import Any, Dict

from fin_sentinel.models.anomaly import Anomaly


def anomaly_from_dict(data: Dict[str, Any]) -> Anomaly:
    """
    Convert a plain anomaly dictionary from the detection engine
    into Fin-Sentinel's internal Anomaly contract.

    The detection engine must not import or modify Fin-Sentinel internals.
    """

    return Anomaly.model_validate(data)
