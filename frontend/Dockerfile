# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for Next.js public env vars (needed at build time)
ARG NEXT_PUBLIC_ENV
ARG NEXT_PUBLIC_API_ENDPOINT
ARG NEXT_PUBLIC_API_INTERNAL_ENDPOINT

# Set as environment variables for the build
ENV NEXT_PUBLIC_ENV=${NEXT_PUBLIC_ENV}
ENV NEXT_PUBLIC_API_ENDPOINT=${NEXT_PUBLIC_API_ENDPOINT}
ENV NEXT_PUBLIC_API_INTERNAL_ENDPOINT=${NEXT_PUBLIC_API_INTERNAL_ENDPOINT}

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

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
