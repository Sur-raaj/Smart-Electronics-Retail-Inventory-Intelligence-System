import axios from 'axios';
import config from '../Config/Config';

// ── Axios Instance ──
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor (attach JWT) ──
api.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem(config.AUTH_TOKEN_KEY);
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor (handle 401) ──
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(config.AUTH_TOKEN_KEY);
      localStorage.removeItem(config.REFRESH_TOKEN_KEY);
      localStorage.removeItem('customer_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Owner API Endpoints ──
export const ownerAPI = {
  // Dashboard Analytics
  getSalesOverview: (params) => api.get('/analytics/sales-overview/', { params }),
  getRevenueTrend: (params) => api.get('/analytics/revenue-trend/', { params }),
  getTopProducts: (params) => api.get('/analytics/top-products/', { params }),
  getCategoryPerformance: (params) => api.get('/analytics/category-performance/', { params }),
  getPaymentMethodStats: (params) => api.get('/analytics/payment-methods/', { params }),
  getOrderStatusStats: (params) => api.get('/analytics/order-status/', { params }),
  getLowStockProducts: (params) => api.get('/analytics/low-stock/', { params }),

  // Product Management
  getAllProducts: (params) => api.get('/products/', { params }),
  getProduct: (id) => api.get(`/products/${id}/`),
  createProduct: (data) => api.post('/products/', data),
  updateProduct: (id, data) => api.put(`/products/${id}/`, data),
  deleteProduct: (id) => api.delete(`/products/${id}/`),

  // Order Management
  getAllOrders: (params) => api.get('/orders/', { params }),
  getOrderDetails: (id) => api.get(`/orders/${id}/`),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/`, { status }),

  // Categories & Suppliers (for dropdowns)
  getCategories: () => api.get('/categories/'),
  getSuppliers: () => api.get('/suppliers/'),
};

// ── Auth API ──
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  refreshToken: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
};

export default api;
