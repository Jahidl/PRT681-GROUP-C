# Test Cases – Admin / Backend

## Requirement: Add new products

### TC-ADM-001 – Create product happy path
- **Preconditions:** Admin logged in
- **Steps:**
  1. Fill product form with name, price, stock
  2. Save
- **Expected Result:** Product appears in catalog

### TC-ADM-002 – Missing required field
- **Preconditions:** —
- **Steps:**
  1. Leave Name empty
  2. Save
- **Expected Result:** Validation error shown

### TC-ADM-003 – Duplicate SKU prevented
- **Preconditions:** Product with SKU exists
- **Steps:**
  1. Enter same SKU
  2. Save
- **Expected Result:** Error “SKU already exists”

---

## Requirement: Remove products

### TC-ADM-004 – Soft-delete hides product
- **Preconditions:** Product exists
- **Steps:**
  1. Admin removes product
- **Expected Result:** Product hidden from store; past orders intact

### TC-ADM-005 – Remove non-existent ID
- **Preconditions:** —
- **Steps:**
  1. API delete with invalid ID
- **Expected Result:** 404 error; no change

### TC-ADM-006 – Remove product with past orders
- **Preconditions:** Product appears in past orders
- **Steps:**
  1. Remove product
- **Expected Result:** Product hidden; past orders unaffected

---

## Requirement: Edit product details & stock

### TC-ADM-007 – Update price & stock
- **Preconditions:** Product exists
- **Steps:**
  1. Change price and stock
- **Expected Result:** Catalog and PDP updated

### TC-ADM-008 – Negative stock rejected
- **Preconditions:** —
- **Steps:**
  1. Set stock = -1
- **Expected Result:** Validation error shown

### TC-ADM-009 – Concurrent edit
- **Preconditions:** Two admins editing same product
- **Steps:**
  1. Both save changes
- **Expected Result:** Conflict handled gracefully

---

## Requirement: Update order status

### TC-ADM-010 – Valid transition
- **Preconditions:** Order status = Pending
- **Steps:**
  1. Set status → Shipped
- **Expected Result:** Status updates; timestamp recorded

### TC-ADM-011 – Invalid transition blocked
- **Preconditions:** Order = Cancelled
- **Steps:**
  1. Set status → Shipped
- **Expected Result:** Error message shown

### TC-ADM-012 – Notification fires
- **Preconditions:** Notifications enabled
- **Steps:**
  1. Update status to Delivered
- **Expected Result:** Email/webhook sent
