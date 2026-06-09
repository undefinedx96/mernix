import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useNavigate, useSearchParams, Link } from 'react-router'
import { useGetVideos } from '../hooks/useGetVideos.ts'
import { useAuthStore } from '../store/authStore.ts'
import type { VideoFeedItem } from '../types/types.ts'
import { formatDuration } from '../utils/formatDuration.ts'
import { formatDistanceToNow, format } from 'date-fns'
import { Clock, Play, Eye, Loader2, SearchX } from 'lucide-react'



const Search = () => {

    const navigate = useNavigate();
    
    const [searchParams] = useSearchParams();
    
    const searchQuery = searchParams.get('q') || '';

    const { isAuthenticated, setLoginModalOpen } = useAuthStore();

    const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetVideos({ limit: 10, searchQuery });

    const { ref: sentinelRef, inView } = useInView({
        threshold: 0.1
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const videos: VideoFeedItem[] = data?.pages.flatMap((page) => page.docs) || [];

    const renderSkeletons = (count: number) => (
        <>
            {[...Array(count)].map((_, i) => (
                <div key={`skeleton-${i}`} className='flex flex-col sm:flex-row gap-4 p-3 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/60 animate-pulse'>
                    <div className='aspect-video sm:w-64 md:w-72 shrink-0 bg-zinc-200 dark:bg-zinc-800 rounded-xl' />
                    <div className='flex flex-col justify-between grow py-1 space-y-3 w-full'>
                        <div>
                            <div className='h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-2' />
                            <div className='h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4' />
                            <div className='flex items-center gap-2 mt-4'>
                                <div className='h-6 w-6 rounded-full bg-zinc-300 dark:bg-zinc-700' />
                                <div className='h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-24' />
                            </div>
                            <div className='h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full mt-4 hidden sm:block' />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );

    if (isError) {
        return (
            <div className='p-6 flex flex-col items-center justify-center min-h-[50vh] text-center'>
                <h2 className='text-xl font-semibold text-red-500 mb-2'>Something went wrong</h2>
                <p className='text-zinc-500 text-sm max-w-md'>
                    {error?.message || 'Failed to complete search query processing.'}
                </p>
            </div>
        );
    }

    return (
        <>
            <title>{`${searchQuery} | Mernix`}</title>

            <section className='w-full max-w-6xl mx-auto px-4 py-6 md:py-10'>
                <div className='flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-8'>
                    <h1 className='text-xl md:text-2xl font-medium text-zinc-500 dark:text-zinc-400'>
                        Search results for: <span className='text-zinc-900 dark:text-zinc-50 font-bold'>"{searchQuery}"</span>
                    </h1>
                </div>

                {/* Search Results Video Feed Layout */}
                <div className='flex flex-col gap-6'>
                    {isLoading && renderSkeletons(6)}

                    {!isLoading && videos.map((video) => (
                        <div
                            key={video._id}
                            className='relative flex flex-col sm:flex-row gap-4 bg-white dark:bg-zinc-900/40 p-3 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/60 hover:shadow-md hover:border-purple-500/30 dark:hover:border-purple-500/20 transition-all duration-200 group'
                        >
                            <button
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        setLoginModalOpen(true);
                                        return;
                                    }
                                    navigate(`/watch/${video._id}`);
                                }}
                                className='absolute inset-0 z-10 rounded-2xl cursor-pointer text-left focus:outline-none bg-transparent w-full h-full border-none'
                                aria-label={`Watch ${video.title}`}
                            />

                            {/* Thumbnail Module Layout */}
                            <div className='relative aspect-video sm:w-64 md:w-72 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 shadow-xs'>
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className='h-full w-full object-cover group-hover:scale-102 transition-transform duration-300'
                                    loading='lazy'
                                />
                                <span className='absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/75 px-2 py-0.5 text-xs font-medium text-white tracking-wide z-20'>
                                    <Clock size={11} />
                                    {formatDuration(video.duration)}
                                </span>
                                <div className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs z-20 pointer-events-none'>
                                    <div className='p-3 bg-purple-600 rounded-full text-white transform scale-90 group-hover:scale-100 transition-transform duration-200 shadow-lg'>
                                        <Play size={18} fill='currentColor' />
                                    </div>
                                </div>
                            </div>

                            {/* Text Metadata Frame */}
                            <div className='flex flex-col justify-between grow py-1 z-20 min-w-0'>
                                <div>
                                    <h3 title={video.title} className='text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-150 leading-snug'>
                                        {video.title}
                                    </h3>

                                    {/* Views & Performance Data */}
                                    <p className='text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1.5'>
                                        <Eye size={12} />
                                        <span title={`${video.views.toLocaleString()} views`}>{video.views.toLocaleString()} views</span>
                                        <span>•</span>
                                        <span title={video.createdAt ? format(new Date(video.createdAt), 'HH:mm:ss') : ''}>
                                            {video.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : 'Recently'}
                                        </span>
                                    </p>

                                    {/* Creator Profile Strip */}
                                    <div className='flex items-center gap-2 mt-3.5 relative z-30'>
                                        <img
                                            src={video.owner.avatar}
                                            alt=''
                                            className='h-6 w-6 rounded-full object-cover border border-zinc-200 dark:border-zinc-700'
                                        />
                                        <Link
                                            to={`/c/${video.owner.username}`}
                                            className='text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors'
                                            title={`${video.owner.firstName} ${video.owner.lastName}`}
                                        >
                                            {video.owner.firstName} {video.owner.lastName}
                                        </Link>
                                    </div>

                                    {/* Description summary description field */}
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

                {/* Empty State Conditions */}
                {!isLoading && videos.length === 0 && (
                    <div className='flex h-[70vh] w-full flex-col items-center justify-center gap-4 text-zinc-500'>
                        <div className='rounded-full bg-zinc-100 p-4 dark:bg-zinc-900'>
                            <SearchX size={40} className='text-zinc-400' />
                        </div>
                        <div className='text-center'>
                            <p className='text-xl font-semibold text-zinc-800 dark:text-zinc-200'>No results found for "{searchQuery}"</p>
                            <p className='text-sm text-zinc-400 mt-1'>We couldn't find any content matching your query. Check your spelling or try broader terms!</p>
                        </div>
                    </div>
                )}

                {/* Bottom Infinite Scroll Target Element */}
                <div ref={sentinelRef} className='w-full flex justify-center items-center py-10 mt-6 text-zinc-400 text-sm'>
                    {isFetchingNextPage ? (
                        <div className='flex items-center gap-2.5 text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-950/30 px-4 py-2 rounded-full border border-purple-100 dark:border-purple-900/40'>
                            <Loader2 className='size-4 animate-spin' />
                            <span>Searching more records...</span>
                        </div>
                    ) : hasNextPage ? (
                        <span className='opacity-0'>Scroll down to load more</span>
                    ) : (
                        videos.length > 0 && (
                            <div className='w-full text-center pt-8 border-t border-zinc-200 dark:border-zinc-800'>
                                <p className='text-xs font-medium text-zinc-500 dark:text-zinc-400'>
                                    End of search results
                                </p>
                            </div>
                        )
                    )}
                </div>
            </section>
        </>
    )
}

export default Search