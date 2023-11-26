import {
	ArrowsRightLeftIcon,
	ArrowsUpDownIcon,
	CheckIcon,
	PencilSquareIcon,
	TrashIcon
} from '@heroicons/react/24/solid'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DateSelector from './DateSelector'
import Theater from './Theater'

const TheaterListsByCinema = ({ cinemas, selectedCinemaIndex, setSelectedCinemaIndex, fetchCinemas, auth }) => {
	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm()

	const {
		register: registerName,
		handleSubmit: handleSubmitName,
		setValue: setValueName,
		formState: { errors: errorsName }
	} = useForm()

	const [movies, setMovies] = useState()
	const [selectedDate, setSelectedDate] = useState(
		(sessionStorage.getItem('selectedDate') && new Date(sessionStorage.getItem('selectedDate'))) || new Date()
	)
	const [isIncreasing, SetIsIncreaseing] = useState(false)
	const [isDeleting, SetIsDeleting] = useState(false)
	const [isDecreasing, SetIsDecreasing] = useState(false)
	const [isEditing, SetIsEditing] = useState(false)

	const fetchMovies = async (data) => {
		try {
			const response = await axios.get('/movie')
			// console.log(response.data.data)
			setMovies(response.data.data)
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		fetchMovies()
	}, [])

	useEffect(() => {
		SetIsEditing(false)
		setValueName('name', cinemas[selectedCinemaIndex].name)
	}, [cinemas[selectedCinemaIndex].name])

	const handleDelete = (cinema) => {
		const confirmed = window.confirm(
			`Bạn có muốn xóa ${cinema.name}, bao gồm cả phòng chiếu, lịch chiếu và tất cả vé?`
		)
		if (confirmed) {
			onDeleteCinema(cinema._id)
		}
	}

	const onDeleteCinema = async (id) => {
		try {
			SetIsDeleting(true)
			const response = await axios.delete(`/cinema/${id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			setSelectedCinemaIndex(null)
			fetchCinemas()
			toast.success('Xóa thành công', {
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

	const onIncreaseTheater = async (data) => {
		try {
			SetIsIncreaseing(true)
			const response = await axios.post(
				`/theater`,
				{
					cinema: cinemas[selectedCinemaIndex]._id,
					number: cinemas[selectedCinemaIndex].theaters.length + 1,
					row: data.row.toUpperCase(),
					column: data.column
				},
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			fetchCinemas()
			// console.log(response.data)
			toast.success('Thêm phòng thành công!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error(errors, {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetIsIncreaseing(false)
		}
	}

	const handleDecreaseTheater = (cinema) => {
		const confirmed = window.confirm(
			`Bạn có muốn xóa phòng ${cinemas[selectedCinemaIndex].theaters.length}, bao gồm cả lịch chiếu và vé?`
		)
		if (confirmed) {
			onDecreaseTheater()
		}
	}

	const onDecreaseTheater = async () => {
		try {
			SetIsDecreasing(true)
			const response = await axios.delete(`/theater/${cinemas[selectedCinemaIndex].theaters.slice(-1)[0]._id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			fetchCinemas()
			toast.success('Thêm thành công', {
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
			SetIsDecreasing(false)
		}
	}

	const onEditCinema = async (data) => {
		try {
			const response = await axios.put(
				`/cinema/${cinemas[selectedCinemaIndex]._id}`,
				{
					name: data.name
				},
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			// console.log(response.data)
			fetchCinemas(data.name)
			toast.success('Đổi tên cụm rạp thành công', {
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
		}
	}

	return (
		<div className="mx-4 h-fit rounded-md bg-white text-gray-900 drop-shadow-md sm:mx-8">
			<div className="flex items-center justify-center gap-2 rounded-t-md bg-rose-500 px-2 py-1.5 text-center text-2xl font-semibold text-white sm:py-2">
				{isEditing ? (
					<input
						title="Cinema name"
						type="text"
						required
						autoFocus
						spellCheck="false"
						className={`flex-grow rounded border border-white bg-gradient-to-br from-gray-900 to-gray-800 px-1 text-center text-2xl font-semibold drop-shadow-sm sm:text-3xl ${
							errorsName.name && 'border-2 border-red-500'
						}`}
						{...registerName('name', { required: true })}
					/>
				) : (
					<span className="flex-grow text-2xl sm:text-3xl">{cinemas[selectedCinemaIndex]?.name}</span>
				)}
				{auth.role === 'admin' && (
					<>
						{isEditing ? (
							<form onClick={handleSubmitName(onEditCinema)}>
								<button
									title="Save cinema name"
									className="flex w-fit items-center gap-1 rounded-md bg-indigo-400 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:bg-indigo-500"
									onClick={() => {
										SetIsEditing(false)
									}}
								>
									Lưu
									<CheckIcon className="h-5 w-5" />
								</button>
							</form>
						) : (
							<button
								title="Edit cinema name"
								className="flex w-fit items-center gap-1 rounded-md bg-indigo-400  py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:bg-indigo-500"
								onClick={() => SetIsEditing(true)}
							>
								Chỉnh sửa
								<PencilSquareIcon className="h-5 w-5" />
							</button>
						)}
						<button
							title="Delete cinema"
							disabled={isDeleting}
							className="flex w-fit items-center gap-1 rounded-md bg-teal-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:bg-teal-600 disabled:from-slate-500 disabled:to-slate-400"
							onClick={() => handleDelete(cinemas[selectedCinemaIndex])}
						>
							{isDeleting ? (
								'Đang xử lý...'
							) : (
								<>
									Xóa
									<TrashIcon className="h-5 w-5" />
								</>
							)}
						</button>
					</>
				)}
			</div>
			<div className="flex flex-col gap-6 p-4 sm:p-6 overflow-y-auto">
				<DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
				<form className="flex flex-col gap-4" onSubmit={handleSubmit(onIncreaseTheater)}>
					<h2 className="text-3xl font-bold">Phòng chiếu phim</h2>
					{auth.role === 'admin' && (
						<div className="flex w-full flex-wrap justify-between gap-4 rounded-md bg-gradient-to-br from-indigo-100 to-white p-4">
							<h3 className="flex items-center text-xl font-bold">Thêm phòng mới</h3>
							<div className="flex grow flex-col gap-4 sm:justify-end md:flex-row">
								<div className="flex flex-wrap justify-end gap-4">
									<div className="flex flex-wrap gap-2">
										<ArrowsUpDownIcon className="h-6 w-6" />
										<div className="my-1 flex flex-col items-end">
											<label className="text-lg font-semibold leading-5">Ghế dọc :</label>
											<label className="text-xs font-semibold">(A-DZ)</label>
										</div>
										<input
											title={errors.row ? errors.row.message : 'A to DZ'}
											type="text"
											maxLength="2"
											required
											className={`w-14 rounded px-3 py-1 text-2xl font-semibold drop-shadow-sm leading-3
											${errors.row && 'border-2 border-red-500'}`}
											{...register('row', {
												required: true,
												pattern: {
													value: /^([A-Da-d][A-Za-z]|[A-Za-z])$/,
													message: 'Invalid row'
												}
											})}
										/>
									</div>
									<div className="flex flex-wrap gap-2">
										<ArrowsRightLeftIcon className="h-6 w-6" />
										<div className="my-1 flex flex-col items-end">
											<label className="text-lg font-semibold leading-5">Ghế ngang :</label>
											<label className="text-xs font-semibold">(1-120)</label>
										</div>
										<input
											title={errors.column ? errors.column.message : '1 to 120'}
											type="number"
											min="1"
											max="120"
											maxLength="3"
											required
											className={`w-24 rounded px-3 py-1 text-2xl font-semibold drop-shadow-sm leading-3 ${
												errors.column && 'border-2 border-red-500'
											}`}
											{...register('column', { required: true })}
										/>
									</div>
								</div>
								<div className="flex grow md:grow-0">
									<div className="flex flex-col items-center justify-center gap-1 rounded-l bg-orange-500	 p-1 text-white">
										<label className="text-xs font-semibold leading-3">Phòng số</label>
										<label className="text-2xl font-semibold leading-5">
											{cinemas[selectedCinemaIndex].theaters.length + 1}
										</label>
									</div>
									<button
										title="Add theater"
										disabled={isIncreasing}
										className="flex grow items-center justify-center whitespace-nowrap rounded-r bg-orange-400 px-2 py-1 font-medium text-white drop-shadow-md hover:bg-orange-500 disabled:from-slate-500 disabled:to-slate-400 md:grow-0"
										type="submit"
									>
										{isIncreasing ? 'Đã xử lý...' : 'Thêm mới'}
									</button>
								</div>
							</div>
						</div>
					)}
				</form>
				{cinemas[selectedCinemaIndex].theaters.map((theater, index) => {
					return (
						<Theater
							key={index}
							theaterId={theater._id}
							movies={movies}
							selectedDate={selectedDate}
							setSelectedDate={setSelectedDate}
						/>
					)
				})}
				{auth.role === 'admin' && cinemas[selectedCinemaIndex].theaters.length > 0 && (
					<div className="flex justify-center">
						<button
							title="Delete last theater"
							className="w-fit rounded-md bg-rose-400 px-2 py-1 font-medium text-white drop-shadow-md hover:bg-rose-500 disabled:from-slate-500 disabled:to-slate-400"
							onClick={() => handleDecreaseTheater()}
							disabled={isDecreasing}
						>
							{isDecreasing ? 'Đang xử lý...' : 'Xóa phòng phía trên'}
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default TheaterListsByCinema
