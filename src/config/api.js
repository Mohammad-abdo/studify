/**
 * API Configuration
 */

import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:6008/api';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:6008/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://back-studify.developteam.site/api';

// Store for rate limit retry attempts
const rateLimitRetries = new Map();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      const requestKey = originalRequest.url + (originalRequest.method || 'get');
      const retryCount = rateLimitRetries.get(requestKey) || 0;
      const maxRetries = 2;

      // Check if we've already retried this request
      if (retryCount < maxRetries && !originalRequest._retry) {
        originalRequest._retry = true;
        rateLimitRetries.set(requestKey, retryCount + 1);
        
        // Get retry-after header or use exponential backoff
        const retryAfter = error.response?.headers['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(1000 * Math.pow(2, retryCount), 5000);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry the request
        try {
          const response = await api(originalRequest);
          rateLimitRetries.delete(requestKey);
          return response;
        } catch (retryError) {
          rateLimitRetries.delete(requestKey);
          throw retryError;
        }
      } else {
        // Max retries reached or already retried
        rateLimitRetries.delete(requestKey);
        const errorMessage = error.response?.data?.message || 'Too many requests. Please wait a moment and try again.';
        // Error will be handled by the component
      }
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;