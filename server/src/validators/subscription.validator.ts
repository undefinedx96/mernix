import z from 'zod'
import { objectIdSchema } from './video.validator';



export const channelParamsSchema = z.object({
    channelId: objectIdSchema
});

export type ChannelParams = z.infer<typeof channelParamsSchema>;



export const subscriptionParamsSchema = z.object({
    subscriberId: objectIdSchema
});

export type SubscriptionParams = z.infer<typeof subscriptionParamsSchema>;