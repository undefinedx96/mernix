import type { AuthResponse, ChangePasswordData, ChannelProfile, LoginData, UpdateAccountData, User, Video } from '../types/types.ts'
import api from './api.ts'



export const authService = {
    
    // ======= 1. Authentication & Session =======
    register: async (data: FormData): Promise<AuthResponse<User>> => {
        const response = await api.post<AuthResponse<User>>('/users/register', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    login: async (data: LoginData): Promise<AuthResponse<{ user: User }>> => {
        const response = await api.post<AuthResponse<{ user: User }>>('/users/login', data);
        return response.data;
    },

    logout: async (): Promise<AuthResponse<null>> => {
        const response = await api.post<AuthResponse<null>>('/users/logout');
        return response.data;
    },

    refreshAccessToken: async (): Promise<AuthResponse<{ accessToken: string; refreshToken: string }>> => {
        const response = await api.post<AuthResponse<{ accessToken: string; refreshToken: string }>>('/users/refresh-token');
        return response.data;
    },
    // ======= 1. Authentication & Session =======


    // ======= 2. Profile management =======
    getCurrentUser: async (): Promise<AuthResponse<User>> => {
        const response = await api.get<AuthResponse<User>>('/users/get-current-user', {
            headers: {
                'X-Skip-Auth-Modal': 'true'
            }
        });
        return response.data;
    },

    changeCurrentPassword: async (data: ChangePasswordData): Promise<AuthResponse<null>> => {
        const response = await api.post<AuthResponse<null>>('/users/change-current-password', data);
        return response.data;
    },

    updateAccountDetails: async (data: UpdateAccountData): Promise<AuthResponse<User>> => {
        const response = await api.patch<AuthResponse<User>>('/users/update-account-details', data);
        return response.data;
    },
    // ======= 2. Profile management =======


    // ======= 3. Media/Asset updates =======
    updateAvatar: async (formData: FormData): Promise<AuthResponse<User>> => {
        const response = await api.patch<AuthResponse<User>>('/users/update-user-avatar', formData, {
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        });
        return response.data;
    },

    updateCoverImage: async (formData: FormData): Promise<AuthResponse<User>> => {
        const response = await api.patch<AuthResponse<User>>('/users/update-user-cover', formData, {
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        });
        return response.data;
    },
    // ======= 3. Media/Asset updates =======


    // ======= 4. Channel & history =======
    getChannelProfile: async (username: string): Promise<AuthResponse<ChannelProfile>> => {
        const response = await api.get<AuthResponse<ChannelProfile>>(`/users/get-user-channel-profile/${username}`);
        return response.data;
    },
    
    getWatchHistory: async (): Promise<AuthResponse<Video[]>> => {
        const response = await api.get<AuthResponse<Video[]>>('users/get-watch-history');
        return response.data;
    }
    // ======= 4. Channel & history =======
};