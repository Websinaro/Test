const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request(path, { token, devKey, method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (devKey) headers["x-dev-secret"] = devKey;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // Public
  getProducts: (params = "") => request(`/products${params}`),
  getProduct: (slug) => request(`/products/${slug}`),
  getRelatedProducts: (slug) => request(`/products/${slug}/related`),
  getCategories: () => request("/categories"),

  // Reviews & Q&A
  getReviews: (slug) => request(`/products/${slug}/reviews`),
  postReview: (token, slug, body) =>
    request(`/products/${slug}/reviews`, { token, method: "POST", body }),
  getQna: (slug) => request(`/products/${slug}/qna`),
  postQuestion: (token, slug, body) =>
    request(`/products/${slug}/qna`, { token, method: "POST", body }),

  // Dev panel (email/password gated signup + login, shared dev identity)
  devSignup: (body) => request("/dev/signup", { method: "POST", body }),
  devLogin: (body) => request("/dev/login", { method: "POST", body }),
  createProduct: (devKey, body) => request("/products", { devKey, method: "POST", body }),

  // Auth-required
  syncUser: (token, body) => request("/auth/sync", { token, method: "POST", body }),
  getMe: (token) => request("/auth/me", { token }),
  updateMe: (token, body) => request("/users/me", { token, method: "PATCH", body }),
  createOrder: (token, body) => request("/orders", { token, method: "POST", body }),
  getOrders: (token) => request("/orders", { token }),
};
