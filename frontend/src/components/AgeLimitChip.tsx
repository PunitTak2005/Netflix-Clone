import Chip, { ChipProps } from "@mui/material/Chip";

export default function AgeLimitChip({ sx, ...others }: ChipProps) {
  return (
    <Chip
      {...others}
      variant="outlined"
      sx={{
        borderRadius: "2px",
        borderColor: "rgba(255, 255, 255, 0.4)",
        color: "rgba(255, 255, 255, 0.9)",
        fontSize: "11px",
        fontWeight: 600,
        height: "20px",
        px: 0.5,
        "& .MuiChip-label": {
          p: 0,
        },
        ...sx,
      }}
    />
  );
}
