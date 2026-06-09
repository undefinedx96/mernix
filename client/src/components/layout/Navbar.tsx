import { Menu, Search, Video, Bell, UserCircle, Sun, Moon, LogOut, User, Settings, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../../store/authStore.ts'
import { useThemeStore } from '../../store/themeStore.ts'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { useState, useRef, useEffect, type SubmitEvent } from 'react'
import { cn } from '../../utils/cn.ts'
import { useLogout } from '../../hooks/useLogout.ts'
import ConfirmationModal from '../common/ConfirmationModal.tsx'



interface NavbarProps {
	onMenuClick: () => void;
}


const Navbar = ({ onMenuClick }: NavbarProps) => {

	const { isAuthenticated, user, setLoginModalOpen } = useAuthStore();
	const { isDarkMode, toggleTheme } = useThemeStore();

	const { mutate: performLogout, isPending: isLoggingOut } = useLogout();

	const [searchParams] = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

	const dropdownRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const location = useLocation();
	const isMobileSearching = location.hash === '#searching';

	// close the dropdown if the user clicks anywhere outside of it
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		if (isDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isDropdownOpen]);

	const handleSearch = (e: SubmitEvent) => {
		e.preventDefault();
		
		const trimmedQuery = searchQuery?.trim();
		if (trimmedQuery) {
			navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
		}
		else {
			navigate('/');
		}
	};

	const handleLogoutConfirm = () => {
		performLogout(undefined, {
			onSuccess: () => {
				setIsLogoutModalOpen(false);
				navigate('/', { replace: true });
			},
		});
	};

	if (isMobileSearching) {
		return (
			<nav className='h-16 bg-white dark:bg-zinc-950 flex items-center px-4 sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-900 gap-2 duration-150'>
				<button
					onClick={() => navigate(-1)}
					className='p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full text-zinc-800 dark:text-zinc-200 cursor-pointer shrink-0'
					title='Back to browsing'
				>
					<ArrowLeft size={22} />
				</button>

				<form onSubmit={handleSearch} className='relative flex-1'>
					<input 
						key={searchParams.get('q') || 'mobile-empty'}
						type='search'
						autoFocus
						title='Search videos...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder='Search videos...'
						className='w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-purple-600/50 rounded-full py-2 px-10 outline-none text-zinc-900 dark:text-zinc-100 transition-all text-sm'
					/>
					<Search className='absolute left-3 top-2.5 text-zinc-400' size={18} />
				</form>
			</nav>
		);
	}

	return (
		<>
			<nav className='h-16 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-900'>
				{/* left: brand */}
				<div className='flex items-center gap-4'>
					<button
						onClick={onMenuClick}
						className='p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors cursor-pointer text-zinc-800 dark:text-zinc-200'
					>
						<Menu size={22} />
					</button>
					<Link to='/' className='group'>
						<div className='flex items-center gap-1 font-bold text-xl tracking-tight'>
							<div className='bg-purple-600 p-1.5 rounded-lg group-hover:-rotate-6 transition-all ease-in-out'>
								<Video size={18} className='text-white' />
							</div>
							<span className='text-zinc-900 dark:text-zinc-100'>
								Mer<span className='text-purple-600'>nix</span>
							</span>
						</div>
					</Link>
				</div>

				{/* center: search (hidden below 768px) */}
				<div className='hidden md:flex flex-1 max-w-xl mx-8'>
					<form onSubmit={handleSearch} className='relative w-full'>
						<input
							key={searchParams.get('q') || 'empty'}
							type='search'
							title='Search videos...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder='Search videos...'
							className='w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-purple-600/50 rounded-full py-2 px-10 outline-none text-zinc-900 dark:text-zinc-100 transition-all text-sm'
						/>
						<Search className='absolute left-3 top-2.5 text-zinc-400' size={18} />
					</form>
				</div>

				{/* right: actions */}
				<div className='flex items-center gap-2 sm:gap-4 relative' ref={dropdownRef}>
					<button
						onClick={() => navigate('#searching')}
						className='flex md:hidden items-center gap-2 text-purple-600 border border-purple-600/30 hover:bg-purple-600/10 dark:border-zinc-800 p-2 rounded-full font-semibold transition-all active:scale-95 cursor-pointer'
						title='Open search bar'
					>
						<Search size={20} />
					</button>

					<button
						onClick={toggleTheme}
						className='flex items-center gap-2 text-purple-700 dark:text-yellow-400 border border-purple-600/20 hover:bg-purple-600/10 dark:border-zinc-800 p-2 rounded-full font-semibold transition-all active:scale-95 cursor-pointer'
						title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
					>
						{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
					</button>

					{isAuthenticated ? (
						<div className='flex items-center gap-3'>
							<button className='p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full text-zinc-700 dark:text-zinc-300 cursor-pointer hidden sm:block'>
								<Bell size={20} />
							</button>

							{/* profile action avatar trigger */}
							<div className='relative'>
								<button
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
									className='block focus:outline-none relative rounded-full border-2 border-purple-500 shadow-sm active:scale-95 transition-transform'
									title={`${user?.firstName} ${user?.lastName}`}
								>
									<img
										src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}`}
										className='size-9 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity'
										alt={user?.avatar || 'avatar'}
									/>
								</button>

								{/* dropdown card */}
								<div
									className={cn('absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all duration-200 transform origin-top-right z-50 overflow-hidden',
										isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
									)}
								>
									{/* user info header */}
									<div className='p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-950/20'>
										<img
											src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}`}
											className='size-11 rounded-full object-cover border border-purple-500/30'
											alt='profile expanded'
										/>
										<div className='flex flex-col min-w-0'>
											<p
												className='text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate'
												title={`${user?.firstName} ${user?.lastName}`}
											>
												{user?.firstName}{' '}{user?.lastName}
											</p>
											<Link
												to={`/c/${user?.username}`} className='text-xs text-zinc-500 dark:text-zinc-400 truncate hover:text-purple-600 dark:hover:text-purple-500'
												title={user?.username}
											>
												{user?.username}
											</Link>
										</div>
									</div>

									{/* options list */}
									<div className='p-1.5 space-y-0.5'>
										<Link
											to={`/c/${user?.username || ''}`}
											onClick={() => setIsDropdownOpen(false)}
											className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors group'
											title={`Your Channel: ${user?.username}`}
										>
											<User
												size={18}
												className='text-zinc-400 group-hover:text-purple-500 transition-colors'
											/>
											<span>Your Channel</span>
										</Link>

										<Link
											to='/settings'
											onClick={() => setIsDropdownOpen(false)}
											className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors group'
											title='Settings'
										>
											<Settings
												size={18}
												className='text-zinc-400 group-hover:text-purple-500 transition-colors'
											/>
											<span>Settings</span>
										</Link>
									</div>

									{/* logout action */}
									<div className='p-1.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/10'>
										<button
											onClick={() => {
												setIsDropdownOpen(false);
												setIsLogoutModalOpen(true);
											}}
											className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer group'
											title='Sign Out'
										>
											<LogOut
												size={18}
												className='text-red-500 group-hover:translate-x-0.5 transition-transform'
											/>
											<span>Sign Out</span>
										</button>
									</div>
								</div>
							</div>
						</div>
					) : (
						<button
							onClick={() => setLoginModalOpen(true)}
							className='flex items-center gap-2 text-purple-600 border border-purple-600/30 hover:bg-purple-600/10 px-4 py-1.5 rounded-full font-semibold transition-all active:scale-95 cursor-pointer whitespace-nowrap text-sm'
						>
							<UserCircle size={20} />
							<span className='hidden sm:block'>Sign In</span>
						</button>
					)}
				</div>
			</nav>

			<ConfirmationModal
				isOpen={isLogoutModalOpen}
				onClose={() => setIsLogoutModalOpen(false)}
				onConfirm={handleLogoutConfirm}
				isPending={isLoggingOut}
				title='Sign Out of Mernix'
				description='Are you sure you want to log out? You will need to sign back in to access your subscriptions, liked videos, and history content metrics.'
				confirmText='Sign Out'
			/>
		</>
	)
}

export default Navbar