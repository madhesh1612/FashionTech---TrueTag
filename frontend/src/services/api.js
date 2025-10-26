import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
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

// Auth API
export const auth = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

// Products API
export const products = {
  register: async (productData) => {
    return api.post('/products/register', productData);
  },

  getList: async (page = 1, limit = 10) => {
    return api.get(`/products?page=${page}&limit=${limit}`);
  },

  getDetails: async (id) => {
    return api.get(`/products/${id}`);
  }
};

// Activation API
export const activation = {
  activate: async (qrToken) => {
    return api.post('/activation/activate', { qrToken });
  },

  getStatus: async (qrToken) => {
    return api.get(`/activation/${qrToken}`);
  }
};

// Verification API
export const verification = {
  verifyProduct: async (qrToken, image = null) => {
    return api.post('/verify/scan', { qrToken, image });
  }
};

// Returns API
export const returns = {
  requestReturn: async (qrToken, reason, image = null) => {
    return api.post('/returns/request', { qrToken, reason, image });
  },

  getHistory: async () => {
    return api.get('/returns/history');
  }
};

// AI Service API
export const aiService = {
  analyzeLabel: async (productId, image, expectedCoordinates) => {
    return axios.post(`${AI_API_URL}/analyze/label`, {
      productId,
      image,
      expectedCoordinates
    });
  },

  analyzeTrust: async (productId, userId, activationTime, returnAttempts, image = null) => {
    return axios.post(`${AI_API_URL}/analyze/trust`, {
      productId,
      userId,
      activationTime,
      returnAttempts,
      image
    });
  }
};

export default api;