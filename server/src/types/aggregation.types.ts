import type { IUser } from '../models/user.model.ts';
import type { IVideo } from '../models/video.model.ts';

interface BaseResponse {
    _id: string;
}

export interface VideoOwnerDataResponseObj extends BaseResponse, Pick<IUser, 'firstName' | 'lastName' | 'username' | 'avatar'> {}

export interface VideoDetailDataResponseObj extends BaseResponse, Omit<IVideo, '_id' | 'owner'> {
    // _id: string;
    // videoFile: string;
    // videoFilePublicId: string;
    // thumbnail: string;
    // thumbnailPublicId: string;
    // title: string;
    // description: string;
    // duration: number;
    // views: number;
    // isPublished: boolean;
    owner: VideoOwnerDataResponseObj;
    likesCount: number;
    isLiked: boolean;
    // createdAt: string;
    // updatedAt: string;
}

export interface ChannelProfileDataResponseObj extends BaseResponse, Pick<IUser, 'firstName' | 'lastName' | 'username' | 'email' | 'avatar' | 'coverImage' | 'createdAt'> {
    // firstName: string;
    // lastName: string;
    // username: string;
    // email: string;
    // avatar: string;
    // coverImage: string;
    subscribersCount: number;
    channelsSubscribedToCount: number;
    isSubscribed: boolean;
}

export interface WatchHistoryVideoDataResponseObj extends VideoDetailDataResponseObj {}
// {
//     _id: string;
//     videoFile: string;
//     thumbnail: string;
//     title: string;
//     description: string;
//     duration: number;
//     views: number;
//     createdAt: string;
//     updatedAt: string;
//     owner: VideoOwnerDataResponseObj;
// }

export interface PaginatedPlaylistResponse {
    playlistArr: VideoDetailDataResponseObj[];
    totalVideos: number;
    limit: number;
    page: number;
    totalPages: number;
    pagingCounter: number;
    hasPrevPage: number;
    hasNextPage: number;
    prevPage: number | null;
    nextPage: number | null;
}

export interface UserPlaylistSummary {
    _id: string;
    name: string;
    description: string;
    videoCount: number;
    thumbnailVideo: string;
    updatedAt: Date;
}

export interface PaginatedPlaylistsResponse {
    playlistsArr: UserPlaylistSummary[];
    totalPlaylists: number;
    limit: number;
    page: number;
    totalPages: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
}