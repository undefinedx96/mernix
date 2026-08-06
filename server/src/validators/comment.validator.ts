import z from 'zod'
import { objectIdSchema } from './video.validator.ts'



export const commentBodySchema = z.object({
    content: z
        .string({ error: 'Comment is required' })
        .trim()
        .min(1, 'Comment must be at least 1 character')
        .max(2000, 'Comment must not exceed 2000 characters')
});

export type CommentBody = z.infer<typeof commentBodySchema>;



export const commentParamsSchema = z.object({
    commentId: objectIdSchema
});

export type CommentParams = z.infer<typeof commentParamsSchema>;