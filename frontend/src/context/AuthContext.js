import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../api/auth";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
    case "LOGOUT":
      return { ...state, user: null, isAuthenticated: false, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      authAPI
        .getMe()
        .then((res) => dispatch({ type: "SET_USER", payload: res.data }))
        .catch(() => {
          localStorage.clear();
          dispatch({ type: "LOGOUT" });
        });
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, refresh_token } = res.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    const meRes = await authAPI.getMe();
    dispatch({ type: "LOGIN_SUCCESS", payload: meRes.data });
    toast.success("Welcome back!");
    return meRes.data;
  };

  const register = async (data) => {
    await authAPI.register(data);
    toast.success("Registration successful! Check your email.");
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    localStorage.clear();
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
