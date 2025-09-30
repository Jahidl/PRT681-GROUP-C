// web/src/api/client.js

const BASE =
  (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")) ||
  "http://localhost:8080";

function buildQuery(params) {
  if (!params) return "";
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  );
  const qs = new URLSearchParams(cleaned).toString();
  return qs ? `?${qs}` : "";
}

async function parseOrText(res) {
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    // not JSON, return raw text
    return text || null;
  }
}

async function apiRequest(method, path, { params, body, headers } = {}) {
  const token = localStorage.getItem("token"); // ok if null
  const res = await fetch(`${BASE}${path}${buildQuery(params)}`, {
    method,
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await parseOrText(res);
  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `${method} ${path} failed with ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export async function apiGet(path, params) {
  return apiRequest("GET", path, { params });
}

export async function apiPost(path, body) {
  return apiRequest("POST", path, { body });
}

// (optional helpers for later)
// export async function apiPut(path, body) {
//   return apiRequest("PUT", path, { body });
// }
// export async function apiDelete(path, params) {
//   return apiRequest("DELETE", path, { params });
// }

export { BASE };
