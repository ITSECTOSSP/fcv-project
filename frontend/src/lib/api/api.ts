// This file sets up an Axios instance for making API requests. It configures the base URL from environment variables and sets default headers for JSON requests. Additionally, it includes an interceptor that automatically adds an authorization token from local storage to the request headers if available. This setup ensures that all API requests are properly authenticated and formatted.
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        Accept: 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;