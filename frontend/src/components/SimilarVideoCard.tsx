import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Movie } from "src/types/Movie";
import NetflixIconButton from "./NetflixIconButton";
import MaxLineTypography from "./MaxLineTypography";
import {
  formatMinuteToReadable,
  getRandomNumber,
  getImageUrl,
  getMatchScore,
} from "src/utils/common";
import AgeLimitChip from "./AgeLimitChip";
import { useGetConfigurationQuery } from "src/store/slices/configuration";
import { useDetailModal } from "src/providers/DetailModalProvider";
import { MEDIA_TYPE } from "src/types/Common";

interface SimilarVideoCardProps {
  video: Movie;
}

export default function SimilarVideoCard({ video }: SimilarVideoCardProps) {
  const { data: configuration } = useGetConfigurationQuery(undefined);
  const { setDetailType } = useDetailModal();

  const imageSrc = getImageUrl(
    video.backdrop_path || video.poster_path,
    "w780",
    configuration?.images?.secure_base_url || configuration?.images?.base_url
  );

  return (
    <Card
      sx={{
        cursor: "pointer",
        bgcolor: "#2f2f2f",
        color: "#ffffff",
        borderRadius: "4px",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.7)",
          "& .play-overlay": {
            opacity: 1,
          },
        },
      }}
      onClick={() => setDetailType({ mediaType: MEDIA_TYPE.Movie, id: video.id })}
    >
      {/* Thumbnail */}
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
            height: "100%",
            width: "100%",
            objectFit: "cover",
            position: "absolute",
          }}
        />

        {/* Hover play button overlay */}
        <Box
          className="play-overlay"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.2s ease",
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              bgcolor: "rgba(0, 0, 0, 0.7)",
              border: "2px solid #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlayArrowIcon sx={{ color: "#ffffff", fontSize: 28 }} />
          </Box>
        </Box>

        {/* Duration badge */}
        <Box
          sx={{
            top: 8,
            right: 8,
            position: "absolute",
            bgcolor: "rgba(0, 0, 0, 0.7)",
            px: 0.75,
            py: 0.25,
            borderRadius: "2px",
          }}
        >
          <Typography variant="caption" sx={{ color: "#ffffff", fontWeight: 600 }}>
            {formatMinuteToReadable(getRandomNumber(50) + 85)}
          </Typography>
        </Box>

        {/* Title overlay at bottom of thumbnail */}
        <Box
          sx={{
            left: 0,
            right: 0,
            bottom: 0,
            px: 1.5,
            py: 0.5,
            position: "absolute",
            background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)",
          }}
        >
          <MaxLineTypography
            maxLine={1}
            sx={{ fontWeight: 700, color: "#ffffff" }}
            variant="subtitle2"
          >
            {video.title || video.name}
          </MaxLineTypography>
        </Box>
      </Box>

      {/* Card Info */}
      <CardContent sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Stack spacing={1} sx={{ flexGrow: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="caption"
                sx={{ color: "#46d369", fontWeight: 700 }}
              >
                {`${getMatchScore(video.vote_average)}% Match`}
              </Typography>
              <AgeLimitChip label="16+" />
              <Typography variant="caption" sx={{ color: "#bcbcbc" }}>
                {video.release_date ? video.release_date.substring(0, 4) : "2024"}
              </Typography>
            </Stack>

            <NetflixIconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
              }}
              sx={{ p: 0.5 }}
            >
              <AddIcon sx={{ fontSize: 16 }} />
            </NetflixIconButton>
          </Stack>

          <MaxLineTypography
            maxLine={3}
            variant="caption"
            sx={{ color: "#d2d2d2", lineHeight: 1.4, flexGrow: 1 }}
          >
            {video.overview || "No overview available for this title."}
          </MaxLineTypography>
        </Stack>
      </CardContent>
    </Card>
  );
}
