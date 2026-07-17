import { flexRender, type Table } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'


export interface DataTableProps<T> {
	table: Table<T>;
	emptyStateMessage?: string;
	showPagination?: boolean;
	overlayHeader?: ReactNode;
}


const DataTable = <T,>({
	table,
	emptyStateMessage = 'No records found.',
	showPagination = true,
	overlayHeader,
}: DataTableProps<T>) => {

	const headerGroups = table.getHeaderGroups();
	const rows = table.getRowModel().rows;
	const columnsCount = table.getVisibleFlatColumns().length;

	return (
		<div className='overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/20 backdrop-blur-sm shadow-sm'>
			{overlayHeader}

			{/* Layout Table */}
			<div className='overflow-x-auto'>
				<table className='w-full text-left border-collapse'>
					<thead>
						{headerGroups.map((headerGroup) => (
							<tr
								key={headerGroup.id}
								className='border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/70 dark:bg-zinc-950/40'
							>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className='px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500'
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
											)
                                        }
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className='divide-y divide-zinc-100 dark:divide-zinc-800/50'>
						{rows.length > 0 ? (
							rows.map((row) => (
								<tr
									key={row.id}
									className='hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors group'
								>
									{row.getVisibleCells().map((cell) => (
										<td
											key={cell.id}
											className='px-6 py-4 text-sm whitespace-nowrap'
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={columnsCount}
									className='px-6 py-12 text-center text-sm text-zinc-400'
								>
									{emptyStateMessage}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Grid Pagination Footer Bar */}
			{showPagination && (
				<div className='px-6 py-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-950/10 text-xs text-zinc-500 select-none'>
					<div className='flex items-center gap-1'>
						<span>Page</span>
						<strong className='font-bold text-zinc-700 dark:text-zinc-300'>
							{table.getState().pagination.pageIndex + 1} of{' '}
							{table.getPageCount()}
						</strong>
					</div>
					<div className='flex items-center gap-2'>
						<button
							type='button'
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							className='p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
							title='Previous'
						>
							<ChevronLeft size={14} />
						</button>
						<button
							type='button'
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							className='p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
							title='Next'
						>
							<ChevronRight size={14} />
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default DataTable