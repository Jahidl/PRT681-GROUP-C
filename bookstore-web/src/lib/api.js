const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001").replace(/\/$/, "");

/** Helper that always hits your /api/auth/* endpoints */
async function authFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!res.ok) {
    let text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res;
}

export async function login({ emailAddress, password }) {
  const res = await authFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ emailAddress, password })
  });
  const data = await res.json();
  // Response shape: { accessToken, user: {...} }
  if (!data?.accessToken) throw new Error("No accessToken returned.");
  return data;
}

export async function register({ firstName, lastName, phoneNumber, emailAddress, password, confirmPassword }) {
  const res = await authFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      firstName,
      lastName,
      phoneNumber: phoneNumber || null,
      emailAddress,
      password,
      confirmPassword
    })
  });
  // Created user object (no token) -> return it
  return res.json();
}
