import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaPlus, FaCheck, FaStar } from "react-icons/fa";
import { useWatchlist } from "../../context/WatchlistContext";
import { useAuth } from "../../context/AuthContext";
import "../movie/MovieCard.css";

export default function ShowCard({ show }) {
  const { isAuthenticated } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [hovered, setHovered] = useState(false);
  const inList = isInWatchlist(show.id);

  const handleWatchlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    inList ? removeFromWatchlist(null, show.id) : addToWatchlist(null, show.id);
  };

  return (
    <div
      className="card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/shows/${show.slug}`} tabIndex={-1}>
        {show.thumbnail_url ? (
          <img
            src={show.thumbnail_url}
            alt={show.title}
            className="card__poster"
            loading="lazy"
          />
        ) : (
          <div className="card__placeholder">
            <span className="card__placeholder-text">{show.title}</span>
          </div>
        )}

        {hovered && (
          <div className="card__overlay">
            <p className="card__title">{show.title}</p>

            <div className="card__meta">
              {show.average_rating > 0 && (
                <span className="card__rating">
                  <FaStar size={10} />
                  {show.average_rating.toFixed(1)}
                </span>
              )}
              <span
                className="card__maturity"
                style={{ color: show.status === "ongoing" ? "#46d369" : "#aaa", border: "none" }}
              >
                {show.status}
              </span>
            </div>

            <div className="card__actions">
              <Link
                to={`/shows/${show.slug}`}
                className="card__btn-play"
                onClick={(e) => e.stopPropagation()}
              >
                <FaPlay size={9} /> Watch
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
    </div>
  );
}
