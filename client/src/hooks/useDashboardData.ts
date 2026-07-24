import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../api/dashboard.service.ts'
import type { ChannelStatsResponse, ChannelVideosPaginatedResponse } from '../types/types.ts'



export const useDashboardStats = () => {
    return useQuery<ChannelStatsResponse, Error>({
        queryKey: ['dashboard', 'stats'],
        queryFn: async () => {
            return await dashboardService.getChannelStats();
        },
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
    });
};


/**
 * @param page - Current page index matching backend controllers
 * @param limit - Max row limit count inside our Tanstack table setup
 */

export const useDashboardVideos = (page = 1, limit = 10) => {
    return useQuery<ChannelVideosPaginatedResponse, Error>({
        queryKey: ['dashboard', 'videos', { page, limit }],
        queryFn: async () => {
            return await dashboardService.getChannelVideos({ page, limit })
        },
        placeholderData: (previousData) => previousData,
        staleTime: 2 * 60 * 1000
    });
};