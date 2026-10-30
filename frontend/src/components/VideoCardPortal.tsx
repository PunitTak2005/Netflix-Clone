import { useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Movie } from "src/types/Movie";
import { usePortal } from "src/providers/PortalProvider";
import { useDetailModal } from "src/providers/DetailModalProvider";
import {
  formatMinuteToReadable,
  getRandomNumber,
  getImageUrl,
  getMatchScore,
} from "src/utils/common";
import NetflixIconButton from "./NetflixIconButton";
import MaxLineTypography from "./MaxLineTypography";
import AgeLimitChip from "./AgeLimitChip";
import QualityChip from "./QualityChip";
import GenreBreadcrumbs from "./GenreBreadcrumbs";
import { useGetConfigurationQuery } from "src/store/slices/configuration";
import { MEDIA_TYPE } from "src/types/Common";
import { useGetGenresQuery } from "src/store/slices/genre";
import { MAIN_PATH } from "src/constant";

interface VideoCardModalProps {
  video: Movie;
  anchorElement: HTMLElement;
}

export default function VideoCardModal({
  video,
  anchorElement,
}: VideoCardModalProps) {
  const navigate = useNavigate();
  const { data: configuration } = useGetConfigurationQuery(undefined);
  const { data: genres } = useGetGenresQuery(MEDIA_TYPE.Movie);
  const setPortal = usePortal();
  const rect = anchorElement.getBoundingClientRect();
  const { setDetailType } = useDetailModal();

  const handleCardClick = () => {
    setDetailType({ mediaType: MEDIA_TYPE.Movie, id: video.id });
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/${MAIN_PATH.watch}?id=${video.id}`);
  };

  const imageSrc = getImageUrl(
    video.backdrop_path || video.poster_path,
    "w780",
    configuration?.images?.secure_base_url || configuration?.images?.base_url
  );

  return (
    <Card
      onPointerLeave={() => {
        setPortal(null, null);
      }}
      sx={{
        width: Math.max(260, rect.width * 1.45),
        bgcolor: "#181818",
        color: "#ffffff",
        borderRadius: "6px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        cursor: "pointer",
      }}
      onClick={handleCardClick}
    >
      {/* Thumbnail area with overlay title */}
      <Box
        sx={{
          width: "100%",
          position: "relative",
          paddingTop: "calc(9 / 16 * 100%)",
          bgcolor: "#202020",
        }}
      >
        <Box
          component="img"
          src={imageSrc}
          alt={video.title || video.name}
          sx={{
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
          }}
        />

        {/* Gradient shadow for title readability */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50%",
            background: "linear-gradient(180deg, rgba(24, 24, 24, 0) 0%, rgba(24, 24, 24, 0.9) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Title overlay */}
        <Box
          sx={{
            position: "absolute",
            bottom: 6,
            left: 12,
            right: 12,
          }}
        >
          <MaxLineTypography
            maxLine={1}
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              textShadow: "1px 2px 4px rgba(0,0,0,0.9)",
              color: "#ffffff",
              fontSize: "0.95rem",
            }}
          >
            {video.title || video.name}
          </MaxLineTypography>
        </Box>
      </Box>

      {/* Card Content & Action Controls */}
      <CardContent sx={{ p: "12px 14px !important", bgcolor: "#181818" }}>
        <Stack spacing={1.2}>
          {/* Action buttons row */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Play Button */}
            <Tooltip title="Play">
              <IconButton
                onClick={handlePlayClick}
                sx={{
                  bgcolor: "#ffffff",
                  color: "#000000",
                  p: 0.75,
                  transition: "transform 0.2s ease, background-color 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <PlayArrowIcon sx={{ fontSize: 22, color: "#000000" }} />
              </IconButton>
            </Tooltip>

            {/* Add to List */}
            <Tooltip title="Add to My List">
              <NetflixIconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <AddIcon sx={{ fontSize: 18 }} />
              </NetflixIconButton>
            </Tooltip>

            {/* Like */}
            <Tooltip title="I like this">
              <NetflixIconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <ThumbUpOffAltIcon sx={{ fontSize: 18 }} />
              </NetflixIconButton>
            </Tooltip>

            <Box sx={{ flexGrow: 1 }} />

            {/* Expand / More Info */}
            <Tooltip title="Episodes & info">
              <NetflixIconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
              >
                <ExpandMoreIcon sx={{ fontSize: 20 }} />
              </NetflixIconButton>
            </Tooltip>
          </Stack>

          {/* Metadata Row: Match %, Age Rating, Duration, Quality */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="subtitle2"
              sx={{ color: "#46d369", fontWeight: 700, fontSize: "0.825rem" }}
            >
              {`${getMatchScore(video.vote_average)}% Match`}
            </Typography>
            <AgeLimitChip label={`${getRandomNumber(6) + 12}+`} />
            <Typography
              variant="caption"
              sx={{ color: "rgba(255, 255, 255, 0.85)", fontWeight: 500 }}
            >
              {formatMinuteToReadable(getRandomNumber(60) + 85)}
            </Typography>
            <QualityChip label="HD" />
          </Stack>

          {/* Genre Breadcrumbs */}
          {genres && video.genre_ids && (
            <GenreBreadcrumbs
              genres={genres
                .filter((genre) => video.genre_ids?.includes(genre.id))
                .map((genre) => genre.name)}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
