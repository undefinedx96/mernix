import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.ts';

const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof ApiError) {
        // console.error('API Error Stack: ', err.stack);

        return res
        .status(err.statusCode)
        .json({
            statusCode: err.statusCode,
            success: err.success,
            message: err.message,
            errors: err.errors,
            data: err.data,
        });
    }

    console.error('Unhandled Error: ', err);

    return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
    });
};

export { errorHandler };