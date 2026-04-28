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
}