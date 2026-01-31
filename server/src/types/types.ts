export interface Config {
    port: number,
    mongoDBUri: string,
    corsOrigin: string,
    accessTokenSecret: string,
    accessTokenExpiry: string,
    refreshTokenSecret: string,
    refreshTokenExpiry: string,
    cloudinaryCloudName: string,
    cloudinaryApiKey: string,
    cloudinaryApiSecret: string,
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface RegisterReqBody {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
}

export interface LoginReqBody {
    userIdentity?: string;
    email?: string;
    username?: string;
    password: string;
}

export interface ChangeCurrentPasswordBody {
    oldPassword: string;
    newPassword: string;
}

export interface UpdateAccountDetailsBody {
    firstName: string;
    lastName: string;
    email: string;
}

export type UserParams = {
    username: string;
}

export interface PublishAVideoReqBody {
    title: string;
    description: string
}