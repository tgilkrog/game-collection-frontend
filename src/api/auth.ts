import axios from 'axios';
import api from './axios';

export const getCsrfCookie = () =>
  axios.get(`${import.meta.env.VITE_API_BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });

export const logoutApi = () => api.post('/logout');
