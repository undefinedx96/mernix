import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { authService } from '../api/auth.service.ts'
import { useAuthStore } from '../store/authStore'
import type { LoginData, AuthResponse } from '../types/types.ts'
import { toast } from 'react-hot-toast'



export const useLogin = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const setLoginModalOpen = useAuthStore((state) => state.setLoginModalOpen);

    return useMutation({
        mutationFn: (data: LoginData) => authService.login(data),

        onSuccess: (response) => {
            setAuth(response.data.user);
            setLoginModalOpen(false);
            toast.success(`Welcome back ${response.data.user.firstName}!`, {
                duration: 3000
            });
        },
        
        onError: (error: AxiosError<AuthResponse<null>>) => {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
        },
    });
};