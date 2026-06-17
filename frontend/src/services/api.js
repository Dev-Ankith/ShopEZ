import axios from 'axios';

const API = axios.create({
  baseURL: '', // Relative URL routes through the Vite port 3000 proxy configuration
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT token into header of every authenticated request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopez_stocks_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
