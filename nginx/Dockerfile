# Team Flags EDU - Nginx Dockerfile
# Week 3: Reverse proxy container
#
# Security features:
# - Based on official nginx:alpine (minimal attack surface)
# - wget installed for health checks
# - Custom nginx.conf with security headers

FROM nginx:1.25-alpine

# Install wget for health checks
RUN apk add --no-cache wget

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create custom error page
RUN echo '<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Service Temporarily Unavailable</h1><p>Please try again later.</p></body></html>' > /usr/share/nginx/html/50x.html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
