import {
	ClockIcon,
	FilmIcon,
	HomeModernIcon,
	MagnifyingGlassIcon,
	TicketIcon,
	UsersIcon,
	VideoCameraIcon
} from '@heroicons/react/24/outline'
import { Bars3Icon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/AuthContext'

const Navbar = () => {
	const { auth, setAuth } = useContext(AuthContext)
	const [menuOpen, setMenuOpen] = useState(false)
	const [isLoggingOut, SetLoggingOut] = useState(false)

	const toggleMenu = () => {
		setMenuOpen(!menuOpen)
	}

	const navigate = useNavigate()

	const onLogout = async () => {
		try {
			SetLoggingOut(true)
			const response = await axios.get('/auth/logout')
			// console.log(response)
			setAuth({ username: null, email: null, role: null, token: null })
			sessionStorage.clear()
			navigate('/')
			toast.success('Đăng xuất thành công!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Lỗi', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetLoggingOut(false)
		}
	}

	const menuLists = () => {
		return (
			<>
				<div className="flex flex-col gap-3 lg:flex-row">
					<Link
						to={'/cinema'}
						className={`flex items-center justify-center gap-3 rounded-md px-3 py-3 text-black hover:bg-orange-50 ${
							window.location.pathname === '/cinema'
								? 'bg-orange-50'
								: 'bg-orange-200'
						}`}
					>
						<HomeModernIcon className="h-6 w-6" />
						<p>Cụm rạp</p>
					</Link>
					<Link
						to={'/schedule'}
						className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-black hover:bg-orange-50 ${
							window.location.pathname === '/schedule'
								? 'bg-orange-50'
								: 'bg-orange-200'
						}`}
					>
						<ClockIcon className="h-6 w-6" />
						<p>Lịch chiếu</p>
					</Link>
					{auth.role && (
						<Link
							to={'/ticket'}
							className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-black hover:bg-orange-50 ${
								window.location.pathname === '/ticket'
									? 'bg-orange-50'
									: 'bg-orange-200'
							}`}
						>
							<TicketIcon className="h-6 w-6" />
							<p>Quản lý vé</p>
						</Link>
					)}
					{auth.role === 'admin' && (
						<>
							<Link
								to={'/movie'}
								className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-black hover:bg-orange-50 ${
									window.location.pathname === '/movie'
										? 'bg-orange-50'
										: 'bg-orange-200'
								}`}
							>
								<VideoCameraIcon className="h-6 w-6" />
								<p>Danh sách phim</p>
							</Link>
							<Link
								to={'/search'}
								className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-black hover:bg-orange-50 ${
									window.location.pathname === '/search'
										? 'bg-orange-50'
										: 'bg-orange-200'
								}`}
							>
								<MagnifyingGlassIcon className="h-6 w-6" />
								<p>Tìm kiếm</p>
							</Link>
							<Link
								to={'/user'}
								className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-black hover:bg-orange-50 ${
									window.location.pathname === '/user'
										? 'bg-orange-50'
										: 'bg-orange-200'
								}`}
							>
								<UsersIcon className="h-6 w-6" />
								<p>Quản lý người dùng</p>
							</Link>
						</>
					)}
				</div>
				<div className="flex grow items-center justify-center gap-3 lg:justify-end">
					{auth.username && (
						<p className="text-md whitespace-nowrap leading-none text-white">Xin chào <strong class="text-danger"> {auth.username}</strong></p>
					)}
					{auth.token ? (
						<button
							className="rounded-lg bg-orange-400	 px-2 py-1 text-white drop-shadow-md hover:from-indigo-500 hover:bg-orange-500 disabled:from-slate-500 disabled:to-slate-400"
							onClick={() => onLogout()}
							disabled={isLoggingOut}
						>
							{isLoggingOut ? 'Đang xử lý...' : 'Đăng xuất'}	
						</button>
					) : (
						<button className="rounded-lg bg-orange-400	 px-2 py-1 text-white drop-shadow-md hover:bg-orange-500">
							<Link to={'/login'}>Đăng nhập</Link>
						</button>
					)}
				</div>
			</>
		)
	}

	return (
		<nav className="flex flex-col items-center justify-between gap-2 bg-orange-300 px-4 py-3 drop-shadow-lg lg:flex-row lg:justify-start sm:px-8">
			<div className="flex w-full flex-row justify-between lg:w-fit">
				<button className="flex flex-row items-center gap-2" onClick={() => navigate('/')}>
					{/* <FilmIcon className="h-8 w-8 text-white" /> */}
					<img src="https://img.icons8.com/external-topaz-kerismaker/48/external-Galaxy-space-topaz-kerismaker.png" alt="" />
					<h1 className="mr-2 text-xl text-white "><strong className='uppercase'>MIS Cinemas Vietnam</strong></h1>
				</button>
				<button
					className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-700 lg:hidden"
					onClick={() => toggleMenu()}
				>
					<Bars3Icon className="h-6 w-6 text-white" />
				</button>
			</div>
			<div className="hidden grow justify-between gap-2 lg:flex">{menuLists()}</div>
			{menuOpen && <div className="flex w-full grow flex-col gap-2 lg:hidden">{menuLists()}</div>}
		</nav>
	)
}

export default Navbar
