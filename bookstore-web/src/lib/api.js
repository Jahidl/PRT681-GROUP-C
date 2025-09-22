const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

async function http(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.headers.get("content-type")?.includes("application/json") ? res.json() : res.text();
}

// PRODUCTS
export async function listProducts(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.categoryId) qs.set("categoryId", params.categoryId);
  if (params.sort) qs.set("sort", params.sort);
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return http(`/api/products${query}`);
}

export async function getProduct(id) {
  return http(`/api/products/${id}`);
}

// ADMIN (example—attach auth if you secure them)
export async function createProduct(data, token) {
  return http(`/api/products`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(data),
  });
}
export async function updateProduct(id, data, token) {
  return http(`/api/products/${id}`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(data),
  });
}
export async function deleteProduct(id, token) {
  return http(`/api/products/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
