import csv
from io import StringIO
from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.database.csv_loader import load_transactions_from_csv
from app.database.db import DB_PATH
from app.engine.detector import detect_duplicate_payment_pairs


router = APIRouter()


@router.post("/import-csv")
async def import_csv(file: UploadFile = File(...)):
    """
    Receive a CSV from the frontend.

    Flow:

        uploaded CSV
            ↓
        temporary file
            ↓
        existing CSV loader
            ↓
        SQLite
            ↓
        existing duplicate detector
            ↓
        detected anomalies
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected.",
        )

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported.",
        )

    try:
        contents = await file.read()

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="The CSV file is empty.",
            )

        # ---------------------------------------------------------
        # Read transaction IDs from THIS uploaded CSV.
        # We use these IDs for the anomaly scan so the scan
        # does not accidentally scan the entire historical DB.
        # ---------------------------------------------------------

        try:
            decoded = contents.decode("utf-8-sig")
            reader = csv.DictReader(
                StringIO(decoded)
            )

            if reader.fieldnames is None:
                raise ValueError(
                    "CSV is missing a header row."
                )

            transaction_ids = []

            for row in reader:
                transaction_id = (
                    row.get("transaction_id") or ""
                ).strip()

                if transaction_id:
                    transaction_ids.append(
                        transaction_id
                    )

        except UnicodeDecodeError as exc:
            raise HTTPException(
                status_code=400,
                detail="CSV must be UTF-8 encoded.",
            ) from exc

        if not transaction_ids:
            raise HTTPException(
                status_code=400,
                detail="CSV contains no transaction IDs.",
            )

        # ---------------------------------------------------------
        # Existing loader
        # ---------------------------------------------------------

        with NamedTemporaryFile(
            suffix=".csv",
            delete=False,
        ) as temp_file:
            temp_file.write(contents)
            temp_path = Path(
                temp_file.name
            )

        try:
            stats = load_transactions_from_csv(
                csv_path=temp_path,
                db_path=DB_PATH,
            )
        finally:
            temp_path.unlink(
                missing_ok=True
            )

        # ---------------------------------------------------------
        # Existing detector — batch mode
        # ---------------------------------------------------------

        anomalies = detect_duplicate_payment_pairs(
            transaction_ids
        )

        return {
            "success": True,
            "filename": file.filename,
            "rows_read": stats["rows_read"],
            "inserted": stats["inserted"],
            "skipped": stats["skipped"],
            "message": "CSV imported and scanned successfully.",
            "anomalies": anomalies,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"CSV import failed: {str(error)}",
        )