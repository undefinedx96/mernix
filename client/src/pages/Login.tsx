import { useForm } from 'react-hook-form'
import { useLogin } from '../hooks/useLogin.ts'
import type { LoginData } from '../types/types.ts'
import { Link } from 'react-router'
import { Video } from 'lucide-react'



const Login = () => {
	const { mutate: loginUser, isPending } = useLogin();

	const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();

	const onSubmit = (data: LoginData) => {
		loginUser(data);
	};


	return (
		<>
			<title>Mernix | Login</title>

			<section className='flex items-center justify-center min-h-[80vh] p-4'>
				<div className='w-full max-w-md p-8 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl'>
					<div className='text-center mb-8'>
						<Link to='/' className='size-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/40 rotate-3 hover:rotate-0 transition-all duration-300'>
							<Video className='text-white fill-current' size={32} />
						</Link>
						<h2 className='text-3xl font-bold tracking-tight'>
							Sign In
						</h2>
						<p className='text-zinc-500 dark:text-zinc-400 mt-2'>
							Welcome back to Mernix
						</p>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className='space-y-5'
					>
						<div>
							<label htmlFor='username' className='block text-sm font-medium mb-1.5 ml-1'>
								Username or Email
							</label>
							<input
                                id='username'
								className={`w-full p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-purple-600 transition-all shadow-sm ${errors.userIdentity ? 'focus:ring-red-500 shadow-md shadow-red-500/30' : ''}`}
								placeholder='username / email'
								{...register('userIdentity', {
									required:
										'Please enter your username or email',
								})}
							/>
							{errors.userIdentity && (
								<p className='text-red-500 text-xs mt-1.5 ml-1'>
									{errors.userIdentity.message}
								</p>
							)}
						</div>


						<div>
							<label htmlFor='password' className='block text-sm font-medium mb-1.5 ml-1'>
								Password
							</label>
							<input
                                id='password'
								type='password'
								className={`w-full p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-purple-600 transition-all shadow-sm ${errors.userIdentity ? 'focus:ring-red-500 shadow-md shadow-red-500/30' : ''}`}
								placeholder='••••••••'
								{...register('password', {
									required: 'Password is required',
									minLength: {
										value: 6,
										message: 'At least 6 characters required',
									},
								})}
							/>
							{errors.password && (
								<p className='text-red-500 text-xs mt-1.5 ml-1'>
									{errors.password.message}
								</p>
							)}
						</div>

						<button
							type='submit'
							disabled={isPending}
							className={`w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 cursor-pointer ${isPending ? 'active:scale-none' : ''}`}
						>
							{isPending ? 'Authenticating...' : 'Sign In'}
						</button>
					</form>

					<div className='mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center'>
						<p className='text-sm text-zinc-500'>
							Don't have an account?{' '}
							<Link
								to='/register'
								className='text-purple-600 hover:underline font-semibold'
							>
								Create Account
							</Link>
						</p>
					</div>
				</div>
			</section>
		</>
	)
}

export default Login