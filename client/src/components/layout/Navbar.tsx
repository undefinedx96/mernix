import { Menu, Search, Video, Bell, UserCircle, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '../../store/authStore.ts'
import { useThemeStore } from '../../store/themeStore.ts'
import { Link } from 'react-router'



interface NavbarProps {
	onMenuClick: () => void;
}



const Navbar = ({ onMenuClick }: NavbarProps) => {

	const { isAuthenticated, user, setLoginModalOpen } = useAuthStore();
	const { isDarkMode, toggleTheme } = useThemeStore();

	return (
		<nav className='h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 sticky top-0 z-50'>

			{/* Left: Brand */}
			<div className='flex items-center gap-4'>
				<button
					onClick={onMenuClick}
					className='p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors cursor-pointer'
				>
					<Menu size={22} />
				</button>
				<Link to='/' className='group'>
					<div className='flex items-center gap-1 font-bold text-xl tracking-tight'>
						<div className='bg-purple-600 p-1.5 rounded-lg group-hover:-rotate-16 transition-all ease-in-out'>
							<Video size={18} className='text-white' />
						</div>
						<span className='text-zinc-900 dark:text-zinc-300'>
							Mer<span className='text-purple-600'>nix</span>
						</span>
					</div>
				</Link>
			</div>

			{/* Center: Search */}
			<div className='hidden md:flex flex-1 max-w-xl mx-8'>
				<div className='relative w-full'>
					<input
						type='text'
						placeholder='Search videos...'
						className='w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-purple-600/50 rounded-full py-2 px-10 outline-none transition-all'
					/>
					<Search
						className='absolute left-3 top-2.5 text-zinc-400'
						size={18}
					/>
				</div>
			</div>

			{/* Right: Actions */}
			<div className='flex items-center gap-2 sm:gap-4'>
				<button
					onClick={toggleTheme}
					className='flex items-center gap-2 text-purple-700 dark:text-yellow-400 border border-purple-600/30 hover:bg-purple-600/10 px-1.5 py-1.5 rounded-full font-semibold transition-all active:scale-95 cursor-pointer'
					title={
						isDarkMode
							? 'Switch to Light Mode'
							: 'Switch to Dark Mode'
					}
				>
					{isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
				</button>

				{isAuthenticated ? (
					<div className='flex items-center gap-2'>
						<button className='p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full cursor-pointer'>
							<Bell size={20} />
						</button>
						<img
							src={
								user?.avatar ||
								`https://ui-avatars.com/api/?name=${user?.username}`
							}
							className='w-9 h-9 rounded-full border-2 border-purple-500 shadow-sm object-cover cursor-pointer hover:opacity-80 transition-opacity'
							alt='profile'
						/>
					</div>
				) : (
					<button
						onClick={() => setLoginModalOpen(true)}
						className='flex items-center gap-2 text-purple-600 border border-purple-600/30 hover:bg-purple-600/10 px-4 py-1.5 rounded-full font-semibold transition-all active:scale-95 cursor-pointer whitespace-nowrap'
					>
						<UserCircle size={20} />
						<span className='hidden sm:block'>Sign In</span>
					</button>
				)}
			</div>
            
		</nav>
	)
}

export default Navbar