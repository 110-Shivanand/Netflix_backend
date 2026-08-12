import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMovies, getMovieDetail } from "../../api/movies";
import { FaImdb, FaStar, FaFilm, FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import "./Footer.css";

const NAV_COLS = [
  {
    heading: "Explore",
    links: [
      { label: "Home",    to: "/" },
      { label: "Movies",  to: "/movies" },
      { label: "Search",  to: "/search" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us",       to: "#" },
      { label: "Investor Relations", to: "#" },
      { label: "Jobs",           to: "#" },
      { label: "Media Centre",   to: "#" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Centre",     to: "#" },
      { label: "Terms of Use",    to: "#" },
      { label: "Privacy Policy",  to: "#" },
      { label: "Cookie Preferences", to: "#" },
      { label: "Contact Us",      to: "#" },
    ],
  },
];

const SOCIALS = [
  { icon: <FaFacebookF />,  href: "#", label: "Facebook" },
  { icon: <FaTwitter />,    href: "#", label: "Twitter"  },
  { icon: <FaInstagram />,  href: "#", label: "Instagram"},
  { icon: <FaYoutube />,    href: "#", label: "YouTube"  },
];

/* ── Spotlight: random featured movie ─────────────────────── */
function Spotlight() {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    let alive = true;
    getMovies("blockbuster", 1)
      .then(async (res) => {
        const list = res.data.movies || [];
        if (!list.length || !alive) return;
        // pick a random entry from results
        const pick = list[Math.floor(Math.random() * list.length)];
        const detail = await getMovieDetail(pick.imdbID).catch(() => null);
        if (detail && detail.data && !detail.data.error && alive) {
          setMovie(detail.data);
        } else if (alive) {
          setMovie(pick); // fallback to search result
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!movie) return null;

  const poster   = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : null;
  const rating   = movie.imdbRating && movie.imdbRating !== "N/A" ? movie.imdbRating : null;
  const genres   = movie.Genre?.split(", ").slice(0, 2) || [];
  const year     = movie.Year;
  const runtime  = movie.Runtime && movie.Runtime !== "N/A" ? movie.Runtime : null;
  const plot     = movie.Plot && movie.Plot !== "N/A" ? movie.Plot : null;
  const imdbId   = movie.imdbID;

  return (
    <div className="ft-spotlight">
      <div className="ft-spotlight__label">
        <FaFilm className="ft-spotlight__label-icon" />
        Featured Movie
      </div>

      <div className="ft-spotlight__card">
        {poster && (
          <Link to={`/movies/${imdbId}`} className="ft-spotlight__poster-wrap">
            <img src={poster} alt={movie.Title} className="ft-spotlight__poster" loading="lazy" />
            <div className="ft-spotlight__poster-shine" />
          </Link>
        )}

        <div className="ft-spotlight__info">
          <Link to={`/movies/${imdbId}`} className="ft-spotlight__title">
            {movie.Title}
          </Link>

          <div className="ft-spotlight__meta">
            {year && <span className="ft-meta-green">{year}</span>}
            {runtime && <span className="ft-meta-dim">· {runtime}</span>}
            {rating && (
              <span className="ft-meta-rating">
                <FaImdb className="ft-meta-imdb" />
                {rating}
              </span>
            )}
          </div>

          {genres.length > 0 && (
            <div className="ft-spotlight__genres">
              {genres.map(g => <span key={g} className="ft-genre-tag">{g}</span>)}
            </div>
          )}

          {plot && <p className="ft-spotlight__plot lc3">{plot}</p>}

          <Link to={`/movies/${imdbId}`} className="ft-spotlight__cta">
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Footer ─────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer className="footer">
      {/* Spotlight */}
      <Spotlight />

      <div className="footer__divider" />

      {/* Main grid */}
      <div className="footer__grid">
        {/* Brand col */}
        <div className="footer__brand">
          <span className="footer__logo">NETFLIX</span>
          <p className="footer__tagline">
            Unlimited movies, TV shows, and more. Watch anywhere. Cancel anytime.
          </p>
          <div className="footer__socials">
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} aria-label={s.label} className="footer__social-btn">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Nav cols */}
        {NAV_COLS.map(col => (
          <div key={col.heading} className="footer__col">
            <p className="footer__col-heading">{col.heading}</p>
            <ul className="footer__col-links">
              {col.links.map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="footer__col-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <p className="footer__copy">© {new Date().getFullYear()} Netflix Clone · Powered by OMDb API</p>
        <p className="footer__copy footer__copy--right">Not affiliated with Netflix, Inc.</p>
      </div>
    </footer>
  );
}
