import { useState, useRef, useEffect } from "react";
import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

import { useSearchVideosQuery } from "src/store/slices/discover";
import { useOptionalDetailModal } from "src/providers/DetailModalProvider";
import { MEDIA_TYPE } from "src/types/Common";
import { getImageUrl, getMatchScore } from "src/utils/common";

const SearchContainer = styled("div")(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  transition: theme.transitions.create(["width", "background-color", "border-color"]),
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  cursor: "pointer",
  padding: theme.spacing(0.5, 1),
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(0.5, 0.5, 0.5, 0),
    transition: theme.transitions.create("width"),
    width: "0px",
    fontSize: "0.85rem",
    "&:focus": {
      width: "160px",
      [theme.breakpoints.up("sm")]: {
        width: "220px",
      },
      [theme.breakpoints.up("md")]: {
        width: "260px",
      },
    },
  },
  "&.is-active .MuiInputBase-input": {
    width: "160px",
    [theme.breakpoints.up("sm")]: {
      width: "220px",
    },
    [theme.breakpoints.up("md")]: {
      width: "260px",
    },
  },
}));

export default function SearchBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const detailModal = useOptionalDetailModal();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults, isFetching } = useSearchVideosQuery(
    { query: debouncedQuery },
    { skip: debouncedQuery.length < 2 }
  );

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleClear = () => {
    setSearchTerm("");
    setDebouncedQuery("");
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (!searchTerm) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchTerm]);

  const results = searchResults?.results?.filter(
    (item) => item.media_type === "movie" || item.media_type === "tv" || !item.media_type
  ) || [];

  return (
    <Box ref={containerRef} sx={{ position: "relative" }}>
      <SearchContainer
        sx={{
          border: isOpen || searchTerm ? "1px solid rgba(255, 255, 255, 0.85)" : "1px solid transparent",
          backgroundColor: isOpen || searchTerm ? "rgba(0, 0, 0, 0.85)" : "transparent",
          borderRadius: "4px",
        }}
      >
        <SearchIconWrapper onClick={handleOpen}>
          <SearchIcon sx={{ color: "#ffffff", fontSize: 22 }} />
        </SearchIconWrapper>
        <StyledInputBase
          inputRef={searchInputRef}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Titles, people, genres"
          className={isOpen || searchTerm ? "is-active" : ""}
          inputProps={{
            "aria-label": "search",
            onFocus: () => setIsOpen(true),
          }}
        />
        {isFetching && (
          <CircularProgress size={16} sx={{ color: "#ffffff", mr: 1 }} />
        )}
        {searchTerm && (
          <IconButton
            size="small"
            onClick={handleClear}
            sx={{ color: "#ffffff", p: 0.5, mr: 0.5 }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </SearchContainer>

      {/* Live Search Results Dropdown */}
      {isOpen && debouncedQuery.length >= 2 && (
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            top: "100%",
            right: 0,
            mt: 1.5,
            width: { xs: 280, sm: 360, md: 400 },
            maxHeight: 440,
            overflowY: "auto",
            bgcolor: "#141414",
            color: "#ffffff",
            borderRadius: "6px",
            zIndex: 1400,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.9)",
          }}
        >
          {results.length > 0 ? (
            <List sx={{ p: 0 }}>
              {results.slice(0, 8).map((movie) => {
                const title = movie.title || movie.name || "Untitled";
                const date = movie.release_date || movie.first_air_date || "";
                const year = date ? date.substring(0, 4) : "";
                const imageSrc = getImageUrl(
                  movie.poster_path || movie.backdrop_path,
                  "w92"
                );

                return (
                  <ListItem
                    key={movie.id}
                    button
                    onClick={() => {
                      detailModal?.setDetailType({
                        mediaType: (movie.media_type as MEDIA_TYPE) || MEDIA_TYPE.Movie,
                        id: movie.id,
                      });
                      handleClear();
                    }}
                    sx={{
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                      py: 1,
                      px: 1.5,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        src={imageSrc}
                        alt={title}
                        sx={{ width: 44, height: 60, mr: 1.5, borderRadius: "3px" }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          noWrap
                          sx={{ color: "#ffffff", fontWeight: 600, fontSize: "0.9rem" }}
                        >
                          {title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: "grey.400", mt: 0.5, display: "block" }}>
                          {year ? `${year} • ` : ""}
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ color: "#46d369", fontWeight: 700 }}
                          >
                            {`${getMatchScore(movie.vote_average)}% Match`}
                          </Typography>
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : !isFetching ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "grey.400" }}>
                No results found for "{debouncedQuery}"
              </Typography>
            </Box>
          ) : null}
        </Paper>
      )}
    </Box>
  );
}
