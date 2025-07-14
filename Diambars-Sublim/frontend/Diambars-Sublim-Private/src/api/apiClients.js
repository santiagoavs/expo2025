import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const apiClient = axios.create({ 
  baseURL,
  withCredentials: true
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('diambars_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('diambars_token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;