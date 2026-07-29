import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/ApiError.ts'
import multer from 'multer'
import { cleanupTempFiles } from '../utils/cleanupTempFiles.ts'
import { AVATAR_MAX, COVER_MAX, THUMBNAIL_MAX, VIDEO_MAX } from './upload.middleware.ts'
import { formatBytesToReadable } from '../utils/formatBytesToReadable.ts'



const fileSizes: Record<string, number> = {
    avatar: AVATAR_MAX,
    coverImage: COVER_MAX,
    videoFile: VIDEO_MAX,
    thumbnail: THUMBNAIL_MAX,
};


const errorHandler = async (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    await cleanupTempFiles(req);

    let formattedError: ApiError;

    if (err instanceof multer.MulterError) {
        const fieldName = err.field || 'file';

        if (err.code === 'LIMIT_FILE_SIZE') {
            const maxBytes = fileSizes[fieldName] || 2000 * 1024;
            const maxAllowed = formatBytesToReadable(maxBytes);

            formattedError = new ApiError(400, 'Validation failed', [
                {
                    field: fieldName,
                    message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} size limit exceeded. Max allowed is ${maxAllowed}`
                }
            ]);
        }

        else {
            formattedError = new ApiError(400, 'Validation failed', [
                {
                    field: fieldName,
                    message: `Multiple files uploaded or unexpected field structure detected. Only permitted count allowed for field '${fieldName}' (${err.message})`
                }
            ]);
        }
    }

    else if (err instanceof Error && err.message === 'Unexpected field') {
        formattedError = new ApiError(400, 'Validation failed', [
            {
                field: 'file',
                message: 'Unexpexted field structure detected'
            }
        ]);
    }

    else if (err instanceof ApiError) {
        formattedError = err;
    }

    else {
        console.error('Unhandled Error: ', err);
        return res
        .status(500)
        .json({
            success: false,
            message: 'Internal Server Error',
        });
    }

    return res
    .status(formattedError.statusCode)
    .json({
        statusCode: formattedError.statusCode,
        success: formattedError.success,
        message: formattedError.message,
        errors: formattedError.errors,
        data: formattedError.data,
    });
};

export { errorHandler };