// Fixed api.js with proper FormData handling

import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 60000, // Increased to 60 seconds for operations like registration
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FIXED: Handle FormData properly
    if (config.data instanceof FormData) {
      // Remove Content-Type header for FormData to let browser set it with boundary
      delete config.headers['Content-Type'];
      console.log('FormData detected - removed Content-Type header');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      config: error.config
    });

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          // Bad Request - often validation errors
          if (data.errors && Array.isArray(data.errors)) {
            console.error('Validation errors:', data.errors);
            // Don't show toast here - let the calling component handle it
          } else {
            console.error('Bad request:', data.message);
          }
          break;
          
        case 401:
          // Unauthorized - only redirect to login if NOT a complaint submission
          const isComplaintSubmission = error.config?.url?.includes('/complaints');
          
          if (!isComplaintSubmission) {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            window.location.href = '/signin';
            toast.error('Session expired. Please sign in again.');
          }
          // For complaint submissions, let the component handle the error
          break;
          
        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action');
          break;
          
        case 404:
          // Not found
          toast.error('Resource not found');
          break;
          
        case 413:
          // Payload too large
          toast.error('File too large. Please reduce file size and try again.');
          break;
          
        case 422:
          // Validation error
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => toast.error(err.message || err));
          } else {
            toast.error(data.message || 'Validation error');
          }
          break;
          
        case 429:
          // Too many requests
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          // Server error
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Request made but no response received
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

export default api;