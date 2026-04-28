import type { User } from '../types/types.ts'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'



interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    setAccessToken: (token: string) => void;
    logout: () => void;
}



export const useAuthStore = create<AuthState>()(
    devtools(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            setAuth: (user, token) => set(
                {
                    user,
                    accessToken: token,
                    isAuthenticated: true
                },
                false,
                'setAuth'
            ),
            setAccessToken: (token) => set(
                {
                    accessToken: token,
                    isAuthenticated: true
                },
                false,
                'setAccessToken'
            ),
            logout: () => set(
                {
                    user: null,
                    accessToken: null,
                    isAuthenticated: false
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