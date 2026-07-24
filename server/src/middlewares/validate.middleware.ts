import type { NextFunction, Request, Response } from 'express'
import { ZodError, ZodType } from 'zod'
import { ApiError } from '../utils/ApiError.ts'
import fs from 'node:fs/promises'



interface ValidationSchema {
    body?: ZodType<Record<string, unknown>>;
    query?: ZodType<Record<string, string | string[] | undefined>>;
    params?: ZodType<Record<string, string>>;
    files?: ZodType<any>;
    file?: ZodType<any>;
}


export const validate = (schemas: ValidationSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) req.body = schemas.body.parse(req.body);
            if (schemas.query) req.query = schemas.query.parse(req.query);
            if (schemas.params) req.params = schemas.params.parse(req.params);
            if (schemas.file) req.file = schemas.file.parse(req.file);
            if (schemas.files) req.files = schemas.files.parse(req.files);
            
            return next();
        }
        catch (error) {
            const cleanupPromises: Promise<void>[] = [];

            if (req.file?.path) {
                cleanupPromises.push(fs.unlink(req.file.path).catch(() => {}));
            }

            if (req.files) {
                const filesMap = req.files as Record<string, Express.Multer.File[]> | undefined;

                if (filesMap) {
                    for (const fieldKey in filesMap) {
                        const fileArray = filesMap[fieldKey];
                        if (Array.isArray(fileArray)) {
                            fileArray.forEach((file) => {
                                if (file.path) {
                                    cleanupPromises.push(fs.unlink(file.path).catch(() => {}));
                                }
                            });
                        }
                    }
                }
            }

            await Promise.all(cleanupPromises);

            if (error instanceof ZodError) {
                const validationErrors = error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }));

                return next(new ApiError(400, 'Validation failed', validationErrors));
            }
            return next(error);
        }
    }
};