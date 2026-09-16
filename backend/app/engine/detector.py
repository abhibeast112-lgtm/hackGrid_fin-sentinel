from typing import Any, Dict, List

from app.database.db import get_transactions


def detect_duplicate_payments(
    transaction_ids: List[str],
) -> Dict[str, Any] | None:
    """
    Detect whether the supplied transactions
    represent a potential duplicate payment.
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
            amount = first["amount"]

            return {
                "anomaly_id": f"ANO-{first['transaction_id']}",
                "anomaly_type": "DUPLICATE_PAYMENT",
                "title": "Potential Duplicate Payment",
                "description": (
                    "Two transactions with the same vendor, "
                    "amount, and invoice number were detected."
                ),
                "amount": amount,
                "currency": first["currency"],
                "risk_score": 94.0,
                "risk_tier": "HIGH",
                "vendor_id": first["vendor_id"],
                "vendor_name": first["vendor_name"],
                "flagged_record_ids": [
                    first["transaction_id"],
                    current["transaction_id"],
                ],
                "associated_records": [
                    first,
                    current,
                ],
            }

    return None


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