import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Player from "video.js/dist/types/player";
import { Box, Stack, Typography, SliderProps } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import SettingsIcon from "@mui/icons-material/Settings";
import BrandingWatermarkOutlinedIcon from "@mui/icons-material/BrandingWatermarkOutlined";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

import useWindowSize from "src/hooks/useWindowSize";
import { formatTime } from "src/utils/common";
import { useGetAppendedVideosQuery } from "src/store/slices/discover";
import { MEDIA_TYPE } from "src/types/Common";

import MaxLineTypography from "src/components/MaxLineTypography";
import VolumeControllers from "src/components/watch/VolumeControllers";
import VideoJSPlayer from "src/components/watch/VideoJSPlayer";
import PlayerSeekbar from "src/components/watch/PlayerSeekbar";
import PlayerControlButton from "src/components/watch/PlayerControlButton";

export function Component() {
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get("id");
  const { data: movieDetail } = useGetAppendedVideosQuery(
    { mediaType: MEDIA_TYPE.Movie, id: Number(movieId) },
    { skip: !movieId }
  );

  const playerRef = useRef<Player | null>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  const [playerState, setPlayerState] = useState({
    paused: false,
    muted: false,
    playedSeconds: 0,
    duration: 0,
    volume: 0.8,
    loaded: 0,
  });

  const navigate = useNavigate();
  const [playerInitialized, setPlayerInitialized] = useState(false);

  const windowSize = useWindowSize();
  const youtubeKey = movieDetail?.videos?.results?.[0]?.key;

  const videoJsOptions = useMemo(() => {
    if (youtubeKey) {
      return {
        preload: "metadata",
        autoplay: true,
        controls: false,
        width: windowSize.width,
        height: windowSize.height,
        techOrder: ["youtube"],
        sources: [
          {
            type: "video/youtube",
            src: `https://www.youtube.com/watch?v=${youtubeKey}`,
          },
        ],
      };
    }

    return {
      preload: "metadata",
      autoplay: true,
      controls: false,
      width: windowSize.width,
      height: windowSize.height,
      sources: [
        {
          src: "https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
          type: "application/x-mpegurl",
        },
      ],
    };
  }, [windowSize, youtubeKey]);

  const handlePlayerReady = function (player: Player): void {
    player.on("pause", () => {
      setPlayerState((draft) => ({ ...draft, paused: true }));
      setShowControls(true);
    });

    player.on("play", () => {
      setPlayerState((draft) => ({ ...draft, paused: false }));
    });

    player.on("timeupdate", () => {
      setPlayerState((draft) => ({ ...draft, playedSeconds: player.currentTime() || 0 }));
    });

    player.one("durationchange", () => {
      setPlayerInitialized(true);
      setPlayerState((draft) => ({ ...draft, duration: player.duration() || 0 }));
    });

    playerRef.current = player;
    setPlayerState((draft) => ({ ...draft, paused: player.paused() }));
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (!playerState.paused) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handleVolumeChange: SliderProps["onChange"] = (_: unknown, value: number | number[]) => {
    playerRef.current?.volume((value as number) / 100);
    setPlayerState((draft) => ({ ...draft, volume: (value as number) / 100 }));
  };

  const handleSeekTo = (v: number) => {
    playerRef.current?.currentTime(v);
  };

  const handleGoBack = () => {
    navigate("/browse");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (!!videoJsOptions.width) {
    return (
      <Box
        onMouseMove={handleMouseMove}
        sx={{
          position: "relative",
          bgcolor: "#000000",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          cursor: showControls ? "default" : "none",
        }}
      >
        <VideoJSPlayer options={videoJsOptions} onReady={handlePlayerReady} />

        {playerRef.current && playerInitialized && (
          <Box
            sx={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              position: "absolute",
              opacity: showControls ? 1 : 0,
              transition: "opacity 0.3s ease",
              pointerEvents: showControls ? "auto" : "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: { xs: 2, sm: 3, md: 4 },
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.85) 100%)",
            }}
          >
            {/* Top Bar: Back Button & Title */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <PlayerControlButton onClick={handleGoBack}>
                <KeyboardBackspaceIcon sx={{ fontSize: 28 }} />
              </PlayerControlButton>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#ffffff",
                  textShadow: "1px 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                {movieDetail?.title || "Feature Presentation"}
              </Typography>
            </Stack>

            {/* Bottom Controls Area */}
            <Box sx={{ width: "100%" }}>
              {/* Seekbar */}
              <Box sx={{ mb: 1 }}>
                <PlayerSeekbar
                  playedSeconds={playerState.playedSeconds}
                  duration={playerState.duration}
                  seekTo={handleSeekTo}
                />
              </Box>

              {/* Action Buttons Row */}
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                {/* Left controls */}
                <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
                  {!playerState.paused ? (
                    <PlayerControlButton
                      onClick={() => {
                        playerRef.current?.pause();
                      }}
                    >
                      <PauseIcon sx={{ fontSize: 32 }} />
                    </PlayerControlButton>
                  ) : (
                    <PlayerControlButton
                      onClick={() => {
                        playerRef.current?.play();
                      }}
                    >
                      <PlayArrowIcon sx={{ fontSize: 32 }} />
                    </PlayerControlButton>
                  )}

                  <PlayerControlButton>
                    <SkipNextIcon sx={{ fontSize: 28 }} />
                  </PlayerControlButton>

                  <VolumeControllers
                    muted={playerState.muted}
                    handleVolumeToggle={() => {
                      playerRef.current?.muted(!playerState.muted);
                      setPlayerState((draft) => ({ ...draft, muted: !draft.muted }));
                    }}
                    value={playerState.volume}
                    handleVolume={handleVolumeChange}
                  />

                  <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: 500 }}>
                    {`${formatTime(playerState.playedSeconds)} / ${formatTime(
                      playerState.duration
                    )}`}
                  </Typography>
                </Stack>

                {/* Middle tagline / title */}
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <MaxLineTypography
                    maxLine={1}
                    variant="subtitle2"
                    textAlign="center"
                    sx={{ maxWidth: 350, mx: "auto", color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    {movieDetail?.tagline || movieDetail?.overview || ""}
                  </MaxLineTypography>
                </Box>

                {/* Right controls */}
                <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
                  <PlayerControlButton>
                    <SettingsIcon sx={{ fontSize: 24 }} />
                  </PlayerControlButton>
                  <PlayerControlButton>
                    <BrandingWatermarkOutlinedIcon sx={{ fontSize: 24 }} />
                  </PlayerControlButton>
                  <PlayerControlButton onClick={toggleFullscreen}>
                    <FullscreenIcon sx={{ fontSize: 28 }} />
                  </PlayerControlButton>
                </Stack>
              </Stack>
            </Box>
          </Box>
        )}
      </Box>
    );
  }
  return null;
}

Component.displayName = "WatchPage";
