import { useInfiniteQuery } from '@tanstack/react-query'
import type { GetVideosQueryParams, PaginatedResponse, VideoFeedItem } from '../types/types.ts'
import { videoService } from '../api/video.service.ts'



/**
 * @param filters - Dynamic parameters matching `GetVideosQueryParams`
*/

export const useGetVideos = (filters: GetVideosQueryParams = {}) => {
    
    const { searchQuery, userId, sortBy, sortType, limit = 12 } = filters;

    return useInfiniteQuery<PaginatedResponse<VideoFeedItem>, Error>({
        queryKey: ['videos', { searchQuery, userId, sortBy, sortType, limit }],

        queryFn: async ({ pageParam = 1 }) => {
            return videoService.getVideos({
                ...filters,
                page: pageParam as number,
                limit,
            });
        },

        initialPageParam: 1,

        getNextPageParam: (lastPage) => {
            if (lastPage.hasNextPage && lastPage.nextPage) {
                return lastPage.nextPage;
            }

            return undefined;
        },

        placeholderData: (previousData) => previousData,

        staleTime: 2 * 60 * 1000
    });
};