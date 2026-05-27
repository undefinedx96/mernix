import { useInfiniteQuery } from '@tanstack/react-query'
import type { PaginatedResponse, WatchHistoryVideoItem } from '../types/types.ts'
import { authService } from '../api/auth.service.ts';



export const useWatchHistory = (limit = 10) => {

    return useInfiniteQuery<PaginatedResponse<WatchHistoryVideoItem>, Error>({
        queryKey: ['watchHistory', limit],

        queryFn: ({ pageParam = 1 }) => {
            return authService.getWatchHistory(pageParam as number, limit);
        },

        initialPageParam: 1,

        getNextPageParam: (lastPage) => {
            if (lastPage.hasNextPage && lastPage.nextPage) {
                return lastPage.nextPage;
            }
            return undefined;
        },

        refetchOnWindowFocus: false,

        staleTime: 5 * 60 * 1000,
    });
};