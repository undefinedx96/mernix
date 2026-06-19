import rateLimit, { type Options, type RateLimitRequestHandler } from 'express-rate-limit'
import { ApiError } from '../utils/ApiError.ts'
import type { NextFunction, Request, Response } from 'express'

export const limiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req: Request, res: Response, next: NextFunction, options: Options) => {
        next(new ApiError(options.statusCode, options.message))
    },
});