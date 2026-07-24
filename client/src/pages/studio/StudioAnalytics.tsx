import { useDashboardStats } from '../../hooks/useDashboardData.ts'
import { Commet } from 'react-loading-indicators'
import { Eye, Users, ThumbsUp, Video, AlertCircle, BarChart3, type LucideIcon } from 'lucide-react'
import { useAuthStore } from '../../store/authStore.ts'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'



const StudioAnalytics = () => {

    const currentUser = useAuthStore((state) => state.user);
    const { data: stats, isLoading, isError, error } = useDashboardStats();

    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);


    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-[40vh] w-full'>
                <Commet color={['#6004a7', '#7d05d9', '#9717fa', '#ad49fb']} />
            </div>
        );
    }

    if (isError || !stats) {
        return (
            <div className='flex flex-col items-center justify-center min-h-[40vh] text-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl mx-auto'>
                <div className='bg-red-50 dark:bg-red-950/20 p-3 rounded-full text-red-500 mb-3'>
                    <AlertCircle size={32} />
                </div>
                <h3 className='text-base font-bold text-zinc-900 dark:text-zinc-100'>
                    Telemetry Sync Failed
                </h3>
                <p className='text-xs text-zinc-500 dark:text-zinc-400 mt-1'>
                    {error?.message || 'Unable to establish streaming network telemetry. Please try again.'}
                </p>
            </div>
        );
    }

    type Cards = {
        id: string;
        title: string;
        value: string;
        titleInfo: string;
        icon: LucideIcon;
        description: string;
        gradient: string;
    }[];
    
    const metricCards: Cards = [
        {
            id: 'metric-views',
            title: 'Lifetime Views',
            value: stats.totalViews.toLocaleString(),
            titleInfo: `${stats.totalViews.toLocaleString()} views`,
            icon: Eye,
            description: 'Total consumer content impressions',
            gradient: 'from-blue-600/10 to-indigo-600/5 text-blue-600 dark:text-blue-400'
        },
        {
            id: 'metric-subscribers',
            title: 'Subscribers',
            value: stats.subscribers.toLocaleString(),
            titleInfo: `${stats.subscribers.toLocaleString()} subscribers`,
            icon: Users,
            description: 'Active loyal platform followers',
            gradient: 'from-purple-600/10 to-pink-600/5 text-purple-600 dark:text-purple-400',
        },
        {
            id: 'metric-likes',
            title: 'Total Likes',
            value: stats.totalLikes.toLocaleString(),
            titleInfo: `${stats.totalLikes.toLocaleString()} likes`,
            icon: ThumbsUp,
            description: 'Aggregated community endorsements',
            gradient: 'from-amber-600/10 to-orange-600/5 text-amber-600 dark:text-amber-400'
        },
        {
            id: 'metric-videos',
            title: 'Total Videos',
            value: stats.totalVideos.toLocaleString(),
            titleInfo: `${stats.totalVideos.toLocaleString()} videos`,
            icon: Video,
            description: 'Total video assets in subscription manager pipeline',
            gradient: 'from-emerald-600/10 to-teal-600/5 text-emerald-600 dark:text-emerald-400'
        }
    ];

    return (
        <div className='space-y-8 duration-300'>
            
            {/* creator hub hero card */}
            <div className='bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden group'>
                <div className='absolute -right-16 -top-16 size-40 bg-purple-600/5 rounded-full blur-2xl group-hover:bg-purple-600/10 transition-colors duration-500' />
                
                <div className='flex items-center gap-4 z-10'>
                    <img 
                        src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.username}`}
                        alt={`${currentUser?.firstName} ${currentUser?.lastName}`}
                        className='size-14 rounded-full object-cover border-2 border-purple-500/20 shadow-md'
                        loading='lazy'
                        title={`${currentUser?.firstName} ${currentUser?.lastName}`}
                    />
                    <div>
                        <h2 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2'>
                            Welcome back, {currentUser?.firstName}!
                            <span className='size-2 rounded-full bg-emerald-500 animate-pulse' title='Channel Active' />
                        </h2>
                        <p className='text-xs text-zinc-500 dark:text-zinc-400 mt-0.5'>
                            Telemetry reporting stream aggregated on {format(currentTime, 'PPPPpppp')}
                        </p>
                    </div>
                </div>

                <div className='text-left sm:text-right z-10 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 dark:border-zinc-800/80'>
                    <span className='text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block'>
                        Channel Status
                    </span>
                    <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-200/30 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 mt-1 border border-purple-100 dark:border-purple-900/30'>
                        <BarChart3 size={12} />
                        Verified Partner
                    </span>
                </div>
            </div>

            {/* metric cards container */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
                {metricCards.map((card) => {
                    return (
                        <div
                            key={`${card.title.replaceAll(' ', '').toLocaleLowerCase()}}-${card.id}`}
                            className='bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-5 shadow-xs hover:shadow-2xl hover:border-purple-500/30 dark:hover:border-purple-500/30 transition-all duration-300 relative group overflow-hidden cursor-pointer'
                        >
                            {/* accent glow on hover */}
                            <div className='absolute -right-6 -bottom-6 size-24 bg-purple-600/0 dark:bg-purple-400/0 group-hover:bg-purple-600/5 dark:group-hover:bg-purple-400/5 rounded-full blur-xl transition-all duration-300' />

                            <div className='flex items-center justify-between gap-4'>
                                <span className='text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wide block truncate'>
                                    {card.title}
                                </span>
                                <div className={`p-2 rounded-xl bg-linear-to-br ${card.gradient} shrink-0`}>
                                    <card.icon size={18} />
                                </div>
                            </div>

                            <div className='mt-4 space-y-0.5'>
                                <h3
                                    className='text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-sans'
                                    title={card.titleInfo}
                                >
                                    {card.value}
                                </h3>
                                <p className='text-[11px] font-medium text-zinc-400 dark:text-zinc-500 truncate'>
                                    {card.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    )
}

export default StudioAnalytics