/**
 * Centralized API Service Layer
 * All backend API calls go through these typed helpers.
 * Base URL is configured via NEXT_PUBLIC_API_URL in .env.local
 */

import { API_BASE_URL } from "@/lib/api";
import { authService } from "@/lib/auth/authService";
import { TokenStorage } from "@/lib/auth/token"; // used in apiFetch for initial token read

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  brand: string | null;
  category: "BOOK" | "APPAREL" | "MERCHANDISE" | "ACCESSORIES";
  status: "ACTIVE" | "DRAFT" | "ARCHIVED" | "OUT_OF_STOCK";
  price: number;
  salePrice: number | null;
  tax: number;
  trackStock: boolean;
  globalStock: number;
  lowStockThreshold: number;
  outOfStockBehavior: string;
  primaryImage: string | null;
  galleryImages: string[];
  shortDescription: string | null;
  fullDescription: string | null;
  createdAt: string;
  updatedAt: string;
  sizes: { id: string; label: string; stock: number; lowStockThreshold?: number }[];
  variants?: {
    id: string;
    colourName: string;
    colourHex: string | null;
    displayOrder: number;
    images: { id: string; url: string; displayOrder: number; isPrimary: boolean; }[];
    sizes: { id: string; label: string; stock: number; lowStockThreshold: number; }[];
  }[];
  book: ApiBook | null;
}

export interface ApiBook {
  id: string;
  title: string;
  slug: string;
  genre: string | null;
  publicationDate: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  coverUrl: string | null;
  qrEnabled: boolean;
  qrSongTitle: string | null;
  qrSongUrl: string | null;
  author: ApiAuthor | null;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    status: string;
  } | null;
}

export interface ApiAuthor {
  id: string;
  name: string;
  slug: string;
  shortBio: string | null;
  fullBio: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt?: string;
  books?: {
    id: string;
    title: string;
    product?: {
      id: string;
      name: string;
      slug: string;
      price: number;
      status: string;
    };
  }[];
}

export interface ApiInquiry {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "NEW" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  shippingAddress: Record<string, string>;
  items: ApiOrderItem[];
  customer?: { name: string; email: string };
}

export interface ApiOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── Core fetch helper ──────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = false
): Promise<T> {
  const buildHeaders = (token?: string | null): Record<string, string> => ({
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const doFetch = (token?: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: buildHeaders(token),
    });

  // ── First attempt ──────────────────────────────────────────────────────────
  const token = requiresAuth ? TokenStorage.getToken() : null;
  let res = await doFetch(token);

  // ── Auto-refresh on 401 for authenticated calls ─────────────────────────────
  if (res.status === 401 && requiresAuth) {
    const newToken = await authService.refresh();
    if (!newToken) {
      // Refresh token missing / expired → force the user back to login
      if (typeof window !== "undefined") {
        window.location.href = "/login?expired=1";
      }
      throw new Error("Your session has expired. Please log in again.");
    }
    // Retry with the fresh token
    res = await doFetch(newToken);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(errorBody.message || `HTTP ${res.status}`);
  }

  const body = await res.json();
  return body.data as T;
}

// ── File upload helper (multipart/form-data — do NOT set Content-Type manually) ─
// Mirrors apiFetch: auto-refreshes token on 401, redirects to login if expired.

async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const doUpload = (token?: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

  const redirectToLogin = () => {
    if (typeof window !== "undefined") window.location.href = "/login?expired=1";
    throw new Error("Your session has expired. Please log in again.");
  };

  // ── Get current token — if missing, pre-emptively refresh ──────────────────
  let token = TokenStorage.getToken();
  if (!token) {
    token = await authService.refresh();
    if (!token) redirectToLogin();
  }

  // ── First attempt ──────────────────────────────────────────────────────────
  let res = await doUpload(token);

  // ── Auto-refresh on 401 (expired access token) ─────────────────────────────
  if (res.status === 401) {
    const newToken = await authService.refresh();
    if (!newToken) redirectToLogin();
    res = await doUpload(newToken);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(errorBody.message || `HTTP ${res.status}`);
  }
  const body = await res.json();
  return body.data as T;
}

// ── Uploads API ────────────────────────────────────────────────────────────────

export const uploadsApi = {
  bookCover: (file: File): Promise<{ url: string; filename: string }> => {
    const fd = new FormData(); fd.append("file", file);
    return apiUpload("/api/v1/uploads/book-cover", fd);
  },
  authorAvatar: (file: File): Promise<{ url: string; filename: string }> => {
    const fd = new FormData(); fd.append("file", file);
    return apiUpload("/api/v1/uploads/author-avatar", fd);
  },
  productImage: (file: File): Promise<{ url: string; filename: string }> => {
    const fd = new FormData(); fd.append("file", file);
    return apiUpload("/api/v1/uploads/product-image", fd);
  },
  productGallery: (file: File): Promise<{ url: string; filename: string }> => {
    const fd = new FormData(); fd.append("file", file);
    return apiUpload("/api/v1/uploads/product-gallery", fd);
  },
};

// ── Products API ───────────────────────────────────────────────────────────────

export const productsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<ApiProduct>> => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.category) q.set("category", params.category);
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    return apiFetch<PaginatedResponse<ApiProduct>>(
      `/api/v1/products?${q.toString()}`
    );
  },

  get: (id: string): Promise<ApiProduct> =>
    apiFetch<ApiProduct>(`/api/v1/products/${id}`),

  create: (data: Record<string, unknown>): Promise<ApiProduct> =>
    apiFetch<ApiProduct>("/api/v1/products", {
      method: "POST",
      body: JSON.stringify(data),
    }, true),

  update: (id: string, data: Record<string, unknown>): Promise<ApiProduct> =>
    apiFetch<ApiProduct>(`/api/v1/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, true),

  delete: (id: string): Promise<void> =>
    apiFetch<void>(`/api/v1/products/${id}`, { method: "DELETE" }, true),
};

// ── Books API ──────────────────────────────────────────────────────────────────

export const booksApi = {
  list: (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<ApiBook>> => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    // No auth required — public endpoint
    return apiFetch<PaginatedResponse<ApiBook>>(`/api/v1/books?${q.toString()}`);
  },
};

// ── Authors API ────────────────────────────────────────────────────────────────

export const authorsApi = {
  list: (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<ApiAuthor & { books: { id: string; title: string; slug: string }[] }>> => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    // No auth required — public endpoint
    return apiFetch<PaginatedResponse<ApiAuthor & { books: { id: string; title: string; slug: string }[] }>>(`/api/v1/authors?${q.toString()}`);
  },

  get: (id: string): Promise<ApiAuthor> =>
    apiFetch<ApiAuthor>(`/api/v1/authors/${id}`),

  update: (id: string, data: Record<string, unknown>): Promise<ApiAuthor> =>
    apiFetch<ApiAuthor>(`/api/v1/authors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, true),
};

