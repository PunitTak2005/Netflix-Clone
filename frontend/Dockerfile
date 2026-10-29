# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package*.json ./

RUN npm ci

# Copy application source code
COPY . .

# Route all API traffic to backend proxy
ENV VITE_APP_API_ENDPOINT_URL="/api/tmdb"

# Build production assets (Vite outputs to dist/)
RUN npm run build

# Stage 2: Serve application with Nginx
FROM nginx:alpine AS runtime

# Copy custom Nginx configuration for React SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default Nginx HTML files
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
