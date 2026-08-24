import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.headers?.['x-account-banned'] === 'true') {
      localStorage.removeItem('user');
      window.location.href = '/';
      return Promise.reject(err);
    }

    // The Laravel session expires after SESSION_LIFETIME minutes of inactivity.
    // When that happens mid-visit, the SPA still has a stale `user` in
    // localStorage/state, so without this every authenticated write would just
    // 401 silently until the user noticed and manually logged out/in again.
    const url = err.config?.url ?? '';
    const isAuthEndpoint = url.includes('/login') || url.includes('/register');
    if (err.response?.status === 401 && !isAuthEndpoint && localStorage.getItem('user')) {
      localStorage.removeItem('user');
      window.location.href = '/';
    }

    return Promise.reject(err);
  }
);

export default api;
