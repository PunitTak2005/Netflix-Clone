# Stage 1: Build the React application
FROM node:20.19.0-alpine AS build
WORKDIR /app

# Copy dependency manifests from frontend
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Route all API traffic to backend proxy
ENV VITE_APP_API_ENDPOINT_URL="/api/tmdb"

RUN npm run build

# Stage 2: Production Server (serves React SPA & TMDB proxy in single container)
FROM node:20.19.0-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

# Install backend production dependencies
COPY ../backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY ../backend .

# Copy compiled static frontend assets into public directory
COPY --from=build /app/dist ./public

EXPOSE 80

CMD ["node", "server.js"]
