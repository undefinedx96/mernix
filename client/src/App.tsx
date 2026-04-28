import { useEffect } from 'react'
import { useThemeStore } from './store/themeStore.ts'
import { Sun, Moon } from 'lucide-react'

function App() {
    const { isDarkMode, toggleTheme } = useThemeStore();

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <div className='min-h-screen transition-colors duration-300 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col items-center justify-center'>
            
            <h1 className='text-4xl font-bold mb-6'>
                {isDarkMode ? 'Dark' : 'Light'}{' '}Mode
            </h1>

            <button
                onClick={toggleTheme}
                className='px-3 py-3 rounded-full font-medium flex items-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition-all active:scale-95 shadow-lg cursor-pointer'
            >
                {isDarkMode ? (
                    <>
                        <Sun size={20} />
                    </>
                ) : (
                    <>
                        <Moon size={20} />
                    </>
                )}
            </button>

            <p className='mt-4 text-zinc-500 dark:text-zinc-400'>
                Learning Zustand
            </p>
        </div>
    )
}

export default App