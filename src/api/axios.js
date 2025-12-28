import axios from 'axios';
import Auth from "../utils/Auth";


const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

// Automatycznie dodaje token do KAŻDEGO requesta
api.interceptors.request.use(
    (config) => {
        const {accessToken, refreshToken} = Auth.getTokens()
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    }
);

// Automatycznie odświeża token przy 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await Auth.refreshToken(); // Odśwież JWT

                const newToken = Auth.getAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest); // Automatycznie powtórz request
            } catch (refreshError) {
                Auth.clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;