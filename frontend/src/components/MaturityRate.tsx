import Box from "@mui/material/Box";
import { ReactNode } from "react";

export default function MaturityRate({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        py: 0.75,
        pl: 1.5,
        pr: 3,
        fontSize: { xs: "0.875rem", sm: "1rem", md: "1.1rem" },
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        color: "#ffffff",
        borderLeft: "3px solid #dcdcdc",
        bgcolor: "rgba(51, 51, 51, 0.6)",
        backdropFilter: "blur(4px)",
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
      }}
    >
      {children}
    </Box>
  );
}
