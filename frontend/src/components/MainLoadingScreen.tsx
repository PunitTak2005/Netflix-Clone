import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

function MainLoadingScreen() {
  return (
    <Box
      sx={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        backgroundColor: "#141414",
        zIndex: 1500,
      }}
    >
      <CircularProgress
        sx={{
          color: "#e50914",
        }}
        size={52}
        thickness={4}
      />
    </Box>
  );
}

export default MainLoadingScreen;
