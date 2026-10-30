import Button, { ButtonProps } from "@mui/material/Button";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function MoreInfoButton({ sx, ...others }: ButtonProps) {
  return (
    <Button
      variant="contained"
      startIcon={
        <InfoOutlinedIcon
          sx={{
            color: "#ffffff !important",
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
        bgcolor: "rgba(109, 109, 110, 0.7) !important",
        color: "#ffffff !important",
        backdropFilter: "blur(4px)",
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
          bgcolor: "rgba(109, 109, 110, 0.4) !important",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        },
        ...sx,
      }}
    >
      More Info
    </Button>
  );
}
