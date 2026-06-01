import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AuthResponse, PublishVideoPayload, TogglePublishStatusResponse, UpdateVideoPayload, Video, VideoIdStr } from '../types/types'
import { videoService } from '../api/video.service'



export const usePublishVideo = () => {

    const queryClient = useQueryClient();

    return useMutation<AuthResponse<Video>, Error, PublishVideoPayload>({
        mutationFn: (payload) => videoService.publishVideo(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['videos'] });
        },
    });
};


export const useUpdateVideo = () => {

    const queryClient = useQueryClient();

    return useMutation<AuthResponse<Video>, Error, { videoId: VideoIdStr; payload: UpdateVideoPayload }>({
        mutationFn: ({ videoId, payload }) => videoService.updateVideo(videoId, payload),

        onSuccess: (response) => {
            const updatedVideo = response.data;

            queryClient.invalidateQueries({ queryKey: ['videos'] });
            queryClient.invalidateQueries({ queryKey: ['video', updatedVideo._id] });
        },
    });
};


export const useDeleteVideo = () => {

    const queryClient = useQueryClient();

    return useMutation<AuthResponse<Record<string, never>>, Error, VideoIdStr>({
        mutationFn: (videoId) => videoService.deleteVideo(videoId),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['videos'] });
        },
    });
};


export const useTogglePublish = () => {
    
    const queryClient = useQueryClient();

    return useMutation<AuthResponse<TogglePublishStatusResponse>, Error, VideoIdStr>({
        mutationFn: (videoId) => videoService.togglePublishStatus(videoId),

        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['videos'] });
            queryClient.invalidateQueries({ queryKey: ['video', response.data.videoId] });
        },
    });
};