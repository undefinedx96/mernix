import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuthStore } from '../../store/authStore'


interface AuthLayoutProps {
    children: ReactNode;
    authentication: boolean;
}

const AuthLayout = ({ children, authentication = true }: AuthLayoutProps) => {

    const { isAuthenticated } = useAuthStore();
    const location = useLocation();
    
    if (authentication && !isAuthenticated) {
        return <Navigate to='/login' state={{ from: location }} replace />
    }
    else if (!authentication && isAuthenticated) {
        return <Navigate to='/' replace />
    }

  return <>{children}</>;
}

export default AuthLayout