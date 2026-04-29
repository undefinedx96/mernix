import { useEffect } from 'react'
import { useThemeStore } from './store/themeStore.ts'
import { Toaster } from 'react-hot-toast'
import LoginModal from './components/auth/LoginModal.tsx'
import { Outlet } from 'react-router'



const App = () => {
    
    const { isDarkMode } = useThemeStore();

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <div className='min-h-screen transition-colors duration-300 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white'>
            <Toaster position='bottom-right' />

            <LoginModal />

            <Outlet />
        </div>
    )
}

export default App