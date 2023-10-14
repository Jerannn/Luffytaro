import { useState, useEffect } from "react";

const Key = "1274012f";

export function useFetchMovies(search) {
  // Fetched Movie Data
  const [movies, setMovies] = useState([]);

  // Loader
  const [isLoading, setIsLoading] = useState(false);

  // Error Message
  const [errMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function FetchMovieData() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${Key}&s=${search}`,
          { signal: controller.signal }
        );
        if (!res.ok)
          throw new Error("Something went wrong during the fetching");

        const data = await res.json();

        if (data.Response === "False") throw new Error("Movie not found!");

        setMovies(data.Search);
        setErrorMessage("");
      } catch (error) {
        console.log(error.message);
        if (error.name !== "AbortError") setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (search.length < 3) {
      setMovies([]);
      setErrorMessage("");
      return;
    }

    // handleCloseMovie();
    FetchMovieData(search);

    return () => {
      controller.abort();
    };
  }, [search]);

  return { movies, isLoading, errMessage };
}
