import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import { useLocation, useNavigate } from "react-router-dom";
import useOffSetTop from "src/hooks/useOffSetTop";
import { APP_BAR_HEIGHT, MAIN_PATH } from "src/constant";
import Logo from "../Logo";
import SearchBox from "../SearchBox";
import NetflixNavigationLink from "../NetflixNavigationLink";

const NAV_LINKS = [
  { title: "Home", path: `/${MAIN_PATH.browse}` },
  { title: "TV Shows", path: `/${MAIN_PATH.genreExplore}/popular` },
  { title: "Movies", path: `/${MAIN_PATH.genreExplore}/top_rated` },
  { title: "New & Popular", path: `/${MAIN_PATH.genreExplore}/upcoming` },
  { title: "My List", path: `/${MAIN_PATH.genreExplore}/now_playing` },
];

export default function MainHeader() {
  const isOffset = useOffSetTop(APP_BAR_HEIGHT);
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const isCurrentActive = (path: string) => {
    if (path === `/${MAIN_PATH.browse}` && location.pathname === `/${MAIN_PATH.browse}`) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        px: { xs: 2, sm: 4, md: "60px" },
        height: APP_BAR_HEIGHT,
        backgroundImage: "none",
        backgroundColor: isOffset ? "#141414" : "transparent",
        boxShadow: isOffset ? "0 4px 20px rgba(0, 0, 0, 0.7)" : "none",
        background: isOffset
          ? "#141414"
          : "linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0) 100%)",
        transition: "background-color 0.4s ease, box-shadow 0.4s ease, background 0.4s ease",
        zIndex: 1100,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          height: APP_BAR_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left Side: Mobile Menu Button + Logo + Navigation Links */}
        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2, md: 5 }}>
          {/* Mobile hamburger icon */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: "none" }, color: "#ffffff", mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>

          <Logo sx={{ mr: { xs: 1, md: 2 } }} />

          {/* Desktop Navigation Links */}
          <Stack
            direction="row"
            spacing={2.5}
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
            {NAV_LINKS.map((link) => {
              const active = isCurrentActive(link.path);
              return (
                <NetflixNavigationLink
                  key={link.title}
                  to={link.path}
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: active ? 700 : 500,
                    color: active ? "#ffffff !important" : "#e5e5e5",
                    cursor: "pointer",
                    position: "relative",
                    "&:hover": {
                      color: "#b3b3b3",
                    },
                  }}
                >
                  {link.title}
                </NetflixNavigationLink>
              );
            })}
          </Stack>
        </Stack>

        {/* Right Side: Search + Notifications + Profile Avatar Dropdown */}
        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
          <SearchBox />

          {/* Notification Bell */}
          <Tooltip title="Notifications">
            <IconButton
              size="medium"
              sx={{
                color: "#ffffff",
                p: { xs: 0.5, sm: 1 },
                transition: "transform 0.2s ease",
                "&:hover": { transform: "scale(1.1)", bgcolor: "transparent" },
              }}
            >
              <Badge
                variant="dot"
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#e50914",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                  },
                }}
              >
                <NotificationsNoneOutlinedIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile Avatar with Caret */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              onClick={handleOpenUserMenu}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                gap: 0.5,
                p: 0.5,
                borderRadius: 1,
                "&:hover .caret-icon": {
                  transform: "rotate(180deg)",
                },
              }}
            >
              <Avatar
                alt="Netflix Profile"
                src="/avatar.png"
                variant="rounded"
                sx={{
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  borderRadius: "4px",
                }}
              />
              <ArrowDropDownIcon
                className="caret-icon"
                sx={{
                  color: "#ffffff",
                  fontSize: 18,
                  transition: "transform 0.3s ease",
                }}
              />
            </Box>

            {/* Profile Dropdown Menu */}
            <Menu
              id="user-menu"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  width: 220,
                  bgcolor: "rgba(0, 0, 0, 0.92)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "4px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.8)",
                  p: 0.5,
                },
              }}
            >
              <MenuItem
                onClick={handleCloseUserMenu}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1,
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                <Avatar
                  src="/avatar.png"
                  variant="rounded"
                  sx={{ width: 26, height: 26, borderRadius: "4px" }}
                />
                <Typography variant="body2" sx={{ color: "#ffffff", fontWeight: 500 }}>
                  Viewer
                </Typography>
              </MenuItem>

              <MenuItem
                onClick={handleCloseUserMenu}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1,
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 20, color: "#a3a3a3" }} />
                <Typography variant="body2" sx={{ color: "#a3a3a3" }}>
                  Manage Profiles
                </Typography>
              </MenuItem>

              <MenuItem
                onClick={handleCloseUserMenu}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1,
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                <PersonOutlineIcon sx={{ fontSize: 20, color: "#a3a3a3" }} />
                <Typography variant="body2" sx={{ color: "#a3a3a3" }}>
                  Account
                </Typography>
              </MenuItem>

              <MenuItem
                onClick={handleCloseUserMenu}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1,
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                <HelpOutlineIcon sx={{ fontSize: 20, color: "#a3a3a3" }} />
                <Typography variant="body2" sx={{ color: "#a3a3a3" }}>
                  Help Center
                </Typography>
              </MenuItem>

              <Divider sx={{ my: 0.5, borderColor: "rgba(255, 255, 255, 0.15)" }} />

              <MenuItem
                onClick={handleCloseUserMenu}
                sx={{
                  py: 1,
                  justifyContent: "center",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                <Typography variant="body2" sx={{ color: "#ffffff", fontWeight: 600 }}>
                  Sign out of Netflix
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Stack>
      </Toolbar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 250,
            bgcolor: "#141414",
            color: "#ffffff",
            p: 2,
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <Box sx={{ mb: 3, mt: 1 }}>
          <Logo />
        </Box>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)", mb: 2 }} />
        <List>
          {NAV_LINKS.map((link) => {
            const active = isCurrentActive(link.path);
            return (
              <ListItem key={link.title} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(link.path);
                    handleDrawerToggle();
                  }}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor: active ? "rgba(255, 255, 255, 0.1)" : "transparent",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
                  }}
                >
                  <ListItemText
                    primary={link.title}
                    primaryTypographyProps={{
                      fontWeight: active ? 700 : 500,
                      color: active ? "#ffffff" : "#b3b3b3",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </AppBar>
  );
}
