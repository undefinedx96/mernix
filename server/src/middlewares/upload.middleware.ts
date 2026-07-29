import type { Request, Response, NextFunction } from 'express'
import { uploadImage, uploadVideo } from './multer.middleware.ts'
import { ApiError } from '../utils/ApiError.ts'
import { cleanupTempFiles } from '../utils/cleanupTempFiles.ts'
import { formatBytesToReadable } from '../utils/formatBytesToReadable.ts'



interface FieldLimit {
    name: string;
    maxCount: number;
    maxSize: number;
}


export const AVATAR_MAX = 200 * 1024;
export const COVER_MAX = 200 * 1024;

export const THUMBNAIL_MAX = 200 * 1024;
export const VIDEO_MAX = 5 * 1024 * 1024;


const validateFieldUploadLimits = (
    multerInstance: typeof uploadImage | typeof uploadVideo,
    fields: FieldLimit[]
) => {
    const multerFieldsConfig = fields.map(({ name, maxCount }) => ({ name, maxCount }));

    const uploadFields = multerInstance.fields(multerFieldsConfig);

    return (req: Request, res: Response, next: NextFunction) => {
        uploadFields(req, res, async (err) => {
            if (err) {
                return next(err);
            }

            const filesMap = req.files as Record<string, Express.Multer.File[]> | undefined;

            const validationErrors: { field: string; message: string }[] = [];

            if (filesMap) {
                for (const field of fields) {
                    const uploadedFiles = filesMap[field.name];

                    if (Array.isArray(uploadedFiles)) {
                        for (const file of uploadedFiles) {
                            if (file.size > field.maxSize) {
                                validationErrors.push({
                                    field: field.name,
                                    message: `${field.name.charAt(0).toUpperCase() + field.name.slice(1)} size limit exceeded. Max allowed is ${formatBytesToReadable(field.maxSize)}`
                                });
                            }
                        }
                    }
                }
            }

            // if validation fails, sweep and delete the files
            if (validationErrors.length > 0) {
                await cleanupTempFiles(req);
                return next(new ApiError(400, 'Validation failed', validationErrors));
            }

            next();
        });
    };
};

export const handleRegisterUploads = validateFieldUploadLimits(
    uploadImage,
    [
        {
            name: 'avatar',
            maxCount: 1,
            maxSize: AVATAR_MAX
        },
        {
            name: 'coverImage',
            maxCount: 1,
            maxSize: COVER_MAX
        }
    ]
);

export const handlePublishVideoUploads = validateFieldUploadLimits(
    uploadVideo,
    [
        {
            name: 'videoFile',
            maxCount: 1,
            maxSize: VIDEO_MAX
        },
        {
            name: 'thumbnail',
            maxCount: 1,
            maxSize: THUMBNAIL_MAX
        }
    ]
);