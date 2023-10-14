import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useFetchMovies } from "./useFetchMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKeyEvent } from "./useKeyEvent";

const average = (arr) =>
  arr.reduce((acc, curr, i, arr) => acc + curr / arr.length, 0);

const Key = "1274012f";

export default function App() {
  const [search, setSearch] = useState("");

  const { movies, isLoading, errMessage } = useFetchMovies(search);

  const [watched, setWatched] = useLocalStorageState([], "watched");

  // Selecting Movie Id
  const [selectedId, setSelectedId] = useState(null);

  function handleSelectingMovie(movieId) {
    setSelectedId((selectedId) => (selectedId === movieId ? null : movieId));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatchedMovie(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  return (
    <div className="container">
      <NavBar>
        <Search search={search} setSearch={setSearch} />
        <NumMovieResult movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !errMessage && (
            <MovieList
              movies={movies}
              onSelectingMovie={handleSelectingMovie}
            />
          )}
          {errMessage && <ErrorMessage erroMessage={errMessage} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddMovieWatched={handleAddWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} onAverage={average} />

              <WatchedMovie watched={watched} onWatchedMovie={setWatched} />
            </>
          )}
        </Box>
      </Main>
    </div>
  );
}

// LOADER
function Loader() {
  return (
    <div className="loaderContainer">
      <div className="loader"></div>
    </div>
  );
}

// Error Message
function ErrorMessage({ erroMessage }) {
  return <p className="errorMsg">{erroMessage}</p>;
}

// Selected Movie
function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddMovieWatched,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  async function getMovieDetails(selectedId) {
    setIsLoading(true);
    const res = await fetch(
      `http://www.omdbapi.com/?apikey=${Key}&i=${selectedId}`
    );
    const data = await res.json();
    setMovie(data);
    setIsLoading(false);
  }

  useEffect(() => {
    getMovieDetails(selectedId);
  }, [selectedId]);

  const {
    Poster: poster,
    Title: title,
    Genre: genre,
    Released: released,
    Runtime: runtime,
    Type: type,
    imdbRating,
    Actors: actors,
    Director: director,
    Awards: awards,
    Language: language,
    Writer: writer,
    Plot: plot,
    Year: year,
  } = movie;

  useEffect(() => {
    if (!title) return;
    document.title = title;

    return () => {
      document.title = "Luffytaro";
    };
  }, [title]);

  function handleAddWatchedMovie() {
    const newMovieWatched = {
      imdbID: selectedId,
      poster,
      title,
      year,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddMovieWatched(newMovieWatched);
    onCloseMovie();
  }

  const isWatched = watched?.find((movie) => movie.imdbID === selectedId);

  useKeyEvent("Escape", onCloseMovie);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="movieDetailsContainer">
          <button onClick={onCloseMovie} className="detailsCloseBtn">
            <i className="fa-regular fa-circle-left"></i>
          </button>
          <div className="MovieDetailsInfo">
            <div className="thumbnailImage">
              <img src={poster} alt={title} className="detailsThumbnail" />
            </div>
            <div>
              <h1>{title}</h1>
              <p>{genre}</p>
              <p>
                {released} - {runtime}
              </p>
              <p>
                <strong>Type:</strong> {type}
              </p>

              <span className="movieInfo">
                <span>
                  <i className="fa-brands fa-imdb"></i>
                  {imdbRating} <i className="fa-solid fa-star"></i>
                </span>
              </span>
            </div>
          </div>
          <div className="moreDetails">
            <div className="ratings">
              {isWatched ? (
                <span>This movie is already in your watched list</span>
              ) : (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button
                      className="addMovieBtn"
                      onClick={handleAddWatchedMovie}
                    >
                      Add Movie
                    </button>
                  )}
                </>
              )}
            </div>
            <span className="aboutMovie">
              <span>
                <strong>Actors:</strong> {actors}
              </span>
              <span>
                <strong>Director:</strong> {director}
              </span>
              <span>
                <strong>Awards:</strong> {awards}
              </span>
              <span>
                <strong>Language:</strong> {language}
              </span>
              <span>
                <strong>Writer:</strong> {writer}
              </span>
            </span>
            <p className="plot">"{plot}"</p>
          </div>
        </div>
      )}
    </>
  );
}

