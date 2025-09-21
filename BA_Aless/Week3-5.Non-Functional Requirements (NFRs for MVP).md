# 5. Non-Functional Requirements (NFRs for MVP)
## Performance:
  - Pages load within 3 seconds under normal load (≤5000 concurrent users).
  - Cart update must be reflected within 1 second.
## Security:
  - Passwords stored with hashing (bcrypt/argon2).
  - Session tokens required for logged-in operations.
  - Admin functions restricted to admin accounts only.
## Usability:
  - Interface must be responsive (desktop & mobile).
  - Error messages must be clear (e.g., “Email already exists”).
