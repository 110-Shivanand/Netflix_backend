import api from "./axios";

export const interactionsAPI = {
  updateProgress: (data) => api.post("/interactions/watch-progress", data),
  getHistory: (params) => api.get("/interactions/watch-history", { params }),
  getContinueWatching: () => api.get("/interactions/continue-watching"),
  addToWatchlist: (data) => api.post("/interactions/watchlist", data),
  removeFromWatchlist: (params) => api.delete("/interactions/watchlist", { params }),
  getWatchlist: (params) => api.get("/interactions/watchlist", { params }),
  rateContent: (data) => api.post("/interactions/rate", data),
  createReview: (data) => api.post("/interactions/reviews", data),
  getReviews: (params) => api.get("/interactions/reviews", { params }),
  deleteReview: (reviewId) => api.delete(`/interactions/reviews/${reviewId}`),
};
