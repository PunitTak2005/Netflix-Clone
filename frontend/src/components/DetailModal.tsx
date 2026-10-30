import { forwardRef, useCallback, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import Tooltip from "@mui/material/Tooltip";
import { TransitionProps } from "@mui/material/transitions";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import Player from "video.js/dist/types/player";
import { useNavigate } from "react-router-dom";

import PlayButton from "./PlayButton";
import NetflixIconButton from "./NetflixIconButton";
import AgeLimitChip from "./AgeLimitChip";
import QualityChip from "./QualityChip";
import SimilarVideoCard from "./SimilarVideoCard";
import {
  formatMinuteToReadable,
  getImageUrl,
  getMatchScore,
} from "src/utils/common";
import { useDetailModal } from "src/providers/DetailModalProvider";
import { useGetSimilarVideosQuery } from "src/store/slices/discover";
import { MAIN_PATH } from "src/constant";
import { MEDIA_TYPE } from "src/types/Common";
import VideoJSPlayer from "./watch/VideoJSPlayer";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function DetailModal() {
  const navigate = useNavigate();
  const { detail, setDetailType } = useDetailModal();
  const { data: similarVideos } = useGetSimilarVideosQuery(
    { mediaType: detail.mediaType ?? MEDIA_TYPE.Movie, id: detail.id ?? 0 },
    { skip: !detail.id }
  );
  const playerRef = useRef<Player | null>(null);
  const [muted, setMuted] = useState(true);

  const handleReady = useCallback((player: Player) => {
    playerRef.current = player;
    setMuted(player.muted() ?? true);
  }, []);

  const handleMute = useCallback((status: boolean) => {
    if (playerRef.current) {
      playerRef.current.muted(!status);
      setMuted(!status);
    }
  }, []);

  const handleClose = () => {
    setDetailType({ mediaType: undefined, id: undefined });
  };

  if (!detail.mediaDetail) {
    return null;
  }

  const media = detail.mediaDetail;
  const youtubeTrailerKey = media.videos?.results?.[0]?.key;
  const backdropUrl = media.backdrop_path
    ? getImageUrl(media.backdrop_path, "original")
    : null;

  return (
    <Dialog
      fullWidth
      scroll="body"
      maxWidth="md"
      open={!!detail.mediaDetail}
      onClose={handleClose}
      id="detail_dialog"
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          bgcolor: "#181818",
          color: "#ffffff",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.9)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        },
      }}
    >
      <DialogContent sx={{ p: 0, bgcolor: "#181818" }}>
        {/* Banner Area (Video or Backdrop Image) */}
        <Box
          sx={{
            width: "100%",
            position: "relative",
            paddingTop: "calc(9 / 16 * 100%)",
            bgcolor: "#000000",
            overflow: "hidden",
          }}
        >
          {/* Backdrop Image fallback */}
          {backdropUrl && (
            <Box
              component="img"
              src={backdropUrl}
              alt={media.title}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 0,
              }}
            />
          )}

          {/* YouTube Trailer Video Player */}
          {youtubeTrailerKey && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1,
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
                  autoplay: true,
                  controls: false,
                  responsive: true,
                  fluid: true,
                  techOrder: ["youtube"],
                  sources: [
                    {
                      type: "video/youtube",
                      src: `https://www.youtube.com/watch?v=${youtubeTrailerKey}`,
                    },
                  ],
                }}
                onReady={handleReady}
              />
            </Box>
          )}

          {/* Close Button in upper right */}
          <IconButton
            onClick={handleClose}
            sx={{
              top: 16,
              right: 16,
              position: "absolute",
              bgcolor: "#181818",
              color: "#ffffff",
              zIndex: 10,
              width: 38,
              height: 38,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.6)",
              transition: "transform 0.2s ease, background-color 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.2)",
                transform: "scale(1.1)",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Bottom Vignette on banner */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40%",
              background: "linear-gradient(180deg, rgba(24, 24, 24, 0) 0%, #181818 100%)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />

          {/* Floating Title & Action Buttons at bottom of banner */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 20,
              px: { xs: 3, sm: 5 },
              zIndex: 3,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: "#ffffff",
                fontSize: { xs: "1.6rem", sm: "2.4rem", md: "2.8rem" },
                textShadow: "2px 4px 10px rgba(0, 0, 0, 0.8)",
                mb: 2,
                lineHeight: 1.1,
              }}
            >
              {media.title || media.original_title}
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <PlayButton
                size="large"
                onClick={() => {
                  if (detail.id) {
                    navigate(`/${MAIN_PATH.watch}?id=${detail.id}`);
                  }
                }}
              />
              <Tooltip title="Add to My List">
                <NetflixIconButton size="medium">
                  <AddIcon />
                </NetflixIconButton>
              </Tooltip>
              <Tooltip title="I like this">
                <NetflixIconButton size="medium">
                  <ThumbUpOffAltIcon />
                </NetflixIconButton>
              </Tooltip>
              <Box sx={{ flexGrow: 1 }} />
              <NetflixIconButton
                size="medium"
                onClick={() => handleMute(muted)}
              >
                {!muted ? <VolumeUpIcon /> : <VolumeOffIcon />}
              </NetflixIconButton>
            </Stack>
          </Box>
        </Box>

        {/* Modal Body: Metadata & Overview */}
        <Container sx={{ py: 3, px: { xs: 3, sm: 5 } }}>
          <Grid container spacing={4}>
            {/* Left Column (Metadata & Overview) */}
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#46d369", fontWeight: 700 }}
                >
                  {`${getMatchScore(media.vote_average)}% Match`}
                </Typography>
                <Typography variant="body2" sx={{ color: "#bcbcbc" }}>
                  {media.release_date
                    ? media.release_date.substring(0, 4)
                    : "2024"}
                </Typography>
                <AgeLimitChip label="16+" />
                <Typography variant="body2" sx={{ color: "#bcbcbc" }}>
                  {formatMinuteToReadable(media.runtime || 115)}
                </Typography>
                <QualityChip label="HD" />
              </Stack>

              <Typography
                variant="body1"
                sx={{
                  color: "#ffffff",
                  lineHeight: 1.6,
                  fontSize: "1rem",
                  fontWeight: 400,
                }}
              >
                {media.overview || "No overview available."}
              </Typography>
            </Grid>

            {/* Right Column (Cast, Genres, Languages) */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1.5}>
                <Typography variant="body2" sx={{ color: "#777777", lineHeight: 1.5 }}>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ color: "#777777" }}
                  >
                    Genres:{" "}
                  </Typography>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ color: "#ffffff" }}
                  >
                    {media.genres && media.genres.length > 0
                      ? media.genres.map((g) => g.name).join(", ")
                      : "Action, Drama"}
                  </Typography>
                </Typography>

                <Typography variant="body2" sx={{ color: "#777777", lineHeight: 1.5 }}>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ color: "#777777" }}
                  >
                    Original Language:{" "}
                  </Typography>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ color: "#ffffff", textTransform: "capitalize" }}
                  >
                    {media.original_language || "English"}
                  </Typography>
                </Typography>

                <Typography variant="body2" sx={{ color: "#777777", lineHeight: 1.5 }}>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ color: "#777777" }}
                  >
                    This title is:{" "}
                  </Typography>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ color: "#ffffff" }}
                  >
                    Exciting, Suspenseful
                  </Typography>
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          {/* "More Like This" Section */}
          {similarVideos && similarVideos.results.length > 0 && (
            <Box sx={{ mt: 5, pt: 3, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5, color: "#ffffff" }}>
                More Like This
              </Typography>
              <Grid container spacing={2}>
                {similarVideos.results.slice(0, 9).map((sm) => (
                  <Grid item xs={12} sm={6} md={4} key={sm.id}>
                    <SimilarVideoCard video={sm} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>
      </DialogContent>
    </Dialog>
  );
}
