import { useState, type ChangeEvent } from 'react'
import { useRegister } from '../hooks/useRegister.ts'
import { useForm, type SubmitHandler } from 'react-hook-form'
import type { RegisterData } from '../types/types.ts'
import { Link } from 'react-router'
import { Camera, User, Video } from 'lucide-react'



const Register = () => {
	
	const { mutate: registerUser, isPending } = useRegister();

	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [coverFile, setCoverFile] = useState<File | null>(null);

	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [coverPreview, setCoverPreview] = useState<string | null>(null);

	const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>();

	const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (file) {
			setAvatarFile(file);
			setAvatarPreview(URL.createObjectURL(file));
		}
	};

	const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (file) {
			setCoverFile(file);
			setCoverPreview(URL.createObjectURL(file));
		}
	};

	const onSubmit: SubmitHandler<RegisterData> = (data) => {
		const formData = new FormData();

		formData.append('username', data.username.toLowerCase().trim());
		formData.append('email', data.email.toLowerCase().trim());
		formData.append('firstName', data.firstName.toLowerCase().trim());
		formData.append('lastName', data.lastName.toLowerCase().trim());

		if (data.password) formData.append('password', data.password);

		if (avatarFile) formData.append('avatar', avatarFile);

		if (coverFile) formData.append('coverImage', coverFile);

		registerUser(formData);
	};

	const { ref: avatarRef, ...avatarRegister } = register('avatar', {
		required: 'Avatar image is required',
	});

	const { ref: coverRef, ...coverRegister } = register('coverImage');


	return (
		<>
			<title>Register | Mernix</title>

			<section className='flex items-center justify-center min-h-screen p-4 text-zinc-900 dark:text-white bg-white dark:bg-zinc-950'>
				<div className='w-full max-w-2xl bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden'>
					<div className='text-center my-8'>
						<Link
							to='/'
							className='size-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/40 rotate-3 hover:rotate-0 transition-all duration-300'
							title='Home'
						>
							<Video
								className='text-white fill-current'
								size={32}
							/>
						</Link>
						<h2 className='text-3xl font-bold tracking-tight'>
							Create Account
						</h2>
						<p className='text-zinc-500 dark:text-zinc-400 mt-2'>
							Join the ultimate developer video streaming hub
						</p>
					</div>


					<form onSubmit={handleSubmit(onSubmit)}>
						
						<div className='relative'>
							<div className='relative group h-32 md:h-44 w-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden'>
								{coverPreview ? (
									<img
										src={coverPreview}
										alt='Cover'
										className='w-full h-full object-cover'
									/>
								) : (
									<div className='w-full h-full flex items-center justify-center text-zinc-400 text-sm italic'>
										No cover image selected
									</div>
								)}
								
								<label
									htmlFor='coverImage'
									className='absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white p-2 rounded-lg cursor-pointer transition-all opacity-0 group-hover:opacity-100 z-10'
									title='Upload cover image'
								>
									<Camera size={20} />
								</label>
								<input
									type='file'
									id='coverImage'
									accept='image/*'
									className='hidden'
									{...coverRegister}
									onChange={(e) => {
										coverRegister.onChange(e);
										handleCoverChange(e);
									}}
									ref={coverRef}
								/>
							</div>
							
							<div className='absolute -bottom-10 left-8 size-24 md:size-32 rounded-full border-4 border-zinc-50 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 overflow-hidden shadow-xl group/avatar'>
								{avatarPreview ? (
									<img
										src={avatarPreview}
										alt='Avatar'
										className='w-full h-full object-cover'
									/>
								) : (
									<div className='w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400'>
										<User
											size={48}
											strokeWidth={1.5}
											className={`opacity-50 ${errors.avatar ? 'text-red-500' : ''}`}
										/>
									</div>
								)}
								<label
									htmlFor='avatar'
									className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-all z-20 text-white'
									title='Upload avatar image'
								>
									<Camera />
								</label>
								<input
									type='file'
									id='avatar'
									accept='image/*'
									className='hidden'
									{...avatarRegister}
									onChange={(e) => {
										avatarRegister.onChange(e);
										handleAvatarChange(e);
									}}
									ref={avatarRef}
								/>
							</div>
						</div>

						{errors.avatar && (
							<p className='text-red-500 text-xs mt-12 ml-8'>
								Please upload an avatar image to continue.
							</p>
						)}

						<div className={`p-8 ${errors.avatar ? 'pt-7' : 'pt-14'}`}>
							<div className='mb-8'>
								<p className='text-zinc-500 dark:text-zinc-400 mt-1'>
									Fill in your details to get started.
								</p>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
								<div className='space-y-1.5'>
									<label
										htmlFor='firstName'
										className='text-sm font-medium ml-1'
									>
										First Name *
									</label>
									<input
										type='text'
										id='firstName'
										placeholder='John'
										className={`w-full p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-purple-600 transition-all ${errors.firstName ? 'focus:ring-red-500 shadow-md shadow-red-500/30' : ''}`}
										{...register('firstName', {
											required: 'First name is required',
										})}
									/>
									{errors.firstName && (
										<p className='text-red-500 text-xs ml-1'>
											{errors.firstName.message}
										</p>
									)}
								</div>

								<div className='space-y-1.5'>
									<label
										htmlFor='lastName'
										className='text-sm font-medium ml-1'
									>
										Last Name *
									</label>
									<input
										type='text'
										id='lastName'
										placeholder='Doe'
										className={`w-full p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-purple-600 transition-all ${errors.lastName ? 'focus:ring-red-500 shadow-md shadow-red-500/30' : ''}`}
										{...register('lastName', {
											required: 'Last name is required',
										})}
									/>
									{errors.lastName && (
										<p className='text-red-500 text-xs ml-1'>
											{errors.lastName.message}
										</p>
									)}
								</div>

								<div className='space-y-1.5'>
									<label
										htmlFor='username'
										className='text-sm font-medium ml-1'
									>
										Username *
									</label>
									<input
										type='text'
										id='username'
										placeholder='johndoe'
										className={`w-full p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-purple-600 transition-all ${errors.username ? 'focus:ring-red-500 shadow-md shadow-red-500/30' : ''}`}
										{...register('username', {
											required: 'Username is required',
										})}
									/>
									{errors.username && (
										<p className='text-red-500 text-xs ml-1'>
											{errors.username.message}
										</p>
									)}
								</div>

								<div className='space-y-1.5'>
									<label
										htmlFor='email'
										className='text-sm font-medium ml-1'
									>
										Email *
									</label>
									<input
										type='email'
										id='email'
										placeholder='john@example.com'
										className={`w-full p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-purple-600 transition-all ${errors.email ? 'focus:ring-red-500 shadow-md shadow-red-500/30' : ''}`}
										{...register('email', {
											required: 'Email is required',
										})}
									/>
									{errors.email && (
										<p className='text-red-500 text-xs ml-1'>
											{errors.email.message}
										</p>
									)}
								</div>
							</div>
							
							<div className='mt-5 space-y-1.5'>
								<label
									htmlFor='password'
									className='text-sm font-medium ml-1'
								>
									Password *
								</label>
								<input
									type='password'
									id='password'
									placeholder='••••••••'
									className={`w-full p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-purple-600 transition-all ${errors.password ? 'focus:ring-red-500 shadow-md shadow-red-500/30' : ''}`}
									{...register('password', {
										required: 'Password is required',
										minLength: {
											value: 6,
											message: 'At least 6 characters required',
										},
									})}
								/>
								{errors.password && (
									<p className='text-red-500 text-xs ml-1'>
										{errors.password.message}
									</p>
								)}
							</div>

							<button
								type='submit'
								disabled={isPending}
								className={`w-full mt-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 cursor-pointer ${isPending ? 'active:scale-none' : ''}`}
							>
								{isPending ? 'Processing Registration...' : 'Create Account'}
							</button>

							<div className='mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center'>
								<p className='text-sm text-zinc-500'>
									Already a member?{' '}
									<Link
										to='/login'
										className='text-purple-600 hover:underline font-semibold'
									>
										Sign In
									</Link>
								</p>
							</div>
						</div>

					</form>
				</div>
			</section>
		</>
	)
}

export default Register