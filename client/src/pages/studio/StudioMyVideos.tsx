import { useState } from 'react'
import { useDashboardVideos } from '../../hooks/useDashboardData.ts'
import { useBulkActionsVideoMutations } from '../../hooks/useBulkActionsVideoMutations.ts'
import { useTogglePublish, useDeleteVideo } from '../../hooks/useVideoMutations.ts'
import StudioVideosTable from './StudioVideosTable.tsx'
import { AlertCircle, Loader2, VideoOff } from 'lucide-react'



const StudioVideosTab = () => {

    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading, isError, error } = useDashboardVideos(page, limit);
    const { bulkDelete, bulkTogglePublish } = useBulkActionsVideoMutations();
    const { mutate: togglePublish } = useTogglePublish();
    const { mutate: deleteVideo } = useDeleteVideo();

    const handleEditRedirect = () => {
        console.log('handle edit');
    };

    if (isLoading) {
        return (
            <div className='flex flex-col items-center justify-center min-h-100 gap-2'>
                <Loader2 className='w-6 h-6 animate-spin text-zinc-500' />
                <span className='text-xs font-mono text-zinc-400 font-medium'>Syncing content matrix...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className='flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 max-w-xl mx-auto my-8'>
                <AlertCircle className='size-5 shrink-0' />
                <p className='text-xs font-medium font-sans'>{error?.message || 'Failed to sync content'}</p>
            </div>
        );
    }

    const videoData = data?.videos || [];
    const totalPages = data?.totalPages || 1;

    if (videoData.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center min-h-87.5 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center bg-zinc-50/30 dark:bg-zinc-900/10'>
                <VideoOff className='w-8 h-8 text-zinc-400 mb-3' />
                <h4 className='text-sm font-bold text-zinc-800 dark:text-zinc-200'>No videos uploaded yet</h4>
                <p className='text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs'>
                    Publish your first video asset to activate the workspace content feed ledger matrix.
                </p>
            </div>
        );
    }

    return (
        <div className='w-full animate-in fade-in duration-300'>
            <StudioVideosTable 
                data={videoData}
                onTogglePublish={(id) => togglePublish(id)}
                onDeleteVideo={(id) => deleteVideo(id)}
                onBulkDelete={(ids) => bulkDelete(ids)}
                onBulkTogglePublish={(ids) => bulkTogglePublish(ids)}
                onEditVideo={handleEditRedirect}
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    )
}

export default StudioVideosTab