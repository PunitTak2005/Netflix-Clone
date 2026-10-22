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
import { getImageUrl } from "src/utils/common";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  transition: theme.transitions.create(["width", "background-color", "border-color"]),
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  cursor: "pointer",
  padding: theme.spacing(0, 1),
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
    fontSize: "0.875rem",
    "&:focus": {
      width: "180px",
      [theme.breakpoints.up("sm")]: {
        width: "240px",
      },
    },
  },
  "&.is-active .MuiInputBase-input": {
    width: "180px",
    [theme.breakpoints.up("sm")]: {
      width: "240px",
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
      <Search
        sx={{
          border: isOpen || searchTerm ? "1px solid rgba(255, 255, 255, 0.85)" : "1px solid transparent",
          backgroundColor: isOpen || searchTerm ? "rgba(0, 0, 0, 0.85)" : "transparent",
          borderRadius: 1,
        }}
      >
        <SearchIconWrapper onClick={handleOpen}>
          <SearchIcon sx={{ color: "white", fontSize: 22 }} />
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
          <CircularProgress size={16} sx={{ color: "white", mr: 1 }} />
        )}
        {searchTerm && (
          <IconButton
            size="small"
            onClick={handleClear}
            sx={{ color: "white", p: 0.5, mr: 0.5 }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Search>

      {/* Live Search Results Dropdown */}
      {isOpen && debouncedQuery.length >= 2 && (
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            top: "100%",
            right: 0,
            mt: 1,
            width: { xs: 260, sm: 340, md: 380 },
            maxHeight: 400,
            overflowY: "auto",
            bgcolor: "#141414",
            color: "white",
            borderRadius: 1,
            zIndex: 1400,
            border: "1px solid rgba(255, 255, 255, 0.15)",
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
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        src={imageSrc}
                        alt={title}
                        sx={{ width: 40, height: 56, mr: 1 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" noWrap sx={{ color: "white" }}>
                          {title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: "grey.500" }}>
                          {year ? `${year} • ` : ""}{movie.vote_average ? `⭐ ${movie.vote_average.toFixed(1)}` : ""}
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : !isFetching ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
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
