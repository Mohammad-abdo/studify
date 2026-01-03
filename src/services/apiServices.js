/**
 * API Services
 * Centralized API calls for all endpoints
 */

import api from '../config/api';

// ==================== AUTH ====================
export const authService = {
  login: (phone, password) => api.post('/auth/login', { phone, password }),
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (userId, code) => api.post('/auth/verify-otp', { userId, code }),
  resendOTP: (userId) => api.post('/auth/resend-otp', { userId }),
  forgotPassword: (phone) => api.post('/auth/forgot-password', { phone }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  getProfile: () => api.get('/auth/profile'),
};

// ==================== USERS ====================
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateStudentProfile: (data) => api.put('/users/student/profile', data),
  updateDoctorProfile: (data) => api.put('/users/doctor/profile', data),
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ==================== BOOKS ====================
export const bookService = {
  getBooks: (params) => api.get('/books', { params }),
  getBookById: (id) => api.get(`/books/${id}`),
  createBook: (data) => api.post('/books', data),
  updateBook: (id, data) => api.put(`/books/${id}`, data),
  deleteBook: (id) => api.delete(`/books/${id}`),
  getBookCategories: () => api.get('/books/categories'),
  addBookPricing: (data) => api.post(`/books/${data.bookId}/pricing`, data),
};

// ==================== PRODUCTS ====================
export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getProductCategories: () => api.get('/products/categories'),
  addProductPricing: (data) => api.post(`/products/${data.productId}/pricing`, data),
};

// ==================== ORDERS ====================
export const orderService = {
  getMyOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
};

// ==================== REVIEWS ====================
export const reviewService = {
  getReviews: (params) => api.get('/reviews', { params }),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// ==================== ADMIN ====================
export const adminService = {
  approveDoctor: (id) => api.post(`/admin/doctors/${id}/approve`),
  rejectDoctor: (id) => api.post(`/admin/doctors/${id}/reject`),
  approveBook: (id) => api.post(`/admin/books/${id}/approve`),
  rejectBook: (id) => api.post(`/admin/books/${id}/reject`),
  getPendingApprovals: (type) => api.get(`/admin/approvals?type=${type}`),
  getOperationLogs: (params) => api.get('/admin/logs', { params }),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
};

// ==================== DELIVERY ====================
export const deliveryService = {
  getProfile: () => api.get('/delivery/profile'),
  updateProfile: (data) => api.put('/delivery/profile', data),
  updateStatus: (status) => api.put('/delivery/status', { status }),
  getAssignments: (params) => api.get('/delivery/assignments', { params }),
  updateLocation: (data) => api.post('/delivery/location', data),
  getWallet: () => api.get('/delivery/wallet'),
  markPickedUp: (orderId) => api.post(`/delivery/orders/${orderId}/pickup`),
  markDelivered: (orderId) => api.post(`/delivery/orders/${orderId}/deliver`),
};

// ==================== NOTIFICATIONS ====================
export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

