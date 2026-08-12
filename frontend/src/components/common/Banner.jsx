import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaInfoCircle, FaPlus, FaCheck } from "react-icons/fa";
import { useWatchlist } from "../../context/WatchlistContext";
import { useAuth } from "../../context/AuthContext";
import "./Banner.css";

export default function HeroBanner({ items = [] }) {
  const [current, setCurrent] = useState(0);
  const { isAuthenticated } = useAuth();
  const { addToWatchlist, isInWatchlist } = useWatchlist();

  /* auto-rotate every 8 s */
  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % items.length), 8000);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;

  const item   = items[current];
  const isMovie = !!item.duration;
  const inList  = isInWatchlist(item.id);

  const handleWatchlist = () => {
    if (!isAuthenticated) return;
    if (isMovie) addToWatchlist(item.id, null);
    else         addToWatchlist(null, item.id);
  };

  return (
    <div className="hero-banner">
      {/* Background */}
      {item.banner_url || item.thumbnail_url ? (
        <img
          src={item.banner_url || item.thumbnail_url}
          alt={item.title}
          className="hero-banner__bg"
        />
      ) : (
        <div className="hero-banner__bg-placeholder" />
      )}

      {/* Overlays */}
      <div className="hero-banner__overlay-left" />
      <div className="hero-banner__overlay-bottom" />

      {/* Content */}
      <div className="hero-banner__content">
        <h1 className="hero-banner__title">{item.title}</h1>

        {item.description && (
          <p className="hero-banner__description">{item.description}</p>
        )}

        <div className="hero-banner__actions">
          <Link
            to={isMovie ? `/watch/movie/${item.id}` : `/shows/${item.slug}`}
            className="hero-banner__btn-play"
          >
            <FaPlay size={14} /> Play
          </Link>

          <Link
            to={isMovie ? `/movies/${item.slug}` : `/shows/${item.slug}`}
            className="hero-banner__btn-info"
          >
            <FaInfoCircle size={14} /> More Info
          </Link>

          {isAuthenticated && (
            <button
              className="hero-banner__btn-watchlist"
              onClick={handleWatchlist}
              aria-label={inList ? "Remove from My List" : "Add to My List"}
            >
              {inList ? <FaCheck /> : <FaPlus />}
            </button>
          )}
        </div>
      </div>

      {/* Maturity badge */}
      {item.maturity_rating && (
        <div className="hero-banner__rating-badge">{item.maturity_rating}</div>
      )}

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="hero-banner__dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`hero-banner__dot${i === current ? " hero-banner__dot--active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
