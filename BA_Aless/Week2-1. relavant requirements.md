# 1. Relevant Requirements (with Grooming)

## Functional Requirements
- User Account
  - System must allow user registration with unique email and password.
  - System must allow login/logout with session token.
  - User profile can be updated.
- Product Discovery
  - System must display product list with category filters.
  - System must show product details (name, price, stock, image).
- Shopping Cart
  - System must allow adding products with quantity.
  - System must allow removing items.
  - System must allow updating quantity.
- Order Management
  - System must allow order submission.
  - System must generate order record and confirmation.
  - System must allow users to view completed orders.
- Admin / Backend
  - System must allow admin to add/remove products.
  - System must allow admin to update stock and order status.

## Non-Functional Requirements
- System should load pages in ≤ 3 seconds.
- Passwords must be hashed securely.
- System must persist cart and orders across sessions.

# 2.Grooming Example

## User Story 1
As a new user, I want to register an account so that I can save my orders.
- Priority: High (must-have for MVP).
- Dependencies: None (entry point).
- Acceptance Criteria:
  - User enters valid email + password.
  - Email must be unique and in correct format.
  - Password must be at least 6 characters.
  - System creates a new account and redirects to login/landing page.
- Estimation: 3 story points.
- Notes: Consider adding “forgot password” later (not MVP).

## User Story 2
As a user, I want to add products to my cart so that I can purchase them later.
- Priority: High (critical for shopping flow).
- Dependencies: Product Discovery (must see products first).
- Acceptance Criteria:
  - User clicks “Add to Cart” on product detail.
  - Product exists in catalog.
  - Quantity must be ≥1 and ≤ stock.
  - Cart updates in real time and shows correct subtotal.
- Estimation: 5 story points (front-end + back-end + DB update).
- Notes: Empty cart state must be handled gracefully.

## User Story 3
As an admin, I want to add new products so that users can see them in the catalog.
- Priority: Medium (important for demo but not core user shopping flow).
- Dependencies: Database connection and product catalog must exist.
- Acceptance Criteria:
  - Admin can enter product name, description, price, and stock.
  - Product is saved to database.
  - New product appears in product list for all users.
- Estimation: 3 story points.
- Notes: Validation needed (price ≥ 0, stock ≥ 0).
