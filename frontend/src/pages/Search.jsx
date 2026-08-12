import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getMovies } from "../api/movies";
import Spinner from "../components/common/Spinner";
import { useDebounce } from "../hooks/useDebounce";
import { FaSearch } from "react-icons/fa";
import "./Search.css";

function Card({ movie, onClick }) {
  const has = movie.Poster && movie.Poster !== "N/A";
  return (
    <div className="sc" onClick={() => onClick(movie.imdbID)} role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick(movie.imdbID)}>
      {has
        ? <img src={movie.Poster} alt={movie.Title} className="sc__img" loading="lazy" />
        : <div className="sc__no-img"><span>{movie.Title}</span></div>
      }
      <div className="sc__body">
        <p className="sc__title lc2">{movie.Title}</p>
        <p className="sc__year">{movie.Year}</p>
      </div>
    </div>
  );
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [query,   setQuery]   = useState(params.get("q") || "");
  const [movies,  setMovies]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const dq        = useDebounce(query, 380);
  const navigate  = useNavigate();
  const totalPages = Math.max(1, Math.ceil(total / 10));

  useEffect(() => { setPage(1); }, [dq]);

  useEffect(() => {
    if (!dq.trim()) { setMovies([]); setTotal(0); return; }
    setParams({ q: dq }, { replace: true });
    setLoading(true);
    getMovies(dq, page)
      .then(r => { setMovies(r.data.movies || []); setTotal(r.data.total_results || 0); })
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [dq, page]); // eslint-disable-line

  return (
    <div className="sp">
      {/* ── Search bar ── */}
      <div className="sp__bar-wrap">
        <div className="sp__bar-inner">
          <FaSearch className="sp__bar-icon" />
          <input
            className="sp__bar-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search movies by title…"
            autoFocus
          />
          {query && (
            <button className="sp__bar-clear" onClick={() => { setQuery(""); setMovies([]); }}>✕</button>
          )}
        </div>
        {!loading && total > 0 && dq && (
          <p className="sp__count">{total.toLocaleString()} results for "<strong>{dq}</strong>"</p>
        )}
      </div>

      {/* ── States ── */}
      {loading && <div style={{ padding: "48px 4%" }}><Spinner /></div>}

      {!loading && !query && (
        <div className="sp__empty">
          <div className="sp__empty-icon">🎬</div>
          <p className="sp__empty-title">Find your next watch</p>
          <p className="sp__empty-sub">Search across thousands of movies from every genre</p>
        </div>
      )}

      {!loading && query && movies.length === 0 && (
        <div className="sp__empty">
          <div className="sp__empty-icon">😕</div>
          <p className="sp__empty-title">No results for "{query}"</p>
          <p className="sp__empty-sub">Try checking your spelling or use a different keyword</p>
        </div>
      )}

      {!loading && movies.length > 0 && (
        <div className="sp__results">
          <div className="sp__grid">
            {movies.map(m => <Card key={m.imdbID} movie={m} onClick={id => navigate(`/movies/${id}`)} />)}
          </div>

          {totalPages > 1 && (
            <div className="sp__pag">
              <button className="mp-pag__btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span className="sp__pag-info">Page {page} of {totalPages}</span>
              <button className="mp-pag__btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
