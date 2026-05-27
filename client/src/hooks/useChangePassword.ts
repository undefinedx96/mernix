import { useMutation } from '@tanstack/react-query'
import type { ApiErrorResponse, AuthResponse, ChangePasswordData, ToastId } from '../types/types.ts'
import { authService } from '../api/auth.service.ts'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'



export const useChangePassword = () => {

    const changePasswordMutation = useMutation<AuthResponse<null>, AxiosError<ApiErrorResponse>, ChangePasswordData, ToastId>({
        mutationFn: (data) => authService.changeCurrentPassword(data),

        onMutate: () => {
            return {
                toastId: toast.loading('Securing your identity...', {
                    duration: 3000
                })
            }
        },

        onSuccess: (response, _, context) => {
            toast.success(response.message || 'Password changed successfully!', {
                id: context?.toastId,
                duration: 3000
            });
        },

        onError: (error, _, context) => {
            const serverErrorMessage = error?.response?.data?.message || 'Verification failure. Verify old password.';

            toast.error(serverErrorMessage, {
                id: context?.toastId,
                duration: 3000
            })
        }
    });

    return {
        // changePassword: changePasswordMutation.mutateAsync,
        changePassword: changePasswordMutation.mutate,
        isChangingPassword: changePasswordMutation.isPending,
        isChangingPasswordError: changePasswordMutation.error,
        isChangingPasswordSuccess: changePasswordMutation.isSuccess,
        resetMutation: changePasswordMutation.reset
    };
};