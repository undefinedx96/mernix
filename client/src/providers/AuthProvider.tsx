import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '../store/authStore.ts'
import { useQuery } from '@tanstack/react-query'
import { authService } from '../api/auth.service.ts'
import { Commet } from 'react-loading-indicators'



interface Children {
    children: ReactNode;
}

export const AuthProvider = ({ children }: Children) => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const initializeGuest = useAuthStore((state) => state.initializeGuest);
    const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);

    const { data, isSuccess, isError } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity
    });

    useEffect(() => {
        if (isSuccess && data?.data) {
            setAuth(data.data);
        }
        else if (isError) {
            initializeGuest();
        }
    }, [isSuccess, isError, data, setAuth, initializeGuest]);

    if (!isAuthInitialized) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950 transition-colors duration-300'>
                <Commet color={['#6004a7', '#7d05d9', '#9717fa', '#ad49fb']} />
            </div>
        );
    }

    return <>{children}</>
};