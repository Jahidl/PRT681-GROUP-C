# Test Cases – Order Management

## Requirement: Confirm & submit orders

### TC-ORD-001 – Submit valid order
- **Preconditions:** Cart contains items; required fields filled
- **Steps:**
  1. Open checkout
  2. Confirm details
  3. Click **Submit Order**
- **Expected Result:** Order created; confirmation screen shown

### TC-ORD-002 – Empty cart blocked
- **Preconditions:** Empty cart
- **Steps:**
  1. Try to proceed to checkout
- **Expected Result:** Error shown; no order created

### TC-ORD-003 – Missing required field
- **Preconditions:** Cart with items; address missing
- **Steps:**
  1. Attempt checkout
- **Expected Result:** Validation error; order not created

---

## Requirement: Generate order record & display details

### TC-ORD-004 – Order persistence & summary
- **Preconditions:** Successful checkout
- **Steps:**
  1. Check database
- **Expected Result:** Order stored with items, prices, timestamp

### TC-ORD-005 – Unique order number
- **Preconditions:** Multiple orders exist
- **Steps:**
  1. Compare order IDs
- **Expected Result:** Each order has unique identifier

### TC-ORD-006 – Confirmation page accuracy
- **Preconditions:** Known cart totals
- **Steps:**
  1. Place order
  2. Check confirmation page
- **Expected Result:** Items, totals, and taxes correct

---

## Requirement: View previous orders

### TC-ORD-007 – Order history list
- **Preconditions:** User has past orders
- **Steps:**
  1. Open **My Orders**
- **Expected Result:** Orders listed newest first

### TC-ORD-008 – Order detail access control
- **Preconditions:** Users A and B with orders
- **Steps:**
  1. User A tries to view User B’s order
- **Expected Result:** Access denied (403/404)

### TC-ORD-009 – No orders empty state
- **Preconditions:** New user
- **Steps:**
  1. Open **My Orders**
- **Expected Result:** Friendly message “No orders yet”
