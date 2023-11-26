import 'react-toastify/dist/ReactToastify.css'
import Loading from './Loading'

const NowShowing = ({ movies, selectedMovieIndex, setSelectedMovieIndex, auth, isFetchingMoviesDone }) => {
	return (
		<div className="mx-4 flex flex-col rounded-md bg-orange-100	p-4 text-gray-900 drop-shadow-md sm:mx-8 sm:p-6">
			<h2 className="text-3xl font-bold">Phim đang chiếu</h2>
			{isFetchingMoviesDone ? (
				movies.length ? (
					<div className="mt-1 overflow-x-auto sm:mt-3">
						<div className="mx-auto flex w-fit gap-5">
							{movies?.map((movie, index) => {
								return movies[selectedMovieIndex]?._id === movie._id ? (
									<div
										key={index}
										title={movie.name}
										className="flex w-[108px] flex-col rounded-md bg-orange-300 p-1 text-white drop-shadow-md hover:bg-orange-300	p-2 sm:w-[300px]"
										onClick={() => {
											setSelectedMovieIndex(null)
											sessionStorage.setItem('selectedMovieIndex', null)
										}}
									>
										<img
											src={movie.img}
											className="h-96 rounded-md object-cover drop-shadow-md sm:h-96"
										/> 
										<p className="truncate p-5 text-center text-black  text-xl font-semibold leading-4">
											{movie.name}
										</p>
									</div>
								) : (
									<div
										key={index}
										className="flex w-[108px] flex-col rounded-md  p-1 drop-shadow-md hover:bg-orange-300 sm:w-[300px] p-2"
										onClick={() => {
											setSelectedMovieIndex(index)
											sessionStorage.setItem('selectedMovieIndex', index)
										}}
									>
										<img
											src={movie.img}
											className="h-96 rounded-md object-cover drop-shadow-md sm:h-96"
										/> 
										<p className="truncate p-5 text-center text-xl font-semibold leading-4 text-black">
											{movie.name}
										</p>
									</div>
								)
							})}
							
						</div> <br />
					</div>
				) : (
					<p className="mt-4 text-center">Không có phim nào</p>
				)
			) : (
				<Loading />
			)}
		</div>
	)
}

export default NowShowing
