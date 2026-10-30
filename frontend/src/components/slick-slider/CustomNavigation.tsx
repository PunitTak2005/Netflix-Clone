import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { MouseEventHandler, ReactNode } from "react";

const ArrowStyle = styled(Box)(({ theme }) => ({
  top: 0,
  bottom: 0,
  position: "absolute",
  zIndex: 10,
  height: "100%",
  opacity: 0,
  display: "flex",
  cursor: "pointer",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.common.white,
  background: "rgba(20, 20, 20, 0.5)",
  backdropFilter: "blur(2px)",
  transition: "opacity 0.25s ease, background-color 0.25s ease",
  "&:hover": {
    background: "rgba(20, 20, 20, 0.85)",
    "& .nav-icon": {
      transform: "scale(1.25)",
    },
  },
  "& .nav-icon": {
    fontSize: 28,
    transition: "transform 0.2s ease",
  },
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

interface CustomNavigationProps {
  isEnd: boolean;
  arrowWidth: number;
  children: ReactNode;
  activeSlideIndex: number;
  onNext: MouseEventHandler<HTMLDivElement>;
  onPrevious: MouseEventHandler<HTMLDivElement>;
}

export default function CustomNavigation({
  isEnd,
  onNext,
  children,
  onPrevious,
  arrowWidth,
  activeSlideIndex,
}: CustomNavigationProps) {
  return (
    <Box
      sx={{
        position: "relative",
        "&:hover .slider-nav-arrow": {
          opacity: 1,
        },
      }}
    >
      {activeSlideIndex > 0 && (
        <ArrowStyle
          className="slider-nav-arrow"
          onClick={onPrevious}
          sx={{
            left: 0,
            width: { xs: arrowWidth / 2, sm: arrowWidth },
            borderTopRightRadius: "4px",
            borderBottomRightRadius: "4px",
          }}
        >
          <ArrowBackIosNewIcon className="nav-icon" />
        </ArrowStyle>
      )}

      {children}

      {!isEnd && (
        <ArrowStyle
          className="slider-nav-arrow"
          onClick={onNext}
          sx={{
            right: 0,
            width: { xs: arrowWidth / 2, sm: arrowWidth },
            borderTopLeftRadius: "4px",
            borderBottomLeftRadius: "4px",
          }}
        >
          <ArrowForwardIosIcon className="nav-icon" />
        </ArrowStyle>
      )}
    </Box>
  );
}
