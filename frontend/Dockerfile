# Stage 1: Build the React application
FROM node:20.19.0-alpine AS build

WORKDIR /app

# Copy package files from the frontend directory
COPY frontend/package*.json ./

RUN npm ci

# Copy the rest of the frontend source code
COPY frontend/ ./

ARG TMDB_V3_API_KEY
ENV VITE_APP_API_ENDPOINT_URL="/api/tmdb"

RUN npm run build

# Stage 2: Runtime environment combining built frontend and backend server
FROM node:20.19.0-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

# Copy backend dependencies and source code
COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./

# Copy the built static assets from the frontend build stage
COPY --from=build /app/dist ./public

EXPOSE 80

CMD ["node", "server.js"]
