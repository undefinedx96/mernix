import type { Request } from 'express';
import multer, { type StorageEngine } from 'multer';

const storage: StorageEngine = multer.diskStorage({
    destination: function (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ) {
        cb(null, './public/temp');
    },
    filename: function (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = file.originalname.split('.').pop();
        cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
    },
});

export const upload = multer({
    storage: storage,
});