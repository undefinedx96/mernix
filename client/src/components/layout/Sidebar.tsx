import { NavLink } from 'react-router'
import {Home, PlaySquare, History, MenuSquare, UserSquare, ThumbsUp, Flame, Gamepad2, Trophy, type LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn.ts'
import { useAuthStore } from '../../store/authStore.ts'
import { type MouseEvent } from 'react'



interface SidebarItemType {
	name: string;
	icon: LucideIcon;
	slug: string;
}

interface MenuGroup {
	title?: string;
	items: SidebarItemType[];
}

interface SidebarProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}

interface SidebarItemProps {
	item: SidebarItemType;
	isOpen: boolean;
	onCloseSidebar: () => void;
}


const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {

	const { user } = useAuthStore();

	const menuGroups: MenuGroup[] = [
		{
			items: [
				{
					name: 'Home',
					icon: Home,
					slug: '/'
				},
				{
					name: 'Subscriptions',
					icon: PlaySquare,
					slug: '/subscriptions',
				},
			],
		},
		{
			title: 'You',
			items: [
				{
					name: 'Your Channel',
					icon: UserSquare,
					slug: `/c/${user?.username}`
				},
				{
					name: 'Watch History',
					icon: History,
					slug: '/watch-history',
				},
				{
					name: 'Liked Videos',
					icon: ThumbsUp, slug: '/liked'
				},
				{
					name: 'Playlists',
					icon: MenuSquare,
					slug: '/playlists'
				},
			],
		},
		{
			title: 'Explore',
			items: [
				{
					name: 'Trending',
					icon: Flame,
					slug: '/trending'
				},
				{
					name: 'Gaming',
					icon: Gamepad2,
					slug: '/gaming'
				},
				{
					name: 'Sports',
					icon: Trophy,
					slug: '/sports'
				},
			],
		},
	];

	// check width explicitly during the event lifecycle
	const handleLinkClickClose = () => {
		if (window.innerWidth < 1024) {
			setIsOpen(false);
		}
	};


	return (
		<>
			<div
				onClick={() => setIsOpen(false)}
				className={cn('fixed inset-0 top-16 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300',
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
				)}
			/>

			{/* sidebar structural container sheet */}
			<aside
				className={cn(
					// global shared properties
					'top-16 h-[calc(100vh-64px)] overflow-y-auto bg-white dark:bg-zinc-950 transition-all duration-300 ease-in-out z-40 scrollbar-thin',

					// mobile-first hidden layout defaults
					'fixed -left-full w-64 shadow-2xl',
					isOpen ? 'left-0' : '-left-full',

					// desktop responsive structure overrides
					'lg:sticky lg:left-0 lg:shadow-none lg:w-auto',
					isOpen ? 'lg:w-64' : 'lg:w-20',
				)}
			>
				<div className='flex flex-col gap-4 p-3'>
					{menuGroups.map((group, idx) => (
						<div key={idx} className='space-y-1'>
							{group.title && isOpen && (
								<h3 className='px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 mt-2'>
									{group.title}
								</h3>
							)}

							{group.items.map((item) => (
								<SidebarItem
									key={item.name}
									item={item}
									isOpen={isOpen}
									onCloseSidebar={handleLinkClickClose}
								/>
							))}

							{idx !== menuGroups.length - 1 && (
								<hr className='border-zinc-200 dark:border-zinc-800 my-4 mx-2' />
							)}
						</div>
					))}
				</div>
			</aside>
		</>
	);
};


const SidebarItem = ({ item, isOpen, onCloseSidebar }: SidebarItemProps) => {
	const { isAuthenticated, setLoginModalOpen } = useAuthStore();

	const handleClick = (e: MouseEvent): void => {
		// safe check for home path navigation routing
		if (item.slug === '/') {
			onCloseSidebar();
			return;
		}

		if (!isAuthenticated) {
			e.preventDefault();
			setLoginModalOpen(true);
		}
        else {
			onCloseSidebar();
		}
	};

	return (
		<NavLink
			to={item.slug}
			title={item.name}
			onClick={handleClick}
			className={({ isActive }) =>
				cn('flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group',
					isActive ? 'bg-purple-600/10 text-purple-600 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900',
				)}
		>
			<item.icon
				size={22}
				className={cn(
					'shrink-0 transition-transform group-hover:scale-110',
					!isOpen && 'lg:mx-auto',
				)}
			/>
			<span
				className={cn(
					'whitespace-nowrap transition-all duration-300',
					isOpen ? 'opacity-100 block' : 'opacity-0 hidden lg:hidden',
				)}
			>
				{item.name}
			</span>
		</NavLink>
	)
}

export default Sidebar