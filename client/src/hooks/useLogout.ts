import { useAuthStore } from '../store/authStore.ts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../api/auth.service.ts'
import type { AxiosError } from 'axios'
import type { AuthResponse } from '../types/types.ts'
import toast from 'react-hot-toast'



export const useLogout = () => {
    const clearAuth = useAuthStore((state) => state.logout);
    const setLoginModalOpen = useAuthStore((state) => state.setLoginModalOpen);

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authService.logout(),

        onSuccess: (response) => {
            clearAuth();
            setLoginModalOpen(false);
            queryClient.clear();

            toast.success(response.message || 'Logged out successfully!', {
                duration: 3000
            });
        },

        onError: (error: AxiosError<AuthResponse<null>>) => {
            const message = error.response?.data?.message || 'Logout failed! Please try again';
            toast.error(message, {
                duration: 3000
            });

            clearAuth();
            queryClient.clear();
        }
    });
};