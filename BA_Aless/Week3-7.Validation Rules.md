# 7.Validation Rules (Updated with Test Cases)
## Field-Level
   - Email: required, valid format, unique (case-insensitive).
   - Password: min 6 chars, salted hash (bcrypt/argon2).
   - Product: name (2–120 chars), price ≥ 0, stock ≥ 0, optional image URL.
   - SKU: included and unique (to confirm).
   - Cart qty: integer, 1…stock; qty=0 → remove item (confirm with Dev).
   - Order: server calculates totals; unique orderId.

## Process-Level 
   - Registration: invalid email → 400; duplicate (case-insensitive) → 409; concurrent same email → one succeeds.
   - Login/Logout: wrong creds → 401; logout invalidates token; token expiry duration to confirm.
   - Add to Cart: product must exist; qty ≤ stock; out-of-stock cannot be added; product not found → 404.
   - Update Cart: qty=0 removes item (confirm); non-existent line remove → 204 or 404 (confirm).
   - Checkout/Order: must be logged in (guest policy confirm); empty cart → 400; stock race → 409; idempotency for checkout (confirm key/header).
   - Admin – Add/Edit: validate required fields; reject negative stock; handle concurrent edits gracefully; define editable fields.
   - Admin – Delete: soft delete preferred; hidden from catalog; past orders intact; behavior for items already in cart (auto-remove vs block, confirm).
   - Order Status: include Pending → Shipped → Delivered in MVP? (confirm); invalid transitions blocked; notifications (email/webhook) (confirm).

## Authorization   
   - /api/admin/* → admin only.
   - /api/cart, /api/orders → authenticated (guest cart policy confirm, and merge behavior after login).
   - /api/products → public.
   - Enforce access control so users cannot access others’ carts/orders.

## Error Handling
   - Standard codes: 400 invalid input, 401 unauthorized, 403 forbidden, 404 not found, 409 conflict, 201 created, 204 no content.
   - Error payload format: plain string vs JSON {code, message, details[]} (confirm).
   - Consider rate limiting for auth/register endpoints (confirm).

## Non-Functional
   - Performance: page load ≤ 3s (home/category/product/cart/checkout).
   - Security: salted password hash; protected endpoints require valid token; token invalid after logout/expiry.
   - Scalability: target ≥ 5,000 concurrent users; error rate < 2%; p95 latency within SLO (confirm if MVP or later).
   - Reliability: orders persist across restart; cart persists across session timeout (policy & duration confirm).
   - Consistency: API path naming + HTTP status conventions consistent across endpoints.

## Edge Cases 
   - Concurrent checkout on low stock → one success, others 409.
   - Price change between add-to-cart & checkout → snapshot policy (confirm).
   - Deleted product in cart → auto-remove vs block (confirm).
   - Empty category → 200 [] vs 404 (confirm).
   - Invalid product id → 404 (confirm exact code).
   - Large numbers: cap items per cart, max qty per line (values confirm).
