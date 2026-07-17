import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiErrorResponse, AuthResponse, PublishVideoPayload, ToastId, TogglePublishStatusResponse, UpdateVideoPayload, Video, VideoIdStr } from '../types/types.ts'
import { videoService } from '../api/video.service.ts'
import type { AxiosError } from 'axios'
import toast from 'react-hot-toast'

export const usePublishVideo = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse<Video>, AxiosError<ApiErrorResponse>, PublishVideoPayload, ToastId>({
        mutationFn: (payload) => videoService.publishVideo(payload),

        onMutate: () => {
            return {
                toastId: toast.loading('Uploading and processing video asset...', {
                    duration: 3000
                })
            };
        },

        onSuccess: (response, _, context) => {
            queryClient.invalidateQueries({ queryKey: ['videos'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'videos'] });
            toast.success(response.message || 'Video published successfully!', {
                id: context?.toastId,
                duration: 3000
            });
        },
    });
};


export const useUpdateVideo = () => {

    const queryClient = useQueryClient();

    return useMutation<AuthResponse<Video>, AxiosError<ApiErrorResponse>, { videoId: VideoIdStr; payload: UpdateVideoPayload }, ToastId>({
        mutationFn: ({ videoId, payload }) => videoService.updateVideo(videoId, payload),

        onMutate: () => {
            return {
                toastId: toast.loading('Saving changes...', {
                    duration: 3000
                })
            };
        },

        onSuccess: (response, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['videos'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'videos'] });
            queryClient.invalidateQueries({ queryKey: ['video', variables.videoId] });

            toast.success(response.message || 'Video changes updated successfully!', {
                id: context?.toastId,
                duration: 3000
            });
        },

        onError: (error, _, context) => {
            const serverErrorMessage = error?.response?.data?.message || 'Failed to update video details';
            toast.error(serverErrorMessage, {
                id: context?.toastId,
                duration: 3000
            });
        }
    });
};


export const useDeleteVideo = () => {

    const queryClient = useQueryClient();

    return useMutation<AuthResponse<Record<string, never>>, AxiosError<ApiErrorResponse>, VideoIdStr, ToastId>({
        mutationFn: (videoId) => videoService.deleteVideo(videoId),

        onMutate: () => {
            return {
                toastId: toast.loading('Deleting video...', {
                    duration: 3000
                })
            };
        },

        onSuccess: (response, videoId, context) => {
            queryClient.invalidateQueries({ queryKey: ['videos'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'videos'] });
            queryClient.invalidateQueries({ queryKey: ['video', videoId] });

            toast.success(response.message || 'Video has been deleted', {
                id: context?.toastId,
                duration: 3000
            });
        },

        onError: (error, _, context) => {
            const serverErrorMessage = error?.response?.data?.message || 'Failed to delete video';
            toast.error(serverErrorMessage, {
                id: context?.toastId,
                duration: 3000
            });
        }
    });
};


export const useTogglePublish = () => {
    
    const queryClient = useQueryClient();

    return useMutation<AuthResponse<TogglePublishStatusResponse>, AxiosError<ApiErrorResponse>, VideoIdStr, ToastId>({
        mutationFn: (videoId) => videoService.togglePublishStatus(videoId),

        onMutate: () => {
            return {
                toastId: toast.loading('Updating visibility settings...', {
                    duration: 3000
                })
            };
        },

        onSuccess: (response, videoId, context) => {
            queryClient.invalidateQueries({ queryKey: ['videos'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'videos'] });
            queryClient.invalidateQueries({ queryKey: ['video', videoId] });

            toast.success(response.message || 'Visibility toggled successfully!', {
                id: context?.toastId,
                duration: 3000
            });
        },

        onError: (error, _, context) => {
            const serverErrorMessage = error?.response?.data?.message || 'Failed to toggle visibility status';
            toast.error(serverErrorMessage, {
                id: context?.toastId,
                duration: 3000
            })
        }
    });
};
