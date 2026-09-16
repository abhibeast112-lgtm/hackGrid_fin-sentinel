import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "fin_sentinel.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS transactions (
            transaction_id TEXT PRIMARY KEY,
            vendor_id TEXT,
            vendor_name TEXT,
            amount REAL NOT NULL,
            currency TEXT DEFAULT 'INR',
            transaction_date TEXT,
            invoice_number TEXT,
            description TEXT
        )
        """
    )

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS investigations (
            investigation_id TEXT PRIMARY KEY,
            anomaly_id TEXT NOT NULL,
            status TEXT NOT NULL,
            risk_tier TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    connection.commit()
    connection.close()


def add_transaction(
    transaction_id,
    vendor_id,
    vendor_name,
    amount,
    currency="INR",
    transaction_date=None,
    invoice_number=None,
    description=None,
):
    connection = get_connection()

    connection.execute(
        """
        INSERT OR IGNORE INTO transactions (
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
            transaction_id,
            vendor_id,
            vendor_name,
            amount,
            currency,
            transaction_date,
            invoice_number,
            description,
        ),
    )

    connection.commit()
    connection.close()


def get_transaction(transaction_id):
    connection = get_connection()

    row = connection.execute(
        """
        SELECT *
        FROM transactions
        WHERE transaction_id = ?
        """,
        (transaction_id,),
    ).fetchone()

    connection.close()

    if row is None:
        return None

    return dict(row)


def get_transactions(transaction_ids):
    connection = get_connection()

    placeholders = ",".join("?" for _ in transaction_ids)

    rows = connection.execute(
        f"""
        SELECT *
        FROM transactions
        WHERE transaction_id IN ({placeholders})
        """,
        tuple(transaction_ids),
    ).fetchall()

    connection.close()

    return [dict(row) for row in rows]


if __name__ == "__main__":
    init_db()

    add_transaction(
        transaction_id="TXN-8392",
        vendor_id="VEND-882",
        vendor_name="Acme Cloud Services Ltd.",
        amount=84500.0,
        invoice_number="INV-1001",
        description="Cloud services payment",
    )

    add_transaction(
        transaction_id="TXN-8417",
        vendor_id="VEND-882",
        vendor_name="Acme Cloud Services Ltd.",
        amount=84500.0,
        invoice_number="INV-1001",
        description="Cloud services payment",
    )

    print("Database initialized.")
    print("Test transactions inserted.")

    transaction = get_transaction("TXN-8392")

    print("\nSingle transaction:")
    print(transaction)

    transactions = get_transactions(
        ["TXN-8392", "TXN-8417"]
    )

    print("\nMultiple transactions:")
    for item in transactions:
        print(item)