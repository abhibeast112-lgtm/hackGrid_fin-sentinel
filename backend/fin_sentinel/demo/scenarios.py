"""Curated real-world financial anomaly scenarios designed to answer judge objections."""

from typing import List
from fin_sentinel.models.anomaly import Anomaly


def get_scenario_a_duplicate_payment() -> Anomaly:
    """Case #1: ₹84,500 Duplicate Payment (High Risk, Survives Challenge -> Escalate).

    17-minute interval between two identical vendor disbursements.
    Adversarial Challenge checks for reversals and credit notes -> None found.
    Result: SUPPORTED. Human Checkpoints 1, 2, 3 triggered.
    """
    return Anomaly(
        anomaly_id="ANO-1042",
        anomaly_type="DUPLICATE_PAYMENT",
        title="Potential Duplicate Payment of ₹84,500 within 17-minute interval",
        description="Two disbursements of exactly ₹84,500 were issued to vendor Acme Cloud Services Ltd. against identical invoice INV-1042.",
        amount=84500.0,
        currency="INR",
        risk_score=94.0,
        risk_tier="HIGH",
        vendor_id="VEND-882",
        vendor_name="Acme Cloud Services Ltd.",
        flagged_record_ids=["TXN-8392", "TXN-8417"],
        associated_records=[
            {
                "record_id": "INV-1042",
                "type": "INVOICE",
                "vendor_id": "VEND-882",
                "amount": 84500.0,
                "description": "Quarterly cloud infrastructure hosting voucher",
                "date": "2026-09-15",
            },
            {
                "record_id": "TXN-8392",
                "type": "TRANSACTION",
                "vendor_id": "VEND-882",
                "amount": 84500.0,
                "invoice_ref": "INV-1042",
                "description": "NEFT disbursement batch 4401 - Hostinger/AWS Cloud",
                "timestamp": "2026-09-16T10:14:00Z",
                "status": "SETTLED",
            },
            {
                "record_id": "TXN-8417",
                "type": "TRANSACTION",
                "vendor_id": "VEND-882",
                "amount": 84500.0,
                "invoice_ref": "INV-1042",
                "description": "NEFT disbursement batch 4402 - Hostinger/AWS Cloud duplicate",
                "timestamp": "2026-09-16T10:31:00Z",
                "status": "SETTLED",
            },
            {
                "record_id": "VEND-882",
                "type": "VENDOR_MASTER",
                "name": "Acme Cloud Services Ltd.",
                "gstin": "29AABCA1234F1Z5",
                "bank_account": "XXXXXX4912",
                "status": "VERIFIED_ACTIVE",
            },
        ],
        metadata={
            "interval_minutes": 17,
            "bank_channel": "NEFT",
            "approver": "SYSTEM_ERP_AUTO",
        },
    )


def get_scenario_b_false_positive_reversal() -> Anomaly:
    """Case #2: ₹50,000 Suspected Duplicate Disproven by Challenge Agent (False Positive).

    Deterministic engine flagged two ₹50,000 disbursements.
    Adversarial Challenge Agent searches ledger and identifies CREDIT-102 (credit note reversing charge).
    Result: CONTRADICTED. Recommendation: CLOSE_FALSE_POSITIVE.
    Proves to judges that Fin-Sentinel actively prevents false-positive escalations.
    """
    return Anomaly(
        anomaly_id="ANO-2055",
        anomaly_type="DUPLICATE_PAYMENT",
        title="Flagged duplicate ₹50,000 payment to TechMatrix Solutions",
        description="Engine detected two ₹50,000 disbursements on the same day for TechMatrix Solutions.",
        amount=50000.0,
        currency="INR",
        risk_score=88.0,
        risk_tier="HIGH",
        vendor_id="VEND-401",
        vendor_name="TechMatrix Solutions Pvt Ltd",
        flagged_record_ids=["TXN-5001", "TXN-5002"],
        associated_records=[
            {
                "record_id": "INV-500",
                "type": "INVOICE",
                "amount": 50000.0,
                "vendor_id": "VEND-401",
                "description": "ERP Custom Module Development milestone 1",
            },
            {
                "record_id": "TXN-5001",
                "type": "TRANSACTION",
                "amount": 50000.0,
                "description": "RTGS payment to TechMatrix Solutions",
                "timestamp": "2026-09-16T09:00:00Z",
                "status": "SETTLED",
            },
            {
                "record_id": "TXN-5002",
                "type": "TRANSACTION",
                "amount": 50000.0,
                "description": "RTGS duplicate trigger",
                "timestamp": "2026-09-16T09:12:00Z",
                "status": "SETTLED",
            },
            {
                "record_id": "CREDIT-102",
                "type": "CREDIT_NOTE",
                "amount": 50000.0,
                "description": "Reversal of duplicate RTGS TXN-5002 due to payment queue glitch",
                "timestamp": "2026-09-16T11:30:00Z",
                "status": "APPLIED",
            },
            {
                "record_id": "REV-5001",
                "type": "REVERSAL",
                "amount": -50000.0,
                "description": "Credit memo offsetting TXN-5002 in banking reconciliation",
                "status": "REVERSED",
            },
        ],
        metadata={
            "interval_minutes": 12,
            "reversal_detected": True,
        },
    )


