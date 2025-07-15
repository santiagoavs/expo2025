import axios from 'axios';

// 1. Crea la instancia con un nombre consistente
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 2. Interceptor de solicitud
api.interceptors.request.use(config => {
  const token = localStorage.getItem('diambars_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  console.error('Error en interceptor de solicitud:', error);
  return Promise.reject(error);
});

// 3. Interceptor de respuesta
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('diambars_token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// 4. Exporta como DEFAULT
export default api;