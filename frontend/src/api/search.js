import api from "./axios";

export const searchAPI = {
  search: (q, params = {}) => api.get("/search", { params: { q, ...params } }),
};
