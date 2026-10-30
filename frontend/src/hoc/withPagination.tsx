import { ElementType, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { useAppDispatch, useAppSelector } from "src/hooks/redux";
import {
  initiateItem,
  useLazyGetVideosByMediaTypeAndGenreIdQuery,
  useLazyGetVideosByMediaTypeAndCustomGenreQuery,
} from "src/store/slices/discover";
import { MEDIA_TYPE } from "src/types/Common";
import { CustomGenre, Genre } from "src/types/Genre";

export default function withPagination(
  Component: ElementType,
  mediaType: MEDIA_TYPE,
  genre: Genre | CustomGenre
) {
  return function WithPagination(props: any) {
    const dispatch = useAppDispatch();
    const itemKey = genre.id ?? (genre as CustomGenre).apiString;
    const mediaState = useAppSelector((state) => state.discover[mediaType]);
    const pageState = mediaState ? mediaState[itemKey] : undefined;
    const [getVideosByMediaTypeAndGenreId] =
      useLazyGetVideosByMediaTypeAndGenreIdQuery();
    const [getVideosByMediaTypeAndCustomGenre] =
      useLazyGetVideosByMediaTypeAndCustomGenreQuery();

    useEffect(() => {
      if (!mediaState || !pageState) {
        dispatch(initiateItem({ mediaType, itemKey }));
      }
    }, [mediaState, pageState, dispatch, itemKey, mediaType]);

    useEffect(() => {
      if (pageState && pageState.page === 0) {
        handleNext(pageState.page + 1);
      }
    }, [pageState]);

    const handleNext = useCallback(
      (page: number) => {
        if (genre.id) {
          getVideosByMediaTypeAndGenreId({
            mediaType,
            genreId: genre.id,
            page,
          });
        } else {
          getVideosByMediaTypeAndCustomGenre({
            mediaType,
            apiString: (genre as CustomGenre).apiString,
            page,
          });
        }
      },
      [genre, getVideosByMediaTypeAndGenreId, getVideosByMediaTypeAndCustomGenre, mediaType]
    );

    if (pageState && pageState.results && pageState.results.length > 0) {
      return (
        <Component
          genre={genre}
          data={pageState}
          handleNext={handleNext}
          {...props}
        />
      );
    }

    // Row skeleton placeholder while initial data loads
    return (
      <Box sx={{ px: { xs: "20px", sm: "36px", md: "60px" }, mb: 4 }}>
        <Skeleton
          variant="text"
          width={180}
          height={32}
          sx={{ bgcolor: "rgba(255, 255, 255, 0.08)", mb: 1, borderRadius: 1 }}
        />
        <Box sx={{ display: "flex", gap: 1.5, overflow: "hidden" }}>
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <Skeleton
              key={k}
              variant="rectangular"
              sx={{
                flex: "1 0 16%",
                paddingTop: "calc(9 / 16 * 16%)",
                bgcolor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "4px",
              }}
            />
          ))}
        </Box>
      </Box>
    );
  };
}
