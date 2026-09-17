from typing import Any, Dict, List

from app.database.db import get_transactions


def _build_duplicate_anomaly(
    first: Dict[str, Any],
    current: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Build the same anomaly structure used by the existing detector.
    Detection criteria remain:
        vendor_id + amount + invoice_number
    """

    return {
        "anomaly_id": f"ANO-{first['transaction_id']}",
        "anomaly_type": "DUPLICATE_PAYMENT",
        "title": "Potential Duplicate Payment",
        "description": (
            "Two transactions with the same vendor, "
            "amount, and invoice number were detected."
        ),
        "amount": first["amount"],
        "currency": first["currency"],
        "risk_score": 94.0,
        "risk_tier": "HIGH",
        "vendor_id": first["vendor_id"],
        "vendor_name": first["vendor_name"],
        "invoice_number": first["invoice_number"],
        "flagged_record_ids": [
            first["transaction_id"],
            current["transaction_id"],
        ],
        "associated_records": [
            first,
            current,
        ],
    }


def detect_duplicate_payments(
    transaction_ids: List[str],
) -> Dict[str, Any] | None:
    """
    Existing single-anomaly detector.

    Preserves the original behavior:
    compare the supplied transactions and return
    the first matching duplicate pair.
    """

    transactions = get_transactions(transaction_ids)

    if len(transactions) < 2:
        return None

    first = transactions[0]

    for current in transactions[1:]:
        same_vendor = (
            current["vendor_id"] == first["vendor_id"]
        )

        same_amount = (
            current["amount"] == first["amount"]
        )

        same_invoice = (
            current["invoice_number"]
            == first["invoice_number"]
        )

        if same_vendor and same_amount and same_invoice:
            return _build_duplicate_anomaly(
                first,
                current,
            )

    return None


def detect_duplicate_payment_pairs(
    transaction_ids: List[str],
) -> List[Dict[str, Any]]:
    """
    Scan all supplied transaction IDs for duplicate-payment pairs.

    This reuses the exact same detection rule as
    detect_duplicate_payments(), but returns ALL
    matching pairs instead of stopping at the first one.

    This is used by CSV ingestion so only transactions
    from the uploaded CSV are scanned.
    """

    transactions = get_transactions(transaction_ids)

    groups: Dict[
        tuple,
        List[Dict[str, Any]]
    ] = {}

    for transaction in transactions:
        key = (
            transaction["vendor_id"],
            transaction["amount"],
            transaction["invoice_number"],
        )

        groups.setdefault(key, []).append(
            transaction
        )

    anomalies: List[Dict[str, Any]] = []

    for grouped_transactions in groups.values():
        if len(grouped_transactions) < 2:
            continue

        # The demo data contains pairs.
        # For a group with more than two records,
        # pair the records sequentially.
        for index in range(
            0,
            len(grouped_transactions) - 1,
            2,
        ):
            first = grouped_transactions[index]
            current = grouped_transactions[index + 1]

            anomalies.append(
                _build_duplicate_anomaly(
                    first,
                    current,
                )
            )

    return anomalies


if __name__ == "__main__":
    anomaly = detect_duplicate_payments(
        [
            "TXN-8392",
            "TXN-8417",
        ]
    )

    if anomaly:
        print("ANOMALY DETECTED")
        print(anomaly)
    else:
        print("No anomaly detected.")