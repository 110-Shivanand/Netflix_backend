import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/player/VideoPlayer";
import Spinner from "../components/common/Spinner";
import { interactionsAPI } from "../api/interactions";
import { useAuth } from "../context/AuthContext";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";
import "../components/player/VideoPlayer.css";

const STREAM_URL = process.env.REACT_APP_STREAM_URL || "http://localhost:8000";

export default function WatchEpisode() {
  const { episodeId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const [startAt, setStartAt]  = useState(0);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Sign in to watch");
      navigate("/login");
      return;
    }
    interactionsAPI
      .getHistory({ limit: 50 })
      .then((res) => {
        const entry = res.data.find((h) => h.episode_id === episodeId);
        if (entry) setStartAt(entry.progress);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [episodeId, isAuthenticated, navigate]);

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="watch-page">
      <div className="watch-page__topbar">
        <button
          className="watch-page__back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="watch-page__player-area">
        <VideoPlayer
          src={`${STREAM_URL}/api/v1/stream/episode/${episodeId}`}
          episodeId={episodeId}
          startAt={startAt}
        />
      </div>
    </div>
  );
}
