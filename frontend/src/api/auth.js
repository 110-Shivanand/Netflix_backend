import api from "./axios";

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  refresh: (refresh_token) => api.post("/auth/refresh", { refresh_token }),
  verifyEmail: (token) => api.post("/auth/verify-email", { token }),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, new_password) =>
    api.post("/auth/reset-password", { token, new_password }),
  getMe: () => api.get("/users/me"),
};
