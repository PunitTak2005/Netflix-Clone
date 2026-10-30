import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";
import Link, { LinkProps } from "@mui/material/Link";

export default function NetflixNavigationLink({
  sx,
  children,
  ...others
}: LinkProps & RouterLinkProps) {
  return (
    <Link
      {...others}
      component={RouterLink}
      sx={{
        color: "#e5e5e5",
        textDecoration: "none",
        transition: "color 0.25s ease-in-out",
        "&:hover": {
          color: "#b3b3b3",
          textDecoration: "none",
        },
        ...sx,
      }}
    >
      {children}
    </Link>
  );
}
