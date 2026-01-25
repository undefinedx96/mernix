import type { CookieOptions } from 'express'

export const DB_NAME: string = 'mernix-db';

export const options: CookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000
};