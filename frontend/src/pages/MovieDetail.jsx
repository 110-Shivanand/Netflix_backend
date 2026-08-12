import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMovieDetail, getMovies } from "../api/movies";
import Spinner from "../components/common/Spinner";
import {
  FaPlay, FaArrowLeft, FaImdb,
  FaStar, FaChevronLeft, FaChevronRight,
  FaFilm, FaGlobe, FaTrophy, FaDollarSign,
} from "react-icons/fa";
import "./MovieDetail.css";

/* ── Similar card ───────────────────────────────────────── */
function SimCard({ movie, onClick }) {
  const has = movie.Poster && movie.Poster !== "N/A";
  return (
    <div className="sim" onClick={() => onClick(movie.imdbID)} role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick(movie.imdbID)}>
      {has
        ? <img src={movie.Poster} alt={movie.Title} className="sim__img" loading="lazy" />
        : <div className="sim__no-img"><span>{movie.Title}</span></div>
      }
      <p className="sim__title lc1">{movie.Title}</p>
      <p className="sim__year">{movie.Year}</p>
    </div>
  );
}

/* ── Stat pill ──────────────────────────────────────────── */
function Stat({ icon, value, label, cls }) {
  return (
    <div className={`dstat ${cls || ""}`}>
      <span className="dstat__icon">{icon}</span>
      <span className="dstat__val">{value}</span>
      {label && <span className="dstat__label">{label}</span>}
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────── */
export default function MovieDetail() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const [movie,   setMovie]   = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const rowRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true); setError(""); setMovie(null); setSimilar([]);

    getMovieDetail(slug)
      .then(async res => {
        if (res.data.error) { setError(res.data.error); return; }
        setMovie(res.data);
        const g = res.data.Genre?.split(",")[0]?.trim();
        if (g) {
          const sr = await getMovies(g, 1).catch(() => null);
          if (sr) setSimilar((sr.data.movies || []).filter(m => m.imdbID !== slug));
        }
      })
      .catch(() => setError("Failed to load. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [slug]);

  const scrollRow = d => rowRef.current?.scrollBy({ left: d * 720, behavior: "smooth" });

  if (loading) return <Spinner fullPage size="lg" />;
  if (error || !movie) return (
    <div className="dp-error">
      <button className="dp-back" onClick={() => navigate(-1)}><FaArrowLeft /> Back</button>
      <p>{error || "Movie not found."}</p>
    </div>
  );

  const poster   = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : null;
  const imdb     = movie.imdbRating !== "N/A" ? movie.imdbRating : null;
  const meta     = movie.Metascore  !== "N/A" ? movie.Metascore  : null;
  const rt       = movie.Ratings?.find(r => r.Source === "Rotten Tomatoes")?.Value;
  const genres   = (movie.Genre  || "").split(", ").filter(Boolean);
  const actors   = (movie.Actors || "").split(", ").filter(Boolean);
  const writers  = (movie.Writer || "").split(", ").slice(0, 3).filter(Boolean);
  const directors= (movie.Director || "").split(", ").filter(Boolean);

  const metaColor = meta
    ? parseInt(meta) >= 61 ? "#6ec76e" : parseInt(meta) >= 41 ? "#f5c518" : "#e50914"
    : null;

  return (
    <div className="dp">
      {/* ── Cinematic Backdrop ──────────────────────────── */}
      {poster && (
        <div className="dp__backdrop">
          <img src={poster} alt="" className="dp__backdrop-img" />
          <div className="dp__backdrop-grad" />
        </div>
      )}

      {/* ── Back ──────────────────────────────────────── */}
      <button className="dp-back" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      {/* ── Hero section ──────────────────────────────── */}
      <div className="dp__hero">
        {/* Poster */}
        {poster && (
          <div className="dp__poster-wrap fade-up">
            <img src={poster} alt={movie.Title} className="dp__poster" />
            <div className="dp__poster-shine" />
          </div>
        )}

        {/* Info */}
        <div className="dp__info fade-up">
          {/* Badges */}
          <div className="dp__badges">
            {movie.Rated && movie.Rated !== "N/A" && (
              <span className="dp-badge dp-badge--rated">{movie.Rated}</span>
            )}
            <span className="dp-badge dp-badge--type">
              <FaFilm style={{ fontSize: ".65rem" }} /> {movie.Type || "Movie"}
            </span>
          </div>

          <h1 className="dp__title">{movie.Title}</h1>

          {/* Meta row */}
          <div className="dp__meta">
            {movie.Year     && <span className="dm-green">{movie.Year}</span>}
            {movie.Runtime !== "N/A" && <span className="dm-sep">·</span>}
            {movie.Runtime !== "N/A" && <span className="dm-dim">{movie.Runtime}</span>}
            {movie.Language && movie.Language !== "N/A" && (
              <>
                <span className="dm-sep">·</span>
                <span className="dm-dim"><FaGlobe style={{ fontSize: ".7rem", marginRight: 3 }} />{movie.Language.split(",")[0]}</span>
              </>
            )}
          </div>

          {/* Scores */}
          <div className="dp__scores">
            {imdb && (
              <Stat
                icon={<FaImdb style={{ color: "#f5c518", fontSize: "1.5rem" }} />}
                value={imdb} label="/10" cls="ds--imdb"
              />
            )}
            {rt && (
              <Stat icon="🍅" value={rt} cls="ds--rt" />
            )}
            {meta && (
              <Stat
                icon={<span style={{ color: metaColor, fontWeight: 900, fontSize: ".9rem" }}>M</span>}
                value={meta} label="Meta" cls="ds--meta"
              />
            )}
          </div>

          {/* Genres */}
          <div className="dp__genres">
            {genres.map(g => <span key={g} className="dp-genre">{g}</span>)}
          </div>

          {/* Actions */}
          <div className="dp__actions">
            <button className="btn btn-play dp__play">
              <FaPlay style={{ fontSize: ".8rem" }} /> Play
            </button>
          </div>

          {/* Plot */}
          {movie.Plot && movie.Plot !== "N/A" && (
            <p className="dp__plot">{movie.Plot}</p>
          )}

          {/* Credits */}
          <div className="dp__credits">
            {directors[0] && directors[0] !== "N/A" && <CreditRow label="Director" value={directors.join(", ")} />}
            {writers[0]   && writers[0]   !== "N/A" && <CreditRow label="Writers"  value={writers.join(", ")} />}
            {actors[0]    && actors[0]    !== "N/A" && <CreditRow label="Cast"     value={actors.slice(0,4).join(", ")} />}
            {movie.Country && movie.Country !== "N/A" && (
              <CreditRow label="Country" value={movie.Country} icon={<FaGlobe />} />
            )}
            {movie.Awards && movie.Awards !== "N/A" && (
              <CreditRow label="Awards" value={movie.Awards} icon={<FaTrophy />} />
            )}
            {movie.BoxOffice && movie.BoxOffice !== "N/A" && (
              <CreditRow label="Box Office" value={movie.BoxOffice} icon={<FaDollarSign />} />
            )}
          </div>
        </div>
      </div>

      {/* ── Similar ────────────────────────────────────── */}
      {similar.length > 0 && (
        <div className="dp__similar">
          <h2 className="dp__similar-title">More Like This</h2>
          <div className="dp__sim-wrap">
            <button className="row__arrow row__arrow--l" onClick={() => scrollRow(-1)}><FaChevronLeft /></button>
            <div className="dp__sim-track scrollbar-hide" ref={rowRef}>
              {similar.map(m => (
                <SimCard key={m.imdbID} movie={m} onClick={id => navigate(`/movies/${id}`)} />
              ))}
            </div>
            <button className="row__arrow row__arrow--r" onClick={() => scrollRow(1)}><FaChevronRight /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function CreditRow({ label, value, icon }) {
  return (
    <div className="credit">
      <span className="credit__label">
        {icon && <span className="credit__icon">{icon}</span>}
        {label}
      </span>
      <span className="credit__val">{value}</span>
    </div>
  );
}
