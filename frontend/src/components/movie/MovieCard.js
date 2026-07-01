import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaPlus, FaCheck, FaStar } from "react-icons/fa";
import { useWatchlist } from "../../context/WatchlistContext";
import { useAuth } from "../../context/AuthContext";
import "./MovieCard.css";

export default function MovieCard({ movie, progress = 0 }) {
  const { isAuthenticated } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [hovered, setHovered] = useState(false);
  const inList = isInWatchlist(movie.id);

  const handleWatchlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    inList ? removeFromWatchlist(movie.id, null) : addToWatchlist(movie.id, null);
  };

  const progressPct = movie.duration && progress
    ? Math.min(100, Math.round((progress / movie.duration) * 100))
    : 0;

  return (
    <div
      className="card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* NEW badge */}
      {movie.is_new_release && <span className="card__new-badge">New</span>}

      <Link to={`/movies/${movie.slug}`} tabIndex={-1}>
        {movie.thumbnail_url ? (
          <img
            src={movie.thumbnail_url}
            alt={movie.title}
            className="card__poster"
            loading="lazy"
          />
        ) : (
          <div className="card__placeholder">
            <span className="card__placeholder-text">{movie.title}</span>
          </div>
        )}

        {/* Hover overlay */}
        {hovered && (
          <div className="card__overlay">
            <p className="card__title">{movie.title}</p>

            <div className="card__meta">
              {movie.average_rating > 0 && (
                <span className="card__rating">
                  <FaStar size={10} />
                  {movie.average_rating.toFixed(1)}
                </span>
              )}
              {movie.maturity_rating && (
                <span className="card__maturity">{movie.maturity_rating}</span>
              )}
            </div>

            <div className="card__actions">
              <Link
                to={`/watch/movie/${movie.id}`}
                className="card__btn-play"
                onClick={(e) => e.stopPropagation()}
              >
                <FaPlay size={9} /> Play
              </Link>

              {isAuthenticated && (
                <button
                  className={`card__btn-list${inList ? " card__btn-list--active" : ""}`}
                  onClick={handleWatchlist}
                  aria-label={inList ? "Remove from My List" : "Add to My List"}
                >
                  {inList ? <FaCheck size={10} /> : <FaPlus size={10} />}
                </button>
              )}
            </div>
          </div>
        )}
      </Link>

      {/* Watch-progress bar */}
      {progressPct > 0 && (
        <div className="card__progress">
          <div className="card__progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      )}
    </div>
  );
}
