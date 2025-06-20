import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 👉 Добавление access_token перед каждым запросом
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  console.log(token, 'token from localStorage');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// 👉 Автоматическое обновление access_token при 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Не пытаемся обновлять токен если это запрос на обновление
      if (originalRequest.url?.includes('/users/refresh')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login'; // Перенаправляем на логин
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refresh_token = localStorage.getItem('refresh_token');

      if (!refresh_token) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const res = await axios.post('http://localhost:5000/api/users/refresh', {}, {
          headers: {
            'Authorization': `Bearer ${refresh_token}`
          }
        });
        
        localStorage.setItem('access_token', res.data.access_token);
        originalRequest.headers['Authorization'] = `Bearer ${res.data.access_token}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
