import { useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/authStore.ts'
import { useUpdateSettings } from '../hooks/useUpdateSettings.ts'
import { useChangePassword } from '../hooks/useChangePassword.ts'
import type { UpdateAccountData, ChangePasswordData } from '../types/types.ts'
import { User, Key, UserCircle, Camera, Loader2, Mail } from 'lucide-react'



const ProfileSettings = () => {

	const currentUser = useAuthStore((state) => state.user);
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = searchParams.get('tab') || 'account';

	const { updateDetails, isUpdatingDetails, updateAvatar, isUpdatingAvatar, updateCoverImage, isUpdatingCoverImage } = useUpdateSettings();

	const { changePassword, isChangingPassword, resetMutation } = useChangePassword();

	// hidden input refs for asset form
	const avatarInputRef = useRef<HTMLInputElement>(null);
	const coverInputRef = useRef<HTMLInputElement>(null);

	const {
		register: registerAccount,
		handleSubmit: handleAccountSubmit,
		formState: { errors: accountErrors },
		reset: resetAccountForm,
	} = useForm<UpdateAccountData>({
		defaultValues: {
			firstName: currentUser?.firstName || '',
			lastName: currentUser?.lastName || '',
			email: currentUser?.email || '',
		},
	});

	const {
		register: registerPassword,
		handleSubmit: handlePasswordSubmit,
		formState: { errors: passwordErrors },
		reset: resetPasswordForm,
		getValues: getPasswordValues,
	} = useForm<ChangePasswordData & { confirmPassword?: string }>();

	// keep inputs synced if current user changes or updates
	useEffect(() => {
		if (currentUser) {
			resetAccountForm({
				firstName: currentUser.firstName,
				lastName: currentUser.lastName,
				email: currentUser.email,
			});
		}
	}, [currentUser, resetAccountForm]);

	// tab handler utility
	const handleTabChange = (tabName: string) => {
		setSearchParams({ tab: tabName });
		resetMutation();
	};

	// ==========================================
	// CLEANED MUTATION ACTION HANDLERS START
	// ==========================================

	// text details form submission: tab-1
	const onAccountSubmit = (data: UpdateAccountData) => {
		updateDetails(data);
	};

	// asset file upload handler: tab-2
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'coverImage') => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validation limits: Max 5MB
		if (file.size > 5 * 1024 * 1024) {
			toast.error('File size must be under 5MB');
			return;
		}

		const formData = new FormData();
		formData.append(type, file);

		if (type === 'avatar') {
			updateAvatar(formData);
		} else {
			updateCoverImage(formData);
		}
	};

	// password form submission: tab-3
	const onPasswordSubmit = (data: ChangePasswordData) => {
		changePassword(
			{
				oldPassword: data.oldPassword,
				newPassword: data.newPassword,
			},
			{
				onSuccess: () => {
					resetPasswordForm();
				},
			},
		);
	};

    // ==========================================
	// CLEANED MUTATION ACTION HANDLERS END
	// ==========================================


	return (
		<>
			<title>Mernix | Dashboard Settings</title>

			<div className='max-w-6xl mx-auto px-4 md:px-8 py-10 w-full text-zinc-950 dark:text-zinc-50 animate-in fade-in duration-200'>
				<h1 className='text-3xl font-extrabold tracking-tight mb-2'>
					Account Control Settings
				</h1>
				<p className='text-sm text-zinc-500 dark:text-zinc-400 mb-8'>
					Manage your public identity, security credentials, and
					branding configurations.
				</p>

				<div className='flex flex-col lg:flex-row gap-8 items-start'>
                    
					{/* LEFT SIDEBAR: TAB SELECTION CONTROLS */}
					<nav className='flex flex-row lg:flex-col gap-2 w-full lg:w-64 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 border-b lg:border-b-0 border-zinc-200 dark:border-zinc-800 shrink-0 select-none scrollbar-none'>
						<button
							type='button'
							onClick={() => handleTabChange('account')}
							className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
								activeTab === 'account'
									? 'bg-purple-600 text-white shadow-lg shadow-purple-600/10'
									: 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
							}`}
						>
							<User size={18} /> Account Info
						</button>
						<button
							type='button'
							onClick={() => handleTabChange('branding')}
							className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
								activeTab === 'branding'
									? 'bg-purple-600 text-white shadow-lg shadow-purple-600/10'
									: 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
							}`}
						>
							<UserCircle size={18} /> Branding Assets
						</button>
						<button
							type='button'
							onClick={() => handleTabChange('security')}
							className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
								activeTab === 'security'
									? 'bg-purple-600 text-white shadow-lg shadow-purple-600/10'
									: 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
							}`}
						>
							<Key size={18} /> Password & Security
						</button>
					</nav>

					{/* RIGHT SLATE: PANEL DISPLAY */}
					<main className='flex-1 w-full bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-6 md:p-8 shadow-sm min-h-112.5'>
						{/* TAB STATE 1: TEXT DETAILS EDIT FRAME */}
						{activeTab === 'account' && (
							<form
								onSubmit={handleAccountSubmit(onAccountSubmit)}
								className='space-y-6 max-w-xl'
							>
								<div>
									<h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1'>
										Personal Information
									</h3>
									<p className='text-xs text-zinc-500 dark:text-zinc-400'>
										Update your basic identity endpoints
										below.
									</p>
								</div>

								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<div className='space-y-1.5'>
										<label className='text-xs font-bold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase'>
											First Name
										</label>
										<input
											{...registerAccount('firstName', {
												required:
													'First name is required',
											})}
											type='text'
											className='w-full rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-transparent px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-purple-600 dark:focus:border-purple-500 transition-colors'
										/>
										{accountErrors.firstName && (
											<p className='text-xs text-red-500 font-medium'>
												{
													accountErrors.firstName
														.message
												}
											</p>
										)}
									</div>
									<div className='space-y-1.5'>
										<label className='text-xs font-bold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase'>
											Last Name
										</label>
										<input
											{...registerAccount('lastName', {
												required:
													'Last name is required',
											})}
											type='text'
											className='w-full rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-transparent px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-purple-600 dark:focus:border-purple-500 transition-colors'
										/>
										{accountErrors.lastName && (
											<p className='text-xs text-red-500 font-medium'>
												{accountErrors.lastName.message}
											</p>
										)}
									</div>
								</div>

								<div className='space-y-1.5'>
									<label className='text-xs font-bold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase'>
										Email Address
									</label>
									<div className='relative'>
										<input
											{...registerAccount('email', {
												required:
													'Email address is required',
												pattern: {
													value: /^\S+@\S+$/i,
													message:
														'Invalid email structure',
												},
											})}
											type='email'
											className='w-full rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-transparent pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-purple-600 dark:focus:border-purple-500 transition-colors'
										/>
										<Mail
											size={16}
											className='absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400'
										/>
									</div>
									{accountErrors.email && (
										<p className='text-xs text-red-500 font-medium'>
											{accountErrors.email.message}
										</p>
									)}
								</div>

								<button
									type='submit'
									disabled={isUpdatingDetails}
									className='flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer min-w-35'
								>
									{isUpdatingDetails ? (
										<Loader2
											size={16}
											className='animate-spin'
										/>
									) : (
										'Save Changes'
									)}
								</button>
							</form>
						)}

						{/* TAB STATE 2: IMAGE BRANDING FILES PANEL */}
						{activeTab === 'branding' && (
							<div className='space-y-8'>
								<div>
									<h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1'>
										Channel Branding
									</h3>
									<p className='text-xs text-zinc-500 dark:text-zinc-400'>
										Upload customized assets to stylize your
										content domain.
									</p>
								</div>

								{/* Hidden Inputs Map */}
								<input
									type='file'
									ref={avatarInputRef}
									onChange={(e) =>
										handleFileChange(e, 'avatar')
									}
									accept='image/*'
									className='hidden'
								/>
								<input
									type='file'
									ref={coverInputRef}
									onChange={(e) =>
										handleFileChange(e, 'coverImage')
									}
									accept='image/*'
									className='hidden'
								/>

								{/* PROFILE BANNER SETTINGS */}
								<div className='space-y-3 max-w-2xl'>
									<span className='text-xs font-bold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase'>
										Channel Cover Banner
									</span>
									<div className='w-full aspect-6/1 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden relative border border-zinc-200 dark:border-zinc-800/80 group'>
										{currentUser?.coverImage ? (
											<img
												src={currentUser.coverImage}
												className='size-full object-cover group-hover:brightness-50 transition-all duration-300 select-none'
												alt='Banner'
											/>
										) : (
											<div className='size-full bg-linear-to-r from-purple-900/20 via-zinc-900 to-zinc-900 group-hover:brightness-50 transition-all duration-300' />
										)}
										<div
											onClick={() =>
												!isUpdatingCoverImage &&
												coverInputRef.current?.click()
											}
											className='absolute inset-0 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 bg-black/40 text-white font-medium text-xs cursor-pointer transition-opacity duration-300'
										>
											{isUpdatingCoverImage ? (
												<Loader2
													size={20}
													className='animate-spin'
												/>
											) : (
												<>
													<Camera size={20} /> Change
													Banner
												</>
											)}
										</div>
									</div>
									<p className='text-[11px] text-zinc-400 font-medium'>
										Recommended Dimensions: aspect ratio 6:1
										(Max 5MB).
									</p>
								</div>

								{/* PROFILE AVATAR SETTINGS */}
								<div className='space-y-3'>
									<span className='text-xs font-bold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase block'>
										Display Avatar
									</span>
									<div className='relative size-28 sm:size-32 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-md bg-zinc-100 dark:bg-zinc-800 group'>
										{currentUser?.avatar ? (
											<img
												src={currentUser.avatar}
												className='size-full object-cover group-hover:brightness-50 transition-all duration-300 select-none'
												alt='Avatar'
											/>
										) : (
											<div className='size-full flex items-center justify-center text-zinc-400'>
												<User size={36} />
											</div>
										)}
										<div
											onClick={() =>
												!isUpdatingAvatar &&
												avatarInputRef.current?.click()
											}
											className='absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 text-white cursor-pointer transition-opacity duration-300'
										>
											{isUpdatingAvatar ? (
												<Loader2
													size={20}
													className='animate-spin'
												/>
											) : (
												<Camera size={18} />
											)}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* TAB STATE 3: SECURITY & PASSWORD PANEL */}
						{activeTab === 'security' && (
							<form
								onSubmit={handlePasswordSubmit(
									onPasswordSubmit,
								)}
								className='space-y-6 max-w-xl'
							>
								<div>
									<h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1'>
										Update Password
									</h3>
									<p className='text-xs text-zinc-500 dark:text-zinc-400'>
										Ensure your workspace session is
										protected under robust pass credentials.
									</p>
								</div>

								<div className='space-y-1.5'>
									<label className='text-xs font-bold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase'>
										Current Password
									</label>
									<input
										{...registerPassword('oldPassword', {
											required:
												'Provide your current password',
										})}
										type='password'
										className='w-full rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-transparent px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-purple-600 dark:focus:border-purple-500 transition-colors'
									/>
									{passwordErrors.oldPassword && (
										<p className='text-xs text-red-500 font-medium'>
											{passwordErrors.oldPassword.message}
										</p>
									)}
								</div>

								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<div className='space-y-1.5'>
										<label className='text-xs font-bold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase'>
											New Password
										</label>
										<input
											{...registerPassword(
												'newPassword',
												{
													required:
														'Provide your new secret pass key',
													minLength: {
														value: 6,
														message:
															'Password must be at least 6 characters',
													},
												},
											)}
											type='password'
											className='w-full rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-transparent px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-purple-600 dark:focus:border-purple-500 transition-colors'
										/>
										{passwordErrors.newPassword && (
											<p className='text-xs text-red-500 font-medium'>
												{
													passwordErrors.newPassword
														.message
												}
											</p>
										)}
									</div>

									<div className='space-y-1.5'>
										<label className='text-xs font-bold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase'>
											Confirm New Password
										</label>
										<input
											{...registerPassword(
												'confirmPassword',
												{
													required:
														'Verify new security password selection',
													validate: (value) =>
														value ===
															getPasswordValues(
																'newPassword',
															) ||
														'Passwords do not match matching parameters',
												},
											)}
											type='password'
											className='w-full rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-transparent px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-purple-600 dark:focus:border-purple-500 transition-colors'
										/>
										{passwordErrors.confirmPassword && (
											<p className='text-xs text-red-500 font-medium'>
												{
													passwordErrors
														.confirmPassword.message
												}
											</p>
										)}
									</div>
								</div>

								<button
									type='submit'
									disabled={isChangingPassword}
									className='flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer min-w-40'
								>
									{isChangingPassword ? (
										<Loader2
											size={16}
											className='animate-spin'
										/>
									) : (
										'Update Password'
									)}
								</button>
							</form>
						)}
					</main>
				</div>
			</div>
		</>
	)
}

export default ProfileSettings