import api from "./axios";

export const showsAPI = {
  getAll: (params) => api.get("/shows", { params }),
  getBySlug: (slug) => api.get(`/shows/${slug}`),
  getTrending: (limit = 10) => api.get("/shows/trending", { params: { limit } }),
  getFeatured: (limit = 5) => api.get("/shows/featured", { params: { limit } }),
  getTopRated: (limit = 10) => api.get("/shows/top-rated", { params: { limit } }),
  getSeasons: (showId) => api.get(`/shows/${showId}/seasons`),
  getEpisodes: (seasonId) => api.get(`/shows/seasons/${seasonId}/episodes`),
  getSimilar: (showId, limit = 8) => api.get(`/shows/${showId}/similar`, { params: { limit } }),
  create: (data) => api.post("/shows", data),
  delete: (showId) => api.delete(`/shows/${showId}`),
};
