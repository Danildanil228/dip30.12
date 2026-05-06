import axios from 'axios';

const getApiBaseUrl = () => {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return "http://localhost:3000";
    }
    return `http://${window.location.hostname}:3000`;
};

export const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;