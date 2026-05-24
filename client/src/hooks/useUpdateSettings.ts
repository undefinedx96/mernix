import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore.ts'
import type { ApiErrorResponse, AuthResponse, ToastId, UpdateAccountData, User } from '../types/types.ts'
import { authService } from '../api/auth.service.ts'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'



export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    const setAuth = useAuthStore(state => state.setAuth);


    const updateDetailsMutation = useMutation<AuthResponse<User>, AxiosError<ApiErrorResponse>, UpdateAccountData, ToastId>({
        mutationFn: (data) => authService.updateAccountDetails(data),

        onMutate: () => {
            return {
                toastId: toast.loading('Updating account details...', {
                    duration: 3000
                })
            }
        },

        onSuccess: (response, _, context) => {
            setAuth(response.data);
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            queryClient.invalidateQueries({ queryKey: ['channelProfile'] });
            toast.success(response.message || 'Profile details updated successfully!', {
                id: context?.toastId,
                duration: 3000
            });
        },

        onError: (error, _, context) => {
            const serverErrorMessage = error?.response?.data?.message || 'Failed to update details';
            toast.error(serverErrorMessage || 'Failed to update details', {
                id: context?.toastId,
                duration: 3000
            });
        }
    });


    const updateAvatarMutation = useMutation<AuthResponse<User>, AxiosError<ApiErrorResponse>, FormData, ToastId>({
        mutationFn: (formData) => authService.updateAvatar(formData),

        onMutate: () => {
            return {
                toastId: toast.loading('Uploading fresh avatar...', {
                    duration: 3000
                })
            }
        },

        onSuccess: (response, _, context) => {
            setAuth(response.data);
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            queryClient.invalidateQueries({ queryKey: ['channelProfile'] });
            toast.success( response.message || 'Avatar updated successfully!', {
                id: context?.toastId,
                duration: 3000
            });
        },

        onError: (error, _, context) => {
            const serverErrorMessage = error?.response?.data?.message || 'Failed to upload avatar';
            toast.error(serverErrorMessage, {
                id: context?.toastId,
                duration: 3000
            })
        }
    });


    const updateCoverImageMutation = useMutation<AuthResponse<User>, AxiosError<ApiErrorResponse>, FormData, ToastId>({
        mutationFn: (formData) => authService.updateCoverImage(formData),

        onMutate: () => {
            return {
                toastId: toast.loading('Uploading channel banner...', {
                    duration: 3000
                })
            }
        },

        onSuccess: (response, _, context) => {
            setAuth(response.data);
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            queryClient.invalidateQueries({ queryKey: ['channelProfile'] });
            toast.success(response.message || 'Cover banner updated successfully!', {
                id: context?.toastId,
                duration: 3000
            })
        },

        onError: (error, _, context) => {
            const serverErrorMessage = error?.response?.data?.message || 'Failed to upload cover banner';
            toast.error(serverErrorMessage, {
                id: context?.toastId,
                duration: 3000
            })
        }
    });


    return {
        // updateDetails: updateDetailsMutation.mutateAsync,
        // updateAvatar: updateAvatarMutation.mutateAsync,
        // updateCoverImage: updateCoverImageMutation.mutateAsync,

        updateDetails: updateDetailsMutation.mutate,
        updateAvatar: updateAvatarMutation.mutate,
        updateCoverImage: updateCoverImageMutation.mutate,
        
        isUpdatingDetails: updateDetailsMutation.isPending,
        isUpdatingAvatar: updateAvatarMutation.isPending,
        isUpdatingCoverImage: updateCoverImageMutation.isPending,
        
        updateDetailsError: updateDetailsMutation.error,
        updateAvatarError: updateAvatarMutation.error,
        updateCoverImageError: updateCoverImageMutation.error,

    };
};








// NOTES:
// 1. Cache Control Invalidation: 
// When a user uploads a new banner file, queryClient.invalidateQueries tells TanStack Query that the old values are stale. The second the user navigates back to their dynamic channel view, it displays the updated graphics from Cloudinary automatically without forcing a manual browser reload.

// 2. mutate Execution Control(recommended):
// TanStack Query handles the asynchronous promise internally, safely feeding results directly into your hook’s lifecycle methods (onSuccess/onError) without any risk of crashing your component UI.

// 3. mutateAsync:
// Must manually handle the asynchronous promise chain using async/await and try/catch inside the component UI, or any unhandled server error will crash your entire React application runtime.