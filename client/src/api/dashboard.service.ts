import type { AuthResponse, ChannelStatsResponse, ChannelVideosPaginatedResponse, GetVideosQueryParams } from '../types/types.ts';
import api from './api.ts'



export const dashboardService = {

    // ====== 1. Static channel-specific aggregate metrics ======
    getChannelStats: async (): Promise<ChannelStatsResponse> => {
        const response = await api.get<AuthResponse<ChannelStatsResponse>>('/dashboard/get-channel-stats');
        return response.data.data;
    },
    // ====== 1. Static channel-specific aggregate metrics ======

    // ====== 2. All videos belonging to the creator using custom paginated labels ======
    getChannelVideos: async (params?: GetVideosQueryParams): Promise<ChannelVideosPaginatedResponse> => {
        const response = await api.get<AuthResponse<ChannelVideosPaginatedResponse>>('/dashboard/get-channel-videos', { params });
        return response.data.data;
    },
    // ====== 2. All videos belonging to the creator using custom paginated labels ======
};