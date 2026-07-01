import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaPlay, FaPlus, FaCheck, FaStar, FaHeart } from "react-icons/fa";
import { moviesAPI } from "../api/movies";
import { interactionsAPI } from "../api/interactions";
import ContentRow from "../components/common/ContentRow";
import Spinner from "../components/common/Spinner";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";
import toast from "react-hot-toast";
import "./Home.css";

export default function MovieDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await moviesAPI.getBySlug(slug);
        setMovie(res.data);
        const [simRes, revRes] = await Promise.allSettled([
          moviesAPI.getSimilar(res.data.id),
          interactionsAPI.getReviews({ movie_id: res.data.id }),
        ]);
        if (simRes.status === "fulfilled") setSimilar(simRes.value.data);
        if (revRes.status === "fulfilled") setReviews(revRes.value.data);
      } catch {
        toast.error("Movie not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleRate = async (score) => {
    if (!isAuthenticated) return toast.error("Sign in to rate");
    try {
      await interactionsAPI.rateContent({ movie_id: movie.id, score });
      setUserRating(score);
      toast.success(`Rated ${score}/10`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to rate");
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    try {
      const res = await interactionsAPI.createReview({ movie_id: movie.id, content: reviewText });
      setReviews((prev) => [res.data, ...prev]);
      setReviewText("");
      toast.success("Review posted");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to post review");
    }
  };

  const inList = movie && isInWatchlist(movie.id);

  if (loading) return <Spinner size="lg" />;
  if (!movie) return <p className="text-center text-gray-400 pt-32">Movie not found.</p>;

  return (
    <div className="min-h-screen bg-netflix-dark">
      {/* Banner */}
      <div className="relative h-[60vh] min-h-[400px]">
        {movie.banner_url || movie.thumbnail_url ? (
          <img
            src={movie.banner_url || movie.thumbnail_url}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </div>

      {/* Details */}
      <div className="px-6 md:px-16 -mt-32 relative z-10">
        <div className="flex gap-8 flex-col md:flex-row">
          {/* Poster */}
          {movie.thumbnail_url && (
            <div className="hidden md:block flex-shrink-0">
              <img
                src={movie.thumbnail_url}
                alt={movie.title}
                className="w-48 rounded-md shadow-2xl"
              />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-white text-3xl md:text-5xl font-bold mb-3">{movie.title}</h1>

            <div className="flex items-center gap-4 mb-4 text-sm text-gray-300 flex-wrap">
              {movie.release_date && <span>{new Date(movie.release_date).getFullYear()}</span>}
              {movie.duration && (
                <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
              )}
              {movie.maturity_rating && (
                <span className="border border-gray-500 px-1.5 py-0.5 text-xs">
                  {movie.maturity_rating}
                </span>
              )}
              {movie.average_rating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <FaStar className="text-xs" /> {movie.average_rating.toFixed(1)} / 10
                </span>
              )}
              {movie.language && <span className="text-gray-400 uppercase">{movie.language}</span>}
            </div>

            {/* Genre tags */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {movie.genres?.map((g) => (
                <span key={g.id} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                  {g.name}
                </span>
              ))}
            </div>

            {movie.description && (
              <p className="text-gray-300 text-sm md:text-base max-w-2xl mb-6 leading-relaxed">
                {movie.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <Link
                to={`/watch/movie/${movie.id}`}
                className="flex items-center gap-2 bg-white text-black font-bold px-8 py-3 rounded hover:bg-gray-200 transition-colors"
              >
                <FaPlay /> Play
              </Link>
              {isAuthenticated && (
                <button
                  onClick={() => inList ? removeFromWatchlist(movie.id) : addToWatchlist(movie.id)}
                  className="flex items-center gap-2 border-2 border-gray-400 text-white px-6 py-3 rounded hover:border-white transition-colors"
                >
                  {inList ? (
                    <><FaCheck className="text-green-400" /> In My List</>
                  ) : (
                    <><FaPlus /> My List</>
                  )}
                </button>
              )}
            </div>

            {/* Cast */}
            {movie.actors?.length > 0 && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm">
                  <span className="text-gray-500">Cast: </span>
                  {movie.actors.map((a) => a.name).join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        {isAuthenticated && (
          <div className="mt-8 mb-4">
            <h3 className="text-white text-lg font-semibold mb-3">Rate this movie</h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRate(n)}
                  className={`w-8 h-8 rounded text-sm font-bold transition-colors ${
                    n <= (hoverRating || userRating)
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                  }`}
                  aria-label={`Rate ${n}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-8 mb-12">
          <h3 className="text-white text-xl font-semibold mb-4">Reviews</h3>

          {isAuthenticated && (
            <form onSubmit={handleReview} className="mb-6 flex gap-3">
              <input
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write a review..."
                className="flex-1 bg-gray-800 text-white rounded px-4 py-2.5 outline-none focus:ring-2 focus:ring-netflix-red text-sm"
                aria-label="Review text"
              />
              <button
                type="submit"
                className="bg-netflix-red text-white px-5 py-2 rounded hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Post
              </button>
            </form>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-300 text-sm leading-relaxed">{r.content}</p>
                  {r.is_spoiler && (
                    <span className="mt-1 inline-block text-xs text-yellow-500">Contains spoilers</span>
                  )}
                  <p className="text-gray-600 text-xs mt-2">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <ContentRow title="More Like This" items={similar} type="movie" />
        )}
      </div>
    </div>
  );
}
