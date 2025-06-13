// api/axiosInstance.ts
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// NOVO ENDEREÇO DO BACKEND
const API_BASE_URL = 'https://back-end-plataforma-teaxis.onrender.com';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT automaticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      console.warn('Sessão expirada ou não autorizada. Redirecionando para o login.');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;