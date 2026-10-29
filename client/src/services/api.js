import axios from 'axios';

// Create central Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for clear error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    console.error('API Error:', customMessage);
    return Promise.reject(error);
  }
);

export default api;
