import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { COMMON_TITLES } from "src/constant";
import GridPage from "src/components/GridPage";
import { MEDIA_TYPE } from "src/types/Common";
import { CustomGenre, Genre } from "src/types/Genre";
import { genreSliceEndpoints } from "src/store/slices/genre";
import store from "src/store";

export async function loader({ params }: LoaderFunctionArgs) {
  let genre: CustomGenre | Genre | undefined = COMMON_TITLES.find(
    (t) => t.apiString === (params.genreId as string)
  );
  if (!genre) {
    const genres = await store
      .dispatch(genreSliceEndpoints.getGenres.initiate(MEDIA_TYPE.Movie))
      .unwrap();
    genre = genres?.find((t) => t.id.toString() === (params.genreId as string));
  }

  return genre;
}

export function Component() {
  const navigate = useNavigate();
  const genre: CustomGenre | Genre | undefined = useLoaderData() as
    | CustomGenre
    | Genre
    | undefined;

  if (genre) {
    return <GridPage mediaType={MEDIA_TYPE.Movie} genre={genre} />;
  }

  return (
    <Box
      sx={{
        pt: "160px",
        pb: 8,
        px: 4,
        textAlign: "center",
        color: "#ffffff",
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Genre Not Found
      </Typography>
      <Typography variant="body1" sx={{ color: "grey.400", mb: 3 }}>
        The requested genre could not be loaded. Explore popular movies on Netflix instead.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate("/browse")}
        sx={{
          bgcolor: "#e50914",
          "&:hover": { bgcolor: "#b80710" },
          px: 3.5,
          py: 1,
          fontWeight: 700,
        }}
      >
        Go to Home
      </Button>
    </Box>
  );
}

Component.displayName = "GenreExplore";
