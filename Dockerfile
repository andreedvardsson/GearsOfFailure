# Team Flags EDU - Production-Grade Dockerfile
# Multi-stage build for optimal image size and security
# This Dockerfile demonstrates DevSecOps best practices
#
# Week 3: Docker Compose - This image works with docker-compose.yml
# Week 5+: Add Firebase credentials for authentication features
#
# Build: docker build -t team-flags-edu .
# Run:   docker run -p 3000:3000 -e MONGODB_URI=... team-flags-edu

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies only when needed
# Using npm ci ensures reproducible builds
COPY package.json package-lock.json* ./
RUN npm ci

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build-time environment variables (dummy values for build only)
# Real values are passed at runtime via docker-compose.yml or -e flags
# MongoDB and Firebase are optional - app works without them for Week 2-4
ENV MONGODB_URI=""
ENV MONGODB_DB=team-flags-edu
ENV STUDENTS_COLLECTION=students
ENV SKIP_ENV_VALIDATION=true

# Build the Next.js application
# This creates an optimized production build
RUN npm run build

# ============================================
# Stage 3: Runner (Final Production Image)
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Security: Create a non-root user
# Running as root is a security risk
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only necessary files from builder
# This keeps the final image small
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Copy Next.js standalone build
# Standalone mode creates a minimal production build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Security: Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Set hostname to allow external connections
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Health check - Docker Compose uses this to verify the app is ready
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the Next.js application
# Standalone mode uses server.js directly
CMD ["node", "server.js"]
