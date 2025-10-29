import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken })
};

export const plantsAPI = {
  create: (data) => api.post('/plants', data),
  getAll: (params) => api.get('/plants', { params }),
  getById: (id) => api.get(`/plants/${id}`),
  update: (id, data) => api.put(`/plants/${id}`, data),
  delete: (id) => api.delete(`/plants/${id}`)
};

export const complaintsAPI = {
  submit: (data) => api.post('/complaints', data),
  uploadPhotos: (formData) => api.post('/complaints/upload-photos', formData),
  // Note: Removed Content-Type header - browser sets it automatically with boundary for FormData
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  update: (id, data) => api.put(`/complaints/${id}`, data),
  assign: (id, inspectorId) => api.post(`/complaints/${id}/assign`, { inspectorId }),
  escalate: (id) => api.post(`/complaints/${id}/escalate`)
};

export const aiAPI = {
  query: (question) => api.post('/ai/query', { question }),
  getSuggestions: () => api.get('/ai/suggestions')
};

export const permitsAPI = {
  create: (data) => api.post('/permits', data),
  getAll: (params) => api.get('/permits', { params }),
  getById: (id) => api.get(`/permits/${id}`),
  update: (id, data) => api.put(`/permits/${id}`, data)
};

export default api;