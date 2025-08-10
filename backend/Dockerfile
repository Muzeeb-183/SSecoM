# Development stage
FROM node:18-alpine AS development
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Expose backend port
EXPOSE 5000

# Development command with nodemon
CMD ["npm", "run", "dev"]

# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S ssecom -u 1001

# Install curl for health checks
RUN apk add --no-cache curl

# Change ownership
RUN chown -R ssecom:nodejs /app
USER ssecom

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
