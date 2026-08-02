import z from 'zod'
import { objectIdSchema } from './video.validator.ts'



export const tweetBodySchema = z.object({
    content: z
        .string({ error: 'Tweet is required' })
        .trim()
        .min(1, 'Tweet must be at least 1 character')
        .max(280, 'Tweet must not exceed 280 characters')
});

export type TweetBody = z.infer<typeof tweetBodySchema>;



export const tweetParamsSchema = z.object({
    tweetId: objectIdSchema
});

export type TweetParams = z.infer<typeof tweetParamsSchema>;