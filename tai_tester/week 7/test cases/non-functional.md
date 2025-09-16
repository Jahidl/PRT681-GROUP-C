# Test Cases – Non-Functional Requirements

## Requirement: Usability – pages load ≤ 3s

### TC-NFR-001 – Home & category pages
- **Method:** Lighthouse / WebPageTest
- **Steps:**
  1. Run 10 tests on home + category pages
- **Expected Result:** Median load time ≤ 3s

### TC-NFR-002 – Product detail pages
- **Steps:**
  1. Run 10 tests on product detail pages
- **Expected Result:** Median load time ≤ 3s

### TC-NFR-003 – Cart & checkout pages
- **Steps:**
  1. Run 10 tests on cart/checkout
- **Expected Result:** Median load time ≤ 3s

---

## Requirement: Security – password hashing & sessions

### TC-NFR-004 – Password storage
- **Steps:**
  1. Register new user
  2. Inspect DB
- **Expected Result:** Password stored as salted hash, not plaintext

### TC-NFR-005 – Auth required for protected endpoints
- **Steps:**
  1. Call `/orders` without token
- **Expected Result:** 401 Unauthorized

### TC-NFR-006 – Token invalid after logout/expiry
- **Steps:**
  1. Logout user
  2. Reuse old token
- **Expected Result:** 401 Unauthorized

---

## Requirement: Scalability – ≥ 5,000 concurrent users

### TC-NFR-007 – Load test baseline
- **Method:** k6 or JMeter
- **Steps:**
  1. Run 5k virtual users steady for 10 min
- **Expected Result:** Error rate < 2%; p95 latency within SLO

### TC-NFR-008 – Auto-scaling triggers
- **Steps:**
  1. Ramp load up
- **Expected Result:** New instances spawn; no downtime

### TC-NFR-009 – Database performance
- **Steps:**
  1. Monitor DB under load
- **Expected Result:** Query times remain acceptable

---

## Requirement: Reliability – persistence across session timeout

### TC-NFR-010 – Cart survives session timeout
- **Steps:**
  1. Add items to cart
  2. Let session expire
  3. Log in again
- **Expected Result:** Cart still contains items

### TC-NFR-011 – Order survives restart
- **Steps:**
  1. Place order
  2. Restart app
- **Expected Result:** Order retrievable after restart

### TC-NFR-012 – Idempotent checkout
- **Steps:**
  1. Retry checkout callback
- **Expected Result:** Only one order created
