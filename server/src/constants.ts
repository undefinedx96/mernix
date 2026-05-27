import type { CookieOptions } from 'express'

export const DB_NAME: string = 'mernix-db';

export const accessTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 15 * 60 * 1000
};

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 10 * 24 * 60 * 60 * 1000
};