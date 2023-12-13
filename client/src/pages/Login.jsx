import axios from 'axios'
import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthContext } from '../context/AuthContext'

const Login = () => {
	const navigate = useNavigate()
	const { auth, setAuth } = useContext(AuthContext)
	const [errorsMessage, setErrorsMessage] = useState('')
	const [isLoggingIn, SetLoggingIn] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm()

	const onSubmit = async (data) => {
		SetLoggingIn(true)
		try {
			const response = await axios.post('/auth/login', data)
			// console.log(response.data)
			toast.success('Đăng nhập thành công!', {
				position: 'bottom-right',
				autoClose: 2000,
				pauseOnHover: false
			})
			setAuth((prev) => ({ ...prev, token: response.data.token }))
			navigate('/')
		} catch (error) {
			console.error(error.response.data)
			setErrorsMessage(error.response.data)
			toast.error('Lỗi', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetLoggingIn(false)
		}
	}

	const inputClasses = () => {
		return 'appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-blue-500'
	}

	return (
		// sua back ground login o day
		<div className="flex min-h-screen items-center justify-center  bg-orange-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-4 shadow-xl">
				<div>
				<h2 className="mt-4 mb-20 text-center text-4xl font-extrabold text-gray-900">Đăng nhập</h2>

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
						name="password"
						type="password"
						{...register('password', { required: true })}
						className={inputClasses`${errors.password ? 'border-red-500' : ''}`}
						placeholder="Mật khẩu"
					/>
					{errors.password && <span className="text-sm text-red-500">Vui lòng nhập mật khẩu</span>}

					<div>
						{errorsMessage && <span className="text-sm text-red-500">{errorsMessage}</span>}
						<button
							type="submit"
							className="mt-4 w-full rounded-md bg-orange-400 py-2 px-4 font-medium text-white drop-shadow-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:from-slate-500 disabled:to-slate-400"
							disabled={isLoggingIn}
						>
							{isLoggingIn ? 'Đang xử lý...' : 'Đăng nhập'}
						</button>
					</div>
					<p className="text-right">
						Chưa có tài khoản?{' '}
						<Link to={'/register'} className="font-bold text-orange-600">
							Đăng ký ngay
						</Link>
					</p>
				</form>
			</div>
		</div>
	)
}

export default Login
