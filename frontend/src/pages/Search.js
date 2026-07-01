import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchAPI } from "../api/search";
import MovieCard from "../components/movie/MovieCard";
import ShowCard  from "../components/show/ShowCard";
import Spinner   from "../components/common/Spinner";
import { useDebounce } from "../hooks/useDebounce";
import "./Search.css";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query,   setQuery]   = useState(searchParams.get("q") || "");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter,  setFilter]  = useState("all"); // all | movies | shows
  const debounced = useDebounce(query, 400);

  useEffect(() => {
    if (!debounced.trim()) { setResults(null); return; }
    setSearchParams({ q: debounced }, { replace: true });
    setLoading(true);
    searchAPI
      .search(debounced)
      .then((res) => setResults(res.data))
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, [debounced]); // eslint-disable-line

  const movies = results?.movies || [];
  const shows  = results?.shows  || [];
  const total  = movies.length + shows.length;

  return (
    <div className="search-page">
      {/* Search input */}
      <div className="search-page__input-wrap">
        <input
          type="text"
          className="search-page__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies, shows, actors…"
          aria-label="Search"
          autoFocus
        />
      </div>

      {/* Filter tabs */}
      {results && (
        <div className="search-page__filters">
          {[
            { key: "all",    label: `All (${total})` },
            { key: "movies", label: `Movies (${movies.length})` },
            { key: "shows",  label: `Shows (${shows.length})` },
          ].map((f) => (
            <button
              key={f.key}
              className={`search-filter-btn${filter === f.key ? " search-filter-btn--active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && <Spinner />}

      {/* Empty query */}
      {!loading && !query && (
        <div className="search-page__empty">
          <p className="search-page__empty-title">What do you want to watch?</p>
          <p className="search-page__empty-sub">
            Search for movies, TV shows, actors and more.
          </p>
        </div>
      )}

      {/* No results */}
      {!loading && query && results && total === 0 && (
        <div className="search-page__empty">
          <p className="search-page__empty-title">No results for "{query}"</p>
          <p className="search-page__empty-sub">
            Try different keywords or check your spelling.
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && results && total > 0 && (
        <>
          {(filter === "all" || filter === "movies") && movies.length > 0 && (
            <div className="search-page__section">
              <h2 className="search-page__section-title">Movies</h2>
              <div className="content-grid">
                {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
              </div>
            </div>
          )}

          {(filter === "all" || filter === "shows") && shows.length > 0 && (
            <div className="search-page__section">
              <h2 className="search-page__section-title">TV Shows</h2>
              <div className="content-grid">
                {shows.map((s) => <ShowCard key={s.id} show={s} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