// ── Inquiries API ──────────────────────────────────────────────────────────────

export const inquiriesApi = {
  submit: (data: {
    name: string;
    email: string;
    phone?: string;
    type?: string;
    message: string;
  }): Promise<ApiInquiry> =>
    apiFetch<ApiInquiry>("/api/v1/inquiries", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<PaginatedResponse<ApiInquiry>> => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.status) q.set("status", params.status);
    if (params?.type) q.set("type", params.type);
    return apiFetch<PaginatedResponse<ApiInquiry>>(
      `/api/v1/inquiries?${q.toString()}`,
      {},
      true
    );
  },

  get: (id: string): Promise<ApiInquiry> =>
    apiFetch<ApiInquiry>(`/api/v1/inquiries/${id}`, {}, true),

  updateStatus: (id: string, status: string): Promise<ApiInquiry> =>
    apiFetch<ApiInquiry>(`/api/v1/inquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }, true),
};

// ── Orders API ─────────────────────────────────────────────────────────────────

export const ordersApi = {
  // Customer
  myOrders: (): Promise<PaginatedResponse<ApiOrder>> =>
    apiFetch<PaginatedResponse<ApiOrder>>("/api/v1/orders", {}, true),

  myOrder: (id: string): Promise<ApiOrder> =>
    apiFetch<ApiOrder>(`/api/v1/orders/${id}`, {}, true),

  checkout: (data: {
    shippingAddress: Record<string, string>;
    items: { productId: string; quantity: number; variantId?: string; sizeLabel?: string }[];
    paymentMethod?: string;
    notes?: string;
  }): Promise<{ order: ApiOrder; paymentIntent?: string }> =>
    apiFetch<{ order: ApiOrder; paymentIntent?: string }>(
      "/api/v1/orders/checkout",
      { method: "POST", body: JSON.stringify(data) },
      true
    ),

  cancel: (id: string): Promise<ApiOrder> =>
    apiFetch<ApiOrder>(`/api/v1/orders/${id}/cancel`, { method: "PATCH" }, true),

  // Admin
  adminList: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<ApiOrder>> => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.status) q.set("status", params.status);
    return apiFetch<PaginatedResponse<ApiOrder>>(
      `/api/v1/admin/orders?${q.toString()}`,
      {},
      true
    );
  },

  adminGet: (id: string): Promise<ApiOrder> =>
    apiFetch<ApiOrder>(`/api/v1/admin/orders/${id}`, {}, true),

  updateStatus: (id: string, status: string): Promise<ApiOrder> =>
    apiFetch<ApiOrder>(`/api/v1/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }, true),

  // alias used by the order manage page
  adminUpdateStatus: (id: string, status: string): Promise<ApiOrder> =>
    apiFetch<ApiOrder>(`/api/v1/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }, true),

  analytics: (): Promise<Record<string, unknown>> =>
    apiFetch<Record<string, unknown>>("/api/v1/admin/orders/analytics", {}, true),
};

// ── Payments API ────────────────────────────────────────────────────────────────

export const paymentsApi = {
  createOrder: (orderId: string): Promise<{
    razorpayOrderId: string;
    amount: number;
    currency: string;
    key: string;
  }> =>
    apiFetch<{ razorpayOrderId: string; amount: number; currency: string; key: string }>(
      "/api/v1/payments/create-order",
      { method: "POST", body: JSON.stringify({ orderId }) },
      true
    ),

  verify: (data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<{ success: boolean; message: string }> =>
    apiFetch<{ success: boolean; message: string }>(
      "/api/v1/payments/verify",
      { method: "POST", body: JSON.stringify(data) },
      true
    ),
};

// ── Tracking API ───────────────────────────────────────────────────────────────

export const trackingApi = {
  adminUpdate: (orderId: string, data: { courierName?: string; trackingNumber?: string; trackingUrl?: string }): Promise<unknown> =>
    apiFetch<unknown>(`/api/v1/admin/tracking/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, true),
};

