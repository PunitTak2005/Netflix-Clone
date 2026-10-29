# Stage 1: Build the React application
FROM node:20.19.0-alpine AS build
WORKDIR /app

# Copy dependency manifests from frontend
COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm install

# Copy application source code
COPY ./frontend .

# Route all API traffic to backend proxy
ENV VITE_APP_API_ENDPOINT_URL="/api/tmdb"

RUN npm run build

# Stage 2: Serve with Nginx and handle React Router HTML5 History fallback
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
