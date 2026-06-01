import { useQuery } from '@tanstack/react-query';
import type { AuthResponse, VideoDetailsResponse, VideoIdStr } from '../types/types.ts'
import { videoService } from '../api/video.service.ts';



/** 
 * @param videoId - The explicit domain-typed identifier for the target video asset
*/

export const useVideoDetails = (videoId: VideoIdStr | undefined) => {
    
    return useQuery<AuthResponse<VideoDetailsResponse>, Error>({
        queryKey: ['video', videoId],

        queryFn: async () => {
            return videoService.getVideoById(videoId!)
        },

        enabled: !!videoId,

        staleTime: 30 * 1000,

        refetchOnWindowFocus: false
    });
};