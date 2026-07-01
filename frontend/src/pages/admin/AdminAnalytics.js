import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Spinner from "../../components/common/Spinner";
import { FaFilm, FaTv, FaUsers, FaEye } from "react-icons/fa";
import "./Admin.css";

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [topShows, setTopShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [moviesRes, showsRes, usersRes, topMovRes, topShowRes] = await Promise.allSettled([
          api.get("/movies?page=1&page_size=1"),
          api.get("/shows?page=1&page_size=1"),
          api.get("/users?skip=0&limit=1"),
          api.get("/movies/top-rated?limit=5"),
          api.get("/shows/top-rated?limit=5"),
        ]);

        setStats({
          movies: moviesRes.status === "fulfilled" ? moviesRes.value.data.total : 0,
          shows: showsRes.status === "fulfilled" ? showsRes.value.data.total : 0,
          users: usersRes.status === "fulfilled" ? usersRes.value.data.length : 0,
        });

        if (topMovRes.status === "fulfilled") setTopMovies(topMovRes.value.data);
        if (topShowRes.status === "fulfilled") setTopShows(topShowRes.value.data);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: "Total Movies", value: stats?.movies ?? "—", icon: <FaFilm />, color: "bg-red-900/30 border-red-800" },
    { label: "Total Shows", value: stats?.shows ?? "—", icon: <FaTv />, color: "bg-purple-900/30 border-purple-800" },
    { label: "Total Users", value: stats?.users ?? "—", icon: <FaUsers />, color: "bg-green-900/30 border-green-800" },
  ];

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-netflix-dark pt-24 pb-16 px-6 md:px-12">
      <h1 className="text-white text-3xl font-bold mb-8">Analytics</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {cards.map((card) => (
          <div key={card.label} className={`border rounded-xl p-6 ${card.color}`}>
            <div className="text-3xl text-white mb-3">{card.icon}</div>
            <p className="text-4xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-gray-400 text-sm">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Movies */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
            <FaFilm className="text-netflix-red" /> Top Rated Movies
          </h2>
          <div className="space-y-3">
            {topMovies.map((m, i) => (
              <div key={m.id} className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-700 w-6">{i + 1}</span>
                {m.thumbnail_url && (
                  <img src={m.thumbnail_url} alt={m.title} className="w-10 h-14 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{m.title}</p>
                  <p className="text-gray-400 text-xs">{m.view_count} views</p>
                </div>
                <span className="text-yellow-400 text-sm font-bold">{m.average_rating?.toFixed(1)}</span>
              </div>
            ))}
            {topMovies.length === 0 && <p className="text-gray-500 text-sm">No data yet.</p>}
          </div>
        </div>

        {/* Top Shows */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
            <FaTv className="text-purple-500" /> Top Rated Shows
          </h2>
          <div className="space-y-3">
            {topShows.map((s, i) => (
              <div key={s.id} className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-700 w-6">{i + 1}</span>
                {s.thumbnail_url && (
                  <img src={s.thumbnail_url} alt={s.title} className="w-10 h-14 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{s.title}</p>
                  <p className="text-gray-400 text-xs">{s.view_count} views</p>
                </div>
                <span className="text-yellow-400 text-sm font-bold">{s.average_rating?.toFixed(1)}</span>
              </div>
            ))}
            {topShows.length === 0 && <p className="text-gray-500 text-sm">No data yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
