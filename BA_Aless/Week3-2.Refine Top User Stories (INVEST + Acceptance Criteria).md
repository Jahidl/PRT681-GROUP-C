# 2. Refine Top User Stories (INVEST + Acceptance Criteria)

## Story 1: User Registration

As a new user, I want to register so I can create an account and save my orders.
  - Independent: Works on its own.
  - Negotiable: Fields can be extended later.
  - Valuable: Essential entry point.
  - Estimable: Small, clear.
  - Small: Single form, backend call.
  - Testable: Email uniqueness, password length.

### Acceptance Criteria:
  - User enters valid email + password.
  - Email must be unique and in proper format.
  - Password ≥ 6 characters.
  - New account is created, confirmation shown.

## Story 2: Add Product to Cart

As a user, I want to add products to my cart so I can purchase them later.
  - Independent: Requires only product list exists.
  - Valuable: Core shopping functionality.
  - Small: One button click → DB/cart update.

### Acceptance Criteria:
  - Clicking “Add to Cart” adds product with quantity.
  - System validates product exists & stock available.
  - Cart total updates immediately.
  - User can see updated cart.

## Story 3: Checkout & Place Order

As a user, I want to confirm my cart and place an order so I can complete my purchase.
  - Independent: Requires cart exists.
  - Valuable: Completes shopping flow.

### Acceptance Criteria:
  - Only logged-in users can checkout.
  - Cart must not be empty.
  - Order record is saved with order ID.
  - Confirmation screen shows summary.
