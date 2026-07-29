import fs from 'node:fs/promises'
import type { Request } from 'express'


/**
 * @function `cleanupTempFiles` - Cleans up the temporary files from `/public/temp` when uploading files
 * @param req 
 */

const cleanupTempFiles = async (req: Request): Promise<void> => {
    const cleanupPromises: Promise<void>[] = [];

    if (req.file?.path) {
        cleanupPromises.push(fs.unlink(req.file.path).catch(() => {}));
    }

    if (req.files) {
        if (Array.isArray(req.files)) {
            req.files.forEach((file) => {
                if (file.path) cleanupPromises.push(fs.unlink(file.path).catch(() => {}));
            });
        }
        else if (typeof req.files === 'object') {
            const filesMap = req.files as Record<string, Express.Multer.File[]>;

            for (const fieldKey in filesMap) {
                const fileArray = filesMap[fieldKey];
                if (Array.isArray(fileArray)) {
                    fileArray.forEach((file) => {
                        if (file.path) cleanupPromises.push(fs.unlink(file.path).catch(() => {}));
                    });
                }
            }
        }
    }

    await Promise.all(cleanupPromises);
};

export { cleanupTempFiles };