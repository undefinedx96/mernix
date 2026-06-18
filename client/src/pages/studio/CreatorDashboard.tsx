import { Link, useSearchParams } from 'react-router'
import { BarChart3, CloudUpload, Video } from 'lucide-react'
import { useAuthStore } from '../../store/authStore.ts'
import type { TabItems } from '../../types/types.ts'
import { StudioAnalytics } from '../index.ts'



const StudioCreator = () => (
    <div className='p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center text-zinc-400 font-medium text-sm animate-in fade-in duration-200'>
        Asset dropzones, multimedia drop bins, and upload controllers coming soon...
    </div>
);

const StudioMyVideos = () => (
    <div className='p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center text-zinc-400 font-medium text-sm animate-in fade-in duration-200'>
        Content management records, metadata lists, and toggle matrix configurations coming soon...
    </div>
);

type Tabs = 'analytics' | 'creator' | 'myVideos';


const CreatorDashboard = () => {

    const currentUser = useAuthStore((state) => state.user);
    const [searchParams, setSearchParams] = useSearchParams();

    const validTabs: Tabs[] = ['analytics', 'creator', 'myVideos'];
    
    const tabParam = searchParams.get('tab') as Tabs;
    
    const activeTab = validTabs.includes(tabParam) ? tabParam : 'analytics';
    
    const handleTabChange = (tabName: Tabs) => {
        setSearchParams({ tab: tabName });
    };

    const tabItems: TabItems<Tabs> = [
        {
            id: 'analytics',
            name: 'Analytics Overview',
            icon: BarChart3
        },
        {
            id: 'creator',
            name: 'Upload Wizard',
            icon: CloudUpload
        },
        {
            id: 'myVideos',
            name: 'My Videos Feed',
            icon: Video
        }
    ];

    return (
        <>
            <title>Creator Studio Hub | Mernix</title>

            <div className='max-w-6xl mx-auto px-4 md:px-8 py-10 w-full text-zinc-950 dark:text-zinc-50 duration-200 space-y-6'>
                <h1 className='text-2xl md:text-3xl font-extrabold tracking-tight mb-2'>
                    Creator Control Studio
                </h1>
                <p className='text-sm text-zinc-500 dark:text-zinc-400 mb-8'>
                    Manage your channel analytics, video upload, and video records (lists) from a single dashboard for user{' '}
                    <Link
                        to={`/c/${currentUser?.username}`}
                        className='text-purple-600 font-semibold hover:underline underline-offset-2'
                        title={`${currentUser?.firstName} ${currentUser?.lastName}`}
                    >
                        @{currentUser?.username}
                    </Link>.
                </p>

                {/* HORIZONTAL SUB-NAV BAR */}
                <div className='border-b border-zinc-200 dark:border-zinc-800/30 sticky top-0 bg-zinc-50/50 dark:bg-zinc-950/20 backdrop-blur-sm z-20 select-none -mx-4 px-4 md:-mx-8 md:px-8'>
                    <div className='flex gap-4 md:gap-6 overflow-x-auto scrollbar-none'>
                        {tabItems.map((tab) => {
                            const isSelected = activeTab === tab.id;
                            
                            return (
                                <button
                                    key={tab.id}
                                    type='button'
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`py-3.5 px-1 text-xs md:text-sm font-semibold tracking-wide flex items-center gap-2 relative transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                                        isSelected
                                            ? 'text-purple-600 dark:text-purple-400'
                                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                    }`}
                                    title={tab.name}
                                    role='radio'
                                >
                                    <tab.icon size={16} />
                                    <span>{tab.name}</span>

                                    {isSelected && (
                                        <div className='absolute bottom-0 left-0 w-full h-0.75 bg-purple-600 dark:bg-purple-400 rounded-t-full transition-all duration-300' />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. CONDITIONAL WORKSPACE CONTAINER CANVAS */}
                <div className='pt-2 w-full'>
                    {activeTab === 'analytics' && <StudioAnalytics />}
                    {activeTab === 'creator' && <StudioCreator />}
                    {activeTab === 'myVideos' && <StudioMyVideos />}
                </div>

            </div>
        </>
    )
}

export default CreatorDashboard