import Button, { ButtonProps } from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useNavigate } from "react-router-dom";
import { MAIN_PATH } from "src/constant";

export default function PlayButton({ sx, onClick, ...others }: ButtonProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate(`/${MAIN_PATH.watch}`);
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleClick}
      startIcon={
        <PlayArrowIcon
          sx={{
            color: "#000000 !important",
            fontSize: {
              xs: "22px !important",
              sm: "28px !important",
              md: "32px !important",
            },
          }}
        />
      }
      {...others}
      sx={{
        bgcolor: "#ffffff !important",
        color: "#000000 !important",
        px: { xs: 2, sm: 3, md: 3.5 },
        py: { xs: 0.75, sm: 1 },
        fontSize: { xs: 15, sm: 17, md: 18 },
        lineHeight: 1.2,
        fontWeight: 700,
        whiteSpace: "nowrap",
        textTransform: "none",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          bgcolor: "rgba(255, 255, 255, 0.75) !important",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        },
        ...sx,
      }}
    >
      Play
    </Button>
  );
}
