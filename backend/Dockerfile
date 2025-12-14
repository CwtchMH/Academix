# Build stage
FROM node:20-alpine AS builder

# Install build dependencies for canvas package
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies for canvas
RUN apk add --no-cache \
    cairo \
    pango \
    jpeg \
    giflib \
    librsvg

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "run", "start:prod"]
