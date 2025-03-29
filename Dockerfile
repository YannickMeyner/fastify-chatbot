# Stage 1: Build Stage
FROM node:23-alpine AS builder
WORKDIR /app

# Copy only package files first for better caching
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy the rest of the app files
COPY . .

# Remove unnecessary files (optional)
RUN rm -rf node_modules/.cache && rm -rf /var/cache/apk/*

# Stage 2: Production Stage (Final Image)
FROM node:23-alpine
WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /app /app

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["node", "server.js"]