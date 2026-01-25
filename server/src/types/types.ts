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

export interface LoginReqBody {
    userIdentity?: string;
    email?: string;
    username?: string;
    password: string;
}