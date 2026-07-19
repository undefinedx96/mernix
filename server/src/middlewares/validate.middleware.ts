import type { NextFunction, Request, Response } from 'express'
import { ZodError, ZodType } from 'zod'
import { ApiError } from '../utils/ApiError';



export const validate = (schemas: ZodType | { body?: ZodType, files?: ZodType }) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if ('body' in schemas || 'files' in schemas) {
                const config = schemas as { body?: ZodType, files?: ZodType };

                if (config.body) config.body.parse(req.body);
                if (config.files) config.files.parse(req.files);
            }
            else {
                const dataToValidate = req.method === 'GET' ? (req.query || {}) : req.body;
                (schemas as ZodType).parse(dataToValidate);
            }
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const validationErrors = error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }));

                return next(new ApiError(400, 'Validation failed', validationErrors));
            }
            next(error);
        }
    }
};