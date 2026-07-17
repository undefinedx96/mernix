import { useMemo, useState } from 'react'
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable, type SortingState } from '@tanstack/react-table'
import type { VideoFeedItem } from '../../types/types.ts'
import { Trash2, Edit, Eye, EyeOff, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import ConfirmationModal from '../../components/common/ConfirmationModal.tsx'
import DataTable from '../../components/common/DataTable.tsx'


interface TableProps {
    data: VideoFeedItem[];
    onTogglePublish: (id: string) => void;
    onDeleteVideo: (id: string) => void;
    onBulkDelete: (ids: string[]) => void;
    onBulkTogglePublish: (ids: string[]) => void;
    onEditVideo: (video: VideoFeedItem) => void; // TODO
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const columnHelper = createColumnHelper<VideoFeedItem>();


const StudioVideosTable = ({ data, onTogglePublish, onDeleteVideo, onBulkDelete, onBulkTogglePublish, onEditVideo, currentPage, totalPages, onPageChange }: TableProps) => {
    
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [sorting, setSorting] = useState<SortingState>([]);

    // Unified Modal State Management
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        confirmText: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        description: '',
        confirmText: 'Confirm',
        onConfirm: () => {},
    });

    const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));

    const columns = useMemo(() => [
        // 1. Checkbox Column
        columnHelper.display({
            id: 'select',
            header: ({ table }) => (
                <div className='flex items-center justify-center pl-2'>
                    <input
                        type='checkbox'
                        className='accent-purple-500 rounded focus:ring-2 checked:focus:ring-purple-400 checked:dark:focus:ring-purple-600/70 cursor-pointer size-4'
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                        title={`${table.getIsAllPageRowsSelected() ? 'Unselect' : 'Select'} All`}
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className='flex items-center justify-center pl-2'>
                    <input
                        type='checkbox'
                        className='accent-purple-500 rounded focus:ring-2 checked:focus:ring-purple-400 checked:dark:focus:ring-purple-600/70 cursor-pointer size-4'
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        onChange={row.getToggleSelectedHandler()}
                        title={`${row.getIsSelected() ? 'Unselect' : 'Select'}`}
                    />
                </div>
            ),
        }),

        // 2. Video Details (Filterable by title)
        columnHelper.accessor('title', {
            header: 'Video',
            cell: (info) => {
                const video = info.row.original;
                return (
                    <div className='flex items-start gap-4 py-1 max-w-md md:max-w-xl'>
                        <div className='relative shrink-0 aspect-video w-24 md:w-28 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/40 shadow-xs' title={video.title}>
                            <img 
                                src={video.thumbnail} 
                                alt={video.title} 
                                className='size-full object-cover'
                            />
                        </div>
                        <div className='flex flex-col min-w-0 mt-0.5'>
                            <span className='font-sans font-bold text-sm text-zinc-800 dark:text-zinc-100 truncate line-clamp-1 break-all whitespace-normal' title={video.title}>
                                {video.title}
                            </span>
                            <p className='text-zinc-400 dark:text-zinc-500 font-sans text-[11px] line-clamp-2 mt-0.5 pr-2 font-normal leading-relaxed' title={video.description}>
                                {video.description || 'No description provided.'}
                            </p>
                        </div>
                    </div>
                );
            },
        }),

        // 3. Visibility Column
        columnHelper.accessor('isPublished', {
            header: 'Visibility',
            cell: (info) => {
                const isPublished = info.getValue();
                const videoId = info.row.original._id;
                const videoTitle = info.row.original.title;
                
                return (
                    <button
                        onClick={() => {
                            setModalConfig({
                                isOpen: true,
                                title: 'Change Video Visibility?',
                                description: `Are you sure you want to change the visibility settings for "${videoTitle}" to ${isPublished ? 'Unlisted' : 'Public'}?`,
                                confirmText: 'Change Visibility',
                                onConfirm: () => {
                                    onTogglePublish(videoId);
                                    closeModal();
                                }
                            });
                        }}
                        className='flex items-center gap-2 group cursor-pointer transition-colors outline-hidden'
                        title={isPublished ? 'Public' : 'Unlisted'}
                    >
                        {isPublished ? (
                            <>
                                <Eye className='w-4 h-4 text-emerald-500 shrink-0' />
                                <span className='text-xs font-semibold text-emerald-600 dark:text-emerald-500 font-sans bg-emerald-500/10 px-2 py-0.5 rounded-full'>
                                    Public
                                </span>
                            </>
                        ) : (
                            <>
                                <EyeOff className='w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0' />
                                <span className='text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-sans bg-zinc-100 dark:bg-zinc-800/60 px-2 py-0.5 rounded-full'>
                                    Unlisted
                                </span>
                            </>
                        )}
                    </button>
                );
            },
        }),

        // 4. Sortable Views Column
        columnHelper.accessor('views', {
            header: ({ column }) => (
                <button
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer font-bold'
                >
                    Views
                    {column.getIsSorted() === 'asc' ? (
                        <ArrowUp className='size-3 text-blue-500' />
                    ) : column.getIsSorted() === 'desc' ? (
                        <ArrowDown className='size-3 text-blue-500' />
                    ) : (
                        <ArrowUpDown className='size-3 opacity-50' />
                    )}
                </button>
            ),
            cell: (info) => (
                <span className='font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300' title={`${info.getValue().toLocaleString()} views`}>
                    {info.getValue().toLocaleString()}
                </span>
            ),
        }),

        // 5. Sortable Created At Date Column
        columnHelper.accessor('createdAt', {
            header: ({ column }) => (
                <button
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer font-bold'
                >
                    Uploaded
                    {column.getIsSorted() === 'asc' ? (
                        <ArrowUp className='size-3 text-blue-500' />
                    ) : column.getIsSorted() === 'desc' ? (
                        <ArrowDown className='size-3 text-blue-500' />
                    ) : (
                        <ArrowUpDown className='size-3 opacity-50' />
                    )}
                </button>
            ),
            cell: (info) => {
                return <span
                            className='text-zinc-500 dark:text-zinc-400 text-xs font-sans font-medium'
                            title={format(info.getValue(), 'PPPPpppp')}
                        >
                            {formatDistanceToNow(new Date(info.getValue()), { addSuffix: true, includeSeconds: true })}
                        </span>;
            },
        }),

        // 6. Sortable Updated At Date Column
        columnHelper.accessor('updatedAt', {
            header: ({ column }) => (
                <button
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className='flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer font-bold'
                >
                    Updated
                    {column.getIsSorted() === 'asc' ? (
                        <ArrowUp className='size-3 text-blue-500' />
                    ) : column.getIsSorted() === 'desc' ? (
                        <ArrowDown className='size-3 text-blue-500' />
                    ) : (
                        <ArrowUpDown className='size-3 opacity-50' />
                    )}
                </button>
            ),
            cell: (info) => {
                return <span
                            className='text-zinc-500 dark:text-zinc-400 text-xs font-sans font-medium'
                            title={format(info.getValue(), 'PPPPpppp')}
                        >
                            {formatDistanceToNow(new Date(info.getValue()), { addSuffix: true, includeSeconds: true })}
                        </span>;
            },
        }),

        // 7. Inline Actions Column
        columnHelper.display({
            id: 'actions',
            header: () => <span className='pr-4 block text-right'>Actions</span>,
            cell: ({ row }) => (
                <div className='flex items-center justify-end gap-3 pr-4'>
                    <button 
                        onClick={() => onEditVideo(row.original)}
                        className='p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer'
                        title='Edit'
                    >
                        <Edit className='size-4' />
                    </button>
                    <button 
                        onClick={() => {
                            setModalConfig({
                                isOpen: true,
                                title: 'Delete Video Permanently?',
                                description: `Are you completely sure you want to delete "${row.original.title}"? This process cannot be undone.`,
                                confirmText: 'Delete Video',
                                onConfirm: () => {
                                    onDeleteVideo(row.original._id);
                                    closeModal();
                                }
                            });
                        }}
                        className='p-1.5 hover:bg-red-500/10 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-500 rounded-lg transition-colors cursor-pointer'
                        title='Delete'
                    >
                        <Trash2 className='size-4' />
                    </button>
                </div>
            ),
        }),
    ], [onTogglePublish, onDeleteVideo, onEditVideo]);

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: { 
            rowSelection,
            globalFilter,
            sorting,
            pagination: {
                pageIndex: currentPage - 1,
                pageSize: 10
            }
        },
        manualPagination: true,
        pageCount: totalPages,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const currentPagination = {
                    pageIndex: currentPage - 1,
                    pageSize: 10
                };
                
                const nextPagination = updater(currentPagination);
                onPageChange(nextPagination.pageIndex + 1)
            }
        },
        getRowId: (row) => row._id,
    });

    const selectedRowIds = useMemo(() => {
        return Object.keys(rowSelection).filter((id) => rowSelection[id]);
    }, [rowSelection]);

    const bulkActionOverlay = useMemo(() => {
        if (selectedRowIds.length === 0) return null;

        return (
            <div className='sticky top-0 left-0 right-0 sm:h-13 bg-blue-600 dark:bg-blue-700/95 backdrop-blur-md z-20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-3 sm:py-0 sm:px-4 animate-in slide-in-from-top duration-200 text-white border-b border-blue-500/20 shadow-md'>
                <div className='flex items-center text-center sm:text-left'>
                    <span className='text-xs font-bold font-sans tracking-wide bg-white/10 sm:bg-transparent px-2.5 py-1 rounded-full sm:p-0'>
                        {selectedRowIds.length} video{selectedRowIds.length > 1 ? 's' : ''} selected
                    </span>
                </div>
                <div className='flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto'>
                    <button
                        onClick={() => {
                            setModalConfig({
                                isOpen: true,
                                title: 'Change Bulk Visibility?',
                                description: `Are you sure you want to change the visibility settings for all ${selectedRowIds.length} selected videos?`,
                                confirmText: 'Confirm Bulk Change',
                                onConfirm: () => {
                                    onBulkTogglePublish(selectedRowIds);
                                    setRowSelection({});
                                    closeModal();
                                },
                            });
                        }}
                        className='flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold font-sans bg-white/10 hover:bg-white/20 active:scale-[0.98] px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-lg border border-white/10 transition-all cursor-pointer text-center'
                    >
                        Change Visibility
                    </button>
                    <button
                        onClick={() => {
                            setModalConfig({
                                isOpen: true,
                                title: `Delete Selected Video${selectedRowIds.length > 1 ? 's' : ''} Permanently?`,
                                description: `Are you completely sure you want to delete ${selectedRowIds.length > 1 ? `all(${selectedRowIds.length})` : 'this'} selected video${selectedRowIds.length > 1 ? 's' : ''}? This process cannot be undone.`,
                                confirmText: `${selectedRowIds.length > 1 ? 'Delete Videos' : 'Delete Video'}`,
                                onConfirm: () => {
                                    onBulkDelete(selectedRowIds);
                                    setRowSelection({});
                                    closeModal();
                                }
                            });
                        }}
                        className='flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold font-sans bg-red-600 hover:bg-red-700 active:scale-[0.98] px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-lg transition-all cursor-pointer shadow-xs text-center'
                    >
                        <Trash2 className='size-3.5 shrink-0' /> {selectedRowIds.length > 1 ? 'Delete Bulk' : 'Delete'}
                    </button>
                </div>
            </div>
        )
    }, [selectedRowIds, onBulkTogglePublish, onBulkDelete]);

    return (
        <div className='w-full flex flex-col gap-4 relative'>
            
            {/* Top Toolbar */}
            <div className='w-full max-w-sm relative'>
                <Search className='w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2' />
                <input
                    type='text'
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder='Filter videos by title...'
                    className='w-full pl-9 pr-4 py-2 text-xs font-sans border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:border-purple-500 transition-colors shadow-2xs'
                />
            </div>

            <DataTable 
                table={table}
                emptyStateMessage='No records found.'
                showPagination={true}
                overlayHeader={bulkActionOverlay}
            />

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                description={modalConfig.description}
                confirmText={modalConfig.confirmText}
            />
        </div>
    )
}

export default StudioVideosTable