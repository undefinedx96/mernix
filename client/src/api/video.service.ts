import type { AuthResponse, GetVideosQueryParams, PaginatedResponse, PublishVideoPayload, TogglePublishStatusResponse, UpdateVideoPayload, Video, VideoDetailsResponse, VideoFeedItem, VideoIdStr } from '../types/types.ts'
import api from './api.ts'



export const videoService = {

    // ====== 1. Feed & Discovery ======
    getVideos: async (params?: GetVideosQueryParams): Promise<PaginatedResponse<VideoFeedItem>> => {
        const response = await api.get<AuthResponse<PaginatedResponse<VideoFeedItem>>>('/video/get-videos', { params });
        return response.data.data;
    },

    getVideoById: async (videoId: string): Promise<AuthResponse<VideoDetailsResponse>> => {
        const response = await api.get<AuthResponse<VideoDetailsResponse>>(`/video/get-video/${videoId}`);

        return response.data;
    },
    // ====== 1. Feed & Discovery ======


    // ====== 2. Content Creation & Management ======
    publishVideo: async ({ title, description, videoFile, thumbnail }: PublishVideoPayload): Promise<AuthResponse<Video>> => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('videoFile', videoFile);
        formData.append('thumbnail', thumbnail);

        const response = await api.post<AuthResponse<Video>>('/video/publish-video', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        return response.data;
    },

    updateVideo: async (videoId: VideoIdStr, { title, description, thumbnail }: UpdateVideoPayload): Promise<AuthResponse<Video>> => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (thumbnail) {
            formData.append('thumbnail', thumbnail);
        }

        const response = await api.patch<AuthResponse<Video>>(`/video/update-video/${videoId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        return response.data;
    },

    deleteVideo: async (videoId: VideoIdStr): Promise<AuthResponse<Record<string, never>>> => {
        const response = await api.delete<AuthResponse<Record<string, never>>>(`/video/delete-video/${videoId}`);

        return response.data;
    },

    togglePublishStatus: async (videoId: VideoIdStr): Promise<AuthResponse<TogglePublishStatusResponse>> => {
        const response = await api.patch<AuthResponse<TogglePublishStatusResponse>>(`/video/toggle-publish-status/${videoId}`);

        return response.data;
    }
    // ====== 2. Content Creation & Management ======
};