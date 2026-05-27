import type { User } from '../types/types.ts'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'



interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isAuthInitialized: boolean;
    isLoginModalOpen: boolean;
    setAuth: (user: User) => void;
    initializeGuest: () => void;
    setLoginModalOpen: (open: boolean) => void;
    logout: () => void;
}



export const useAuthStore = create<AuthState>()(
    devtools(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isAuthInitialized: false,
            isLoginModalOpen: false,
            setAuth: (user) => set(
                {
                    user,
                    isAuthenticated: true,
                    isAuthInitialized: true,
                    isLoginModalOpen: false
                },
                false,
                'setAuth'
            ),
            initializeGuest: () => set(
                {
                    user: null,
                    isAuthenticated: false,
                    isAuthInitialized: true
                },
                false,
                'initializeGuest'
            ),
            setLoginModalOpen: (open) => set(
                {
                    isLoginModalOpen: open
                },
                false,
                'setLoginModalOpen'
            ),
            logout: () => set(
                {
                    user: null,
                    isAuthenticated: false,
                    isLoginModalOpen: false
                },
                false,
                'logout'
            )
        }),
        {
            name: 'AuthStore'
        }
    )
);






// NOTE:
// 2nd param in set(): 'false' means merge this change (don't replace the whole state)
// 3rd param in set(): 'actionName' is what shows up in DevTools