import api from "./axios";

/** Search movies by title */
export const getMovies = (search, page = 1) =>
  api.get("/movies", { params: { search, page } });

/** Get full detail for one movie by IMDb ID */
export const getMovieDetail = (imdbId) =>
  api.get(`/movies/${imdbId}`);

/** Compat stub — pages that still import moviesAPI won't crash */
export const moviesAPI = {
  getAll:         (params) => getMovies(params?.search || "popular", params?.page || 1),
  getBySlug:      ()       => Promise.resolve({ data: null }),
  getTrending:    ()       => Promise.resolve({ data: [] }),
  getFeatured:    ()       => Promise.resolve({ data: [] }),
  getNewReleases: ()       => Promise.resolve({ data: [] }),
  getTopRated:    ()       => Promise.resolve({ data: [] }),
  getSimilar:     ()       => Promise.resolve({ data: [] }),
};
