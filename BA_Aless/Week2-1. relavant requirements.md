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
We refine one user story:

User Story: As a user, I want to add a product to my cart so that I can purchase it later.

Priority: High (critical for MVP).
Acceptance Criteria:
Product must exist in catalog.
Quantity must be ≥1 and ≤ stock.
Cart total must update correctly.
Dependencies: Product Discovery (user must be able to see product first).
Effort: 3 story points (small feature, but involves backend + UI).
