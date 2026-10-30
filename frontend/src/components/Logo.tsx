import Box, { BoxProps } from "@mui/material/Box";
import { Link as RouterLink } from "react-router-dom";
import { MAIN_PATH } from "src/constant";

export default function Logo({ sx }: BoxProps) {
  return (
    <RouterLink
      to={`/${MAIN_PATH.browse}`}
      style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
    >
      <Box
        component="img"
        alt="Netflix"
        src="/assets/netflix-logo.png"
        sx={{
          height: { xs: 22, sm: 26, md: 30 },
          width: "auto",
          objectFit: "contain",
          display: "block",
          cursor: "pointer",
          ...sx,
        }}
      />
    </RouterLink>
  );
}
