import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";

const FOOTER_LINKS = [
  "Audio Description",
  "Help Center",
  "Gift Cards",
  "Media Center",
  "Investor Relations",
  "Jobs",
  "Terms of Use",
  "Privacy",
  "Legal Notices",
  "Cookie Preferences",
  "Corporate Information",
  "Contact Us",
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        width: "100%",
        bgcolor: "#141414",
        color: "#808080",
        pt: { xs: 6, sm: 8 },
        pb: { xs: 5, sm: 6 },
        px: { xs: "20px", sm: "36px", md: "60px" },
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <Box sx={{ maxWidth: 980, mx: "auto" }}>
        {/* Social Media Icons */}
        <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
          <Link
            href="https://facebook.com"
            target="_blank"
            rel="noopener"
            sx={{
              color: "#ffffff",
              transition: "color 0.2s ease",
              "&:hover": { color: "#b3b3b3" },
            }}
          >
            <FacebookIcon sx={{ fontSize: 26 }} />
          </Link>
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener"
            sx={{
              color: "#ffffff",
              transition: "color 0.2s ease",
              "&:hover": { color: "#b3b3b3" },
            }}
          >
            <InstagramIcon sx={{ fontSize: 26 }} />
          </Link>
          <Link
            href="https://twitter.com"
            target="_blank"
            rel="noopener"
            sx={{
              color: "#ffffff",
              transition: "color 0.2s ease",
              "&:hover": { color: "#b3b3b3" },
            }}
          >
            <TwitterIcon sx={{ fontSize: 26 }} />
          </Link>
          <Link
            href="https://youtube.com"
            target="_blank"
            rel="noopener"
            sx={{
              color: "#ffffff",
              transition: "color 0.2s ease",
              "&:hover": { color: "#b3b3b3" },
            }}
          >
            <YouTubeIcon sx={{ fontSize: 26 }} />
          </Link>
        </Stack>

        {/* 4-Column Footer Navigation Links */}
        <Grid container spacing={1.5} sx={{ mb: 4 }}>
          {FOOTER_LINKS.map((link) => (
            <Grid item xs={6} sm={4} md={3} key={link}>
              <Link
                href="#"
                underline="none"
                sx={{
                  color: "#808080",
                  fontSize: "13px",
                  lineHeight: 1.8,
                  display: "inline-block",
                  transition: "text-decoration 0.2s ease, color 0.2s ease",
                  "&:hover": {
                    textDecoration: "underline",
                    color: "#b3b3b3",
                  },
                }}
              >
                {link}
              </Link>
            </Grid>
          ))}
        </Grid>

        {/* Service Code Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            size="small"
            sx={{
              borderColor: "#808080",
              color: "#808080",
              fontSize: "13px",
              py: 0.5,
              px: 1.5,
              borderRadius: "2px",
              textTransform: "none",
              "&:hover": {
                borderColor: "#ffffff",
                color: "#ffffff",
                bgcolor: "transparent",
              },
            }}
          >
            Service Code
          </Button>
        </Box>

        {/* Copyright */}
        <Typography
          variant="caption"
          sx={{
            color: "#808080",
            fontSize: "11px",
            display: "block",
            letterSpacing: "0.2px",
          }}
        >
          © 1997-2026 Netflix, Inc.
        </Typography>
      </Box>
    </Box>
  );
}
