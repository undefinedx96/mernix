import type { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { uploadImage } from './multer.middleware.ts'
import { ApiError } from '../utils/ApiError.ts'
import fs from 'node:fs/promises'



interface FieldLimit {
    name: string;
    maxCount: number;
    maxSize: number;
}


const AVATAR_MAX = 200 * 1024;
const COVER_MAX = 200 * 1024;


const validateFieldUploadLimits = (fields: FieldLimit[]) => {
    const multerFieldsConfig = fields.map(({ name, maxCount }) => ({ name, maxCount }));

    const uploadFields = uploadImage.fields(multerFieldsConfig);

    return (req: Request, res: Response, next: NextFunction) => {
        uploadFields(req, res, async (err) => {
            if (err) {
                return next(err instanceof multer.MulterError ? new ApiError(400, err.message) : err);
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
                                    message: `${field.name.charAt(0).toUpperCase() + field.name.slice(1)} size limit exceeded. Max allowed is ${field.maxSize / 1024}KB`
                                });
                            }
                        }
                    }
                }
            }

            // if validation fails, sweep and delete the files
            if (validationErrors.length > 0) {
                const cleanupPromises: Promise<void>[] = [];

                if (filesMap) {
                    for(const fieldKey in filesMap) {
                        const fileArray = filesMap[fieldKey];
                        if (Array.isArray(fileArray)) {
                            fileArray.forEach((file) => {
                                if (file.path) {
                                    cleanupPromises.push(fs.unlink(file.path).catch(() => {}))
                                }
                            });
                        }
                    }
                }
                
                await Promise.all(cleanupPromises);
                return next(new ApiError(400, 'Validation failed', validationErrors));
            }

            next();
        });
    };
};

export const handleRegisterUploads = validateFieldUploadLimits(
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