import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login:           (credentials) => api.post('/auth/login', credentials),
  register:        (userData)    => api.post('/auth/register', userData),
  getCurrentUser:  ()            => api.get('/auth/profile'),
  updateProfile:   (data)        => api.put('/auth/update-profile', data),
  changePassword:  (data)        => api.put('/auth/change-password', data),
  forgotPassword:  (email)       => api.post('/auth/forgot-password', { email }), // ✅ NEW
  resetPassword:   (data)        => api.post('/auth/reset-password', data),       // ✅ NEW
};

export const propertyAPI = {
  getAll:          (params)      => api.get('/properties', { params }),
  getById:         (id)          => api.get(`/properties/${id}`),
  create:          (data)        => api.post('/properties', data),
  update:          (id, data)    => api.put(`/properties/${id}`, data),
  delete:          (id)          => api.delete(`/properties/${id}`),
  getMyProperties: (params)      => api.get('/properties/my/properties', { params }),
  downloadPDF:     (id)          => `${API_URL}/properties/${id}/pdf`,
};

export const enquiryAPI = {
  getAll:       (params)     => api.get('/enquiries', { params }),
  getById:      (id)         => api.get(`/enquiries/${id}`),
  create:       (data)       => api.post('/enquiries', data),
  updateStatus: (id, status) => api.put(`/enquiries/${id}`, { status }),
  delete:       (id)         => api.delete(`/enquiries/${id}`),
};

export const legalAPI = {
  getAllServices:  ()            => api.get('/legal/services'),
  getMyServices:  ()            => api.get('/legal/services'),
  createService:  (data)        => api.post('/legal/services', data),
  updateService:  (id, data)    => api.put(`/legal/services/${id}`, data),
  deleteService:  (id)          => api.delete(`/legal/services/${id}`),
  getAllRequests:  (params)      => api.get('/legal/requests', { params }),
  getRequestById: (id)          => api.get(`/legal/requests/${id}`),
  createRequest:  (data)        => api.post('/legal/requests', data),
  updateRequest:  (id, data)    => api.put(`/legal/requests/${id}`, data),
  deleteRequest:  (id)          => api.delete(`/legal/requests/${id}`),
};

export const lawyerPublicAPI = {
  getProfile:     ()   => api.get('/users/lawyer-profile'),
  getProfileById: (id) => api.get(`/users/lawyer-profile/${id}`),
  getAll:         ()   => api.get('/users/lawyer-profile'),
};

export const userAPI = {
  getAll:                  (params)   => api.get('/users', { params }),
  getById:                 (id)       => api.get(`/users/${id}`),
  update:                  (id, data) => api.put(`/users/${id}`, data),
  delete:                  (id)       => api.delete(`/users/${id}`),
  approveProfessional:     (id)       => api.put(`/users/${id}/approve`),
  rejectProfessional:      (id)       => api.put(`/users/${id}/reject`),
  getPendingProfessionals: ()         => api.get('/users/pending'),
};

export const landAPI = {
  submitRequirement:       (data)        => api.post('/land/requirement', data),
  postRequirement:         (data)        => api.post('/land/requirement', data),
  getListings:             (params = {}) => api.get('/land/listings', { params }),
  getAllRequirements:       (params = {}) => api.get('/land/requirements', { params }),
  getRequirementById:      (id)          => api.get(`/land/requirements/${id}`),
  updateRequirementStatus: (id, status)  => api.put(`/land/requirement/${id}`, { status }),
  deleteRequirement:       (id)          => api.delete(`/land/requirement/${id}`),
};

export const wishlistAPI = {
  getAll:   ()           => api.get('/wishlist'),
  getIds:   ()           => api.get('/wishlist/ids'),
  add:      (propertyId) => api.post('/wishlist', { propertyId }),
  remove:   (propertyId) => api.delete(`/wishlist/${propertyId}`),
  clearAll: ()           => api.delete('/wishlist'),
};

export const uploadAPI = {
  single:   (formData) => api.post('/upload/single',   formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  multiple: (formData) => api.post('/upload/multiple', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:   (publicId) => api.delete('/upload/delete', { data: { publicId } }),
};

export const brokerAPI = {
  getMyListings: (params)   => api.get('/properties/my/properties', { params }),
  addListing:    (data)     => api.post('/properties', data),
  updateListing: (id, data) => api.put(`/properties/${id}`, data),
  deleteListing: (id)       => api.delete(`/properties/${id}`),
};

export const tourAPI = {
  schedule: (data) => api.post('/enquiries', { ...data, type: 'TOUR' }),
  getAll:   ()     => api.get('/enquiries', { params: { type: 'TOUR' } }),
};

// ✅ NEW — Chat API
export const chatAPI = {
  createSession:  (data)  => api.post('/chat/session', data),
  getSession:     (id)    => api.get(`/chat/session/${id}`),
  getAllSessions:  ()      => api.get('/chat/sessions'),
  saveMessage:    (data)  => api.post('/chat/message', data),
  closeSession:   (id)    => api.put(`/chat/session/${id}/close`),
  markRead:       (id)    => api.put(`/chat/session/${id}/read`),
};

export default api;