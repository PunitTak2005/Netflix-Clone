import { tmdbApi } from "./apiSlice";

type ConfigurationType = {
  images: {
    base_url: string;
    secure_base_url: string;
    backdrop_sizes: string[];
    logo_sizes: string[];
    poster_sizes: string[];
    profile_sizes: string[];
    still_sizes: string[];
  };
  change_keys: string[];
};

export const extendedApi = tmdbApi.injectEndpoints({
  endpoints: (build) => ({
    getConfiguration: build.query<ConfigurationType, void>({
      query: () => "/configuration",
    }),
  }),
});

export const { useGetConfigurationQuery } = extendedApi;
