// src/api.js
// API base resolution:
// - Build-time override: set REACT_APP_API_BASE
// - Local dev (browser on localhost): use http://localhost:3000
// - Production (deployed app): use same-origin (relative path '')
const API_BASE = (function () {
  if (process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:3000";
  }
  return ""; // relative -> requests go to current origin (e.g. https://p-q-2025-pg.vercel.app/api/...)
})();

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
