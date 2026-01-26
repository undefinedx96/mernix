import type { NextFunction, Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler.ts'
import { ApiError } from '../utils/ApiError.ts'
import jwt from 'jsonwebtoken'
import conf from '../conf/conf.ts';
import { User } from '../models/user.model.ts'

export const verifyJWT = asyncHandler(async (req: Request, _: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '').trim();
        // console.log('Token: ', token);

        if (!token) {
            throw new ApiError(401, 'Unauthorized request');
        }

        const decodedToken = jwt.verify(token, conf.accessTokenSecret) as jwt.JwtPayload;
        // console.log('Decoded token: ', decodedToken);

        const user = await User.findById(decodedToken?._id).select('-password -refreshToken');

        if (!user) {
            throw new ApiError(401, 'Invalid access token');
        }

        req.user = user;
        next();
    }
    catch (error: any) {
        throw new ApiError(401, error?.message || 'Invalid access token');
    }
});