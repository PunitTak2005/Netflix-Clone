# Build/dependency stage
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy dependency manifests first for optimal caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Runtime stage
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules from dependency stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application source with node user ownership
COPY --chown=node:node . .

# Run as non-root user
USER node

EXPOSE 5000

CMD ["node", "server.js"]
