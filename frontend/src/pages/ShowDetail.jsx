import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaPlay, FaPlus, FaCheck, FaStar, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { showsAPI } from "../api/shows";
import { interactionsAPI } from "../api/interactions";
import ContentRow from "../components/common/ContentRow";
import Spinner from "../components/common/Spinner";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";
import toast from "react-hot-toast";
import "./Home.css";

export default function ShowDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [show, setShow] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState({});
  const [openSeason, setOpenSeason] = useState(null);
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
        const res = await showsAPI.getBySlug(slug);
        setShow(res.data);
        const [seasonsRes, simRes, revRes] = await Promise.allSettled([
          showsAPI.getSeasons(res.data.id),
          showsAPI.getSimilar(res.data.id),
          interactionsAPI.getReviews({ show_id: res.data.id }),
        ]);
        if (seasonsRes.status === "fulfilled") {
          const s = seasonsRes.value.data;
          setSeasons(s);
          if (s.length > 0) {
            setOpenSeason(s[0].id);
            loadEpisodes(s[0].id);
          }
        }
        if (simRes.status === "fulfilled") setSimilar(simRes.value.data);
        if (revRes.status === "fulfilled") setReviews(revRes.value.data);
      } catch {
        toast.error("Show not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const loadEpisodes = async (seasonId) => {
    if (episodes[seasonId]) return;
    try {
      const res = await showsAPI.getEpisodes(seasonId);
      setEpisodes((prev) => ({ ...prev, [seasonId]: res.data }));
    } catch {}
  };

  const toggleSeason = (seasonId) => {
    if (openSeason === seasonId) {
      setOpenSeason(null);
    } else {
      setOpenSeason(seasonId);
      loadEpisodes(seasonId);
    }
  };

  const handleRate = async (score) => {
    if (!isAuthenticated) return toast.error("Sign in to rate");
    try {
      await interactionsAPI.rateContent({ show_id: show.id, score });
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
      const res = await interactionsAPI.createReview({ show_id: show.id, content: reviewText });
      setReviews((prev) => [res.data, ...prev]);
      setReviewText("");
      toast.success("Review posted");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  const inList = show && isInWatchlist(show.id);

  if (loading) return <Spinner size="lg" />;
  if (!show) return <p className="text-center text-gray-400 pt-32">Show not found.</p>;

  return (
    <div className="min-h-screen bg-netflix-dark">
      {/* Banner */}
      <div className="relative h-[55vh] min-h-[380px]">
        {show.banner_url || show.thumbnail_url ? (
          <img
            src={show.banner_url || show.thumbnail_url}
            alt={show.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </div>

      <div className="px-6 md:px-16 -mt-32 relative z-10">
        <div className="flex gap-8 flex-col md:flex-row">
          {show.thumbnail_url && (
            <div className="hidden md:block flex-shrink-0">
              <img src={show.thumbnail_url} alt={show.title} className="w-44 rounded-md shadow-2xl" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-white text-3xl md:text-5xl font-bold mb-3">{show.title}</h1>
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-300 flex-wrap">
              {show.first_air_date && <span>{new Date(show.first_air_date).getFullYear()}</span>}
              <span
                className={`font-medium ${show.status === "ongoing" ? "text-green-400" : "text-gray-400"}`}
              >
                {show.status}
              </span>
              {show.maturity_rating && (
                <span className="border border-gray-500 px-1.5 py-0.5 text-xs">{show.maturity_rating}</span>
              )}
              {show.average_rating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <FaStar className="text-xs" /> {show.average_rating.toFixed(1)}
                </span>
              )}
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {show.genres?.map((g) => (
                <span key={g.id} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                  {g.name}
                </span>
              ))}
            </div>
            {show.description && (
              <p className="text-gray-300 text-sm md:text-base max-w-2xl mb-6 leading-relaxed">
                {show.description}
              </p>
            )}
            <div className="flex gap-3 mb-6 flex-wrap">
              {seasons[0] && episodes[seasons[0]?.id]?.[0] && (
                <Link
                  to={`/watch/episode/${episodes[seasons[0].id][0].id}`}
                  className="flex items-center gap-2 bg-white text-black font-bold px-8 py-3 rounded hover:bg-gray-200 transition-colors"
                >
                  <FaPlay /> Play S1 E1
                </Link>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => inList ? removeFromWatchlist(null, show.id) : addToWatchlist(null, show.id)}
                  className="flex items-center gap-2 border-2 border-gray-400 text-white px-6 py-3 rounded hover:border-white transition-colors"
                >
                  {inList ? <><FaCheck className="text-green-400" /> In My List</> : <><FaPlus /> My List</>}
                </button>
              )}
            </div>
            {show.actors?.length > 0 && (
              <p className="text-gray-400 text-sm mb-6">
                <span className="text-gray-500">Cast: </span>
                {show.actors.map((a) => a.name).join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Seasons & Episodes */}
        {seasons.length > 0 && (
          <div className="mt-10 mb-8">
            <h2 className="text-white text-2xl font-semibold mb-4">Episodes</h2>
            <div className="space-y-3">
              {seasons.map((season) => (
                <div key={season.id} className="bg-gray-900 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSeason(season.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-white font-semibold">
                      Season {season.season_number}
                      {season.title && ` — ${season.title}`}
                    </span>
                    {openSeason === season.id ? (
                      <FaChevronUp className="text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-400" />
                    )}
                  </button>

                  {openSeason === season.id && (
                    <div className="border-t border-gray-700 divide-y divide-gray-800">
                      {episodes[season.id] ? (
                        episodes[season.id].length > 0 ? (
                          episodes[season.id].map((ep) => (
                            <div key={ep.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-800">
                              <span className="text-gray-500 text-sm w-6 text-right">{ep.episode_number}</span>
                              {ep.thumbnail_url ? (
                                <img
                                  src={ep.thumbnail_url}
                                  alt={ep.title}
                                  className="w-28 h-16 object-cover rounded"
                                />
                              ) : (
                                <div className="w-28 h-16 bg-gray-700 rounded flex items-center justify-center">
                                  <FaPlay className="text-gray-500" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate">{ep.title}</p>
                                {ep.description && (
                                  <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{ep.description}</p>
                                )}
                                {ep.duration && (
                                  <p className="text-gray-500 text-xs mt-1">
                                    {Math.floor(ep.duration / 60)}m
                                  </p>
                                )}
                              </div>
                              <Link
                                to={`/watch/episode/${ep.id}`}
                                className="flex-shrink-0 p-2 bg-gray-700 rounded-full hover:bg-netflix-red transition-colors"
                                aria-label={`Play ${ep.title}`}
                              >
                                <FaPlay className="text-white text-xs" />
                              </Link>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm px-5 py-3">No episodes yet.</p>
                        )
                      ) : (
                        <p className="text-gray-500 text-sm px-5 py-3">Loading episodes...</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        {isAuthenticated && (
          <div className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-3">Rate this show</h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRate(n)}
                  className={`w-8 h-8 rounded text-sm font-bold transition-colors ${
                    n <= (hoverRating || userRating) ? "bg-yellow-500 text-black" : "bg-gray-700 text-gray-400 hover:bg-gray-600"
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
        <div className="mt-6 mb-12">
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
              <button type="submit" className="bg-netflix-red text-white px-5 py-2 rounded hover:bg-red-700 text-sm font-medium">
                Post
              </button>
            </form>
          )}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No reviews yet.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-300 text-sm leading-relaxed">{r.content}</p>
                  <p className="text-gray-600 text-xs mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {similar.length > 0 && <ContentRow title="More Like This" items={similar} type="show" />}
      </div>
    </div>
  );
}
