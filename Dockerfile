# Stage 1: Build the React application
FROM node:20.19.0-alpine AS builder
WORKDIR /app

# Copy package files from the frontend directory
COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY ./frontend .

# Accept the TMDB API key and set environment variables
ARG TMDB_V3_API_KEY
ENV VITE_APP_TMDB_V3_API_KEY=${TMDB_V3_API_KEY}
ENV VITE_APP_API_ENDPOINT_URL="https://api.themoviedb.org/3"

RUN npm run build

# Stage 2: Serve with Nginx and handle React Router HTML5 History fallback
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

# Copy built assets from the builder stage
COPY --from=builder /app/dist .

# Generate Nginx configuration with React Router fallback support
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
