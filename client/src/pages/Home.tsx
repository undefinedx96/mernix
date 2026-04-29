const Home = () => {
	return (
		<div className='p-6'>
			<h1 className='text-2xl font-bold mb-6'>Recommended for you</h1>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
				{[...Array(8)].map((_, i) => (
					<div key={i} className='flex flex-col gap-3 cursor-pointer'>
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
			</div>
		</div>
	)
}

export default Home