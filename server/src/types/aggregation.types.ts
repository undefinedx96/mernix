export interface VideoOwnerDataResponseObj {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar: string;
}

export interface VideoDetailDataResponseObj {
    _id: string;
    videoFile: string;
    videoFilePublicId: string;
    thumbnail: string;
    thumbnailPublicId: string;
    title: string;
    description: string;
    duration: number;
    views: number;
    isPublished: boolean;
    owner: VideoOwnerDataResponseObj;
    likesCount: number;
    isLiked: boolean;
    createdAt: string;
    updatedAt: string;
}