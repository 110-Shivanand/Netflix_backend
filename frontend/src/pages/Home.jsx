import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMovies, getMovieDetail } from "../api/movies";
import Spinner from "../components/common/Spinner";
import {
  FaPlay, FaInfoCircle,
  FaChevronLeft, FaChevronRight,
  FaStar, FaPlus,
} from "react-icons/fa";
import "./Home.css";

/* ─── well-known IMDb IDs for the banner ─────────────────────
   These guarantee we always have real posters + full details. */
const BANNER_IDS = [
  "tt4154796", // Avengers: Endgame
  "tt0468569", // The Dark Knight
  "tt1375666", // Inception
  "tt0816692", // Interstellar
  "tt6751668", // Parasite
  "tt0120737", // The Lord of the Rings
];

const ROWS = [
  { title: "🔥 Trending Now",        query: "avengers"        },
  { title: "💥 Action & Adventure",  query: "action"          },
  { title: "🚀 Sci-Fi Worlds",       query: "space"           },
  { title: "😂 Comedy",              query: "comedy"          },
  { title: "😰 Thriller & Suspense", query: "thriller"        },
  { title: "🏆 Award Winners",       query: "oscar"           },
  { title: "🎨 Animation",           query: "animation"       },
  { title: "👨‍👩‍👧 Family",              query: "family"          },
];

