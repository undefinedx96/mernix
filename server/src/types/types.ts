export interface Config {
    port: number;
    mongoDBUri: string;
    corsOrigin: string;
    accessTokenSecret: string;
    accessTokenExpiry: string;
    refreshTokenSecret: string;
    refreshTokenExpiry: string;
    bcryptSaltRounds: number;
    cloudinaryCloudName: string;
    cloudinaryApiKey: string;
    cloudinaryApiSecret: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface HealthCheckStatus {
    database: 'HEALTHY' | 'UNHEALTHY';
}

export interface HealthCheckResponse {
    status: string;
    uptime: number;
    timestamp: number;
    environment: string;
    services: HealthCheckStatus;
}