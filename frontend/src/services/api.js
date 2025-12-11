import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Courts API
export const courtsAPI = {
  getAll: (params = {}) => api.get('/courts', { params }),
  getById: (id) => api.get(`/courts/${id}`),
  create: (data) => api.post('/courts', data),
  update: (id, data) => api.put(`/courts/${id}`, data),
  delete: (id) => api.delete(`/courts/${id}`),
};

// Coaches API
export const coachesAPI = {
  getAll: (params = {}) => api.get('/coaches', { params }),
  getById: (id) => api.get(`/coaches/${id}`),
  create: (data) => api.post('/coaches', data),
  update: (id, data) => api.put(`/coaches/${id}`, data),
  delete: (id) => api.delete(`/coaches/${id}`),
};

// Equipment API
export const equipmentAPI = {
  getAll: (params = {}) => api.get('/equipment', { params }),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params = {}) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  checkAvailability: (data) => api.post('/bookings/check-availability', data),
  getSlots: (courtId, date) => api.get(`/bookings/slots/${courtId}/${date}`),
  calculatePrice: (data) => api.post('/bookings/calculate-price', data),
};

// Pricing API
export const pricingAPI = {
  getAll: (params = {}) => api.get('/pricing', { params }),
  getById: (id) => api.get(`/pricing/${id}`),
  create: (data) => api.post('/pricing', data),
  update: (id, data) => api.put(`/pricing/${id}`, data),
  delete: (id) => api.delete(`/pricing/${id}`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  bulkCreateCourts: (data) => api.post('/admin/bulk/courts', data),
  bulkCreateEquipment: (data) => api.post('/admin/bulk/equipment', data),
  healthCheck: () => api.get('/admin/health'),
};

export default api;
