import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Adjunta el token a cada petición si existe
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('diambars_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Error en interceptor de solicitud:', error);
    return Promise.reject(error);
  }
);

// Si recibe 401, solo elimina el token; la ruta protegida se encargará de redirigir
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('diambars_token');
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
