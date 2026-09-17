from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.database.csv_loader import load_transactions_from_csv
from app.database.db import DB_PATH


router = APIRouter()


@router.post("/import-csv")
async def import_csv(file: UploadFile = File(...)):
    """
    Receive a CSV file from the frontend, temporarily save it,
    import its transactions into the existing SQLite database,
    and delete the temporary file afterward.
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

        # Save the uploaded CSV temporarily.
        with NamedTemporaryFile(
            suffix=".csv",
            delete=False,
        ) as temp_file:
            temp_file.write(contents)
            temp_path = Path(temp_file.name)

        try:
            # Reuse the existing CSV loader.
            stats = load_transactions_from_csv(
                csv_path=temp_path,
                db_path=DB_PATH,
            )

        finally:
            # Remove temporary uploaded file.
            temp_path.unlink(missing_ok=True)

        return {
            "success": True,
            "filename": file.filename,
            "rows_read": stats["rows_read"],
            "inserted": stats["inserted"],
            "skipped": stats["skipped"],
            "message": "CSV imported successfully.",
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"CSV import failed: {str(error)}",
        )