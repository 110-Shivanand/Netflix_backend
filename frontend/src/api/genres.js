import api from "./axios";

export const genresAPI = {
  getAll: () => api.get("/genres"),
  create: (data) => api.post("/genres", data),
  delete: (genreId) => api.delete(`/genres/${genreId}`),
};
