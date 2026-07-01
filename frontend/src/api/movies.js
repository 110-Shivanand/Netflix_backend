import api from "./axios";

export const moviesAPI = {
  getAll: (params) => api.get("/movies", { params }),
  getBySlug: (slug) => api.get(`/movies/${slug}`),
  getTrending: (limit = 10) => api.get("/movies/trending", { params: { limit } }),
  getFeatured: (limit = 5) => api.get("/movies/featured", { params: { limit } }),
  getNewReleases: (limit = 10) => api.get("/movies/new-releases", { params: { limit } }),
  getTopRated: (limit = 10) => api.get("/movies/top-rated", { params: { limit } }),
  getSimilar: (movieId, limit = 8) => api.get(`/movies/${movieId}/similar`, { params: { limit } }),
  uploadThumbnail: (movieId, file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/movies/${movieId}/thumbnail`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadBanner: (movieId, file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/movies/${movieId}/banner`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  create: (data) => api.post("/movies", data),
  update: (movieId, data) => api.put(`/movies/${movieId}`, data),
  delete: (movieId) => api.delete(`/movies/${movieId}`),
};
