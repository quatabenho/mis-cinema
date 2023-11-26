import {
	ChevronDoubleDownIcon,
	ChevronDoubleUpIcon,
	MagnifyingGlassIcon,
	TicketIcon,
	TrashIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
import { Fragment, useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import ShowtimeDetails from '../components/ShowtimeDetails'
import { AuthContext } from '../context/AuthContext'

const User = () => {
	const { auth } = useContext(AuthContext)
	const [users, setUsers] = useState(null)
	const [ticketsUser, setTicketsUser] = useState(null)
	const [tickets, setTickets] = useState([])
	const [isUpdating, SetIsUpdating] = useState(false)
	const [isDeleting, SetIsDeleting] = useState(false)

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors }
	} = useForm()

	const fetchUsers = async (data) => {
		try {
			// setIsFetchingShowtimesDone(false)
			const response = await axios.get('/auth/user', {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data.data)
			setUsers(response.data.data)
		} catch (error) {
			console.error(error)
		} finally {
			// setIsFetchingShowtimesDone(true)
		}
	}

	useEffect(() => {
		fetchUsers()
	}, [])

	const onUpdateUser = async (data) => {
		try {
			SetIsUpdating(true)
			const response = await axios.put(`/auth/user/${data.id}`, data, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			fetchUsers()
			toast.success(`Cập nhật ${response.data.data.username} thành ${response.data.data.role} thành công!`, {
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
			SetIsUpdating(false)
		}
	}

	const handleDelete = (data) => {
		const confirmed = window.confirm(`Do you want to delete user ${data.username}?`)
		if (confirmed) {
			onDeleteUser(data)
		}
	}

	const onDeleteUser = async (data) => {
		try {
			SetIsDeleting(true)
			const response = await axios.delete(`/auth/user/${data.id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			fetchUsers()
			toast.success(`Đã xóa!`, {
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
			SetIsDeleting(false)
		}
	}

	return (
		<div className="flex min-h-screen flex-col gap-4 bg-white pb-8 text-gray-900 sm:gap-8">
			<Navbar />
			<div className="mx-4 flex h-fit flex-col gap-2 rounded-lg bg-orange-50 p-4 drop-shadow-xl sm:mx-8 sm:p-6">
				<h2 className="text-3xl font-bold text-gray-900">Quản lý tài khoản</h2>
				<div className="relative drop-shadow-sm">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<MagnifyingGlassIcon className="h-5 w-5 stroke-2 text-gray-500" />
					</div>
					<input
						type="search"
						className="block w-full rounded-lg border border-gray-300 p-2 pl-10 text-gray-900"
						placeholder="Tìm kiếm"
						{...register('search')}
					/>
				</div>
				<div
					className={`mt-2 grid max-h-[60vh] overflow-auto rounded-md bg-gradient-to-br from-indigo-100 to-white`}
					style={{ gridTemplateColumns: 'repeat(3, minmax(max-content, 1fr)) max-content max-content' }}
				>
					<p className="sticky top-0 bg-gradient-to-br from-gray-800 to-gray-700 px-2 py-1 text-center text-xl font-semibold text-white">
						Tài khoản
					</p>
					<p className="sticky top-0 bg-gradient-to-br from-gray-800 to-gray-700 px-2 py-1 text-center text-xl font-semibold text-white">
						Email
					</p>
					<p className="sticky top-0 bg-gradient-to-br from-gray-800 to-gray-700 px-2 py-1 text-center text-xl font-semibold text-white">
						Role
					</p>
					<p className="sticky top-0 bg-gradient-to-br from-gray-800 to-gray-700 px-2 py-1 text-center text-xl font-semibold text-white">
						Vé
					</p>
					<p className="sticky top-0 bg-gradient-to-br from-gray-800 to-gray-700 px-2 py-1 text-center text-xl font-semibold text-white">
						Xóa
					</p>
					{users
						?.filter((user) => user.username.toLowerCase().includes(watch('search')?.toLowerCase() || ''))
						.map((user, index) => {
							return (
								<Fragment key={index}>
									<div className="border-t-2 border-indigo-200 px-2 py-1">{user.username}</div>
									<div className="border-t-2 border-indigo-200 px-2 py-1">{user.email}</div>
									<div className="border-t-2 border-indigo-200 px-2 py-1">{user.role}</div>
									<div className="border-t-2 border-indigo-200 px-2 py-1">
										<button
											className={`flex items-center justify-center gap-1 rounded bg-violet-300 py-1 pl-2 pr-1.5 text-sm font-medium text-whilte  disabled:from-slate-500 disabled:to-slate-400
										${
											ticketsUser === user.username
												? 'bg-violet-600 hover:bg-violet-400'
												: 'bg-violet-600 hover:bg-violet-400'
										}`}
											onClick={() => {
												setTickets(user.tickets)
												setTicketsUser(user.username)
											}}
										>
											Xem thông tin {user.tickets.length}
											<TicketIcon className="h-6 w-6" />
										</button>
									</div>
									<div className="flex gap-2 border-t-2 border-indigo-200 px-2 py-1">
										{user.role === 'user' && (
											<button
												className="flex w-[115px] items-center justify-center gap-1 rounded bg-purple-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
												onClick={() => onUpdateUser({ id: user._id, role: 'admin' })}
												disabled={isUpdating}
											>
												Set Admin
												<ChevronDoubleUpIcon className="h-5 w-5" />
											</button>
										)}
										{user.role === 'admin' && (
											<button
												className="flex w-[115px] items-center justify-center gap-1 rounded bg-purple-400 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
												onClick={() => onUpdateUser({ id: user._id, role: 'user' })}
												disabled={isUpdating}
											>
												Set User
												<ChevronDoubleDownIcon className="h-5 w-5" />
											</button>
										)}
										<button
											className="flex w-[115px] items-center justify-center gap-1 rounded bg-rose-400 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:bg-rose-500 disabled:from-slate-500 disabled:to-slate-400"
											onClick={() => handleDelete({ id: user._id, username: user.username })}
											disabled={isDeleting}
										>
											Xóa
											<TrashIcon className="h-5 w-5" />
										</button>
									</div>
								</Fragment>
							)
						})}
				</div>
				{ticketsUser && (
					<>
						<h2 className="mt-4 text-2xl font-bold text-gray-900">Xem thông tin vé của {ticketsUser} </h2>
						{tickets.length === 0 ? (
							<p className="text-center">Người dùng này chưa mua vé xem phim nào cả.</p>
						) : (
							<div className="grid grid-cols-1 gap-4 xl:grid-cols-2 min-[1920px]:grid-cols-3">
								{tickets.map((ticket, index) => {
									return (
										<div className="flex flex-col" key={index}>
											<ShowtimeDetails showtime={ticket.showtime} />
											<div className="flex h-full flex-col justify-between rounded-b-lg bg-gradient-to-br from-indigo-100 to-white text-center text-lg drop-shadow-lg md:flex-row">
												<div className="flex h-full flex-col items-center gap-x-4 px-4 py-2 md:flex-row">
													<p className="whitespace-nowrap font-semibold">Ghế : </p>
													<p>
														{ticket.seats.map((seat) => seat.row + seat.number).join(', ')}
													</p>
													<p className="whitespace-nowrap">({ticket.seats.length} seats)</p>
												</div>
											</div>
										</div>
									)
								})}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}

export default User
