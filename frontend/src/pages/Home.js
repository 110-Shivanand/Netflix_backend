import React, { useEffect, useState } from "react";
import HeroBanner from "../components/common/Banner";
import ContentRow from "../components/common/ContentRow";
import Spinner from "../components/common/Spinner";
import { moviesAPI } from "../api/movies";
import { showsAPI } from "../api/shows";
import { interactionsAPI } from "../api/interactions";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Home.css";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    featured: [],
    trending: [],
    popularMovies: [],
    popularShows: [],
    newReleases: [],
    topRated: [],
    continueWatching: [],
    recommended: [],
  });

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [
          featuredMovies,
          featuredShows,
          trending,
          trendingShows,
          popularMovies,
          popularShows,
          newReleases,
          topRated,
        ] = await Promise.all([
          moviesAPI.getFeatured(3),
          showsAPI.getFeatured(3),
          moviesAPI.getTrending(10),
          showsAPI.getTrending(10),
          moviesAPI.getAll({ page: 1, page_size: 10 }),
          showsAPI.getAll({ page: 1, page_size: 10 }),
          moviesAPI.getNewReleases(10),
          moviesAPI.getTopRated(10),
        ]);

        const bannerItems = [
          ...(featuredMovies.data || []),
          ...(featuredShows.data || []),
        ];

        let continueWatching = [];
        let recommended = { movies: [], shows: [] };

        if (isAuthenticated) {
          const [cw, rec] = await Promise.allSettled([
            interactionsAPI.getContinueWatching(),
            api.get("/recommendations"),
          ]);
          if (cw.status === "fulfilled") continueWatching = cw.value.data;
          if (rec.status === "fulfilled") recommended = rec.value.data;
        }

        setData({
          featured: bannerItems,
          trending: [...(trending.data || []), ...(trendingShows.data || [])],
          popularMovies: popularMovies.data?.items || [],
          popularShows: popularShows.data?.items || [],
          newReleases: newReleases.data || [],
          topRated: topRated.data || [],
          continueWatching,
          recommended: [...(recommended.movies || []), ...(recommended.shows || [])],
        });
      } catch (e) {
        console.error("Failed to load home data", e);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [isAuthenticated]);

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="bg-netflix-dark min-h-screen">
      {/* Hero Banner */}
      <HeroBanner items={data.featured} />

      {/* Content Rows */}
      <div className="relative z-10 -mt-16 md:-mt-24">
        {isAuthenticated && data.continueWatching.length > 0 && (
          <ContentRow title="Continue Watching" items={data.continueWatching} type="movie" />
        )}
        {isAuthenticated && data.recommended.length > 0 && (
          <ContentRow title="Recommended for You" items={data.recommended} type="movie" />
        )}
        <ContentRow title="Trending Now" items={data.trending} type="movie" />
        <ContentRow title="Popular Movies" items={data.popularMovies} type="movie" />
        <ContentRow title="Popular TV Shows" items={data.popularShows} type="show" />
        <ContentRow title="New Releases" items={data.newReleases} type="movie" />
        <ContentRow title="Top Rated" items={data.topRated} type="movie" />
      </div>
    </div>
  );
}
