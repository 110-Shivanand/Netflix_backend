import { useCallback, useRef } from "react";
import { interactionsAPI } from "../api/interactions";
import { useAuth } from "../context/AuthContext";

export function useWatchProgress({ movieId, showId, episodeId } = {}) {
  const { isAuthenticated } = useAuth();
  const saveTimer = useRef(null);

  const saveProgress = useCallback(
    (progress, duration) => {
      if (!isAuthenticated) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        interactionsAPI
          .updateProgress({
            movie_id: movieId || undefined,
            show_id: showId || undefined,
            episode_id: episodeId || undefined,
            progress: Math.floor(progress),
            duration: duration ? Math.floor(duration) : undefined,
          })
          .catch(() => {});
      }, 5000); // save every 5 seconds of playback
    },
    [isAuthenticated, movieId, showId, episodeId]
  );

  return { saveProgress };
}
