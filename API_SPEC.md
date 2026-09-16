# Fin-Sentinel API Specification

## 1. Overview

Fin-Sentinel is a human-in-the-loop financial investigation engine.

The API layer will:

1. Receive an anomaly from the detection engine.
2. Start an investigation.
3. Return a human checkpoint when approval is required.
4. Receive a human decision.
5. Resume the investigation.
6. Return another checkpoint or the final investigation result.

The frontend will communicate with the API using HTTP/JSON.

---

# 2. Start Investigation

## Endpoint

POST `/investigations`

## Request Body

```json
{
  "anomaly_id": "ANO-1042",
  "anomaly_type": "DUPLICATE_PAYMENT",
  "title": "Potential Duplicate Payment",
  "description": "Two identical payments were detected.",
  "amount": 84500.0,
  "currency": "INR",
  "risk_score": 94.0,
  "risk_tier": "HIGH",
  "vendor_id": "VEND-882",
  "vendor_name": "Acme Cloud Services Ltd.",
  "flagged_record_ids": [
    "TXN-8392",
    "TXN-8417"
  ],
  "associated_records": []
}