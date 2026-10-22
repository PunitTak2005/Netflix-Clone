import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import Logo from "./Logo";

export default function RouteErrorBoundary() {
  const error = useRouteError();

  let errorMessage = "An unexpected error occurred.";
  let errorCode = "500";

  if (isRouteErrorResponse(error)) {
    errorCode = error.status.toString();
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#141414",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 4 } }}>
        <Logo />
      </Box>
      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          py: 6,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          fontWeight="bold"
          sx={{ mb: 2, fontSize: { xs: "2.2rem", sm: "3.5rem" } }}
        >
          Lost your way?
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "grey.400", mb: 4, maxWidth: 600, fontSize: "1.1rem" }}
        >
          Sorry, something went wrong. You'll find lots to explore on the home page.
        </Typography>
        <Button
          variant="contained"
          color="error"
          size="large"
          href="/browse"
          sx={{
            bgcolor: "#e50914",
            "&:hover": { bgcolor: "#b80710" },
            px: 4,
            py: 1.2,
            fontWeight: "bold",
            borderRadius: 1,
            textTransform: "none",
            fontSize: "1rem",
            mb: 4,
          }}
        >
          Netflix Home
        </Button>
        <Box sx={{ borderLeft: "2px solid #e50914", pl: 2, textAlign: "left" }}>
          <Typography variant="caption" sx={{ color: "grey.500", display: "block" }}>
            Error Code: <strong>{errorCode}</strong>
          </Typography>
          <Typography variant="caption" sx={{ color: "grey.600" }}>
            {errorMessage}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
