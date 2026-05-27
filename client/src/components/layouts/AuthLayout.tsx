import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuthStore } from '../../store/authStore'
import { Commet } from 'react-loading-indicators';


interface AuthLayoutProps {
    children: ReactNode;
    authentication: boolean;
}

const AuthLayout = ({ children, authentication = true }: AuthLayoutProps) => {

    const { isAuthenticated, isAuthInitialized } = useAuthStore();
    const location = useLocation();

    if (!isAuthInitialized) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950 transition-colors duration-300'>
                <Commet color={['#6004a7', '#7d05d9', '#9717fa', '#ad49fb']} />
            </div>
        );
    }
    
    if (authentication && !isAuthenticated) {
        return <Navigate to='/login' state={{ from: location }} replace />
    }
    else if (!authentication && isAuthenticated) {
        return <Navigate to='/' replace />
    }

  return <>{children}</>;
}

export default AuthLayout