import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Link, useNavigate } from 'react-router'
import { useGetVideos } from '../hooks/useGetVideos.ts'
import { useAuthStore } from '../store/authStore.ts'
import type { VideoFeedItem } from '../types/types.ts'
import { formatDuration } from '../utils/formatDuration.ts'
import { format, formatDistanceToNow } from 'date-fns'



const Home = () => {

    const navigate = useNavigate();

    const { isAuthenticated, setLoginModalOpen } = useAuthStore();

    const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetVideos({ limit: 10 });

    const { ref: sentinelRef, inView } = useInView({
        threshold: 0.1,
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
                <div key={`skeleton-${i}`} className='flex flex-col gap-3'>
                    <div className='aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse' />
                    <div className='flex gap-3 animate-pulse'>
                        <div className='w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0' />
                        <div className='flex flex-col gap-2 w-full'>
                            <div className='h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4' />
                            <div className='h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2' />
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
                    {error?.message || 'Failed to populate feed. Check your database connection.'}
                </p>
            </div>
        );
    }

    return (
        <div className='p-6'>
            <h1 className='text-2xl font-bold mb-6'>Recommended for you</h1>
            
            {/* Video Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                
                {/* Initial Loading Skeletons */}
                {isLoading && renderSkeletons(8)}

                {/* Real video cards */}
                {!isLoading && videos.map((video) => (
                    <div 
                        key={video._id} 
                        className='flex flex-col gap-3 cursor-pointer group hover:bg-purple-600/10 dark:hover:bg-purple-600/10 duration-300 ease-out transition-colors rounded-3xl p-3'
                        title={video.title}
                        onClick={() => {
                            if (!isAuthenticated) {
                                setLoginModalOpen(true);
                                return;
                            }
                            navigate(`/watch/${video._id}`);
                        }}
                    >
                        {/* Thumbnail Container */}
                        <div className='aspect-video relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-2xl'>
                            <img 
                                src={video.thumbnail} 
                                alt={video.title}
                                className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out'
                                loading='lazy'
                            />
                            {/* Duration badge */}
                            <span className='absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-medium'>
                                {formatDuration(video.duration)}
                            </span>
                        </div>

                        {/* Metadata Row */}
                        <div className='flex gap-3'>
                            <img 
                                src={video.owner.avatar} 
                                alt={video.owner.username}
                                className='w-10 h-10 rounded-full object-cover bg-zinc-200 shrink-0'
                            />
                            
                            <div className='flex flex-col w-full min-w-0'>
                                <h3 className='text-sm font-semibold line-clamp-2 text-zinc-900 dark:text-zinc-100 leading-tight mb-1'>
                                    {video.title}
                                </h3>
                                <Link 
                                    to={`/c/${video.owner.username}`}
                                    className='text-xs text-zinc-500 dark:text-zinc-400 truncate hover:text-black hover:dark:text-white'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        if (!isAuthenticated) {
                                            setLoginModalOpen(true);
                                            return;
                                        }
                                        navigate(`/c/${video.owner.username}`);
                                    }}
                                >
                                    {video.owner.firstName}{' '}{video.owner.lastName}
                                </Link>
                                <p
                                    className='text-xs text-zinc-500 dark:text-zinc-400 mt-0.5'
                                    title={format(video.createdAt, 'PPPPpppp')}
                                >
                                    {video.views} views • {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true, includeSeconds: true })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Append incremental loading items cleanly during scroll paginations */}
                {isFetchingNextPage && renderSkeletons(4)}
            </div>

            {/* Zero State Check (Hidden if loading or if items exist) */}
            {!isLoading && videos.length === 0 && (
                <div className='flex flex-col items-center justify-center min-h-[30vh] text-center mt-6'>
                    <h2 className='text-xl font-semibold text-zinc-400 mb-2'>No videos found</h2>
                    <p className='text-zinc-500 text-sm'>Be the first to publish content to the platform!</p>
                </div>
            )}

            {/* Invisible tracking sentinel element used by the intersection observer loop */}
            <div ref={sentinelRef} className='h-10 w-full mt-4' />
        </div>
    )
}

export default Home