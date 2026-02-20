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

// ── Warehouse API Endpoints ──
export const warehouseAPI = {
  // Dashboard
  getOverview: (params) => api.get('/warehouse/overview/', { params }),
  getStockByCategory: (params) => api.get('/warehouse/stock-by-category/', { params }),
  getStockByOwner: () => api.get('/warehouse/stock-by-owner/'),
  getRecentDeliveries: (params) => api.get('/warehouse/deliveries/', { params }),

  // Inventory Management
  getInventoryItems: (params) => api.get('/warehouse/inventory/', { params }),
  getInventoryItem: (id) => api.get(`/warehouse/inventory/${id}/`),
  updateInventoryItem: (id, data) => api.patch(`/warehouse/inventory/${id}/`, data),

  // Stock Movements
  getStockMovements: (params) => api.get('/warehouse/stock-movements/', { params }),
  createStockMovement: (data) => api.post('/warehouse/stock-movements/', data),
  getStockMovement: (id) => api.get(`/warehouse/stock-movements/${id}/`),

  // Low Stock Alerts
  getAlerts: (params) => api.get('/warehouse/alerts/', { params }),
  resolveAlert: (id) => api.patch(`/warehouse/alerts/${id}/resolve/`),
  dismissAlert: (id) => api.patch(`/warehouse/alerts/${id}/dismiss/`),

  // Suppliers
  getSuppliers: (params) => api.get('/warehouse/suppliers/', { params }),
  getSupplier: (id) => api.get(`/warehouse/suppliers/${id}/`),

  // Owners (for filter dropdown)
  getOwners: () => api.get('/warehouse/owners/'),
};

// ── Customer API Endpoints ──
export const customerAPI = {
  // Browsing
  getProducts: (params) => api.get('/products/', { params }),
  getProduct: (id) => api.get(`/products/${id}/`),
  getCategories: () => api.get('/categories/'),
  searchProducts: (query) => api.get('/products/', { params: { search: query } }),

  // Cart
  getCart: () => api.get('/cart/'),
  addToCart: (productId, quantity = 1) => api.post('/cart/', { product_id: productId, quantity }),
  updateCartItem: (itemId, quantity) => api.patch(`/cart/${itemId}/`, { quantity }),
  removeCartItem: (itemId) => api.delete(`/cart/${itemId}/`),
  clearCart: () => api.delete('/cart/clear/'),

  // Wishlist
  getWishlist: () => api.get('/wishlist/'),
  addToWishlist: (productId) => api.post('/wishlist/', { product_id: productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}/`),

  // Orders
  placeOrder: (data) => api.post('/orders/', data),
  getMyOrders: (params) => api.get('/orders/my/', { params }),
  getOrderDetails: (id) => api.get(`/orders/${id}/`),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel/`),

  // Profile
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),

  // Reviews
  addReview: (productId, data) => api.post(`/products/${productId}/reviews/`, data),
  getReviews: (productId) => api.get(`/products/${productId}/reviews/`),
};

// ── Admin API Endpoints ──
export const adminAPI = {
  // Dashboard / System Overview
  getSystemOverview: () => api.get('/admin/system-overview/'),
  getUsersByRole: () => api.get('/admin/users-by-role/'),
  getRegistrationTrend: (params) => api.get('/admin/registration-trend/', { params }),
  getRecentActivity: (params) => api.get('/admin/recent-activity/', { params }),
  getSupplierPerformance: (params) => api.get('/admin/supplier-performance/', { params }),

  // User Management
  getUsers: (params) => api.get('/admin/users/', { params }),
  getUser: (id) => api.get(`/admin/users/${id}/`),
  createUser: (data) => api.post('/admin/users/', data),
  updateUser: (id, data) => api.patch(`/admin/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}/`),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status/`),
  resetPassword: (id) => api.post(`/admin/users/${id}/reset-password/`),
  getUserActivity: (id, params) => api.get(`/admin/users/${id}/activity/`, { params }),

  // Supplier Management
  getSuppliers: (params) => api.get('/admin/suppliers/', { params }),
  getSupplier: (id) => api.get(`/admin/suppliers/${id}/`),
  createSupplier: (data) => api.post('/admin/suppliers/', data),
  updateSupplier: (id, data) => api.patch(`/admin/suppliers/${id}/`, data),
  toggleSupplierStatus: (id) => api.patch(`/admin/suppliers/${id}/toggle-status/`),
  getSupplierStats: () => api.get('/admin/supplier-stats/'),

  // System Logs
  getLogs: (params) => api.get('/admin/logs/', { params }),
  getLogStats: (params) => api.get('/admin/log-stats/', { params }),
  exportLogs: (params) => api.get('/admin/logs/export/', { params, responseType: 'blob' }),

  // Analytics Summary
  getRevenueSummary: (params) => api.get('/admin/analytics/revenue-summary/', { params }),
  getRevenueByOwner: (params) => api.get('/admin/analytics/revenue-by-owner/', { params }),
  getRevenueTrend: (params) => api.get('/admin/analytics/revenue-trend/', { params }),
  getCategoryPerformance: (params) => api.get('/admin/analytics/category-performance/', { params }),
  getCustomerAnalytics: (params) => api.get('/admin/analytics/customer-analytics/', { params }),
  getUserGrowth: (params) => api.get('/admin/analytics/user-growth/', { params }),
};

// ── Auth API ──
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  refreshToken: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
  register: (data) => api.post('/auth/register/', data),
};

export default api;
