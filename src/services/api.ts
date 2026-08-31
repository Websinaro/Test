import { User, Product, Category, CartItem, Order, Review, Coupon, DatabaseStatus } from '../types/index.ts';


let csrfTokenCache: string | null = null;
let jwtTokenCache: string | null = localStorage.getItem('nexus_jwt_token');

export function setJwtToken(token: string | null) {
  jwtTokenCache = token;
  if (token) {
    localStorage.setItem('nexus_jwt_token', token);
  } else {
    localStorage.removeItem('nexus_jwt_token');
  }
}

export function getJwtToken(): string | null {
  return jwtTokenCache;
}

export async function fetchCsrfToken(): Promise<string> {
  try {
    const res = await fetch('/api/security/csrf-token', { credentials: 'include' });
    const data = await res.json();
    if (data.csrfToken) {
      csrfTokenCache = data.csrfToken;
      return data.csrfToken;
    }
  } catch (err) {
    console.warn('Failed to fetch CSRF token:', err);
  }
  return '';
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!csrfTokenCache && options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
    await fetchCsrfToken();
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (csrfTokenCache) {
    headers['X-CSRF-Token'] = csrfTokenCache;
  }

  if (jwtTokenCache) {
    headers['Authorization'] = `Bearer ${jwtTokenCache}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    // If CSRF token expired or missing, refresh it once
    if (data?.code === 'CSRF_TOKEN_MISSING' || data?.code === 'CSRF_TOKEN_MISMATCH') {
      const newToken = await fetchCsrfToken();
      if (newToken && options.method && options.method !== 'GET') {
        headers['X-CSRF-Token'] = newToken;
        const retryRes = await fetch(endpoint, {
          ...options,
          headers,
          credentials: 'include',
        });
        if (retryRes.ok) {
          return await retryRes.json();
        }
      }
    }
    throw new Error(data?.error || `HTTP error ${response.status}: ${response.statusText}`);
  }

  return data as T;
}

export const api = {
  // CSRF & Security
  initSecurity: fetchCsrfToken,

  // Database status (admin only)
  getDbStatus: () => request<{ status: DatabaseStatus }>('/api/db/status'),
  reconnectDb: () => request<{ message: string; status: DatabaseStatus }>('/api/db/reconnect', { method: 'POST' }),

  // Auth
  checkEmailExists: (email: string) =>
    request<{ exists: boolean }>(`/api/auth/check-email?email=${encodeURIComponent(email)}`),
  register: (payload: { name: string; email: string; password: string; phone?: string }) =>
    request<{ message: string; user: User; token: string; csrfToken: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { email?: string; identifier?: string; password: string }) =>
    request<{ message: string; user: User; token: string; csrfToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  firebaseGoogleLogin: (payload: { uid: string; email: string; displayName?: string; photoURL?: string; phoneNumber?: string | null }) =>
    request<{ message: string; user: User; token: string; csrfToken: string }>('/api/auth/firebase-google', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMe: () => request<{ user: User }>('/api/auth/me'),
  updateProfile: (payload: { name?: string; phone?: string; avatar_url?: string }) =>
    request<{ message: string; user: User; token: string }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  logout: () => request<{ message: string }>('/api/auth/logout', { method: 'POST' }),

  // Products
  getCategories: () => request<{ categories: Category[] }>('/api/products/categories'),
  getFeaturedProducts: () => request<{ products: Product[] }>('/api/products/featured'),
  getProducts: (params?: { category?: string; search?: string; minPrice?: number; maxPrice?: number; sortBy?: string; featured?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.minPrice !== undefined) query.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) query.set('maxPrice', params.maxPrice.toString());
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.featured) query.set('featured', 'true');
    const queryString = query.toString();
    return request<{ total: number; products: Product[] }>(`/api/products${queryString ? `?${queryString}` : ''}`);
  },
  getProductDetails: (idOrSlug: string | number) =>
    request<{ product: Product; reviews: Review[]; related: Product[] }>(`/api/products/${idOrSlug}`),
  createProduct: (payload: any) =>
    request<{ message: string; product: Product }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProduct: (id: number, payload: any) =>
    request<{ message: string; product: Product }>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteProduct: (id: number) =>
    request<{ message: string }>(`/api/products/${id}`, {
      method: 'DELETE',
    }),

  // Cart
  getCart: () => request<{ cart: CartItem[] }>('/api/cart'),
  addToCart: (productId: number, quantity = 1) =>
    request<{ message: string; cart: CartItem[] }>('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  updateCartQuantity: (productId: number, quantity: number) =>
    request<{ message: string; cart: CartItem[] }>('/api/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    }),
  removeFromCart: (productId: number) =>
    request<{ message: string; cart: CartItem[] }>(`/api/cart/remove/${productId}`, {
      method: 'DELETE',
    }),
  clearCart: () => request<{ message: string; cart: CartItem[] }>('/api/cart/clear', { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => request<{ wishlist: Product[] }>('/api/wishlist'),
  toggleWishlist: (productId: number) =>
    request<{ isWishlisted: boolean; wishlist: Product[] }>('/api/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),

  // Reviews
  addReview: (payload: { productId: number; rating: number; title?: string; comment: string }) =>
    request<{ message: string; review: Review }>('/api/reviews/add', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getProductReviews: (productId: number) => request<{ reviews: Review[] }>(`/api/reviews/product/${productId}`),

  // Orders
  checkout: (payload: any) =>
    request<{ message: string; order: Order }>('/api/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMyOrders: () => request<{ orders: Order[] }>('/api/orders/my-orders'),
  getAdminOrders: () => request<{ orders: Order[] }>('/api/orders/admin/all'),
  updateOrderStatus: (orderId: number, status: string) =>
    request<{ message: string; order: Order }>(`/api/orders/admin/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Coupons
  validateCoupon: (code: string, subtotal: number) =>
    request<{ valid: boolean; coupon: Coupon }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),
  getPromotions: () => request<{ promotions: Array<{ code: string; label: string; description: string }> }>('/api/coupons/public'),
};
