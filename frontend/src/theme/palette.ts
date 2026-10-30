import type { PaletteMode } from "@mui/material";

const PRIMARY = {
  light: "#e50914",
  main: "#141414",
  dark: "#000000",
};

const NETFLIX_RED = {
  light: "#ff3d47",
  main: "#e50914",
  dark: "#b81d24",
  contrastText: "#ffffff",
};

const GREY = {
  100: "#F9FAFB",
  200: "#F4F6F8",
  300: "#DFE3E8",
  400: "#C4CDD5",
  500: "#919EAB",
  600: "#637381",
  700: "#454F5B",
  800: "#212B36",
  900: "#181818",
};

const COMMON = {
  common: { black: "#000000", white: "#ffffff" },
  primary: { ...PRIMARY, contrastText: "#ffffff" },
  error: NETFLIX_RED,
  grey: GREY,
  action: {
    active: GREY[500],
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

const palette = {
  ...COMMON,
  text: {
    primary: "#ffffff",
    secondary: "#a3a3a3",
    disabled: GREY[600],
  },
  background: {
    default: "#141414",
    paper: "#181818",
  },
  mode: "dark" as PaletteMode,
};

export default palette;
