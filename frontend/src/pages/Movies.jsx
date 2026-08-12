import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMovies } from "../api/movies";
import Spinner from "../components/common/Spinner";
import { FaSearch, FaFire, FaStar } from "react-icons/fa";
import "./Movies.css";

const QUICK = ["Action","Comedy","Thriller","Sci-Fi","Horror","Romance","Animation","Drama"];

function MovieCard({ movie, onClick }) {
  const [hov, setHov] = useState(false);
  const has = movie.Poster && movie.Poster !== "N/A";
  return (
    <div
      className={`mc ${hov ? "mc--hov" : ""}`}
      onClick={() => onClick(movie.imdbID)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick(movie.imdbID)}
    >
      {has
        ? <img src={movie.Poster} alt={movie.Title} className="mc__img" loading="lazy" />
        : <div className="mc__no-img"><span>{movie.Title}</span></div>
      }
      <div className="mc__info">
        <p className="mc__title lc2">{movie.Title}</p>
        <p className="mc__year">{movie.Year}</p>
      </div>
      <div className="mc__overlay">
        <span className="mc__play">▶</span>
      </div>
    </div>
  );
}

export default function Movies() {
  const [input,    setInput]    = useState("marvel");
  const [query,    setQuery]    = useState("marvel");
  const [movies,   setMovies]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [error,    setError]    = useState("");
  const totalPages = Math.max(1, Math.ceil(total / 10));
  const navigate   = useNavigate();

  const fetch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await getMovies(query, page);
      const { movies: list, total_results, error: e } = res.data;
      if (e) { setError(e); setMovies([]); setTotal(0); }
      else   { setMovies(list); setTotal(total_results); }
    } catch { setError("Backend unreachable. Start the server and try again."); setMovies([]); }
    finally   { setLoading(false); }
  }, [query, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const submit = e => { e.preventDefault(); setPage(1); setQuery(input.trim()); };
  const quick  = g => { setInput(g); setPage(1); setQuery(g); };
  const goPage = p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="movies-page">
      {/* ── Header ── */}
      <div className="mp-header">
        <div className="mp-header__inner">
          <h1 className="mp-header__title">
            <FaFire className="mp-header__icon" /> Browse Movies
          </h1>

          <form onSubmit={submit} className="mp-search">
            <FaSearch className="mp-search__icon" />
            <input
              className="mp-search__input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Search any movie…"
            />
            <button type="submit" className="mp-search__btn">Search</button>
          </form>

          {/* Quick filters */}
          <div className="mp-quick">
            {QUICK.map(g => (
              <button
                key={g}
                className={`mp-quick__btn ${query === g ? "mp-quick__btn--on" : ""}`}
                onClick={() => quick(g)}
              >
                {g}
              </button>
            ))}
          </div>

          {!loading && total > 0 && (
            <p className="mp-count">
              Showing <strong>{movies.length}</strong> of <strong>{total.toLocaleString()}</strong> results for "<em>{query}</em>"
            </p>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mp-content">
        {loading && <Spinner />}

        {!loading && error && (
          <div className="mp-empty">
            <p className="mp-empty__icon">⚠️</p>
            <p className="mp-empty__msg">{error}</p>
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="mp-empty">
            <p className="mp-empty__icon">🎬</p>
            <p className="mp-empty__msg">No movies found for "<strong>{query}</strong>"</p>
            <p className="mp-empty__sub">Try a different title or use the quick filters above</p>
          </div>
        )}

        {!loading && movies.length > 0 && (
          <>
            <div className="mp-grid">
              {movies.map(m => (
                <MovieCard key={m.imdbID} movie={m} onClick={id => navigate(`/movies/${id}`)} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mp-pag">
                <button className="mp-pag__btn" disabled={page === 1} onClick={() => goPage(page - 1)}>← Prev</button>
                {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`mp-pag__btn mp-pag__btn--num ${p === page ? "mp-pag__btn--on" : ""}`}
                    onClick={() => goPage(p)}
                  >
                    {p}
                  </button>
                ))}
                {totalPages > 8 && <span className="mp-pag__ellip">…{totalPages}</span>}
                <button className="mp-pag__btn" disabled={page === totalPages} onClick={() => goPage(page + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
