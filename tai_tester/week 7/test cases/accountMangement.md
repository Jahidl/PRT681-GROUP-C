# Test Cases – Account Management

## Requirement: New user registration

### TC-AM-001 – Happy path registration
- **Preconditions:** Email not in system
- **Steps:**
  1. Open sign-up form
  2. Enter valid email and strong password
  3. Click **Register**
- **Expected Result:** Account is created; success message or auto-login

### TC-AM-002 – Invalid email format rejected
- **Preconditions:** —
- **Steps:**
  1. Open sign-up form
  2. Enter invalid email (e.g., `notanemail`) and valid password
  3. Submit
- **Expected Result:** Validation error; no account created

### TC-AM-003 – Duplicate email blocked
- **Preconditions:** Account already exists for `user@example.com`
- **Steps:**
  1. Open sign-up form
  2. Enter `user@example.com` and password
  3. Submit
- **Expected Result:** Error “Email already registered”; no account created

---

## Requirement: Email format validation & uniqueness

### TC-AM-004 – Complex but valid email accepted
- **Preconditions:** —
- **Steps:**
  1. Register with `first.last+tag@sub.domain.co`
- **Expected Result:** Accepted; account created

### TC-AM-005 – Case-insensitive uniqueness enforced
- **Preconditions:** Account exists for `USER@EXAMPLE.COM`
- **Steps:**
  1. Try registering `user@example.com`
- **Expected Result:** Treated as duplicate; blocked

### TC-AM-006 – Concurrency uniqueness
- **Preconditions:** Two clients try to register same email
- **Steps:**
  1. Both submit at nearly same time
- **Expected Result:** One succeeds; other blocked by uniqueness

---

## Requirement: Secure login & logout

### TC-AM-007 – Successful login creates session token
- **Preconditions:** Valid account exists
- **Steps:**
  1. Enter correct email + password
  2. Submit login
- **Expected Result:** User logged in; secure session token issued

### TC-AM-008 – Wrong password rejected
- **Preconditions:** Valid account exists
- **Steps:**
  1. Enter correct email but wrong password
- **Expected Result:** Login fails; no session created

### TC-AM-009 – Logout invalidates token
- **Preconditions:** Logged-in user
- **Steps:**
  1. Click **Logout**
  2. Attempt to access page with old token
- **Expected Result:** Session invalid; access denied
