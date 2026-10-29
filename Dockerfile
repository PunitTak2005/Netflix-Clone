# Stage 1: Build the React application
FROM node:20.19.0-alpine AS build
WORKDIR /app

# Copy dependency manifests from frontend
COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm install

# Copy application source code
COPY ./frontend .

# Accept the TMDB API key from Jenkins build-args and set all variants
ARG TMDB_V3_API_KEY
ENV VITE_TMDB_V3_API_KEY=${TMDB_V3_API_KEY}
ENV VITE_APP_TMDB_V3_API_KEY=${TMDB_V3_API_KEY}
ENV VITE_TMDB_API_KEY=${TMDB_V3_API_KEY}
ENV VITE_APP_API_ENDPOINT_URL="https://api.themoviedb.org/3"

RUN npm run build

# Stage 2: Serve with Nginx and handle React Router HTML5 History fallback
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
