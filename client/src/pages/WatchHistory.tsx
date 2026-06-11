import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useWatchHistory } from '../hooks/useWatchHistory.ts'
import { Play, Clock, History, Loader2, Eye } from 'lucide-react'
import { type WatchHistoryVideoItem } from '../types/types.ts'
import { Link } from 'react-router'
import { format, formatDistanceToNow } from 'date-fns'
import { formatDuration } from '../utils/formatDuration.ts'



const WatchHistory = () => {
	
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useWatchHistory(10);

	const { ref, inView } = useInView({
		threshold: 0.1,
	});

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const allVideos = data?.pages.flatMap(page => page.docs) || [];

	// SKELETON PLACEHOLDER
	if (isLoading) {
		return (
			<section className='w-full max-w-6xl mx-auto px-4 py-6 md:py-10 animate-pulse'>
				<div className='h-9 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-8' />
				<div className='flex flex-col gap-6'>
					{[...Array(4)].map((_, i) => (
						<div key={i} className='flex flex-col sm:flex-row gap-4 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800/40'>
							<div className='aspect-video sm:w-64 md:w-72 shrink-0 rounded-xl bg-zinc-200 dark:bg-zinc-800' />
							<div className='flex flex-col justify-between grow py-1 space-y-3'>
								<div className='space-y-2'>
									<div className='h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded' />
									<div className='h-4 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded' />
								</div>
								<div className='flex items-center gap-2'>
									<div className='h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800' />
									<div className='h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded' />
								</div>
							</div>
						</div>
					))}
				</div>
			</section>
		);
	}

	if (isError) {
		return (
			<div className='flex h-[70vh] w-full flex-col items-center justify-center gap-2 text-zinc-500'>
				<p className='text-lg font-medium text-zinc-800 dark:text-zinc-200'>Failed to load watch history</p>
				<p className='text-sm text-zinc-400'>{error?.message || 'Something went wrong'}</p>
			</div>
		);
	}

	const serverMessage = data?.pages[0]?.message || 'Watch history is currently empty or has been cleared.';

	if (allVideos.length === 0) {
		return (
			<div className='flex h-[70vh] w-full flex-col items-center justify-center gap-4 text-zinc-500'>
				<div className='rounded-full bg-zinc-100 p-4 dark:bg-zinc-900'>
					<History size={40} className='text-zinc-400' />
				</div>
				<div className='text-center'>
					<p className='text-xl font-semibold text-zinc-800 dark:text-zinc-200'>Keep track of what you watch</p>
					<p className='text-sm text-zinc-400 mt-1'>{serverMessage}</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<title>Watch History | Mernix</title>

			<section className='w-full max-w-6xl mx-auto px-4 py-6 md:py-10'>
				<div className='flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-8'>
					<h1 className='text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50'>
						Watch History
					</h1>
				</div>

				{/* Video Feed Layout List */}
				<div className='flex flex-col gap-6'>
					{allVideos.map((video: WatchHistoryVideoItem, index) => (
						<div
							key={`${video._id}-${index}`}
							className='relative flex flex-col sm:flex-row gap-4 bg-white dark:bg-zinc-900/40 p-3 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/60 hover:shadow-md hover:border-purple-500/30 dark:hover:border-purple-500/20 transition-all duration-200 group'
						>
							<Link 
								to={`/watch/${video._id}`} 
								className='absolute inset-0 z-10 rounded-2xl cursor-pointer'
							/>

							{/* Thumbnail Module Layout */}
							<div className='relative aspect-video sm:w-64 md:w-72 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 shadow-xs'>
								<img
									src={video.thumbnail}
									alt={video.title}
									className='h-full w-full object-cover group-hover:scale-102 transition-transform duration-300'
									loading='lazy'
								/>
								<span className='absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/75 px-2 py-0.5 text-xs font-medium text-white tracking-wide'>
									<Clock size={11} />
									{formatDuration(video.duration)}
								</span>
								<div className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs'>
									<div className='p-3 bg-purple-600 rounded-full text-white transform scale-90 group-hover:scale-100 transition-transform duration-200 shadow-lg'>
										<Play size={18} fill='currentColor' />
									</div>
								</div>
							</div>

							{/* Text Metadata Frame */}
							<div className='flex flex-col justify-between grow py-1 z-20'>
								<div>
									<h3 title={video.title} className='text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-150 leading-snug'>
										{video.title}
									</h3>

									{/* Views & Performance Data String */}
									<p className='text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1.5'>
										<Eye size={12} />
										<span title={`${video.views.toLocaleString()} views`}>{video.views.toLocaleString()} views</span>
										<span>•</span>
										<span 
											title={video.createdAt ? format(new Date(video.createdAt), 'HH:mm:ss') : ''}
										>
											{video.createdAt ? new Date(video.createdAt).toLocaleDateString(undefined,
													{
                                                        dateStyle: 'full'
													},
												)
											: 'Recently'
                                            }{' '}
                                            ({formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })})
										</span>
									</p>

									{/* Creator Profile Strip */}
									<div className='flex items-center gap-2 mt-4 relative'>
										<img
											src={video.owner.avatar}
											alt=''
											className='h-6 w-6 rounded-full object-cover border border-zinc-200 dark:border-zinc-700'
										/>
										<Link
											to={`/c/${video.owner.username}`}
											className='text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors z-30'
											title={`${video.owner.firstName} ${video.owner.lastName}`}
										>
											{video.owner.firstName} {video.owner.lastName}
										</Link>
									</div>

									{/* Description summary */}
									<p
										className='text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-3 truncate hidden sm:block max-w-2xl font-normal leading-relaxed'
										title={video.description}
									>
										{video.description}
									</p>
								</div>
							</div>

						</div>
					))}
				</div>

				{/* Bottom Infinite Scroll Target Element */}
				<div
					ref={ref}
					className='w-full flex justify-center items-center py-10 mt-6 text-zinc-400 text-sm'
				>
					{isFetchingNextPage ? (
						<div className='flex items-center gap-2.5 text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-950/30 px-4 py-2 rounded-full border border-purple-100 dark:border-purple-900/40'>
							<Loader2 className='size-4 animate-spin' />
							<span>Loading more history...</span>
						</div>
					) : hasNextPage ? (
						<span className='opacity-0'>Scroll down to load more</span>
					) : (
						<div className='w-full text-center pt-8 border-t border-zinc-200 dark:border-zinc-800'>
							<p className='text-xs font-medium text-zinc-500 dark:text-zinc-400'>
								End of Watch History
							</p>
						</div>
					)}
				</div>
			</section>
		</>
	)
}

export default WatchHistory