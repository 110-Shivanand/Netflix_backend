import React, { createContext, useContext, useState, useEffect } from "react";
import { interactionsAPI } from "../api/interactions";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchWatchlist();
    else setWatchlist([]);
  }, [isAuthenticated]);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const res = await interactionsAPI.getWatchlist({ limit: 100 });
      setWatchlist(res.data);
    } catch {}
    setLoading(false);
  };

  const addToWatchlist = async (movieId = null, showId = null) => {
    try {
      await interactionsAPI.addToWatchlist({
        movie_id: movieId || undefined,
        show_id: showId || undefined,
      });
      await fetchWatchlist();
      toast.success("Added to watchlist");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to add");
    }
  };

  const removeFromWatchlist = async (movieId = null, showId = null) => {
    try {
      await interactionsAPI.removeFromWatchlist({
        movie_id: movieId || undefined,
        show_id: showId || undefined,
      });
      await fetchWatchlist();
      toast.success("Removed from watchlist");
    } catch {}
  };

  const isInWatchlist = (id) => {
    return watchlist.some(
      (item) => item.movie_id === id || item.show_id === id
    );
  };

  return (
    <WatchlistContext.Provider
      value={{ watchlist, loading, addToWatchlist, removeFromWatchlist, isInWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be inside WatchlistProvider");
  return ctx;
}
