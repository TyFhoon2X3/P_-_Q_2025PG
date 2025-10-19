// src/api.js
const API_BASE = "http://localhost:3000";

export async function api(path, { method = "GET", body, headers = {} } = {}) {
  const token = localStorage.getItem("token");

  // ✅ ถ้า body เป็น FormData — ห้ามตั้ง Content-Type เอง
  const isFormData = body instanceof FormData;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || "Request failed";
    throw new Error(msg);
  }

  return data;
}
