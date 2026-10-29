import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { COMMON_TITLES } from "src/constant";
import HeroSection from "src/components/HeroSection";
import { genreSliceEndpoints, useGetGenresQuery } from "src/store/slices/genre";
import { MEDIA_TYPE } from "src/types/Common";
import { CustomGenre, Genre } from "src/types/Genre";
import SliderRowForGenre from "src/components/VideoSlider";
import MainLoadingScreen from "src/components/MainLoadingScreen";
import store from "src/store";

export async function loader() {
  await store.dispatch(
    genreSliceEndpoints.getGenres.initiate(MEDIA_TYPE.Movie)
  );
  return null;
}

export function Component() {
  const { data: genres, isError, error, isLoading } = useGetGenresQuery(MEDIA_TYPE.Movie);

  if (isLoading) {
    return <MainLoadingScreen />;
  }

  if (isError) {
    return (
      <Box sx={{ pt: 16, pb: 8, px: 4, textAlign: "center", color: "white" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Unable to connect to TMDB Movie Service
        </Typography>
        <Typography variant="body2" sx={{ color: "grey.400", maxWidth: 500, mx: "auto" }}>
          {error && "data" in error
            ? (error.data as any)?.message || (error.data as any)?.error || "Movie data is temporarily unavailable."
            : "Movie data is temporarily unavailable. Please try again later."}
        </Typography>
      </Box>
    );
  }

  const genreList = genres && genres.length > 0 ? genres : [];

  return (
    <Stack spacing={2}>
      <HeroSection mediaType={MEDIA_TYPE.Movie} />
      {[...COMMON_TITLES, ...genreList].map((genre: Genre | CustomGenre) => (
        <SliderRowForGenre
          key={genre.id || genre.name}
          genre={genre}
          mediaType={MEDIA_TYPE.Movie}
        />
      ))}
    </Stack>
  );
}

Component.displayName = "HomePage";
