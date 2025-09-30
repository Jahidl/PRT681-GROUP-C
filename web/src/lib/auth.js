const API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function readBody(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

export async function registerUser(payload) {
  // expected payload based on your UI + common .NET patterns:
  // { firstName, lastName, phoneNumber?, emailAddress, password, confirmPassword }
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include", // safe if API sets auth cookies; harmless otherwise
  });
  if (!res.ok) {
    const body = await readBody(res);
    throw new Error(typeof body === "string" ? body : (body?.title || "Registration failed"));
  }
  return res.json(); // whatever your API returns (often a message)
}

export async function loginUser(emailAddress, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailAddress, password }),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await readBody(res);
    throw new Error(typeof body === "string" ? body : (body?.title || "Invalid email or password"));
  }
  // expect: { token, firstName?, lastName?, email?, role? }
  return res.json();
}

export function logoutClientOnly() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-changed"));
}
