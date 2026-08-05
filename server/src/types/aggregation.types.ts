import type { IUser } from '../models/user.model.ts';
import type { IVideo } from '../models/video.model.ts';

interface BaseResponse {
    _id: string;
}

export interface VideoOwnerDataResponseObj extends BaseResponse, Pick<IUser, 'firstName' | 'lastName' | 'username' | 'avatar'> {}

export interface BaseVideoDetailObj extends BaseResponse, Omit<IVideo, '_id' | 'owner'> {
    owner: VideoOwnerDataResponseObj;
}

export interface WatchHistoryVideoDataResponseObj extends  BaseVideoDetailObj {}

export interface VideoDetailDataResponseObj extends BaseVideoDetailObj {
    likesCount: number;
    isLiked: boolean;
}

export interface ChannelProfileDataResponseObj extends BaseResponse, Pick<IUser, 'firstName' | 'lastName' | 'username' | 'email' | 'avatar' | 'coverImage' | 'createdAt'> {
    subscribersCount: number;
    channelsSubscribedToCount: number;
    isSubscribed: boolean;
}

export interface UserPlaylistSummary {
    _id: string;
    name: string;
    description: string;
    videoCount: number;
    thumbnailVideo: string;
    updatedAt: Date;
}