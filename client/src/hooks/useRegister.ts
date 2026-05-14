import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { authService } from '../api/auth.service.ts';
import type { AuthResponse } from '../types/types.ts';
import { toast } from 'react-hot-toast';



export const useRegister = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (formData: FormData) => authService.register(formData),
        onSuccess: () => {
            toast.success('Registration successful! Please sign in.', {
                duration: 3000
            });
            navigate('/login');
        },
        onError: (error: AxiosError<AuthResponse<null>>) => {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(message, {
                duration: 3000
            });
        },
    });
};