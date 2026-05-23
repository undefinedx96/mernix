import { useParams } from 'react-router'
import { useAuthStore } from '../store/authStore.ts'
import { useQuery } from '@tanstack/react-query'
import { authService } from '../api/auth.service.ts'


type UserParams = {
    username: string;
}

export const useChannelProfile = () => {

    const { username } = useParams<UserParams>();
    const currentUser = useAuthStore((state) => state.user);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['channelProfile', username],
        queryFn: () => authService.getChannelProfile(username!),
        enabled: !!username,
        staleTime: 1000 * 60 * 5,
        retry: false
    });

    const isOwner = currentUser?.username?.toLowerCase() === username?.toLowerCase();

    return {
        channel: data?.data || null,
        isLoading,
        isError,
        error,
        isOwner,
        username
    };
};