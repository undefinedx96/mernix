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

// ========= Utility based types =========