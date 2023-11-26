import { TrashIcon } from '@heroicons/react/24/solid'

const MovieLists = ({ movies, search, handleDelete }) => {
	const moviesList = movies?.filter((movie) => movie.name.toLowerCase().includes(search?.toLowerCase() || ''))

	return !!moviesList.length ? (
		<div className="grid grid-cols-1 gap-4 rounded-md bg-orange-50 p-4 drop-shadow-md lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1920px]:grid-cols-5">
			{moviesList.map((movie, index) => {
				return (
					<div key={index} className="flex min-w-fit flex-grow rounded-md bg-white drop-shadow-md hover:bg-orange-300">
						<img src={movie.img} className="h-36 rounded-md object-contain drop-shadow-md sm:h-48" />
						<div className="flex flex-grow flex-col justify-between p-2">
							<div>
								<p className="text-lg font-semibold sm:text-xl">{movie.name}</p>
								<p>Thời lượng : {movie.length || '-'} phút.</p>
							</div>
							<button
								className="flex w-fit items-center gap-1 self-end rounded-md bg-red-400 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:bg-red-500"
								onClick={() => handleDelete(movie)}
							>
								Xóa
								<TrashIcon className="h-5 w-5" />
							</button>
						</div>
					</div>
				)
			})}
		</div>
	) : (
		<div>Không tìm thấy phim nào.</div>
	)
}

export default MovieLists