// ── Cart API ───────────────────────────────────────────────────────────────────

export const cartApi = {
  get: (): Promise<unknown> =>
    apiFetch<unknown>("/api/v1/cart", {}, true),

  sync: (items: { productId: string; quantity: number; sizeId?: string }[]): Promise<unknown> =>
    apiFetch<unknown>("/api/v1/cart", {
      method: "POST",
      body: JSON.stringify({ items }),
    }, true),
};

// ── Users / Profile API ────────────────────────────────────────────────────────

export const usersApi = {
  me: (): Promise<{ id: string; name: string; email: string; phone?: string; role: string }> =>
    apiFetch<{ id: string; name: string; email: string; phone?: string; role: string }>(
      "/api/v1/auth/me",
      {},
      true
    ),

  updateProfile: (data: { name?: string; phone?: string }): Promise<unknown> =>
    apiFetch<unknown>("/api/v1/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }, true),
};

// ── Admin analytics shorthand ──────────────────────────────────────────────────

export const adminApi = {
  dashboard: async () => {
    const [productsRes, ordersRes, inquiriesRes, analyticsRes] = await Promise.allSettled([
      productsApi.list({ limit: 1 }),
      ordersApi.adminList({ limit: 5 }),
      inquiriesApi.list({ limit: 5, status: "NEW" }),
      ordersApi.analytics(),
    ]);

    return {
      products:
        productsRes.status === "fulfilled"
          ? productsRes.value
          : { items: [], pagination: { total: 0, page: 1, limit: 1, totalPages: 0 } },
      recentOrders:
        ordersRes.status === "fulfilled"
          ? ordersRes.value
          : { items: [], pagination: { total: 0, page: 1, limit: 5, totalPages: 0 } },
      newInquiries:
        inquiriesRes.status === "fulfilled"
          ? inquiriesRes.value
          : { items: [], pagination: { total: 0, page: 1, limit: 5, totalPages: 0 } },
      analytics:
        analyticsRes.status === "fulfilled" ? analyticsRes.value : null,
    };
  },
};

// ── Addresses API ──────────────────────────────────────────────────────────────

export const addressesApi = {
  list: (): Promise<unknown[]> =>
    apiFetch<unknown[]>("/api/v1/addresses", {}, true),

  create: (data: Record<string, unknown>): Promise<unknown> =>
    apiFetch<unknown>("/api/v1/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    }, true),

  update: (id: string, data: Record<string, unknown>): Promise<unknown> =>
    apiFetch<unknown>(`/api/v1/addresses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, true),

  delete: (id: string): Promise<void> =>
    apiFetch<void>(`/api/v1/addresses/${id}`, { method: "DELETE" }, true),
};

// ── Store Settings API ─────────────────────────────────────────────────────────

export const storeSettingsApi = {
  get: (): Promise<Record<string, unknown>> =>
    apiFetch<Record<string, unknown>>("/api/v1/settings", {}, true),

  update: (data: Record<string, unknown>): Promise<Record<string, unknown>> =>
    apiFetch<Record<string, unknown>>("/api/v1/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }, true),
};
