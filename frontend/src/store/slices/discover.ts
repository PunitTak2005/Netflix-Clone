import { TMDB_V3_API_KEY } from "src/constant";
import { tmdbApi } from "./apiSlice";
import { MEDIA_TYPE, PaginatedMovieResult } from "src/types/Common";
import { MovieDetail } from "src/types/Movie";
import { createSlice, isAnyOf } from "@reduxjs/toolkit";

const initialState: Record<string, Record<string, PaginatedMovieResult>> = {};
export const initialItemState: PaginatedMovieResult = {
  page: 0,
  results: [],
  total_pages: 0,
  total_results: 0,
};

const discoverSlice = createSlice({
  name: "discover",
  initialState,
  reducers: {
    setNextPage: (state, action) => {
      const { mediaType, itemKey } = action.payload;
      state[mediaType][itemKey].page += 1;
    },
    initiateItem: (state, action) => {
      const { mediaType, itemKey } = action.payload;
      if (!state[mediaType]) {
        state[mediaType] = {};
      }
      if (!state[mediaType][itemKey]) {
        state[mediaType][itemKey] = initialItemState;
      }
    },
  },
  extraReducers(builder) {
    builder.addMatcher(
      isAnyOf(
        extendedApi.endpoints.getVideosByMediaTypeAndCustomGenre.matchFulfilled,
        extendedApi.endpoints.getVideosByMediaTypeAndGenreId.matchFulfilled
      ),
      (state, action) => {
        const {
          page,
          results,
          total_pages,
          total_results,
          mediaType,
          itemKey,
        } = action.payload;
        state[mediaType][itemKey].page = page;
        const existingIds = new Set(
          state[mediaType][itemKey].results.map((item) => item.id)
        );
        const uniqueResults = results.filter(
          (item) => !existingIds.has(item.id)
        );
        state[mediaType][itemKey].results.push(...uniqueResults);
        state[mediaType][itemKey].total_pages = total_pages;
        state[mediaType][itemKey].total_results = total_results;
      }
    );
  },
});

export const { setNextPage, initiateItem } = discoverSlice.actions;
export default discoverSlice.reducer;

const extendedApi = tmdbApi.injectEndpoints({
  endpoints: (build) => ({
    getVideosByMediaTypeAndGenreId: build.query<
      PaginatedMovieResult & {
        mediaType: MEDIA_TYPE;
        itemKey: number | string;
      },
      { mediaType: MEDIA_TYPE; genreId: number; page: number }
    >({
      query: ({ mediaType, genreId, page }) => ({
        url: `/discover/${mediaType}`,
        params: {
          with_genres: genreId,
          page,
          ...(TMDB_V3_API_KEY ? { api_key: TMDB_V3_API_KEY } : {}),
        },
      }),
      transformResponse: (
        response: PaginatedMovieResult,
        _,
        { mediaType, genreId }
      ) => ({
        ...response,
        mediaType,
        itemKey: genreId,
      }),
    }),
    getVideosByMediaTypeAndCustomGenre: build.query<
      PaginatedMovieResult & {
        mediaType: MEDIA_TYPE;
        itemKey: number | string;
      },
      { mediaType: MEDIA_TYPE; apiString: string; page: number }
    >({
      query: ({ mediaType, apiString, page }) => ({
        url: `/${mediaType}/${apiString}`,
        params: {
          page,
          ...(TMDB_V3_API_KEY ? { api_key: TMDB_V3_API_KEY } : {}),
        },
      }),
      transformResponse: (
        response: PaginatedMovieResult,
        _,
        { mediaType, apiString }
      ) => {
        return {
          ...response,
          mediaType,
          itemKey: apiString,
        };
      },
    }),
    getAppendedVideos: build.query<
      MovieDetail,
      { mediaType: MEDIA_TYPE; id: number }
    >({
      query: ({ mediaType, id }) => ({
        url: `/${mediaType}/${id}`,
        params: {
          append_to_response: "videos",
          ...(TMDB_V3_API_KEY ? { api_key: TMDB_V3_API_KEY } : {}),
        },
      }),
    }),
    getSimilarVideos: build.query<
      PaginatedMovieResult,
      { mediaType: MEDIA_TYPE; id: number }
    >({
      query: ({ mediaType, id }) => ({
        url: `/${mediaType}/${id}/similar`,
        params: {
          ...(TMDB_V3_API_KEY ? { api_key: TMDB_V3_API_KEY } : {}),
        },
      }),
    }),
    searchVideos: build.query<
      PaginatedMovieResult,
      { query: string; page?: number }
    >({
      query: ({ query, page = 1 }) => ({
        url: `/search/multi`,
        params: {
          query: encodeURIComponent(query).replace(/%20/g, "+"),
          page,
          ...(TMDB_V3_API_KEY ? { api_key: TMDB_V3_API_KEY } : {}),
        },
      }),
    }),
  }),
});

export const {
  useGetVideosByMediaTypeAndGenreIdQuery,
  useLazyGetVideosByMediaTypeAndGenreIdQuery,
  useGetVideosByMediaTypeAndCustomGenreQuery,
  useLazyGetVideosByMediaTypeAndCustomGenreQuery,
  useGetAppendedVideosQuery,
  useLazyGetAppendedVideosQuery,
  useGetSimilarVideosQuery,
  useLazyGetSimilarVideosQuery,
  useSearchVideosQuery,
  useLazySearchVideosQuery,
} = extendedApi;
