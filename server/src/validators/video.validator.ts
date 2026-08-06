import z from 'zod';
import { isValidObjectId } from 'mongoose';
import { createSingleFileSchema, multerFileSchema } from './auth.validator.ts'



export const objectIdSchema = z
    .string({ error: 'ID parameter is required' })
    .trim()
    .refine((val) => isValidObjectId(val), {
        error: 'Invalid or missing ObjectId'
    });



export const publishVideoReqBodySchema = z.object({
    title: z
        .string({ error: 'Title is required' })
        .trim()
        .min(3, 'Title must be at least 3 characters long')
        .max(150, 'Title must not exceed 150 characters'),
    description: z
        .string({ error: 'Description is required' })
        .trim()
        .min(5, 'Description must be at least 5 characters long')
        .max(2000, 'Description must not exceed 2000 characters')
});

export type PublishAVideoReqBody = z.infer<typeof publishVideoReqBodySchema>;



export const publishVideoFilesSchema = z.object({
    videoFile: z
        .array(multerFileSchema)
        .min(1, 'Video file upload is required')
        .max(1, 'You can only upload 1 video file'),
    thumbnail: z
        .array(multerFileSchema)
        .min(1, 'Thumbnail image upload is required')
        .max(1, 'You can only upload 1 thumbnail image')
});

export type PublishVideoFiles = z.infer<typeof publishVideoFilesSchema>;



export const updateVideoReqBodySchema = publishVideoReqBodySchema.pick({
    title: true,
    description: true
});

export type UpdateVideoReqBody = z.infer<typeof updateVideoReqBodySchema>;



export const singleThumbnailUpdateSchema = createSingleFileSchema('thumbnail', true);

export type SingleThumbnailReqFile = z.infer<typeof singleThumbnailUpdateSchema>;



export const videoIdParamSchema = z.object({
    videoId: objectIdSchema
});

export type VideoParams = z.infer<typeof videoIdParamSchema>;



export const getAllVideosQuerySchema = z.object({
    page: z
        .string()
        .default('1')
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            error: 'Page must be a positive integer'
        }),
    limit: z
        .string()
        .default('10')
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100, {
            error: 'Limit must be between 1 and 100'
        }),
    searchQuery: z
        .string()
        .trim(),
    sortBy: z
        .string()
        .trim()
        .default('createdAt'),
    sortType: z
        .enum(['asc', 'desc'])
        .default('desc'),
    userId: z
        .string()
        .trim()
        .refine((val) => !val || isValidObjectId(val), {
            error: 'Invalid user ID'
        })
}).partial();

export type GetAllVideosQueryType = z.infer<typeof getAllVideosQuerySchema>;