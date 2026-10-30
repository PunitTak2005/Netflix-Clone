import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import Player from "video.js/dist/types/player";

import { useNavigate } from "react-router-dom";
import { MAIN_PATH } from "src/constant";
import { getRandomNumber, getImageUrl } from "src/utils/common";
import MaxLineTypography from "./MaxLineTypography";
import PlayButton from "./PlayButton";
import MoreInfoButton from "./MoreInfoButton";
import NetflixIconButton from "./NetflixIconButton";
import MaturityRate from "./MaturityRate";
import useOffSetTop from "src/hooks/useOffSetTop";
import { useDetailModal } from "src/providers/DetailModalProvider";
import { MEDIA_TYPE } from "src/types/Common";
import {
  useGetVideosByMediaTypeAndCustomGenreQuery,
  useLazyGetAppendedVideosQuery,
} from "src/store/slices/discover";
import { Movie } from "src/types/Movie";
import VideoJSPlayer from "./watch/VideoJSPlayer";

interface TopTrailerProps {
  mediaType: MEDIA_TYPE;
}

export default function TopTrailer({ mediaType }: TopTrailerProps) {
  const navigate = useNavigate();
  const { data } = useGetVideosByMediaTypeAndCustomGenreQuery({
    mediaType,
    apiString: "popular",
    page: 1,
  });
  const [getVideoDetail, { data: detail }] = useLazyGetAppendedVideosQuery();
  const [video, setVideo] = useState<Movie | null>(null);
  const [muted, setMuted] = useState(true);
  const playerRef = useRef<Player | null>(null);
  const isOffset = useOffSetTop(typeof window !== "undefined" ? window.innerWidth * 0.5625 : 400);
  const { setDetailType } = useDetailModal();
  const maturityRate = useMemo(() => {
    return getRandomNumber(6) + 12; // 12+ to 18+
  }, []);

  const handleReady = useCallback((player: Player) => {
    playerRef.current = player;
  }, []);

  useEffect(() => {
    if (playerRef.current) {
      if (isOffset) {
        playerRef.current.pause();
      } else {
        if (playerRef.current.paused()) {
          playerRef.current.play();
        }
      }
    }
  }, [isOffset]);

  useEffect(() => {
    if (data && data.results) {
      const videos = data.results.filter((item) => !!item.backdrop_path);
      if (videos.length > 0) {
        setVideo(videos[getRandomNumber(videos.length)]);
      }
    }
  }, [data]);

  useEffect(() => {
    if (video) {
      getVideoDetail({ mediaType, id: video.id });
    }
  }, [video, mediaType, getVideoDetail]);

  const handleMute = useCallback((status: boolean) => {
    if (playerRef.current) {
      playerRef.current.muted(!status);
      setMuted(!status);
    }
  }, []);

  const backdropUrl = video?.backdrop_path
    ? getImageUrl(video.backdrop_path, "original")
    : null;

  return (
    <Box sx={{ position: "relative", zIndex: 1, width: "100%", overflow: "hidden" }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: "70vh", sm: "75vh", md: "85vh", lg: "56.25vw" },
          minHeight: { xs: 460, sm: 540, md: 620 },
          maxHeight: 900,
        }}
      >
        {video && (
          <>
            {/* Background Image: Loads immediately so there is never a blank screen */}
            {backdropUrl && (
              <Box
                component="img"
                src={backdropUrl}
                alt={video.title || video.name}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 20%",
                  zIndex: 0,
                }}
              />
            )}

            {/* Trailer Video Player Overlay */}
            {detail && detail.videos?.results?.[0]?.key && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 1,
                  opacity: 1,
                  "& .video-js": {
                    width: "100% !important",
                    height: "100% !important",
                    position: "absolute",
                  },
                }}
              >
                <VideoJSPlayer
                  options={{
                    loop: true,
                    muted: true,
                    autoplay: true,
                    controls: false,
                    responsive: true,
                    fluid: true,
                    techOrder: ["youtube"],
                    sources: [
                      {
                        type: "video/youtube",
                        src: `https://www.youtube.com/watch?v=${detail.videos.results[0].key}`,
                      },
                    ],
                  }}
                  onReady={handleReady}
                />
              </Box>
            )}

            {/* Top Vignette (for navbar readability) */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "120px",
                background: "linear-gradient(180deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0) 100%)",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />

            {/* Left Vignette (behind Title and Synopsis) */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: { xs: "100%", md: "60%" },
                background: {
                  xs: "linear-gradient(to right, rgba(20,20,20,0.85) 0%, rgba(20,20,20,0.5) 60%, rgba(20,20,20,0) 100%)",
                  md: "linear-gradient(to right, rgba(20,20,20,0.92) 0%, rgba(20,20,20,0.6) 50%, rgba(20,20,20,0) 100%)",
                },
                zIndex: 2,
                pointerEvents: "none",
              }}
            />

            {/* Bottom Vignette (smooth blend to page background #141414) */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: { xs: "160px", sm: "220px", md: "280px" },
                backgroundImage:
                  "linear-gradient(180deg, rgba(20,20,20,0) 0%, rgba(20,20,20,0.2) 20%, rgba(20,20,20,0.6) 50%, rgba(20,20,20,0.85) 75%, #141414 100%)",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />

            {/* Bottom-Right Controls: Sound Mute & Maturity Rating */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                position: "absolute",
                right: 0,
                bottom: { xs: "28%", sm: "30%", md: "35%" },
                zIndex: 4,
              }}
            >
              <NetflixIconButton
                size="medium"
                onClick={() => handleMute(muted)}
                sx={{
                  color: "#ffffff",
                  mr: 1,
                  bgcolor: "rgba(30, 30, 30, 0.7)",
                }}
              >
                {!muted ? <VolumeUpIcon /> : <VolumeOffIcon />}
              </NetflixIconButton>
              <MaturityRate>{`${maturityRate}+`}</MaturityRate>
            </Stack>

            {/* Hero Information: N Series Badge, Title, Synopsis, and CTA Buttons */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 3,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                pb: { xs: "22%", sm: "24%", md: "25%", lg: "22%" },
                px: { xs: "20px", sm: "36px", md: "60px" },
              }}
            >
              <Box sx={{ maxWidth: { xs: "100%", sm: "520px", md: "640px" } }}>
                {/* Netflix Badge */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Typography
                    component="span"
                    sx={{
                      color: "#e50914",
                      fontWeight: 900,
                      fontSize: { xs: "1.3rem", sm: "1.6rem" },
                      letterSpacing: "-1px",
                      lineHeight: 1,
                      fontFamily: "Impact, sans-serif",
                    }}
                  >
                    N
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      letterSpacing: "4px",
                      fontWeight: 800,
                      color: "rgba(255, 255, 255, 0.9)",
                      textTransform: "uppercase",
                      fontSize: { xs: "0.75rem", sm: "0.85rem" },
                    }}
                  >
                    {mediaType === MEDIA_TYPE.Tv ? "SERIES" : "FILM"}
                  </Typography>
                </Stack>

                {/* Movie Title */}
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "1.8rem", sm: "2.6rem", md: "3.6rem", lg: "4.2rem" },
                    lineHeight: 1.05,
                    color: "#ffffff",
                    textShadow: "2px 4px 12px rgba(0, 0, 0, 0.8)",
                    mb: { xs: 1.5, sm: 2 },
                  }}
                >
                  {video.title || video.name}
                </Typography>

                {/* Movie Synopsis */}
                <MaxLineTypography
                  variant="body1"
                  maxLine={3}
                  sx={{
                    color: "rgba(255, 255, 255, 0.95)",
                    fontSize: { xs: "0.875rem", sm: "1rem", md: "1.1rem" },
                    lineHeight: 1.45,
                    textShadow: "1px 2px 6px rgba(0, 0, 0, 0.9)",
                    mb: { xs: 2.5, sm: 3 },
                    maxWidth: 580,
                  }}
                >
                  {video.overview}
                </MaxLineTypography>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <PlayButton
                    size="large"
                    onClick={() => navigate(`/${MAIN_PATH.watch}?id=${video.id}`)}
                  />
                  <MoreInfoButton
                    size="large"
                    onClick={() => {
                      setDetailType({ mediaType, id: video.id });
                    }}
                  />
                </Stack>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
