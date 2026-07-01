import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../context/WatchlistContext";
import { useAuth }      from "../context/AuthContext";
import MovieCard from "../components/movie/MovieCard";
import ShowCard  from "../components/show/ShowCard";
import Spinner   from "../components/common/Spinner";
import api       from "../api/axios";
import "./Watchlist.css";

export default function Watchlist() {
  const { watchlist, loading } = useWatchlist();
  const { isAuthenticated }    = useAuth();
  const navigate               = useNavigate();
  const [enriched,  setEnriched]  = useState([]);
  const [enriching, setEnriching] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
  }, [isAuthenticated, navigate]);

  /* enrich watchlist items with full content data */
  useEffect(() => {
    if (!watchlist.length) { setEnriched([]); return; }
    setEnriching(true);

    Promise.all(
      watchlist.map(async (item) => {
        try {
          if (item.movie_id) {
            const res = await api.get(`/movies?page=1&page_size=100`);
            const found = res.data.items?.find((m) => m.id === item.movie_id);
            return found ? { ...found, _type: "movie", _wid: item.id } : null;
          }
          if (item.show_id) {
            const res = await api.get(`/shows?page=1&page_size=100`);
            const found = res.data.items?.find((s) => s.id === item.show_id);
            return found ? { ...found, _type: "show", _wid: item.id } : null;
          }
        } catch { return null; }
        return null;
      })
    ).then((results) => {
      setEnriched(results.filter(Boolean));
    }).finally(() => setEnriching(false));
  }, [watchlist]);

  if (loading || enriching) return <Spinner />;

  return (
    <div className="browse-page">
      <div className="browse-page__header">
        <h1 className="browse-page__title">My List</h1>
      </div>

      {watchlist.length === 0 ? (
        <div className="watchlist-empty">
          <p className="watchlist-empty__title">Your list is empty.</p>
          <p className="watchlist-empty__sub">
            Add movies and shows with the + button.
          </p>
        </div>
      ) : (
        <div className="content-grid">
          {enriched.map((item) =>
            item._type === "movie"
              ? <MovieCard key={item._wid} movie={item} />
              : <ShowCard  key={item._wid} show={item}  />
          )}
        </div>
      )}
    </div>
  );
}
