import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import conf from '../conf/conf.ts'
import { useAuthStore } from '../store/authStore.ts';
import { authService } from './auth.service.ts';



const api: AxiosInstance = axios.create({
    baseURL: conf.baseUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});



// // req. interceptor only needed for body/header token strategy (no plans to use it)
// api.interceptors.request.use(
//     (config) => {
//         const token = useAuthStore.getState().accessToken;
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );



// will use res. interceptor for getting tokens as cookies to prevent xss attacks
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as CustomAxiosRequestConfig | undefined;
        
        const is401 = error.response?.status === 401;

        const isLoginRequest = originalRequest?.url?.includes('/users/login');

        // if it's a login request, reject immediately
        if (is401 && isLoginRequest) {
            return Promise.reject(error);
        }

        // if it's a 401 and we haven't retried yet
        if (is401 && originalRequest && !originalRequest._retry) {

            // prevent infinite loops on refresh endpoint
            if (originalRequest.url?.includes('/users/refresh-token')) {
                const { logout } = useAuthStore.getState();
                logout();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                await authService.refreshAccessToken();
                return api(originalRequest);
            }
            catch (refreshError) {
                handleGlobalLogout(originalRequest);
                return Promise.reject(refreshError);
            }
        }

        // fallback for subsequent failed 401s
        if (is401) {
            handleGlobalLogout(originalRequest);
        }

        return Promise.reject(error);
    }
);

// Helper fn. with robust undefined checking
const handleGlobalLogout = (originalRequest: CustomAxiosRequestConfig | undefined) => {
    const { logout, setLoginModalOpen } = useAuthStore.getState();
    logout();

    const skipLoginModal = originalRequest?.headers?.['X-Skip-Auth-Modal'] === 'true';
    
    if (!skipLoginModal) {
        setLoginModalOpen(true);
    }
};



export default api;