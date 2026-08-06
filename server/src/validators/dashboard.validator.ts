import z from 'zod'



export const channelStatsResponseSchema = z.object({
    totalVideos: z
        .number()
        .min(0, 'Total videos count must be non-negative'),
    totalViews: z
        .number()
        .min(0, 'Total views count must be non-negative'),
    subscribers: z
        .number()
        .min(0, 'Total subscribers count must be non-negative'),
    totalLikes: z
        .number()
        .min(0, 'Total likes count must be non-negative'),
});

export type ChannelStatsResponse = z.infer<typeof channelStatsResponseSchema>;