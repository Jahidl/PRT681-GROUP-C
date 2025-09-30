import requests
import pyodbc
import time

# --- CONFIG ---
API_BASE = "http://localhost:8080"         # Base URL for the API
DB_CONN = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost,1433;DATABASE=ECommerce;UID=sa;PWD=YourPassword123"

# --- DB Helpers ---
def db_query(sql, params=None):
    with pyodbc.connect(DB_CONN) as conn:
        cur = conn.cursor()
        cur.execute(sql, params or [])
        rows = cur.fetchall()
        return rows

def db_execute(sql, params=None):
    with pyodbc.connect(DB_CONN) as conn:
        cur = conn.cursor()
        cur.execute(sql, params or [])
        conn.commit()

# --- TEST FLOW ---
def test_create_product():
    # 1. Create via API
    payload = {
        "name": "Test Widget",
        "price": 19.99,
        "quantity": 5
    }
    resp = requests.post(f"{API_BASE}/api/products", json=payload)
    assert resp.status_code in (200, 201), f"Create failed: {resp.text}"
    new_id = resp.json().get("id")

    # 2. Give DB a moment to persist
    time.sleep(1)

    # 3. Verify in DB
    rows = db_query("SELECT Name, Price, Quantity FROM Products WHERE Id = ?", [new_id])
    assert rows, "Product not found in DB"
    row = rows[0]
    assert row[0] == "Test Widget"
    assert float(row[1]) == 19.99
    assert row[2] == 5
    print("✅ DB record verified")

    # 4. Clean up
    db_execute("DELETE FROM Products WHERE Id = ?", [new_id])
    print("🧹 Cleaned up test product")

if __name__ == "__main__":
    test_create_product()
