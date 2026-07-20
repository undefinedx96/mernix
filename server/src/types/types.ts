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

export type UserParams = {
    username: string;
};

export interface PublishAVideoReqBody {
    title: string;
    description: string;
}

export type VideoParams = {
    videoId: string;
};

export type CommentParams = {
    commentId: string;
};

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

export interface GetAllVideosQuery {
    page: string;
    limit: string;
    searchQuery: string;
    sortBy: string;
    sortType: 'asc' | 'desc';
    userId: string;
}

export interface CommentBody {
    content: string;
}

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

export type GetAllVideosQueryType = Partial<GetAllVideosQuery>;

export interface HealthCheckResponse {
    status: string;
    uptime: number;
    timestamp: number;
    environment: string;
}