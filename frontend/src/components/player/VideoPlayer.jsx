import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "./VideoPlayer.css";
import { useWatchProgress } from "../../hooks/useWatchProgress";

export default function VideoPlayer({
  src,
  poster,
  movieId,
  showId,
  episodeId,
  startAt = 0,
}) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { saveProgress } = useWatchProgress({ movieId, showId, episodeId });

  useEffect(() => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls:    true,
      autoplay:    false,
      preload:     "auto",
      responsive:  true,
      fluid:       true,
      poster:      poster || undefined,
      sources:     [{ src, type: "video/mp4" }],
      html5: {
        vhs: { overrideNative: true },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
    });

    playerRef.current = player;

    /* resume playback */
    player.ready(() => {
      if (startAt > 10) player.currentTime(startAt);
    });

    /* save progress every 5 s of playback */
    let lastSaved = 0;
    player.on("timeupdate", () => {
      const current = player.currentTime();
      if (current - lastSaved >= 5) {
        lastSaved = current;
        saveProgress(current, player.duration());
      }
    });

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="player-wrapper">
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-netflix-skin vjs-big-play-centered"
        />
      </div>
    </div>
  );
}
