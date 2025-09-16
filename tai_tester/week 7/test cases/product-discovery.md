# Test Cases – Product Discovery

## Requirement: Display product list with categories

### TC-PD-001 – Category filter shows matching items
- **Preconditions:** Products exist in multiple categories
- **Steps:**
  1. Open catalog
  2. Select category “Metals”
- **Expected Result:** Only “Metals” products displayed

### TC-PD-002 – Empty category
- **Preconditions:** Category exists with 0 products
- **Steps:**
  1. Select empty category
- **Expected Result:** Empty state message shown

### TC-PD-003 – Pagination or infinite scroll works
- **Preconditions:** Category has > 20 products
- **Steps:**
  1. Open category
  2. Scroll or go to next page
- **Expected Result:** More products load in order without duplicates

---

## Requirement: View product details

### TC-PD-004 – Full details render
- **Preconditions:** Product with name, price, stock, image
- **Steps:**
  1. Open product detail page
- **Expected Result:** Name, price, stock status, and image display

### TC-PD-005 – Out-of-stock product
- **Preconditions:** Product stock = 0
- **Steps:**
  1. Open product detail page
- **Expected Result:** Shows “Out of stock”; add-to-cart disabled

### TC-PD-006 – Missing image placeholder
- **Preconditions:** Product has no image
- **Steps:**
  1. Open product detail page
- **Expected Result:** Placeholder image displays
