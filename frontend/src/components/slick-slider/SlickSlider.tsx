import { useState, useRef } from "react";
import Slider, { Settings } from "react-slick";
import { styled, Theme, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import CustomNavigation from "./CustomNavigation";
import VideoItemWithHover from "src/components/VideoItemWithHover";
import { ARROW_MAX_WIDTH } from "src/constant";
import NetflixNavigationLink from "src/components/NetflixNavigationLink";
import { CustomGenre, Genre } from "src/types/Genre";
import { Movie } from "src/types/Movie";
import { PaginatedMovieResult } from "src/types/Common";

const RootStyle = styled("div")(() => ({
  position: "relative",
  overflow: "inherit",
}));

const StyledSlider = styled(Slider)(
  ({ theme, padding }: { theme: Theme; padding: number }) => ({
    display: "flex !important",
    justifyContent: "center",
    overflow: "initial !important",
    "& > .slick-list": {
      overflow: "visible",
    },
    [theme.breakpoints.up("sm")]: {
      "& > .slick-list": {
        width: `calc(100% - ${2 * padding}px)`,
      },
      "& .slick-list > .slick-track": {
        margin: "0px !important",
      },
    },
    [theme.breakpoints.down("sm")]: {
      "& > .slick-list": {
        width: `calc(100% - ${padding}px)`,
      },
    },
  })
);

interface SlideItemProps {
  item: Movie;
  rank?: number;
}

function SlideItem({ item, rank }: SlideItemProps) {
  if (rank !== undefined) {
    return (
      <Box sx={{ pr: { xs: 0.5, sm: 1 }, position: "relative" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Top 10 Stylized Rank Number */}
          <Typography
            sx={{
              fontSize: { xs: "3.5rem", sm: "4.5rem", md: "6rem", lg: "7rem" },
              fontWeight: 900,
              lineHeight: 0.8,
              fontFamily: "Impact, sans-serif",
              color: "#000000",
              WebkitTextStroke: "3px #595959",
              letterSpacing: "-4px",
              userSelect: "none",
              mr: -1.5,
              zIndex: 2,
            }}
          >
            {rank}
          </Typography>
          <Box sx={{ flexGrow: 1, zIndex: 3 }}>
            <VideoItemWithHover video={item} />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ pr: { xs: 0.5, sm: 1 } }}>
      <VideoItemWithHover video={item} />
    </Box>
  );
}

interface SlickSliderProps {
  data: PaginatedMovieResult;
  genre: Genre | CustomGenre;
  handleNext: (page: number) => void;
  isTop10Row?: boolean;
}

export default function SlickSlider({
  data,
  genre,
  isTop10Row,
}: SlickSliderProps) {
  const sliderRef = useRef<Slider>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const theme = useTheme();

  const beforeChange = async (currentIndex: number, nextIndex: number) => {
    if (currentIndex < nextIndex) {
      setActiveSlideIndex(nextIndex);
    } else if (currentIndex > nextIndex) {
      setIsEnd(false);
    }
    setActiveSlideIndex(nextIndex);
  };

  const settings: Settings = {
    speed: 500,
    arrows: false,
    infinite: false,
    lazyLoad: "ondemand",
    slidesToShow: isTop10Row ? 5 : 6,
    slidesToScroll: isTop10Row ? 5 : 6,
    beforeChange,
    responsive: [
      {
        breakpoint: 1536,
        settings: {
          slidesToShow: isTop10Row ? 4 : 5,
          slidesToScroll: isTop10Row ? 4 : 5,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: isTop10Row ? 3 : 4,
          slidesToScroll: isTop10Row ? 3 : 4,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
    ],
  };

  const handlePrevious = () => {
    sliderRef.current?.slickPrev();
  };

  const handleNext = () => {
    sliderRef.current?.slickNext();
  };

  const filteredMovies = data.results.filter((i) => !!i.backdrop_path);
  const title = isTop10Row ? "Top 10 Movies Today" : `${genre.name} Movies`;

  return (
    <Box sx={{ overflow: "hidden", height: "100%", zIndex: 1, position: "relative" }}>
      {filteredMovies.length > 0 && (
        <>
          {/* Row Header */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              mb: 1.5,
              pl: { xs: "20px", sm: "36px", md: "60px" },
              pr: { xs: "20px", sm: "36px", md: "60px" },
            }}
          >
            <NetflixNavigationLink
              to={`/genre/${
                genre.id || genre.name.toLowerCase().replace(" ", "_")
              }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                "&:hover .explore-arrow": {
                  transform: "translateX(4px)",
                  opacity: 1,
                },
                "&:hover .explore-text": {
                  opacity: 1,
                  maxWidth: "100px",
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1rem", sm: "1.2rem", md: "1.35rem" },
                  color: "#e5e5e5",
                  lineHeight: 1.25,
                  transition: "color 0.2s ease",
                  "&:hover": {
                    color: "#ffffff",
                  },
                }}
              >
                {title}
              </Typography>

              {/* "Explore All" animated reveal */}
              <Typography
                className="explore-text"
                sx={{
                  color: "#54b9c5",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  opacity: isHovered ? 1 : 0,
                  maxWidth: isHovered ? "100px" : "0px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  transition: "all 0.3s ease",
                  display: { xs: "none", sm: "inline-block" },
                }}
              >
                Explore All
              </Typography>
              <ArrowForwardIosIcon
                className="explore-arrow"
                sx={{
                  fontSize: "0.75rem",
                  color: "#54b9c5",
                  opacity: isHovered ? 1 : 0,
                  transition: "all 0.2s ease",
                  display: { xs: "none", sm: "inline-block" },
                }}
              />
            </NetflixNavigationLink>
          </Stack>

          <RootStyle>
            <CustomNavigation
              isEnd={isEnd}
              arrowWidth={ARROW_MAX_WIDTH}
              onNext={handleNext}
              onPrevious={handlePrevious}
              activeSlideIndex={activeSlideIndex}
            >
              <StyledSlider
                ref={sliderRef}
                {...settings}
                padding={ARROW_MAX_WIDTH}
                theme={theme}
              >
                {filteredMovies.map((item, idx) => (
                  <SlideItem
                    key={item.id}
                    item={item}
                    rank={isTop10Row && idx < 10 ? idx + 1 : undefined}
                  />
                ))}
              </StyledSlider>
            </CustomNavigation>
          </RootStyle>
        </>
      )}
    </Box>
  );
}
