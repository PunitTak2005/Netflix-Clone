# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

# Accept the TMDB API key from Jenkins build-args
ARG TMDB_V3_API_KEY
ENV VITE_TMDB_V3_API_KEY=$TMDB_V3_API_KEY

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx and handle React Router HTML5 History fallback
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
