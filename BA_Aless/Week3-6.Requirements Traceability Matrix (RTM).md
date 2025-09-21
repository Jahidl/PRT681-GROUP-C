User Story ID
Requirement
Acceptance Criteria
Test Case ID
API/UI Link
US-01
User Registration
Valid email, password ≥6, unique email
TC-01: Valid input → success; TC-02: Invalid email → fail
API: POST /register, UI: Register Form
US-05
Add to Cart
Product exists, qty ≤ stock, update total
TC-05: Add valid product; TC-06: Exceed stock → error
API: POST /cart, UI: Product Detail
US-08
Place Order
Must be logged in, cart not empty, save record
TC-10: Checkout logged-in; TC-11: Empty cart → error
API: POST /order, UI: Checkout Page
