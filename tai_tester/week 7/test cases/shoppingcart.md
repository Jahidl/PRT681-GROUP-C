# Test Cases – Shopping Cart

## Requirement: Add products to the cart

### TC-CART-001 – Add in-stock item
- **Preconditions:** Product has stock ≥ 1
- **Steps:**
  1. Open product detail page
  2. Click **Add to cart**
- **Expected Result:** Item appears in cart with quantity = 1; cart total updates

### TC-CART-002 – Add same item increments
- **Preconditions:** Product already in cart with qty = 1
- **Steps:**
  1. Click **Add to cart** again
- **Expected Result:** Quantity increases to 2; subtotal recalculates

### TC-CART-003 – Add out-of-stock item blocked
- **Preconditions:** Product stock = 0
- **Steps:**
  1. Attempt to add to cart
- **Expected Result:** System shows “Out of stock”; cart unchanged

---

## Requirement: Remove products from the cart

### TC-CART-004 – Remove line item
- **Preconditions:** Cart has at least one item
- **Steps:**
  1. Click **Remove** on the item
- **Expected Result:** Item disappears; cart total updates

### TC-CART-005 – Remove non-existent item (tampered request)
- **Preconditions:** User manually edits request payload
- **Steps:**
  1. Send API call with invalid line ID
- **Expected Result:** System returns error (400/404); cart unchanged

### TC-CART-006 – Clear cart
- **Preconditions:** Cart has multiple items
- **Steps:**
  1. Click **Clear cart**
- **Expected Result:** Cart becomes empty; totals = $0

---

## Requirement: Update product quantities in the cart

### TC-CART-007 – Increase within stock
- **Preconditions:** Product stock = 10, cart qty = 1
- **Steps:**
  1. Change quantity to 5
- **Expected Result:** Quantity updates; totals recalc

### TC-CART-008 – Exceed stock blocked
- **Preconditions:** Product stock = 3, cart qty = 2
- **Steps:**
  1. Change quantity to 5
- **Expected Result:** System shows “Max 3 allowed”; qty remains ≤ 3

### TC-CART-009 – Set to 0 removes item
- **Preconditions:** Cart qty = 1
- **Steps:**
  1. Change quantity to 0
- **Expected Result:** Item removed from cart; totals update
