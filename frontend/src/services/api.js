import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a 401 AND we are not already on the login page
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email, full_name, password) =>
    api.post('/api/auth/register', { email, full_name, password }),
  
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
};

// Sweets API
export const sweetsAPI = {
  getAll: (skip = 0, limit = 100) =>
    api.get('/api/sweets', { params: { skip, limit } }),
  
  getById: (id) =>
    api.get(`/api/sweets/${id}`),
  
  search: (params) =>
    api.post('/api/sweets/search', params),
  
  create: (data) =>
    api.post('/api/sweets', data),
  
  update: (id, data) =>
    api.put(`/api/sweets/${id}`, data),
  
  delete: (id) =>
    api.delete(`/api/sweets/${id}`),
  
  purchase: (id, quantity) =>
    api.post(`/api/sweets/${id}/purchase`, { quantity }),
  
  restock: (id, quantity) =>
    api.post(`/api/sweets/${id}/restock`, { quantity }),
};

export default api;