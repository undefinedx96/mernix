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

export type TweetParams = {
    tweetId: string;
};

export type TweetUserParams = {
    userId: string;
};

export type ChannelParams = {
    channelId: string;
};

export type SubscriptionParams = {
    subscriberId: string;
};

export interface TweetBody {
    content: string;
}

export interface PlaylistBody {
    name: string;
    description: string;
}

export type PlaylistParams = {
    playlistId: string;
    videoId: string;
};

export interface ChannelStatsResponse {
    totalVideos: number;
    totalViews: number;
    subscribers: number;
    totalLikes: number;
}

export interface HealthCheckResponse {
    status: string;
    uptime: number;
    timestamp: number;
    environment: string;
}