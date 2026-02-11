# Troubleshooting Guide

> **📚 Navigation:** [Docs Index](README.md) | [Week 2: Single Container](WEEK2_SINGLE_CONTAINER.md) | [Week 3: Docker Compose](WEEK3_BOILER_ROOM.md) | **Troubleshooting**

Common issues and solutions for Team Flags EDU.

---

## Docker Compose Issues

### "Port already in use"

```bash
# Error: bind: address already in use

# Solution 1: Change port in .env
NGINX_PORT=8080

# Solution 2: Find and kill process using the port
lsof -i :80
kill -9 <PID>

# Solution 3: Stop other Docker containers
docker ps
docker stop <container_id>
```

### "Container won't start"

```bash
# Check logs for the failing service
docker compose logs app
docker compose logs db
docker compose logs nginx

# Rebuild from scratch
docker compose down -v
docker compose up --build
```

### "502 Bad Gateway"

The app hasn't started yet. Wait for health checks to pass.

```bash
# Watch the logs
docker compose logs -f app

# Wait until you see "Ready in Xs"
# Then refresh browser
```

### Services not healthy

```bash
# Check which services are unhealthy
docker compose ps

# View health check logs
docker inspect team-flags-app | grep -A 20 "Health"
```

---

## MongoDB Issues

### "Cannot connect to MongoDB"

```bash
# 1. Check if MongoDB is running
docker compose ps db

# 2. Check MongoDB logs
docker compose logs db

# 3. Verify MongoDB is healthy
docker compose exec db mongosh --eval "db.adminCommand('ping')"

# 4. Check MONGODB_URI in .env matches credentials
cat .env | grep MONGO
```

### "Authentication failed"

Credentials in `.env` don't match `docker-compose.yml` defaults.

```bash
# Check your .env
MONGO_USERNAME=admin
MONGO_PASSWORD=password

# These must match MONGODB_URI
MONGODB_URI=mongodb://admin:password@db:27017/team-flags-edu?authSource=admin
```

### Reset MongoDB completely

```bash
# Stop everything and remove volumes
docker compose down -v

# Restart (creates fresh database)
docker compose up --build
```

---

## Network Issues

### Can't reach app from nginx

```bash
# Check networks
docker network ls
docker network inspect team-flags-frontend

# Verify app is on frontend-net
docker inspect team-flags-app | grep -A 10 "Networks"
```

### Test network connectivity

```bash
# From nginx, try to reach app (should work)
docker compose exec nginx wget -qO- http://app:3000/api/health

# From nginx, try to reach db (should FAIL - this is correct!)
docker compose exec nginx ping -c 1 db
# Expected: "bad address 'db'"
```

---

## Build Issues

### "COPY failed: file not found"

```bash
# Make sure you're in the project root
pwd
# Should be: /path/to/team-flags-edu

# Check file exists
ls -la Dockerfile
ls -la nginx/Dockerfile
```

### Build takes forever

```bash
# Clean Docker cache
docker builder prune

# Or build without cache
docker compose build --no-cache
```

### Out of disk space

```bash
# Remove unused Docker resources
docker system prune -a

# Check disk usage
docker system df
```

---

## Environment Issues

### "Variable is not set"

```bash
# Make sure .env exists
ls -la .env

# If missing, create from template
cp .env.example .env
```

### Changes to .env not taking effect

```bash
# Restart services to pick up env changes
docker compose down
docker compose up
```

---

## macOS Specific

### Docker Desktop not running

```bash
# Start Docker Desktop from Applications
# Or via command line:
open -a Docker
```

### Permission denied on volumes

```bash
# Fix permissions
chmod -R 755 ./scripts
```

---

## Windows Specific

### Line ending issues

```bash
# If scripts fail with "^M" errors
# Convert line endings to Unix format
# In VS Code: Bottom right → CRLF → Click → Select LF
```

### Path issues

```bash
# Use forward slashes in paths
# Wrong: C:\Users\name\project
# Right: /c/Users/name/project
```

---

## Still Stuck?

1. **Check the logs:** `docker compose logs -f`
2. **Restart everything:** `docker compose down -v && docker compose up --build`
3. **Ask for help:** Post in course Discord with:
   - Error message
   - Output of `docker compose ps`
   - Output of `docker compose logs <service>`
