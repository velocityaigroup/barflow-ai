import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 10000,
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('barflow_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  pinLogin: (businessId: string, pin: string) =>
    api.post('/auth/pin-login', { businessId, pin }).then((r) => r.data),
};

// Tables
export const tablesApi = {
  getAll: () => api.get('/tables').then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/tables/${id}/status`, { status }).then((r) => r.data),
};

// Orders
export const ordersApi = {
  create: (data: any) => api.post('/orders', data).then((r) => r.data),
  getAll: (params?: any) => api.get('/orders', { params }).then((r) => r.data),
  getOne: (id: string) => api.get(`/orders/${id}`).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }).then((r) => r.data),
  getDailyRevenue: () => api.get('/orders/revenue/daily').then((r) => r.data),
};

// Products
export const productsApi = {
  getAll: (categoryId?: string) =>
    api.get('/products', { params: categoryId ? { categoryId } : undefined }).then((r) => r.data),
};

// Categories
export const categoriesApi = {
  getAll: () => api.get('/categories').then((r) => r.data),
};

// Inventory
export const inventoryApi = {
  getAll: () => api.get('/inventory').then((r) => r.data),
  getLowStock: () => api.get('/inventory/low-stock').then((r) => r.data),
};
