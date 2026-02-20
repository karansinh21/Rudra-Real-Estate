import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth'; // Updated to /auth instead of /login
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/profile')
};

// Property APIs
export const propertyAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  getMyProperties: () => api.get('/properties/broker/my-properties')
};

// Enquiry APIs
export const enquiryAPI = {
  getAll: (params) => api.get('/enquiries', { params }),
  getById: (id) => api.get(`/enquiries/${id}`),
  create: (data) => api.post('/enquiries', data),
  updateStatus: (id, status) => api.put(`/enquiries/${id}`, { status }),
  delete: (id) => api.delete(`/enquiries/${id}`)
};

// Legal APIs
export const legalAPI = {
  // Services
  getAllServices: () => api.get('/legal/services'),
  createService: (data) => api.post('/legal/services', data),
  updateService: (id, data) => api.put(`/legal/services/${id}`, data),
  deleteService: (id) => api.delete(`/legal/services/${id}`),
  
  // Requests
  getAllRequests: (params) => api.get('/legal/requests', { params }),
  getRequestById: (id) => api.get(`/legal/requests/${id}`),
  createRequest: (data) => api.post('/legal/requests', data),
  updateRequest: (id, data) => api.put(`/legal/requests/${id}`, data),
  deleteRequest: (id) => api.delete(`/legal/requests/${id}`)
};

// User APIs (Admin only)
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  // Add these for professional approval
  approveProfessional: (id) => api.put(`/users/${id}/approve`),
  rejectProfessional: (id) => api.put(`/users/${id}/reject`),
  getPendingProfessionals: () => api.get('/users/pending')
};

export default api;