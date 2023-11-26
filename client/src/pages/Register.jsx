import axios from 'axios'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Register = () => {
	const navigate = useNavigate()
	const [errorsMessage, setErrorsMessage] = useState('')
	const [isRegistering, SetIsRegistering] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm()

	const onSubmit = async (data) => {
		SetIsRegistering(true)
		try {
			const response = await axios.post('/auth/register', data)
			// console.log(response.data)
			toast.success('Registration successful!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
			navigate('/')
		} catch (error) {
			console.error(error.response.data)
			setErrorsMessage(error.response.data)
			toast.error('Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetIsRegistering(false)
		}
	}

	const inputClasses = () => {
		return 'appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-blue-500'
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-orange-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-4 shadow-xl">
				<div>
					<h2 className="mt-4 mb-20 text-center text-4xl font-extrabold text-gray-900">Đăng ký</h2>
				</div>
				<form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
					<input
						name="username"
						type="text"
						{...register('username', { required: true })}
						className={inputClasses`${errors.username ? 'border-red-500' : ''}`}
						placeholder="Tài khoản"
					/>
					{errors.username && <span className="text-sm text-red-500">Vui lòng nhập tài khoản</span>}
					<input
						name="email"
						type="email"
						{...register('email', { required: true })}
						className={inputClasses`${errors.email ? 'border-red-500' : ''}`}
						placeholder="Địa chỉ email"
					/>
					{errors.username && <span className="text-sm text-red-500">Vui lòng nhập địa chỉ email</span>}
					<input
						name="password"
						type="password"
						autoComplete="current-password"
						{...register('password', {
							required: 'Vui lòng nhập mật khẩu',
							minLength: {
								value: 6,
								message: 'Mật khẩu phải chứa ít nhất 6 ký tự'
							}
						})}
						className={inputClasses`${errors.password ? 'border-red-500' : ''}`}
						placeholder="Mật khẩu"
					/>
					{errors.password && <span className="text-sm text-red-500">{errors.password?.message}</span>}
					<div>
						{errorsMessage && <span className="text-sm text-red-500">{errorsMessage}</span>}
						<button
							type="submit"
							className="mt-4 w-full rounded-md bg-orange-400  py-2 px-4 font-medium text-white drop-shadow-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:from-slate-500 disabled:to-slate-400"
							disabled={isRegistering}
						>
							{isRegistering ? 'Đang xử lý...' : 'Đăng ký'}
						</button>
					</div>
					<p className="text-right">
						Đã có tài khoản?{' '}
						<Link to={'/login'} className="font-bold text-orange-600">
							Đăng nhập ngay
						</Link>
					</p>
				</form>
			</div>
		</div>
	)
}

export default Register
