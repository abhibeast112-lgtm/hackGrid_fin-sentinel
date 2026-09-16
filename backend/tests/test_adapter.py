from fin_sentinel import anomaly_from_dict
from fin_sentinel.models.anomaly import Anomaly


def test_anomaly_adapter():
    data = {
        "anomaly_id": "ANO-ADAPTER-001",
        "anomaly_type": "DUPLICATE_PAYMENT",
        "title": "Possible duplicate payment",
        "description": "Potential duplicate transaction detected.",
        "amount": 275000.0,
        "currency": "INR",
        "risk_score": 92.0,
        "risk_tier": "HIGH",
        "vendor_id": "V-1001",
        "vendor_name": "ABC Supplies",
        "flagged_record_ids": [
            "INV-1042",
            "TXN-88421",
        ],
        "associated_records": [
            {
                "record_id": "INV-1042",
                "record_type": "INVOICE",
                "amount": 275000.0,
            }
        ],
    }

    anomaly = anomaly_from_dict(data)

    assert isinstance(anomaly, Anomaly)
    assert anomaly.anomaly_id == "ANO-ADAPTER-001"
    assert anomaly.amount == 275000.0
    assert anomaly.risk_score == 92.0
    assert anomaly.vendor_id == "V-1001"


def test_adapter_rejects_invalid_anomaly():
    data = {
        "anomaly_id": "BAD-001",
        "anomaly_type": "INVALID",
    }

    try:
        anomaly_from_dict(data)
        assert False, "Invalid anomaly should have been rejected"
    except ValueError:
        assert True
