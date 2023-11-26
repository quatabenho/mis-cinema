import {
	ChevronDownIcon,
	ChevronUpDownIcon,
	ChevronUpIcon,
	EyeIcon,
	EyeSlashIcon,
	FunnelIcon,
	InformationCircleIcon,
	MapIcon
} from '@heroicons/react/24/outline'
import { ArrowDownIcon, TrashIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { Fragment, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Select from 'react-tailwindcss-select'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import { AuthContext } from '../context/AuthContext'

const Search = () => {
	const { auth } = useContext(AuthContext)
	const [isOpenFilter, setIsOpenFilter] = useState(true)
	const [isDeletingCheckedShowtimes, setIsDeletingCheckedShowtimes] = useState(false)
	const [deletedCheckedShowtimes, setDeletedCheckedShowtimes] = useState(0)
	const [isReleasingCheckedShowtimes, setIsReleasingCheckedShowtimes] = useState(false)
	const [releasedCheckedShowtimes, setReleasedCheckedShowtimes] = useState(0)
	const [isUnreleasingCheckedShowtimes, setIsUnreleasingCheckedShowtimes] = useState(false)
	const [unreleasedCheckedShowtimes, setUnreleasedCheckedShowtimes] = useState(0)
	const [isFetchingShowtimesDone, setIsFetchingShowtimesDone] = useState(false)

	const [showtimes, setShowtimes] = useState([])
	const [filterCinema, setFilterCinema] = useState(null)
	const [filterTheater, setFilterTheater] = useState(null)
	const [filterMovie, setFilterMovie] = useState(null)
	const [filterDate, setFilterDate] = useState(null)
	const [filterDateFrom, setFilterDateFrom] = useState(null)
	const [filterDateTo, setFilterDateTo] = useState(null)
	const [filterPastDate, setFilterPastDate] = useState(null)
	const [filterToday, setFilterToday] = useState(null)
	const [filterFutureDate, setFilterFutureDate] = useState(null)
	const [filterTime, setFilterTime] = useState(null)
	const [filterTimeFrom, setFilterTimeFrom] = useState(null)
	const [filterTimeTo, setFilterTimeTo] = useState(null)
	const [filterReleaseTrue, setFilterReleaseTrue] = useState(null)
	const [filterReleaseFalse, setFilterReleaseFalse] = useState(null)
	const [isCheckAll, setIsCheckAll] = useState(false)
	const [checkedShowtimes, setCheckedShowtimes] = useState([])

	const [sortCinema, setSortCinema] = useState(0) // -1: descending, 0 no sort, 1 ascending
	const [sortTheater, setSortTheater] = useState(0)
	const [sortMovie, setSortMovie] = useState(0)
	const [sortDate, setSortDate] = useState(0)
	const [sortTime, setSortTime] = useState(0)
	const [sortBooked, setSortBooked] = useState(0)
	const [sortRelease, setSortRelease] = useState(0)

	const resetSort = () => {
		setSortCinema(0)
		setSortTheater(0)
		setSortMovie(0)
		setSortDate(0)
		setSortTime(0)
		setSortBooked(0)
		setSortRelease(0)
	}

	const filteredShowtimes = showtimes
		.filter((showtime) => {
			const showtimeDate = new Date(showtime.showtime)
			const year = showtimeDate.getFullYear()
			const month = showtimeDate.toLocaleString('default', { month: 'short' })
			const day = showtimeDate.getDate().toString().padStart(2, '0')
			const formattedDate = `${day} ${month} ${year}`
			const hours = showtimeDate.getHours().toString().padStart(2, '0')
			const minutes = showtimeDate.getMinutes().toString().padStart(2, '0')
			const formattedTime = `${hours} : ${minutes}`
			return (
				(!filterCinema || filterCinema.map((cinema) => cinema.value).includes(showtime.theater.cinema._id)) &&
				(!filterTheater || filterTheater.map((theater) => theater.value).includes(showtime.theater.number)) &&
				(!filterMovie || filterMovie.map((movie) => movie.value).includes(showtime.movie._id)) &&
				(!filterDate || filterDate.map((showtime) => showtime.value).includes(formattedDate)) &&
				(!filterDateFrom || new Date(filterDateFrom.value) <= new Date(formattedDate)) &&
				(!filterDateTo || new Date(filterDateTo.value) >= new Date(formattedDate)) &&
				(!filterPastDate ||
					new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) >
						new Date(formattedDate)) &&
				(!filterToday ||
					(new Date().getFullYear() === new Date(formattedDate).getFullYear() &&
						new Date().getMonth() === new Date(formattedDate).getMonth() &&
						new Date().getDate() === new Date(formattedDate).getDate())) &&
				(!filterFutureDate ||
					new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) <
						new Date(formattedDate)) &&
				(!filterTime || filterTime.map((showtime) => showtime.value).includes(formattedTime)) &&
				(!filterTimeFrom || filterTimeFrom.value <= formattedTime) &&
				(!filterTimeTo || filterTimeTo.value >= formattedTime) &&
				(!filterReleaseTrue || showtime.isRelease) &&
				(!filterReleaseFalse || !showtime.isRelease)
			)
		})
		.sort((a, b) => {
			if (sortCinema) {
				return sortCinema * a.theater.cinema.name.localeCompare(b.theater.cinema.name)
			}
			if (sortTheater) {
				return sortTheater * (a.theater.number - b.theater.number)
			}
			if (sortMovie) {
				return sortMovie * a.movie.name.localeCompare(b.movie.name)
			}
			if (sortDate) {
				return sortDate * (new Date(a.showtime) - new Date(b.showtime))
			}
			if (sortTime) {
				return (
					sortTime *
					(new Date(a.showtime)
						.getHours()
						.toString()
						.padStart(2, '0')
						.concat(new Date(a.showtime).getMinutes().toString().padStart(2, '0')) -
						new Date(b.showtime)
							.getHours()
							.toString()
							.padStart(2, '0')
							.concat(new Date(b.showtime).getMinutes().toString().padStart(2, '0')))
				)
			}
			if (sortBooked) {
				return sortBooked * (a.seats.length - b.seats.length)
			}
			if (sortRelease) {
				return sortRelease * (a.isRelease - b.isRelease)
			}
		})

	const fetchShowtimes = async (data) => {
		try {
			setIsFetchingShowtimesDone(false)
			let response
			if (auth.role === 'admin') {
				response = await axios.get('/showtime/unreleased', {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				response = await axios.get('/showtime')
			}
			// console.log(response.data.data)
			setShowtimes(response.data.data)
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingShowtimesDone(true)
		}
	}

	useEffect(() => {
		fetchShowtimes()
	}, [])

	const handleDeleteCheckedShowtimes = () => {
		const confirmed = window.confirm(
			`Do you want to delete ${checkedShowtimes.length} checked showtimes, including its tickets?`
		)
		if (confirmed) {
			onDeleteCheckedShowtimes()
		}
	}

	const onDeleteCheckedShowtimes = async () => {
		setIsDeletingCheckedShowtimes(true)
		setDeletedCheckedShowtimes(0)
		let successCounter = 0
		let errorCounter = 0
		const deletePromises = checkedShowtimes.map(async (checkedShowtime) => {
			try {
				const response = await axios.delete(`/showtime/${checkedShowtime}`, {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
				setDeletedCheckedShowtimes((prev) => prev + 1)
				successCounter++
				return response
			} catch (error) {
				console.error(error)
				errorCounter++
			}
		})
		await Promise.all(deletePromises)
		toast.success(`Delete ${successCounter} checked showtimes successful!`, {
			position: 'top-center',
			autoClose: 2000,
			pauseOnHover: false
		})
		errorCounter > 0 &&
			toast.error(`Error deleting ${errorCounter} checked showtime`, {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		resetState()
		fetchShowtimes()
		setIsDeletingCheckedShowtimes(false)
	}

	const handleReleaseCheckedShowtimes = () => {
		const confirmed = window.confirm(`Do you want to release ${checkedShowtimes.length} checked showtimes?`)
		if (confirmed) {
			onReleaseCheckedShowtimes()
		}
	}

	const onReleaseCheckedShowtimes = async () => {
		setIsReleasingCheckedShowtimes(true)
		setReleasedCheckedShowtimes(0)
		let successCounter = 0
		let errorCounter = 0
		const releasePromises = checkedShowtimes.map(async (checkedShowtime) => {
			try {
				const response = await axios.put(
					`/showtime/${checkedShowtime}`,
					{ isRelease: true },
					{
						headers: {
							Authorization: `Bearer ${auth.token}`
						}
					}
				)
				setReleasedCheckedShowtimes((prev) => prev + 1)
				successCounter++
				return response
			} catch (error) {
				console.error(error)
				errorCounter++
			}
		})
		await Promise.all(releasePromises)
		toast.success(`Phát hành ${successCounter} thành công!`, {
			position: 'top-center',
			autoClose: 2000,
			pauseOnHover: false
		})
		errorCounter > 0 &&
			toast.error(`Lỗi phát hành ${errorCounter} lịch`, {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		resetState()
		fetchShowtimes()
		setIsReleasingCheckedShowtimes(false)
	}

	const handleUnreleasedCheckedShowtimes = () => {
		const confirmed = window.confirm(`Bạn có muốn hủy ${checkedShowtimes.length} lịch đã đánh dấu?`)
		if (confirmed) {
			onUnreleasedCheckedShowtimes()
		}
	}

	const onUnreleasedCheckedShowtimes = async () => {
		setIsUnreleasingCheckedShowtimes(true)
		setUnreleasedCheckedShowtimes(0)
		let successCounter = 0
		let errorCounter = 0
		const releasePromises = checkedShowtimes.map(async (checkedShowtime) => {
			try {
				const response = await axios.put(
					`/showtime/${checkedShowtime}`,
					{ isRelease: false },
					{
						headers: {
							Authorization: `Bearer ${auth.token}`
						}
					}
				)
				setUnreleasedCheckedShowtimes((prev) => prev + 1)
				successCounter++
				return response
			} catch (error) {
				console.error(error)
				errorCounter++
			}
		})
		await Promise.all(releasePromises)
		toast.success(`Hủy ${successCounter} lịch đã đánh dấu thành công!`, {
			position: 'top-center',
			autoClose: 2000,
			pauseOnHover: false
		})
		errorCounter > 0 &&
			toast.error(`Lỗi hủy ${errorCounter} lịch`, {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		resetState()
		fetchShowtimes()
		setIsUnreleasingCheckedShowtimes(false)
	}

	const resetState = () => {
		setIsCheckAll(false)
		setCheckedShowtimes([])
	}

	const navigate = useNavigate()

	return (
		<div className="flex min-h-screen flex-col gap-4 bg-orange-0 pb-8 text-gray-900 sm:gap-8">
			<Navbar />
			<div className="mx-4 flex h-fit flex-col gap-2 rounded-lg bg-orange-50 p-4 drop-shadow-xl sm:mx-8 sm:p-6">
				<h2 className="text-3xl font-bold text-gray-900 pb-5">Tìm lịch chiếu phim</h2>
				<div className="flex flex-col gap-2 rounded-md bg-orange-100 p-4 transition-all duration-500 ease-in-out">
					<div className="flex items-center justify-between" onClick={() => setIsOpenFilter((prev) => !prev)}>
						<div className="flex items-center gap-2 text-2xl font-bold text-gray-900 pb-3">
							<FunnelIcon className="h-6 w-6" />
							Bộ lọc
						</div>
						{!isOpenFilter && (
							<ChevronDownIcon className="h-6 w-6 transition-all hover:scale-125 hover:cursor-pointer" />
						)}
						{isOpenFilter && (
							<ChevronUpIcon className="h-6 w-6 transition-all hover:scale-125 hover:cursor-pointer" />
						)}
					</div>
					{isOpenFilter && (
						<div className="">
							<div className="flex flex-col pb-3">
								<h4 className="pt-1 text-lg font-bold text-gray-800">Cụm rạp</h4>
								<Select
									value={filterCinema}
									options={Array.from(
										new Set(showtimes.map((showtime) => showtime.theater.cinema._id))
									).map((value) => ({
										value,
										label: showtimes.find((showtime) => showtime.theater.cinema._id === value)
											.theater.cinema.name
									}))}
									onChange={(value) => {
										setFilterCinema(value)
										resetState()
									}}
									isClearable={true}
									isMultiple={true}
									isSearchable={true}
									primaryColor="indigo"
								/>
							</div>
							<div className="flex flex-col pb-3">
								<h4 className="pt-1 text-lg font-bold text-gray-800">Phòng chiếu phim</h4>
								<Select
									value={filterTheater}
									options={Array.from(new Set(showtimes.map((showtime) => showtime.theater.number)))
										.sort((a, b) => a - b)
										.map((value) => ({
											value,
											label: value.toString()
										}))}
									onChange={(value) => {
										setFilterTheater(value)
										resetState()
									}}
									isClearable={true}
									isMultiple={true}
									isSearchable={true}
									primaryColor="indigo"
								/>
							</div>
							<div className="flex flex-col pb-3">
								<h4 className="pt-1 text-lg font-bold text-gray-800">Phim</h4>
								<Select
									value={filterMovie}
									options={Array.from(new Set(showtimes.map((showtime) => showtime.movie._id))).map(
										(value) => ({
											value,
											label: showtimes.find((showtime) => showtime.movie._id === value).movie.name
										})
									)}
									onChange={(value) => {
										setFilterMovie(value)
										resetState()
									}}
									isClearable={true}
									isMultiple={true}
									isSearchable={true}
									primaryColor="indigo"
								/>
							</div>
							<div className="flex flex-col pb-3">
								<h4 className="pt-1 text-lg font-bold text-gray-800">Ngày</h4>
								<Select
									value={filterDate}
									options={Array.from(
										new Set(
											showtimes.map((showtime) => {
												const showtimeDate = new Date(showtime.showtime)
												const year = showtimeDate.getFullYear()
												const month = showtimeDate.toLocaleString('default', { month: 'short' })
												const day = showtimeDate.getDate().toString().padStart(2, '0')
												return `${day} ${month} ${year}`
											})
										)
									).map((value) => ({
										value,
										label: value
									}))}
									onChange={(value) => {
										setFilterDate(value)
										resetState()
									}}
									isClearable={true}
									isMultiple={true}
									isSearchable={true}
									primaryColor="indigo"
								/>
								<div className="my-2 flex flex-col items-start gap-x-2 gap-y-1 sm:flex-row sm:items-center pb-3">
									<label className="text-md font-semibold text-gray-800">Từ</label>
									<Select
										value={filterDateFrom}
										options={Array.from(
											new Set(
												showtimes.map((showtime) => {
													const showtimeDate = new Date(showtime.showtime)
													const year = showtimeDate.getFullYear()
													const month = showtimeDate.toLocaleString('default', {
														month: 'short'
													})
													const day = showtimeDate.getDate().toString().padStart(2, '0')
													return `${day} ${month} ${year}`
												})
											)
										)
											// .filter((value) => !filterDateTo || new Date(filterDateTo.value) >= new Date(value))
											.map((value) => ({
												value,
												label: value
											}))}
										onChange={(value) => {
											setFilterDateFrom(value)
											resetState()
										}}
										isClearable={true}
										isSearchable={true}
										primaryColor="indigo"
									/>
									<label className="text-md font-semibold text-gray-800 pl-4">Đến</label>
									<Select
										value={filterDateTo}
										options={Array.from(
											new Set(
												showtimes.map((showtime) => {
													const showtimeDate = new Date(showtime.showtime)
													const year = showtimeDate.getFullYear()
													const month = showtimeDate.toLocaleString('default', {
														month: 'short'
													})
													const day = showtimeDate.getDate().toString().padStart(2, '0')
													return `${day} ${month} ${year}`
												})
											)
										)
											// .filter((value) => !filterDateFrom || new Date(filterDateFrom.value) <= new Date(value))
											.map((value) => ({
												value,
												label: value
											}))}
										onChange={(value) => {
											setFilterDateTo(value)
											resetState()
										}}
										isClearable={true}
										isSearchable={true}
										primaryColor="indigo"
									/>
								</div>
								<div className="flex flex-col items-start gap-x-8 gap-y-2 sm:flex-row sm:items-center pb-3">
									<label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
										Đã chiếu
										<input
											type="checkbox"
											className="h-6 w-6"
											checked={filterPastDate}
											onClick={(event) => {
												setFilterPastDate(event.target.checked)
												setFilterToday(false)
												setFilterFutureDate(false)
												resetState()
											}}
										/>
									</label>
									<label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
										Hôm nay
										<input
											type="checkbox"
											className="h-6 w-6"
											checked={filterToday}
											onClick={(event) => {
												setFilterPastDate(false)
												setFilterToday(event.target.checked)
												setFilterFutureDate(false)
												resetState()
											}}
										/>
									</label>
									<label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
										Sắp chiếu
										<input
											type="checkbox"
											className="h-6 w-6"
											checked={filterFutureDate}
											onClick={(event) => {
												setFilterPastDate(false)
												setFilterToday(false)
												setFilterFutureDate(event.target.checked)
												resetState()
											}}
										/>
									</label>
								</div>
							</div>
							<div className="flex flex-col">
								<h4 className="pt-1 text-lg font-bold text-gray-800">Thời gian</h4>
								<Select
									value={filterTime}
									options={Array.from(
										new Set(
											showtimes.map((showtime) => {
												const showtimeDate = new Date(showtime.showtime)
												const hours = showtimeDate.getHours().toString().padStart(2, '0')
												const minutes = showtimeDate.getMinutes().toString().padStart(2, '0')
												return `${hours} : ${minutes}`
											})
										)
									)
										.sort()
										.map((value) => ({
											value,
											label: value
										}))}
									onChange={(value) => {
										setFilterTime(value)
										resetState()
									}}
									isClearable={true}
									isMultiple={true}
									isSearchable={true}
									primaryColor="indigo"
								/>
								<div className="my-2 flex flex-col items-start gap-x-2 gap-y-1 sm:flex-row sm:items-center pb-3">
									<label className="text-md font-semibold text-gray-800">Từ</label>
									<Select
										value={filterTimeFrom}
										options={Array.from(
											new Set(
												showtimes.map((showtime) => {
													const showtimeDate = new Date(showtime.showtime)
													const hours = showtimeDate.getHours().toString().padStart(2, '0')
													const minutes = showtimeDate
														.getMinutes()
														.toString()
														.padStart(2, '0')
													return `${hours} : ${minutes}`
												})
											)
										)
											.sort()
											.map((value) => ({
												value,
												label: value
											}))}
										onChange={(value) => {
											setFilterTimeFrom(value)
											resetState()
										}}
										isClearable={true}
										isSearchable={true}
										primaryColor="indigo"
									/>
									<label className="text-md font-semibold text-gray-800 pl-4">Đến</label>
									<Select
										value={filterTimeTo}
										options={Array.from(
											new Set(
												showtimes.map((showtime) => {
													const showtimeDate = new Date(showtime.showtime)
													const hours = showtimeDate.getHours().toString().padStart(2, '0')
													const minutes = showtimeDate
														.getMinutes()
														.toString()
														.padStart(2, '0')
													return `${hours} : ${minutes}`
												})
											)
										)
											.sort()
											.map((value) => ({
												value,
												label: value
											}))}
										onChange={(value) => {
											setFilterTimeTo(value)
											resetState()
										}}
										isClearable={true}
										isSearchable={true}
										primaryColor="indigo"
									/>
								</div>
							</div>
							<div className="flex flex-col">
								<h4 className="pt-1 text-lg font-bold text-gray-800">Phát hành</h4>
								<div className="mt-1 flex flex-col items-start gap-x-8 gap-y-2 sm:flex-row sm:items-center">
									<label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
										Đã phát hành
										<input
											type="checkbox"
											className="h-6 w-6"
											checked={filterReleaseTrue}
											onClick={(event) => {
												setFilterReleaseTrue(event.target.checked)
												setFilterReleaseFalse(false)
												resetState()
											}}
										/>
									</label>
									<label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
										Chưa phát hành
										<input
											type="checkbox"
											className="h-6 w-6"
											checked={filterReleaseFalse}
											onClick={(event) => {
												setFilterReleaseTrue(false)
												setFilterReleaseFalse(event.target.checked)
												resetState()
											}}
										/>
									</label>
								</div>
							</div>
						</div>
					)}
				</div><br />
				<div className="flex items-end pb-3">
					<ArrowDownIcon className="h-8 min-h-[32px] w-8 min-w-[32px] px-1" />
					<div className="flex flex-wrap items-center gap-2 px-1">
						<button
							className="flex w-fit items-center justify-center gap-1 rounded bg-gradient-to-r from-indigo-600 to-blue-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400 md:min-w-fit"
							onClick={() => handleReleaseCheckedShowtimes()}
							disabled={checkedShowtimes.length === 0 || isReleasingCheckedShowtimes}
						>
							{isReleasingCheckedShowtimes ? (
								`${releasedCheckedShowtimes} / ${checkedShowtimes.length} lịch đã phát hành`
							) : (
								<>
									<EyeIcon className="h-5 w-5" />
									{`Phát hành ${checkedShowtimes.length} lịch đã đánh dấu`}
								</>
							)}
						</button>
						<button
							className="flex w-fit items-center justify-center gap-1 rounded bg-gradient-to-r from-indigo-600 to-blue-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400 md:min-w-fit"
							onClick={() => handleUnreleasedCheckedShowtimes()}
							disabled={checkedShowtimes.length === 0 || isUnreleasingCheckedShowtimes}
						>
							{isUnreleasingCheckedShowtimes ? (
								`${unreleasedCheckedShowtimes} / ${checkedShowtimes.length} lịch đã phát hành`
							) : (
								<>
									<EyeSlashIcon className="h-5 w-5" />
									{`Hủy ${checkedShowtimes.length} lịch đã đánh dấu`}
								</>
							)}
						</button>
						<button
							className="flex w-fit items-center justify-center gap-1 rounded bg-red-400 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:from-slate-500 disabled:to-slate-400 md:min-w-fit"
							onClick={() => handleDeleteCheckedShowtimes()}
							disabled={checkedShowtimes.length === 0 || isDeletingCheckedShowtimes}
						>
							{isDeletingCheckedShowtimes ? (
								`${deletedCheckedShowtimes} / ${checkedShowtimes.length} showtimes deleted`
							) : (
								<>
									<TrashIcon className="h-5 w-5" />
									{`Xóa ${checkedShowtimes.length} lịch đã đánh dấu`}
								</>
							)}
						</button>
					</div>

					{isFetchingShowtimesDone && (
						<div className="ml-auto flex items-center gap-1 px-1 text-sm font-medium">
							<InformationCircleIcon className="h-5 w-5" /> Hiển thị {filteredShowtimes.length} kết quả
						</div>
					)}
				</div>

				<div
					className={`mb-4 grid max-h-screen overflow-auto rounded-md bg-gradient-to-br from-indigo-100 to-white`}
					style={{ gridTemplateColumns: '34px repeat(7, minmax(max-content, 1fr)) 104px' }}
				>
					<p className="sticky top-0 flex items-center justify-center rounded-tl-md bg-red-400 text-center text-xl font-semibold text-white">
						<input
							type="checkbox"
							className="h-6 w-6"
							checked={isCheckAll}
							onChange={() => {
								if (isCheckAll) {
									setIsCheckAll(false)
									setCheckedShowtimes([])
								} else {
									setIsCheckAll(true)
									setCheckedShowtimes((prev) => [
										...prev,
										...filteredShowtimes.map((showtime) => showtime._id)
									])
								}
							}}
							disabled={!isFetchingShowtimesDone}
						/>
					</p>
					<button
						className="sticky top-0 flex justify-center bg-red-500 hover:from-gray-700 hover:to-gray-600 px-2 py-1 text-center text-xl font-semibold text-white"
						onClick={() => {
							let prevValue = sortCinema
							resetSort()
							setSortCinema(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
						}}
					>
						<p className="ml-auto">Cụm rạp</p>
						{sortCinema === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
						{sortCinema === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
						{sortCinema === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
					</button>
					<button
						className="sticky top-0 flex justify-center bg-red-400 hover:from-gray-700 hover:to-gray-600 px-2 py-1 text-center text-xl font-semibold text-white"
						onClick={() => {
							let prevValue = sortTheater
							resetSort()
							setSortTheater(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
						}}
					>
						<p className="ml-auto">Phòng chiếu</p>
						{sortTheater === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
						{sortTheater === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
						{sortTheater === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
					</button>
					<button
						className="sticky top-0 flex justify-center bg-red-500 hover:from-gray-700 hover:to-gray-600 px-2 py-1 text-center text-xl font-semibold text-white"
						onClick={() => {
							let prevValue = sortMovie
							resetSort()
							setSortMovie(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
						}}
					>
						<p className="ml-auto">Phim</p>
						{sortMovie === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
						{sortMovie === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
						{sortMovie === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
					</button>
					<button
						className="sticky top-0 flex justify-center bg-red-400 hover:from-gray-700 hover:to-gray-600 px-2 py-1 text-center text-xl font-semibold text-white"
						onClick={() => {
							let prevValue = sortDate
							resetSort()
							setSortDate(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
						}}
					>
						<p className="ml-auto">Ngày</p>
						{sortDate === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
						{sortDate === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
						{sortDate === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
					</button>
					<button
						className="sticky top-0 flex justify-center bg-red-500 hover:from-gray-700 hover:to-gray-600 px-2 py-1 text-center text-xl font-semibold text-white"
						onClick={() => {
							let prevValue = sortTime
							resetSort()
							setSortTime(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
						}}
					>
						<p className="ml-auto">Thời gian</p>
						{sortTime === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
						{sortTime === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
						{sortTime === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
					</button>
					<button
						className="sticky top-0 flex justify-center bg-red-400 hover:from-gray-700 hover:to-gray-600 px-2 py-1 text-center text-xl font-semibold text-white"
						onClick={() => {
							let prevValue = sortBooked
							resetSort()
							setSortBooked(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
						}}
					>
						<p className="ml-auto">Đã đặt vé</p>
						{sortBooked === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
						{sortBooked === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
						{sortBooked === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
					</button>
					<button
						className="sticky top-0 flex justify-center bg-red-500 hover:from-gray-700 hover:to-gray-600 px-2 py-1 text-center text-xl font-semibold text-white"
						onClick={() => {
							let prevValue = sortRelease
							resetSort()
							setSortRelease(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
						}}
					>
						<p className="ml-auto">Phát hành</p>
						{sortRelease === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
						{sortRelease === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
						{sortRelease === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
					</button>
					<p className="sticky top-0 z-[1] flex items-center justify-center gap-2 rounded-tr-md bg-red-400 px-2 py-1 text-center text-xl font-semibold text-white">
						<MapIcon className="h-6 w-6" />
						Xem
					</p>
					{isFetchingShowtimesDone &&
						filteredShowtimes.map((showtime, index) => {
							const showtimeDate = new Date(showtime.showtime)
							const year = showtimeDate.getFullYear()
							const month = showtimeDate.toLocaleString('default', { month: 'short' })
							const day = showtimeDate.getDate().toString().padStart(2, '0')
							const hours = showtimeDate.getHours().toString().padStart(2, '0')
							const minutes = showtimeDate.getMinutes().toString().padStart(2, '0')
							const isCheckedRow = checkedShowtimes.includes(showtime._id)
							return (
								<Fragment key={index}>
									<div
										className={`flex items-center justify-center border-t-2 border-indigo-200 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>
										<input
											id={showtime._id}
											type="checkbox"
											className="h-6 w-6"
											checked={checkedShowtimes.includes(showtime._id)}
											onChange={(e) => {
												const { id, checked } = e.target
												setCheckedShowtimes((prev) => [...prev, id])
												if (!checked) {
													setCheckedShowtimes((prev) => prev.filter((item) => item !== id))
												}
											}}
											disabled={!isFetchingShowtimesDone}
										/>
									</div>
									<div
										className={`border-t-2 border-indigo-200 px-2 py-1 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>
										{showtime.theater.cinema.name}
									</div>
									<div
										className={`border-t-2 border-indigo-200 px-2 py-1 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>
										{showtime.theater.number}
									</div>
									<div
										className={`border-t-2 border-indigo-200 px-2 py-1 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>
										{showtime.movie.name}
									</div>
									<div
										className={`border-t-2 border-indigo-200 px-2 py-1 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>{`${day} ${month} ${year}`}</div>
									<div
										className={`border-t-2 border-indigo-200 px-2 py-1 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>{`${hours} : ${minutes}`}</div>
									<div
										className={`border-t-2 border-indigo-200 px-2 py-1 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>
										{showtime.seats.length}
									</div>
									<div
										className={`flex items-center gap-2 border-t-2 border-indigo-200 px-2 py-1 ${
											isCheckedRow && 'border-white bg-blue-200 text-blue-800'
										}`}
									>
										<p>
											{String(showtime.isRelease).charAt(0).toUpperCase() +
												String(showtime.isRelease).slice(1)}
										</p>
										{!showtime.isRelease && (
											<EyeSlashIcon className="h-5 w-5" title="Unreleased showtime" />
										)}
									</div>
									<button
										className="flex items-center justify-center gap-2 bg-red-300 px-2 py-1 text-white drop-shadow-md hover:bg-red-600 disabled:from-slate-500 disabled:to-slate-400"
										onClick={() => navigate(`/showtime/${showtime._id}`)}
									>
										<MapIcon className="h-6 w-6" />
										Chi tiết
									</button>
								</Fragment>
							)
						})}
				</div>
				{!isFetchingShowtimesDone && <Loading />}
			</div>
		</div>
	)
}

export default Search
