import z from 'zod'
import { objectIdSchema } from './video.validator';



export const playlistBodySchema = z.object({
    name: z
        .string({ error: 'Playlist name is required' })
        .trim()
        .min(3, 'Playlist name must be at least 3 characters long')
        .max(150, 'Playlist name must not exceed 150 characters'),
    description: z
        .string({ error: 'Playlist description is required' })
        .trim()
        .min(5, 'Playlist description must be at least 5 characters long')
        .max(2000, 'Playlist description must not exceed 2000 characters')
});

export type PlaylistBody = z.infer<typeof playlistBodySchema>;



export const playlistParamsSchema = z.object({
    playlistId: objectIdSchema,
    videoId: objectIdSchema.optional()
});

export type PlaylistParams = z.infer<typeof playlistParamsSchema>;