/* ═══════════════════════════════════════════════════════════
   HERO BANNER — fetches full detail for each featured movie
═══════════════════════════════════════════════════════════ */
function Hero({ movies }) {
  const [idx,      setIdx]      = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progRef  = useRef(null);
  const navigate = useNavigate();
  const DURATION = 9000;

  /* start auto-rotate */
  const goTo = useCallback((i) => {
    setIdx(i);
    setProgress(0);
    clearInterval(timerRef.current);
    clearInterval(progRef.current);
    timerRef.current = setInterval(
      () => setIdx(n => (n + 1) % movies.length),
      DURATION,
    );
    progRef.current = setInterval(
      () => setProgress(p => Math.min(p + 100 / (DURATION / 60), 100)),
      60,
    );
  }, [movies.length]);

  useEffect(() => {
    if (!movies.length) return;
    goTo(0);
    return () => { clearInterval(timerRef.current); clearInterval(progRef.current); };
  }, [movies.length, goTo]);

  if (!movies.length) return <div className="hero hero--loading"><Spinner /></div>;

  const m       = movies[idx];
  const poster  = m.Poster  && m.Poster  !== "N/A" ? m.Poster  : null;
  const rating  = m.imdbRating && m.imdbRating !== "N/A" ? m.imdbRating : null;
  const genres  = (m.Genre || "").split(",").slice(0, 3).map(g => g.trim()).filter(Boolean);
  const runtime = m.Runtime && m.Runtime !== "N/A" ? m.Runtime : null;

  return (
    <section className="hero" aria-label="Featured movies">

      {/* ── Full-bleed backdrop ── */}
      <div className="hero__bg" key={m.imdbID}>
        {poster
          ? <img src={poster} alt="" className="hero__bg-img" />
          : <div className="hero__bg-fallback" />
        }
        <div className="hero__grad-left"   />
        <div className="hero__grad-bottom" />
        <div className="hero__grad-top"    />
      </div>

      {/* ── Content ── */}
      <div className="hero__content" key={`c-${m.imdbID}`}>

        {/* rank badge */}
        <div className="hero__badge">
          <span className="hero__badge-num">#{idx + 1}</span>
          <span className="hero__badge-text">in Movies Today</span>
        </div>

        {/* title */}
        <h1 className="hero__title">{m.Title}</h1>

        {/* meta row */}
        <div className="hero__meta">
          {m.Year   && <span className="hm hm--green">{m.Year}</span>}
          {runtime  && <><span className="hm hm--sep">·</span><span className="hm hm--dim">{runtime}</span></>}
          {rating   && (
            <span className="hm hm--gold">
              <FaStar className="hm__star" /> {rating}
            </span>
          )}
          {genres.map(g => (
            <span key={g} className="hm hm--tag">{g}</span>
          ))}
        </div>

        {/* plot */}
        {m.Plot && m.Plot !== "N/A" && (
          <p className="hero__plot lc3">{m.Plot}</p>
        )}

        {/* CTAs */}
        <div className="hero__btns">
          <button
            className="btn btn-play hero__btn"
            onClick={() => navigate(`/movies/${m.imdbID}`)}
          >
            <FaPlay style={{ fontSize: ".8rem" }} /> Play
          </button>
          <button
            className="btn btn-info hero__btn"
            onClick={() => navigate(`/movies/${m.imdbID}`)}
          >
            <FaInfoCircle style={{ fontSize: ".85rem" }} /> More Info
          </button>
        </div>
      </div>

      {/* ── Thumbnail strip (side) ── */}
      <div className="hero__strip">
        {movies.map((mv, i) => {
          const p = mv.Poster && mv.Poster !== "N/A" ? mv.Poster : null;
          return (
            <button
              key={mv.imdbID}
              className={`hero__thumb ${i === idx ? "hero__thumb--on" : ""}`}
              onClick={() => goTo(i)}
              aria-label={mv.Title}
            >
              {p
                ? <img src={p} alt={mv.Title} className="hero__thumb-img" />
                : <div className="hero__thumb-blank" />
              }
              <div className="hero__thumb-overlay" />
            </button>
          );
        })}
      </div>

      {/* ── Progress bar ── */}
      <div className="hero__prog">
        <div className="hero__prog-fill" style={{ width: `${progress}%` }} />
      </div>

    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CARD POPUP MODAL
═══════════════════════════════════════════════════════════ */
function CardPopup({ movie, onClose }) {
  const navigate = useNavigate();
  const poster  = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : null;
  const rating  = movie.imdbRating && movie.imdbRating !== "N/A" ? movie.imdbRating : null;
  const genres  = (movie.Genre || "").split(",").slice(0, 3).map(g => g.trim()).filter(Boolean);

  return (
    <div className="cpop">
      {/* hero image */}
      <div className="cpop__top">
        {poster
          ? <img src={poster} alt={movie.Title} className="cpop__img" />
          : <div className="cpop__no-img" />
        }
        <div className="cpop__img-grad" />
        <button className="cpop__x" onClick={onClose} aria-label="Close">✕</button>

        {/* title on top of image */}
        <div className="cpop__on-img">
          <p className="cpop__title lc2">{movie.Title}</p>
          <div className="cpop__meta">
            {movie.Year && <span className="cpm-green">{movie.Year}</span>}
            {rating && <span className="cpm-gold"><FaStar style={{ fontSize: ".6rem" }} />{rating}</span>}
            {movie.Runtime && movie.Runtime !== "N/A" && <span className="cpm-dim">{movie.Runtime}</span>}
          </div>
        </div>
      </div>

      {/* body */}
      <div className="cpop__body">
        {genres.length > 0 && (
          <div className="cpop__genres">
            {genres.map(g => <span key={g} className="cpop__genre">{g}</span>)}
          </div>
        )}
        {movie.Plot && movie.Plot !== "N/A" && (
          <p className="cpop__plot lc4">{movie.Plot}</p>
        )}
        <div className="cpop__btns">
          <button className="btn btn-play cpop__btn" onClick={() => navigate(`/movies/${movie.imdbID}`)}>
            <FaPlay style={{ fontSize: ".7rem" }} /> Play
          </button>
          <button className="btn btn-info cpop__btn" onClick={() => navigate(`/movies/${movie.imdbID}`)}>
            <FaInfoCircle style={{ fontSize: ".75rem" }} /> More Info
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOVIE CARD
═══════════════════════════════════════════════════════════ */
function Card({ movie }) {
  const [hov,    setHov]    = useState(false);
  const [popup,  setPopup]  = useState(null);
  const [detail, setDetail] = useState(null);
  const timer   = useRef(null);
  const navigate = useNavigate();
  const hasPoster = movie.Poster && movie.Poster !== "N/A";

  const onEnter = () => {
    timer.current = setTimeout(() => {
      setHov(true);
      if (!detail) {
        getMovieDetail(movie.imdbID)
          .then(r => { if (!r.data.error) setDetail(r.data); })
          .catch(() => {});
      }
    }, 550);
  };
  const onLeave = () => { clearTimeout(timer.current); setHov(false); };

  return (
    <>
      <div
        className={`ncard ${hov ? "ncard--hov" : ""}`}
        onClick={() => navigate(`/movies/${movie.imdbID}`)}
        onMouseEnter={onEnter} onMouseLeave={onLeave}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === "Enter" && navigate(`/movies/${movie.imdbID}`)}
        aria-label={movie.Title}
      >
        {hasPoster
          ? <img src={movie.Poster} alt={movie.Title} className="ncard__img" loading="lazy" />
          : <div className="ncard__no-img"><span>{movie.Title}</span></div>
        }
        <div className="ncard__overlay">
          <p className="ncard__name lc1">{movie.Title}</p>
          <span className="ncard__yr">{movie.Year}</span>
        </div>
        {hov && (
          <button
            className="ncard__plus"
            onClick={e => { e.stopPropagation(); setPopup(detail || movie); }}
            aria-label="More info"
          >
            <FaPlus />
          </button>
        )}
      </div>

      {popup && (
        <div className="cpop-backdrop" onClick={() => setPopup(null)}>
          <div onClick={e => e.stopPropagation()}>
            <CardPopup movie={popup} onClose={() => setPopup(null)} />
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCROLLABLE ROW
═══════════════════════════════════════════════════════════ */
function Row({ title, query }) {
  const [movies,  setMovies]  = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  useEffect(() => {
    getMovies(query, 1)
      .then(r => setMovies(r.data.movies || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query]);

  const scroll = d => trackRef.current?.scrollBy({ left: d * 720, behavior: "smooth" });

  return (
    <div className="row">
      <h2 className="row__title">{title}</h2>
      <div className="row__wrap">
        <button className="row__arrow row__arrow--l" onClick={() => scroll(-1)} aria-label="Scroll left"><FaChevronLeft /></button>
        <div className="row__track scrollbar-hide" ref={trackRef}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="ncard skeleton" style={{ flexShrink: 0, minWidth: 155, height: 232 }} />
              ))
            : movies.map(m => <Card key={m.imdbID} movie={m} />)
          }
        </div>
        <button className="row__arrow row__arrow--r" onClick={() => scroll(1)} aria-label="Scroll right"><FaChevronRight /></button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [bannerMovies, setBannerMovies] = useState([]);
  const [ready,        setReady]        = useState(false);

  useEffect(() => {
    /* fetch full detail for each banner ID in parallel */
    Promise.allSettled(
      BANNER_IDS.map(id => getMovieDetail(id))
    ).then(results => {
      const movies = results
        .filter(r => r.status === "fulfilled" && !r.value.data.error)
        .map(r => r.value.data);
      setBannerMovies(movies);
    }).finally(() => setReady(true));
  }, []);

  if (!ready) return <Spinner fullPage size="lg" />;

  return (
    <div className="home">
      <Hero movies={bannerMovies} />
      <div className="home__rows">
        {ROWS.map(r => <Row key={r.query} title={r.title} query={r.query} />)}
      </div>
    </div>
  );
}
