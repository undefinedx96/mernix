export interface Config {
    baseUrl: string;
}

export interface User {
    _id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    coverImage?: string;
    watchHistory: string[];
    createdAt: string;
    updatedAt: string;
    password?: string;
}

export interface Video {
    _id: string;
    videoFile: string;
    thumbnail: string;
    title: string;
    description: string;
    duration: number;
    views: number;
    isPublished: boolean;
    owner: string | User; 
    createdAt: string;
    updatedAt: string;
}

export interface ConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	isPending?: boolean;
}

export interface AuthResponse<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}

export interface ValidationError {
    field?: string;
    message: string;
}

export interface ApiErrorResponse {
    statusCode: number;
    success: boolean;
    message: string;
    errors: ValidationError[];
    data: null;
}

export interface ToastId {
    toastId: string;
}

export interface PaginatedResponse<T> {
    docs: T[],
    totalDocs: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
    message?: string;
}

export interface GetVideosQueryParams {
    page?: number;
    limit?: number;
    searchQuery?: string;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
    userId?: string;
}

export interface PublishVideoPayload {
    title: string;
    description: string;
    videoFile: File;
    thumbnail: File;
}

export interface UpdateVideoPayload {
    title: string;
    description: string;
    thumbnail?: File;
}

export interface TogglePublishStatusResponse {
    videoId: string;
    isPublished: boolean;
}

export type VideoIdStr = string;

// ========= Utility based types =========

export type LoginData = Pick<User, 'password'> & {
    userIdentity?: string;
    email?: string;
    username?: string;
}

export type UpdateAccountData = Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>;

export interface ChangePasswordData {
    oldPassword: string;
    newPassword: string;
}

export interface ChannelProfile extends Pick<User, '_id' | 'firstName' | 'lastName' | 'username' | 'email' | 'avatar' | 'coverImage' | 'createdAt'> {
    subscribersCount: number;
    channelsSubscribedToCount: number;
    isSubscribed: boolean;
}

export type RegisterData = Pick<Required<User>, 'username' | 'email' | 'firstName' | 'lastName' | 'password'> & {
    avatar: FileList;
    coverImage?: FileList;
};

export type WatchHistoryVideoOwner = Pick<User, '_id' | 'firstName' | 'lastName' | 'username' | 'avatar'>;

export interface WatchHistoryVideoItem extends Omit<Video, 'owner'> {
    owner: WatchHistoryVideoOwner;
}

export type VideoOwnerDetails = Pick<User, '_id' | 'firstName' | 'lastName' | 'username' | 'avatar'>;

export interface VideoFeedItem extends Omit<Video, 'owner'> {
    owner: VideoOwnerDetails;
}

export interface VideoDetailsResponse extends Omit<Video, 'owner'> {
    owner: VideoOwnerDetails;
    likesCount: boolean;
    isLiked: boolean;
}

// ========= Utility based types =========