def get_scenario_c_autonomous_expense_variance() -> Anomaly:
    """Case #3: ₹6,200 Executive Meal Expense Variance (Low/Medium Risk, Fully Autonomous).

    Runs completely autonomously from start to finish without pausing for human checkpoints.
    Demonstrates proportional control: low-exposure routine anomalies don't spam human approvers.
    """
    return Anomaly(
        anomaly_id="ANO-3019",
        anomaly_type="UNUSUAL_EXPENSE_VARIANCE",
        title="Executive meal expense of ₹6,200 exceeds ₹2,500 daily allowance",
        description="Expense submitted under travel meals exceeds standard policy threshold of ₹2,500 by 148%.",
        amount=6200.0,
        currency="INR",
        risk_score=38.0,
        risk_tier="LOW",
        vendor_id="VEND-110",
        vendor_name="Taj Bangalore Airport Dining",
        flagged_record_ids=["TXN-9910"],
        associated_records=[
            {
                "record_id": "INV-9910",
                "type": "INVOICE",
                "amount": 6200.0,
                "description": "Client dinner receipt Taj Bangalore",
                "date": "2026-09-15",
            },
            {
                "record_id": "TXN-9910",
                "type": "TRANSACTION",
                "amount": 6200.0,
                "description": "Corporate Amex card charge - Taj Dining",
                "category": "Travel Meals",
            },
        ],
        metadata={
            "historical_avg": 2400.0,
            "policy_limit": 2500.0,
        },
    )


def get_scenario_d_split_po() -> Anomaly:
    """Case #4: Split Purchase Orders ₹49,500 & ₹49,200 (Evasion of ₹50,000 threshold)."""
    return Anomaly(
        anomaly_id="ANO-4088",
        anomaly_type="SPLIT_PURCHASE_ORDER",
        title="Split Purchase Orders structured below ₹50,000 approval limit",
        description="Two purchase orders (₹49,500 and ₹49,200) issued to same vendor within 3 hours.",
        amount=98700.0,
        currency="INR",
        risk_score=82.0,
        risk_tier="HIGH",
        vendor_id="VEND-605",
        vendor_name="Delta Engineering Hardware",
        flagged_record_ids=["PO-401", "PO-402"],
        associated_records=[
            {
                "record_id": "PO-401",
                "type": "PURCHASE_ORDER",
                "amount": 49500.0,
                "vendor_id": "VEND-605",
                "description": "Pneumatic fittings Part A",
            },
            {
                "record_id": "PO-402",
                "type": "PURCHASE_ORDER",
                "amount": 49200.0,
                "vendor_id": "VEND-605",
                "description": "Pneumatic fittings Part B",
            },
        ],
        metadata={
            "approval_threshold": 50000.0,
        },
    )


def get_all_scenarios() -> List[Anomaly]:
    return [
        get_scenario_a_duplicate_payment(),
        get_scenario_b_false_positive_reversal(),
        get_scenario_c_autonomous_expense_variance(),
        get_scenario_d_split_po(),
    ]