// NAVBAR
function NavBar({ children }) {
  return (
    <div className="nav">
      <Logo />
      {children}
    </div>
  );
}

function Logo() {
  return (
    <span className="logo">
      <i className="fa-solid fa-film"></i> Luffytaro
    </span>
  );
}

function Search({ search, setSearch }) {
  const inputEl = useRef();
  useKeyEvent("Enter", () => {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setSearch("");
  });

  return (
    <input
      className="searchBox"
      placeholder="Search movie..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumMovieResult({ movies }) {
  return (
    <p className="foundCount">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

// RENDER MOVIE
function Main({ children }) {
  return <div className="main">{children}</div>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="movies">
      <button className="hideButton" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <i className="fa-solid fa-eye-slash"></i>
        ) : (
          <i className="fa-solid fa-eye"></i>
        )}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectingMovie }) {
  return (
    <div className="movieList">
      {movies.map((movie) => (
        <FetchMovie
          movie={movie}
          key={movie.imdbID}
          onSelectingMovie={onSelectingMovie}
        >
          <h2>{movie.Title}</h2>
          <p>📅 {movie.Year}</p>
        </FetchMovie>
      ))}
    </div>
  );
}

function FetchMovie({ movie, children, onSelectingMovie }) {
  return (
    <div className="movie" onClick={() => onSelectingMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={movie.Title} className="movieSearchImage" />

      <span className="movieDescription">{children}</span>
    </div>
  );
}

function FetchWatchedMovie({ movie, onDeleteMovie, children }) {
  return (
    <div className="movie">
      <img src={movie.poster} alt={movie.title} className="movieSearchImage" />

      <span className="movieDescription">{children}</span>
      <button
        className="removeMovieBtn"
        onClick={() => onDeleteMovie(movie.imdbID)}
      >
        <i className="fa-solid fa-trash"></i>
      </button>
    </div>
  );
}
function WatchedMovie({ watched, onWatchedMovie }) {
  function handleDeleteWatchedMove(Id) {
    onWatchedMovie((watched) => watched.filter((movie) => movie.imdbID !== Id));
  }

  return (
    <div className="movieList">
      {watched.map((movie) => (
        <FetchWatchedMovie
          movie={movie}
          key={movie.title}
          onDeleteMovie={handleDeleteWatchedMove}
        >
          <h2>{movie.title}</h2>
          <span className="movieInfo">
            <span>
              <i className="fa-brands fa-imdb"></i>
              {movie.imdbRating}
            </span>
            <span>
              <i className="fa-solid fa-star"></i>
              {movie.userRating}
            </span>
            <span>
              <i className="fa-regular fa-hourglass-half"></i>
              {movie.runtime} mins
            </span>
          </span>
        </FetchWatchedMovie>
      ))}
    </div>
  );
}

function WatchedSummary({ watched, onAverage }) {
  const imdbRating = average(watched.map((movie) => movie.imdbRating));
  const userRating = average(watched.map((movie) => movie.userRating));
  const runtime = watched
    .map((movie) => movie.runtime)
    .reduce((acc, curr) => acc + curr, 0);
  return (
    <div className="summary">
      <h1>Movies you watched</h1>
      <span>
        <span className="numMovies">
          <p>
            <i className="fa-solid fa-hashtag"></i>
            <strong> {watched.length}</strong> movies
          </p>
        </span>
        <span>
          <i className="fa-brands fa-imdb"></i>

          {Math.round(imdbRating * 100) / 100}
        </span>
        <span>
          <i className="fa-solid fa-star"></i>

          {Math.round(userRating * 100) / 100}
        </span>
        <span>
          <i className="fa-regular fa-hourglass-half"></i>
          {runtime.toFixed(0)} mins
        </span>
      </span>
    </div>
  );
}
