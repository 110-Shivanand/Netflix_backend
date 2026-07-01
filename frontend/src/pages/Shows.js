import React, { useState, useEffect, useCallback } from "react";
import ShowCard  from "../components/show/ShowCard";
import Spinner   from "../components/common/Spinner";
import { showsAPI } from "../api/shows";
import { genresAPI } from "../api/genres";
import "./Watchlist.css";

const PAGE_SIZE = 24;

export default function Shows() {
  const [shows,         setShows]         = useState([]);
  const [genres,        setGenres]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [selectedGenre, setSelectedGenre] = useState("");

  useEffect(() => {
    genresAPI.getAll().then((r) => setGenres(r.data)).catch(() => {});
  }, []);

  const loadShows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await showsAPI.getAll({
        page,
        page_size: PAGE_SIZE,
        genre: selectedGenre || undefined,
      });
      setShows(res.data.items || []);
      setTotalPages(res.data.total_pages || 1);
    } catch {
      setShows([]);
    } finally {
      setLoading(false);
    }
  }, [page, selectedGenre]);

  useEffect(() => { loadShows(); }, [loadShows]);

  const handleGenre = (slug) => { setSelectedGenre(slug); setPage(1); };

  return (
    <div className="browse-page">
      <div className="browse-page__header">
        <h1 className="browse-page__title">TV Shows</h1>

        <div className="genre-filter-bar">
          <button
            className={`genre-filter-btn ${!selectedGenre ? "genre-filter-btn--active" : "genre-filter-btn--default"}`}
            onClick={() => handleGenre("")}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              className={`genre-filter-btn ${selectedGenre === g.slug ? "genre-filter-btn--active" : "genre-filter-btn--default"}`}
              onClick={() => handleGenre(g.slug)}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : shows.length === 0 ? (
        <div className="watchlist-empty">
          <p className="watchlist-empty__title">No shows found.</p>
        </div>
      ) : (
        <>
          <div className="content-grid">
            {shows.map((s) => <ShowCard key={s.id} show={s} />)}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination__btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="pagination__info">Page {page} of {totalPages}</span>
              <button
                className="pagination__btn"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
