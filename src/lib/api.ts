/**
 * Velocity AI BarFlow — NestJS API Client
 *
 * Usage:
 *   Set NEXT_PUBLIC_API_URL in .env.local or Vercel env vars to enable.
 *   Falls back to direct Supabase if not set (see useDemoStore.ts).
 */
import axios, { AxiosError } from 'axios';

// ─── Config ────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach JWT ─────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('barflow_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — normalise errors ──────────────────
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string; statusCode?: number }>) => {
    const msg =
      error.response?.data?.message ||
      (Array.isArray((error.response?.data as any)?.message)
        ? (error.response?.data as any).message.join(', ')
        : null) ||
      error.message ||
      'Unknown API error';

    console.error(`[BarFlow API] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response?.status ?? 'ERR'}: ${msg}`);
    return Promise.reject(new Error(msg));
  },
);

// ─── Helpers ──────────────────────────────────────────────────
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

// ─── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; user: NestUser }>('/auth/login', { email, password }).then(r => r.data),

  pinLogin: (businessId: string, pin: string) =>
    api.post<{ accessToken: string; user: NestUser }>('/auth/pin-login', { businessId, pin }).then(r => r.data),
};

// ─── Tables ────────────────────────────────────────────────────
export const tablesApi = {
  getAll: () =>
    api.get<NestTable[]>('/tables').then(r => r.data),

  updateStatus: (id: string, status: string) =>
    api.patch<NestTable>(`/tables/${id}/status`, { status }).then(r => r.data),

  seed: (count?: number) =>
    api.post<NestTable[]>('/tables/seed', { count }).then(r => r.data),
};

// ─── Orders ────────────────────────────────────────────────────
export const ordersApi = {
  getAll: (params?: Record<string, any>) =>
    api.get<NestOrder[]>('/orders', { params }).then(r => r.data),

  getOne: (id: string) =>
    api.get<NestOrder>(`/orders/${id}`).then(r => r.data),

  create: (data: CreateOrderPayload) =>
    api.post<NestOrder>('/orders', data).then(r => r.data),

  updateStatus: (id: string, status: string) =>
    api.patch<NestOrder>(`/orders/${id}/status`, { status }).then(r => r.data),

  getDailyRevenue: () =>
    api.get<{ total: number; orderCount: number; topItems: TopItem[] }>('/orders/revenue/daily').then(r => r.data),
};

// ─── Products ──────────────────────────────────────────────────
export const productsApi = {
  getAll: (categoryId?: string) =>
    api.get<NestProduct[]>('/products', { params: categoryId ? { categoryId } : undefined }).then(r => r.data),
};

// ─── Categories ────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () =>
    api.get<NestCategory[]>('/categories').then(r => r.data),
};

// ─── Inventory ─────────────────────────────────────────────────
export const inventoryApi = {
  getAll:     () => api.get('/inventory').then(r => r.data),
  getLowStock: () => api.get('/inventory/low-stock').then(r => r.data),
};

// ─── Health ────────────────────────────────────────────────────
export const healthApi = {
  check: () =>
    api.get<{ status: string; timestamp: string }>('/health', { timeout: 3000 }).then(r => r.data),
};

// ─── Response types ────────────────────────────────────────────
export interface NestUser {
  id: string;
  name: string;
  email: string;
  role: string;
  businessId: string;
}

export interface NestTable {
  id: string;
  businessId: string;
  number: number;
  name: string;
  capacity: number;
  status: 'free' | 'occupied' | 'ordering';
  section?: string;
  positionX?: number;
  positionY?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NestOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  customNote?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceAdjustment: number;
}

export interface NestOrder {
  id: string;
  localId?: string;
  businessId: string;
  tableId?: string;
  table?: NestTable;
  staffId?: string;
  status: 'pending' | 'sent' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
  destination: 'bar' | 'kitchen' | 'mixed';
  items: NestOrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  notes?: string;
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NestProduct {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  description?: string;
  isAvailable: boolean;
}

export interface NestCategory {
  id: string;
  name: string;
  emoji?: string;
}

export interface TopItem {
  name: string;
  count: number;
  revenue: number;
}

export interface CreateOrderItemPayload {
  productId?: string;
  productName?: string;
  unitPrice?: number;
  quantity: number;
  selectedModifiers?: SelectedModifier[];
  customNote?: string;
}

export interface CreateOrderPayload {
  tableId?: string;
  localId?: string;
  destination?: 'bar' | 'kitchen';
  items: CreateOrderItemPayload[];
  notes?: string;
}
