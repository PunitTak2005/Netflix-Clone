import Chip, { ChipProps } from "@mui/material/Chip";

export default function QualityChip({ sx, ...others }: ChipProps) {
  return (
    <Chip
      variant="outlined"
      {...others}
      sx={{
        borderRadius: "3px",
        borderColor: "rgba(255, 255, 255, 0.4)",
        color: "rgba(255, 255, 255, 0.9)",
        fontSize: "10px",
        fontWeight: 700,
        height: "18px",
        px: 0.5,
        letterSpacing: "0.5px",
        "& .MuiChip-label": {
          p: 0,
        },
        ...sx,
      }}
    />
  );
}
