import axios, { type AxiosInstance } from 'axios'
import conf from '../conf/conf.ts'
import { useAuthStore } from '../store/authStore.ts';



const api: AxiosInstance = axios.create({
    baseURL: conf.baseUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});



// req. interceptor only needed for body/header token strategy (no plans to use it)
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);



// will use res. interceptor for getting tokens as cookies to prevent xss attacks
api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);



export default api;