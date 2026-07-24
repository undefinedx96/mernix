import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/ApiError.ts'
import multer from 'multer'



const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let formattedError: ApiError;

    if (err instanceof multer.MulterError) {
        const fieldName = err.field || 'file';

        if (err.code === 'LIMIT_FILE_SIZE') {
            formattedError = new ApiError(400, 'Validation failed', [
                {
                    field: fieldName,
                    message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} size limit exceeded.`
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