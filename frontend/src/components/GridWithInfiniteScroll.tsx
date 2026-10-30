import { useRef, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import VideoItemWithHover from "./VideoItemWithHover";
import { CustomGenre, Genre } from "src/types/Genre";
import { PaginatedMovieResult } from "src/types/Common";
import useIntersectionObserver from "src/hooks/useIntersectionObserver";

interface GridWithInfiniteScrollProps {
  genre: Genre | CustomGenre;
  data: PaginatedMovieResult;
  handleNext: (page: number) => void;
}

export default function GridWithInfiniteScroll({
  genre,
  data,
  handleNext,
}: GridWithInfiniteScrollProps) {
  const intersectionRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersectionObserver(intersectionRef);

  useEffect(() => {
    if (
      intersection &&
      intersection.intersectionRatio === 1 &&
      data.page < data.total_pages
    ) {
      handleNext(data.page + 1);
    }
  }, [intersection, data.page, data.total_pages, handleNext]);

  const filteredMovies = data.results.filter((v) => !!v.backdrop_path);

  return (
    <>
      <Container
        maxWidth={false}
        sx={{
          px: { xs: "20px", sm: "36px", md: "60px" },
          pb: 8,
          pt: { xs: "90px", sm: "110px", md: "130px" },
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#ffffff",
            fontWeight: 800,
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.4rem" },
            mb: 3,
          }}
        >
          {`${genre.name} Movies`}
        </Typography>

        <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
          {filteredMovies.map((video, idx) => (
            <Grid
              key={`${video.id}_${idx}`}
              item
              xs={6}
              sm={4}
              md={3}
              lg={2}
              sx={{ zIndex: 1 }}
            >
              <VideoItemWithHover video={video} />
            </Grid>
          ))}
        </Grid>
      </Container>
      <Box sx={{ height: 40 }} ref={intersectionRef} />
    </>
  );
}
