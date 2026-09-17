from __future__ import annotations

import csv
import sqlite3
from pathlib import Path
from typing import Dict


BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_CSV = BASE_DIR / "data" / "transactions.csv"
DEFAULT_DB = BASE_DIR / "app" / "database" / "fin_sentinel.db"

REQUIRED_COLUMNS = {
    "transaction_id",
    "vendor_id",
    "vendor_name",
    "amount",
    "currency",
    "transaction_date",
    "invoice_number",
    "description",
}


def detect_delimiter(csv_path: Path) -> str:
    """
    Detect whether the transaction file is comma-separated
    or tab-separated.
    """
    with csv_path.open("r", encoding="utf-8-sig", newline="") as file:
        sample = file.read(4096)

    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",\t;|")
        return dialect.delimiter
    except csv.Error:
        if "\t" in sample:
            return "\t"
        return ","


def load_transactions_from_csv(
    csv_path: Path = DEFAULT_CSV,
    db_path: Path = DEFAULT_DB,
) -> Dict[str, int]:

    if not csv_path.exists():
        raise FileNotFoundError(
            f"CSV file not found: {csv_path}"
        )

    delimiter = detect_delimiter(csv_path)

    with csv_path.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:

        reader = csv.DictReader(
            file,
            delimiter=delimiter
        )

        if reader.fieldnames is None:
            raise ValueError("CSV file has no header row.")

        # Remove accidental whitespace around column names.
        reader.fieldnames = [
            field.strip()
            for field in reader.fieldnames
        ]

        missing = REQUIRED_COLUMNS - set(reader.fieldnames)

        if missing:
            raise ValueError(
                "CSV is missing required columns: "
                + ", ".join(sorted(missing))
            )

        connection = sqlite3.connect(db_path)

        inserted = 0
        skipped = 0
        rows_read = 0

        try:
            for row in reader:

                rows_read += 1

                # Clean whitespace from every value.
                row = {
                    key.strip(): (
                        value.strip()
                        if isinstance(value, str)
                        else value
                    )
                    for key, value in row.items()
                }

                transaction_id = row["transaction_id"]

                # Avoid inserting duplicate transaction IDs.
                existing = connection.execute(
                    """
                    SELECT 1
                    FROM transactions
                    WHERE transaction_id = ?
                    LIMIT 1
                    """,
                    (transaction_id,),
                ).fetchone()

                if existing:
                    skipped += 1
                    continue

                connection.execute(
                    """
                    INSERT INTO transactions (
                        transaction_id,
                        vendor_id,
                        vendor_name,
                        amount,
                        currency,
                        transaction_date,
                        invoice_number,
                        description
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        row["transaction_id"],
                        row["vendor_id"],
                        row["vendor_name"],
                        float(row["amount"]),
                        row["currency"],
                        row["transaction_date"],
                        row["invoice_number"],
                        row["description"],
                    ),
                )

                inserted += 1

            connection.commit()

        finally:
            connection.close()

    return {
        "rows_read": rows_read,
        "inserted": inserted,
        "skipped": skipped,
    }


if __name__ == "__main__":
    stats = load_transactions_from_csv()

    print("CSV import complete.")
    print(f"Rows read: {stats['rows_read']}")
    print(f"Inserted: {stats['inserted']}")
    print(f"Skipped existing transaction IDs: {stats['skipped']}")