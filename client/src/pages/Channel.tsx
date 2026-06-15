import { useChannelProfile } from '../hooks/useChannelProfile.ts'
import { Commet } from 'react-loading-indicators'
import { Grid, ListVideo, User as UserIcon, Edit, UserPlus, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate, useSearchParams } from 'react-router'
import type { TabItems } from '../types/types.ts'



const Channel = () => {

	const { channel, isLoading, isError, isOwner, username, error } = useChannelProfile();

	const [searchParams, setSearchParams] = useSearchParams();

	const navigate = useNavigate();

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-[70vh]'>
                <title>Loading... | Mernix</title>
				<Commet color={['#6004a7', '#7d05d9', '#9717fa', '#ad49fb']} />
			</div>
		);
	}

	if (isError || !channel) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[70vh] text-center px-4'>
                <title>Channel Not Found | Mernix</title>
				<div className='bg-zinc-100 dark:bg-zinc-900 p-4 rounded-full mb-4 text-zinc-400'>
					<UserIcon size={48} />
				</div>
				<h2 className='text-xl font-bold text-zinc-900 dark:text-zinc-100'>
					{error?.message || 'Error'}
				</h2>
				<p className='text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm'>
					The channel{' '}
					<span className='text-purple-600 font-semibold'>
						{username}
					</span>{' '}
					does not exist or has been removed.
				</p>
			</div>
		);
	}

	type Tabs = 'videos' | 'playlists' | 'about';

	const tabItems: TabItems<Tabs> = [
        {
            id: 'videos',
            name: 'Videos',
            icon: Grid
        },
        {
            id: 'playlists',
            name: 'Playlists',
            icon: ListVideo
        },
        {
            id: 'about',
            name: 'About',
            icon: UserIcon
        }
    ];

    const validTabs: Tabs[] = ['videos', 'playlists', 'about'];
    
    const tabParam = searchParams.get('tab') as Tabs;
    
    const activeTab = validTabs.includes(tabParam) ? tabParam : 'videos';

	const handleTabChange = (tabName: Tabs) => {
        setSearchParams({ tab: tabName });
    };


	return (
		<>
			<title>{`${channel.firstName} ${channel.lastName} (${channel.username}) | Mernix`}</title>

			<section className='w-full text-zinc-900 dark:text-zinc-100 animate-in fade-in duration-300'>
				{/* coverImage banner container */}
				<div className='w-full aspect-6/1 bg-zinc-200 dark:bg-zinc-800 relative overflow-hidden group border-b rounded-sm border-zinc-200 dark:border-zinc-800/50'>
					{channel.coverImage ? (
						<img
							src={channel.coverImage}
							alt={`${channel.firstName}'s banner`}
							title={`${channel.firstName}'s banner`}
							className='w-full h-full object-cover'
						/>
					) : (
						<div className='w-full h-full bg-linear-to-r from-purple-900/20 via-zinc-900 to-zinc-900' />
					)}
				</div>

				{/* channel metadata header */}
				<div className='max-w-7xl mx-auto px-4 md:px-8 mt-6 flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800/80'>
					<div className='flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 md:gap-6'>
						{/* channel avatar slot */}
						<div className='size-30 md:size-44 rounded-full overflow-hidden border-4 border-purple-600/20 bg-zinc-100 dark:bg-zinc-900 shrink-0 shadow-xl'>
							{channel.avatar ? (
								<img
									src={channel.avatar}
									alt={`${channel.firstName}'s avatar`}
									title={`${channel.firstName}'s avatar`}
									className='size-full object-cover'
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-200 dark:bg-zinc-800'>
									<UserIcon size={40} />
								</div>
							)}
						</div>

						<div className='flex flex-col justify-center pt-1'>
							<h1
								className='text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50'
								title={`${channel.firstName} ${channel.lastName}`}
							>
								{channel.firstName} {channel.lastName}
							</h1>
							<span
								className='text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-0.5 block'
								title={channel.username}
							>
								@{channel.username}
							</span>

							{/* aggregation counts */}
							<div className='flex items-center gap-2 mt-3 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-medium'>
								<span title={`${channel.subscribersCount} subscribers`}>
									{channel.subscribersCount}{' '}subscribers
								</span>
								<span className='size-1 bg-zinc-300 dark:bg-zinc-700 rounded-full' />
								<span title={`${channel.channelsSubscribedToCount} subscriptions`}>
									{channel.channelsSubscribedToCount}{' '}subscriptions
								</span>
								<span className='size-1 bg-zinc-300 dark:bg-zinc-700 rounded-full' />
								<span title='0 videos'>
                                    0{' '}videos
                                </span>
							</div>
						</div>
					</div>

					{/* action controller btn */}
					<div className='flex justify-center md:pt-4'>
						{isOwner ? (
							<button
                                className='flex items-center gap-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200 active:scale-95 cursor-pointer'
                                title={isOwner ? 'Customize Channel' : ''}
								onClick={() => navigate('/settings?tab=account')}
                            >
								<Edit size={16} />
								Customize Channel
							</button>
						) : (
							<button
                                className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-xl text-sm shadow-lg shadow-purple-600/10 transition-all duration-200 active:scale-95 cursor-pointer'
                                title={!isOwner ? 'Subscribe' : ''}
                            >
								<UserPlus size={16} />
								Subscribe
							</button>
						)}
					</div>
				</div>

				{/* sub-navigation filter tabs layout */}
				<div className='max-w-7xl mx-auto px-4 md:px-8 border-b border-zinc-200 dark:border-zinc-800/30 bg-zinc-50/50 dark:bg-zinc-950/20 backdrop-blur-sm sticky top-0 z-10'>
					<div className='flex gap-6 md:gap-8 overflow-x-auto scrollbar-none'>
						{tabItems.map((tab) => {
							const isSelected = activeTab === tab.id;
							return (
								<button
									key={tab.id}
									onClick={() => handleTabChange(tab.id)}
									className={`py-3.5 px-1 text-xs md:text-sm font-semibold tracking-wide flex items-center gap-2 relative transition-colors duration-200 cursor-pointer whitespace-nowrap ${
										isSelected
											? 'text-purple-600 dark:text-purple-400'
											: 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
									}`}
                                    title={tab.name}
                                    role='radio'
								>
									<tab.icon size={15} />
                                    <span>{tab.name}</span>

                                    {isSelected && (
                                        <div className='absolute bottom-0 left-0 w-full h-0.75 bg-purple-600 dark:bg-purple-400 rounded-t-full transition-all duration-300' />
                                    )}
								</button>
							)
						})}
					</div>
				</div>

				{/* inner tab grid body */}
				<div className='max-w-7xl mx-auto px-4 md:px-8 py-8'>
					{activeTab === 'videos' && (
						<div className='flex flex-col items-center justify-center py-16 text-zinc-400/80 dark:text-zinc-600'>
							<Grid
								size={48}
								strokeWidth={1.5}
								className='mb-3'
							/>
							<p className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>
								This channel hasn't uploaded any videos yet.
							</p>
						</div>
					)}

					{activeTab === 'playlists' && (
						<div className='flex flex-col items-center justify-center py-16 text-zinc-400/80 dark:text-zinc-600'>
							<ListVideo
								size={48}
								strokeWidth={1.5}
								className='mb-3'
							/>
							<p className='text-sm font-medium text-zinc-500 dark:text-zinc-400'>
								No playlists created yet.
							</p>
						</div>
					)}

					{activeTab === 'about' && (
						<div className='max-w-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/40 p-6 rounded-2xl shadow-sm'>
							<h3 className='text-base font-bold text-zinc-800 dark:text-zinc-200 mb-4'>
								About Channel
							</h3>

							<div className='flex flex-col gap-4 text-sm text-zinc-600 dark:text-zinc-400 font-medium'>
								<div className='flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/50 pb-3'>
									<Calendar
										size={18}
										className='text-purple-600 dark:text-purple-400'
									/>
									<div>
										<span className='text-zinc-400 block text-xs font-semibold uppercase tracking-wider mb-0.5'>
											Joined Platform
										</span>
                                        <span
                                            className='text-xs'
                                            title={`${new Date(channel.createdAt).getHours()}:${new Date(channel.createdAt).getMinutes()}:${new Date(channel.createdAt).getSeconds()}`}
                                        >
                                            {channel.createdAt ? new Date(channel.createdAt).toLocaleDateString(undefined,
													{
                                                        dateStyle: 'full'
													},
												)
											: 'Recently'
                                            }{' '}
                                            ({formatDistanceToNow(new Date(channel.createdAt), { addSuffix: true })})
                                        </span>
									</div>
								</div>

								<div className='flex items-center gap-3 pt-1'>
									<UserIcon
										size={18}
										className='text-purple-600 dark:text-purple-400'
									/>
									<div>
										<span className='text-zinc-400 block text-xs font-semibold uppercase tracking-wider mb-0.5'>
											Channel Name
										</span>
										<span
                                            className='text-xs'
                                            title={`${channel.firstName} ${channel.lastName} (@${channel.username})`}
                                        >
                                            {channel.firstName} {channel.lastName}{' '}(@{channel.username})
                                        </span>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</section>
		</>
	)
}

export default Channel