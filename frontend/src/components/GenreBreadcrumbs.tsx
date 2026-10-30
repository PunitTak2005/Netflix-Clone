import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Breadcrumbs, { BreadcrumbsProps } from "@mui/material/Breadcrumbs";

const Separator = (
  <Box
    component="span"
    sx={{
      width: 3,
      height: 3,
      borderRadius: "50%",
      bgcolor: "rgba(255, 255, 255, 0.4)",
      mx: "2px !important",
    }}
  />
);

interface GenreBreadcrumbsProps extends BreadcrumbsProps {
  genres: string[];
}

export default function GenreBreadcrumbs({
  genres,
  ...others
}: GenreBreadcrumbsProps) {
  return (
    <Breadcrumbs
      separator={Separator}
      sx={{
        "& .MuiBreadcrumbs-ol": {
          flexWrap: "wrap",
        },
      }}
      {...others}
    >
      {genres.slice(0, 3).map((genre, idx) => (
        <Typography
          key={idx}
          variant="caption"
          sx={{
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          {genre}
        </Typography>
      ))}
    </Breadcrumbs>
  );
}
