# Week 3: Docker Compose - Multi-Container Setup

> **📚 Navigation:** [Docs Index](README.md) | [Week 2: Single Container](WEEK2_SINGLE_CONTAINER.md) | **Week 3: Docker Compose** | [Troubleshooting](TROUBLESHOOTING.md)

**Goal:** Orchestrate a 3-service application with Docker Compose

**Prerequisites:** Complete [Week 2](WEEK2_SINGLE_CONTAINER.md) first, or have basic Docker knowledge.

---

## Learning Objectives

After completing this lab, you will:
- ✅ Have a docker-compose.yml that starts 3 services
- ✅ Understand Nginx → Next.js App → MongoDB architecture
- ✅ Know how Docker networks provide isolation
- ✅ Use volumes for persistent data
- ✅ Configure health checks for startup ordering

---

## Suggested Timeline

| Time | Activity |
|------|----------|
| 30 min | Intro: Docker Compose basics, architecture overview |
| 60 min | Hands-on: Fork → Clone → Start → Understand |
| 60 min | Explore: Read and understand all configuration files |
| 30 min | Experiment: Change, break, fix |

---

## Quick Start: Sync & Run

### Step 1: Sync Your Existing Fork (IMPORTANT!)

> **⚠️ Already have a fork from Week 2?** You do NOT need to fork again!
> You need to sync your fork with upstream to get the new Docker Compose files.

```bash
# 1. Go to your existing fork folder
cd team-flags

# 2. Add upstream (the original repo) - do this only ONCE
git remote add upstream https://github.com/r87-e/team-flags.git

# 3. Verify upstream was added
git remote -v
# You should see:
# origin    https://github.com/YOUR-USERNAME/team-flags.git (fetch)
# origin    https://github.com/YOUR-USERNAME/team-flags.git (push)
# upstream  https://github.com/r87-e/team-flags.git (fetch)
# upstream  https://github.com/r87-e/team-flags.git (push)

# 4. Fetch updates from upstream
git fetch upstream

# 5. Merge the changes into your main branch
git checkout main
git merge upstream/main

# 6. Push to your fork (optional but recommended)
git push origin main
```

> **💡 What's happening here?**
> - `upstream` = the original repo (r87-e/team-flags) with the latest changes
> - `origin` = your fork (YOUR-USERNAME/team-flags)
> - `git fetch upstream` = downloads changes without applying them
> - `git merge upstream/main` = applies the changes to your code

**If you get merge conflicts:**
```bash
# See which files have conflicts
git status

# Open the files and resolve conflicts manually
# Look for <<<<<<< HEAD and >>>>>>> upstream/main

# After resolving conflicts:
git add .
git commit -m "Merge upstream changes"
```

---

### Step 1b: New Here? Fork the Repository

> **🆕 First time?** If you do NOT have a fork from before, follow these steps:

```bash
# 1. Go to GitHub and fork:
#    https://github.com/r87-e/team-flags
#    (Click "Fork" button in top right)

# 2. Clone your fork (replace YOUR-USERNAME with your GitHub username)
git clone https://github.com/YOUR-USERNAME/team-flags.git
cd team-flags
```

### Step 2: Inspect the Project Structure

Before running anything, let's understand what we're working with:

```bash
# See what files are in the project
ls -la

# You should see these key files:
# - docker-compose.yml  → Orchestrates all services
# - Dockerfile          → Builds the Next.js app
# - nginx/              → Nginx reverse proxy config
# - scripts/            → Database initialization
# - .env.example        → Environment template
```

---

## STOP! Read Before You Run

**Don't just run commands blindly.** Understanding the configuration is the whole point of this lab. Take time to read each file.

---

### Step 3: Inspect docker-compose.yml (The Orchestrator)

This is the most important file. Read it carefully:

```bash
cat docker-compose.yml
```

**🔍 What to look for:**

| Line | Look for | Why it matters |
|------|----------|----------------|
| `services:` | 3 services defined | nginx, app, db - our 3-tier architecture |
| `build: ./nginx` | Build from local Dockerfile | nginx has custom config |
| `image: mongo:7` | Uses official image | db doesn't need custom build |
| `depends_on: ... condition: service_healthy` | Startup ordering | Prevents "connection refused" errors |
| `networks:` | Two networks defined | frontend-net and backend-net for isolation |
| `volumes:` | Named volume | mongo-data persists database across restarts |
| `${VARIABLE:-default}` | Environment variables | Values come from .env file, with fallbacks |

**❓ Ask yourself:**
- Which service is exposed to the internet (port 80)?
- Which service can talk to MongoDB?
- What happens if you remove `depends_on`?

---

### Step 4: Inspect the Dockerfile (App Container)

```bash
cat Dockerfile
```

**🔍 What to look for:**

| Line | Look for | Why it matters |
|------|----------|----------------|
| `FROM ... AS deps` | Multi-stage build | Separates build from runtime |
| `FROM ... AS builder` | Second stage | Compiles the app |
| `FROM ... AS runner` | Final stage | Only ~150MB instead of 1.5GB |
| `RUN adduser ... nextjs` | Non-root user | Security: container doesn't run as root |
| `USER nextjs` | Switch user | Actually uses the non-root user |
| `COPY --from=builder` | Copy between stages | Only copies what's needed |
| `EXPOSE 3000` | Documentation | Tells readers which port (doesn't open it) |

**❓ Ask yourself:**
- Why use 3 stages instead of 1?
- Why create a special user instead of using root?
- What files are copied to the final image?

---

### Step 5: Inspect Nginx Configuration

```bash
cat nginx/nginx.conf
```

**🔍 What to look for:**

| Line | Look for | Why it matters |
|------|----------|----------------|
| `upstream nextjs { server app:3000; }` | Service discovery | `app` is the container name from docker-compose |
| `listen 80` | Port binding | Nginx listens on port 80 |
| `proxy_pass http://nextjs` | Reverse proxy | Forwards requests to Next.js |
| `X-Frame-Options` | Security header | Prevents clickjacking attacks |
| `X-Content-Type-Options` | Security header | Prevents MIME sniffing |
| `location /health` | Health endpoint | Docker uses this for health checks |

**❓ Ask yourself:**
- How does nginx know where `app:3000` is?
- What security headers are added?
- Why have a separate `/health` endpoint?

---

### Step 6: Inspect the Nginx Dockerfile

```bash
cat nginx/Dockerfile
```

**🔍 What to look for:**
- Base image: `nginx:alpine` (minimal)
- Custom config copied in
- Health check tool installed (wget)

---

### Step 7: Inspect Environment Configuration

```bash
cat .env.example
```

**🔍 What to look for:**

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Database connection string (includes credentials!) |
| `MONGO_USERNAME` / `MONGO_PASSWORD` | Database credentials |
| `NGINX_PORT` | Which port nginx listens on |
| `NODE_ENV` | production vs development mode |

**⚠️ Security note:** This file has example passwords. In production, use strong passwords and never commit `.env` to Git!

---

### Step 8: Create Your Environment File

Now that you understand what's in it:

```bash
# Copy the example file to a real .env
cp .env.example .env

# Verify it was created
cat .env
```

> **💡 Why .env?**
> Environment variables separate configuration from code. You can run the same Docker image
> in different environments (dev, staging, prod) just by changing the .env file.
> These files should NEVER be committed to Git since they often contain passwords!

---

### Step 9: NOW Run Docker Compose

You've read the configs. Now you understand what will happen:

```bash
# Build and start all 3 services
docker compose up --build
```

**Watch the output and match it to what you read:**
1. Docker reads `docker-compose.yml` and finds 3 services: nginx, app, db
2. For `db`: pulls `mongo:7` image (no build needed)
3. For `app`: runs the multi-stage Dockerfile you inspected
4. For `nginx`: runs `nginx/Dockerfile` you inspected
5. Services start in order: db → app → nginx (because of `depends_on`)
6. Health checks run until all services are healthy
7. When ready, you can reach the app at http://localhost

---

### Step 10: Verify Everything Works

```bash
# In a new terminal, check status of all containers
docker compose ps

# Expected result - all should show "healthy":
# NAME               STATUS                   PORTS
# team-flags-nginx   Up X minutes (healthy)   0.0.0.0:80->80/tcp
# team-flags-app     Up X minutes (healthy)   3000/tcp
# team-flags-db      Up X minutes (healthy)   0.0.0.0:27017->27017/tcp
```

---

## Architecture: 3-Service Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                         DOCKER HOST                              │
│                                                                  │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │                    BROWSER                               │  │
│    │                 http://localhost                         │  │
│    └─────────────────────┬───────────────────────────────────┘  │
│                          │                                       │
│                          ▼                                       │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │              NGINX (Reverse Proxy)                       │  │
│    │                                                          │  │
│    │  • Port 80 (exposed)                                     │  │
│    │  • Forwards requests to app:3000                         │  │
│    │  • Adds security headers                                 │  │
│    │  • Handles static file caching                           │  │
│    └─────────────────────┬───────────────────────────────────┘  │
│                          │                                       │
│                    frontend-net (Docker network)                 │
│                          │                                       │
│                          ▼                                       │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │              NEXT.JS APP (Application)                   │  │
│    │                                                          │  │
│    │  • Port 3000 (internal - not exposed)                    │  │
│    │  • React frontend + API routes                           │  │
│    │  • Connects to MongoDB for data                          │  │
│    │  • Health endpoint: /api/health                          │  │
│    └─────────────────────┬───────────────────────────────────┘  │
│                          │                                       │
│                    backend-net (Docker network)                  │
│                          │                                       │
│                          ▼                                       │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │              MONGODB (Database)                          │  │
│    │                                                          │  │
│    │  • Port 27017 (exposed for debug)                        │  │
│    │  • Persistent data via volume                            │  │
│    │  • Credentials via environment variables                 │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

| Service | Purpose | Why? |
|---------|---------|------|
| **Nginx** | Reverse proxy | Hides backend ports, adds security headers, can handle SSL |
| **App** | Application logic | Separated from database and proxy for scalability |
| **MongoDB** | Data storage | Isolated in its own network, only accessible from app |

### Network Isolation

```
frontend-net:  nginx ←→ app       (users can reach)
backend-net:   app ←→ db         (internal only)
```

> **💡 Why two networks?**
> MongoDB is only connected to `backend-net`. This means someone who compromises
> nginx CANNOT reach the database directly - they must go through the app service first.
> This is "defense in depth" - multiple layers of security.

---

## Hands-On Exercises

### Exercise 1: Explore Docker Compose (15 min)

```bash
# 1. Show all containers and their status
docker compose ps
```

> **💡 Learning moment: Container States**
> - `Up (healthy)` = Container running AND health check passing
> - `Up (health: starting)` = Running but health check not passed yet
> - `Up (unhealthy)` = Running but health check failing
> - `Exited` = Container stopped (check logs to see why!)

```bash
# 2. Show logs from all services (Ctrl+C to stop)
docker compose logs -f
```

> **🔧 Pro tip:** The `-f` flag means "follow" - logs stream in real-time.
> Without `-f`, you just see existing logs and exit.

```bash
# 3. Show logs from only the app
docker compose logs -f app
```

> **💡 Learning moment: Log filtering**
> In production, you might have 20+ services. Filtering logs by service name
> is essential for debugging. You can also combine: `docker compose logs -f app nginx`

```bash
# 4. Show network configuration
docker network ls
docker network inspect team-flags-frontend
```

> **🔍 What to look for in network inspect:**
> - `"Containers"` section shows which containers are connected
> - `"Subnet"` shows the IP range (e.g., 172.18.0.0/16)
> - Each container gets an IP within this subnet

**Questions to answer:**
- Which containers are running?
- What status does each container have?
- Which networks exist and which services are connected to each?

---

### Exercise 2: Test Health Endpoints (10 min)

```bash
# 1. Nginx health check (direct)
curl http://localhost/health
```

> **💡 Why nginx has its own health endpoint:**
> Nginx responds with "OK" instantly - no backend needed. This lets Docker
> know nginx itself is working, separate from whether the app is working.

```bash
# 2. App health check (via nginx)
curl http://localhost/api/health
```

> **🔍 Examine the response:**
> ```json
> {
>   "status": "healthy",
>   "checks": {
>     "database": { "status": "connected" }
>   }
> }
> ```
> The app checks MongoDB connectivity and reports it. This is a **deep health check** -
> it verifies the entire chain works, not just that the process is running.

```bash
# 3. MongoDB ping (inside container)
docker compose exec db mongosh --eval "db.adminCommand('ping')"
```

> **💡 Learning moment: `docker compose exec`**
> This runs a command INSIDE a running container. It's like SSH-ing into a server.
> - `exec db` = run in the `db` container
> - `mongosh` = MongoDB shell
> - `--eval "..."` = run this JavaScript and exit

**Questions to answer:**
- What does each health endpoint return?
- Why do we have health checks on each service?

> **🎓 Real-world insight:**
> Health checks aren't just for Docker. Kubernetes, load balancers (AWS ALB,
> nginx upstream), and monitoring tools (Prometheus, Datadog) all use health
> endpoints to know if your service is working.

---

### Exercise 3: Network Isolation Test (15 min)

This exercise proves that Docker networks actually isolate services.

```bash
# 1. Try to reach MongoDB from nginx container (should FAIL)
docker compose exec nginx ping -c 3 db
# Expected: "bad address 'db'" - nginx can't see db
```

> **🔐 Security insight:**
> This error is GOOD! It means nginx (which is exposed to the internet on port 80)
> cannot directly access your database. An attacker who compromises nginx
> would need to also compromise the app to reach MongoDB.

```bash
# 2. Try to reach MongoDB from app container (should SUCCEED)
docker compose exec app ping -c 3 db
# Expected: "64 bytes from..." - app can reach db
```

> **💡 How does `db` resolve to an IP?**
> Docker has a built-in DNS server. When you use service names in docker-compose,
> Docker automatically creates DNS entries. `db` resolves to MongoDB's container IP.

```bash
# 3. Try to reach app from nginx (should SUCCEED)
docker compose exec nginx wget -qO- http://app:3000/api/health
```

> **💡 Learning moment: Service Discovery**
> Notice we use `app:3000` not `localhost:3000` or an IP address.
> This is **service discovery** - containers find each other by name.
> If you scale to 3 app containers, `app` would round-robin between them!

**What we proved:**
| From | To | Result | Why |
|------|-----|--------|-----|
| nginx | db | ❌ FAIL | Different networks |
| nginx | app | ✅ OK | Both on frontend-net |
| app | db | ✅ OK | Both on backend-net |

> **🎓 This is "Defense in Depth"**
> Multiple security layers: Even if one layer fails, others protect you.
> Network isolation is one layer. Non-root users is another. Firewalls are another.

---

### Exercise 4: Experiment - Break Things! (20 min)

The best way to learn is to break things and fix them.

**A) Change an environment variable:**
```bash
# Stop everything
docker compose down

# Edit .env and change NGINX_PORT to 8080
nano .env  # or use any editor

# Start again
docker compose up -d

# Now the app should be on http://localhost:8080
curl http://localhost:8080/api/health
```

> **💡 Learning moment: Environment variables**
> We changed the port WITHOUT modifying any code or config files.
> This is the "12-factor app" principle: configuration via environment.
> Same Docker image can run on port 80, 8080, or 443 just by changing `.env`.

**B) Simulate a database failure:**
```bash
# Stop only the database
docker compose stop db

# Check what happens with health checks
docker compose ps
# Notice: app might become "unhealthy" after a few checks

curl http://localhost/api/health
# Should show database: "disconnected" or "error"

# Start the database again
docker compose start db

# Watch recovery
docker compose ps
# App should become healthy again automatically
```

> **🎓 Real-world insight: Resilience**
> In production, databases restart, networks hiccup, services crash.
> Good applications handle this gracefully:
> - Health checks detect problems
> - Orchestrators (Docker, Kubernetes) restart unhealthy containers
> - Apps reconnect when dependencies return
>
> This is why we use connection pooling and retry logic!

**C) Inspect inside a container:**
```bash
# Enter the app container
docker compose exec app sh

# Inside the container - explore!
pwd                           # Where are we? /app
ls -la                        # What files exist?
cat /etc/passwd | grep nextjs # See the non-root user
whoami                        # Confirm we're running as nextjs
ps aux                        # What processes are running?
env | grep MONGO              # See environment variables

exit
```

> **🔐 Security insight: Why non-root matters**
> Notice `whoami` returns `nextjs`, not `root`.
> If an attacker exploits a vulnerability in your app, they get `nextjs`
> permissions - which can't install software, modify system files, or
> access other containers. This limits the blast radius of a compromise.

**D) BONUS: Watch resource usage in real-time:**
```bash
# See CPU/memory usage of all containers
docker stats

# Press Ctrl+C to exit
```

> **💡 Pro tip:** In production, you'd set memory/CPU limits in docker-compose
> to prevent one container from starving others. Look up `deploy.resources.limits`.

---

## Knowledge Check

Test your understanding by answering these questions:

### 1. Explain the purpose of each service (3 points)
- Nginx:
- App (Next.js):
- MongoDB:

### 2. Why do we have two separate networks? (2 points)

### 3. What happens if you remove `depends_on` from the app service? (2 points)

### 4. Explain the difference between `ports` and `expose` in Docker Compose (2 points)

### 5. Why does the Dockerfile use multi-stage builds? (2 points)

### 6. Draw a diagram showing how an HTTP request flows from browser to database (3 points)

---

## Common Problems & Solutions

### Problem: "Port already in use"
```bash
# Solution 1: Change port in .env
NGINX_PORT=8080

# Solution 2: Find and stop process using the port
lsof -i :80
kill -9 <PID>
```

### Problem: "Container won't start"
```bash
# Check logs for specific service
docker compose logs app

# Rebuild from scratch
docker compose down -v
docker compose up --build
```

### Problem: "Cannot connect to MongoDB"
```bash
# Wait - MongoDB takes time to start
# Check health status
docker compose ps

# Verify MongoDB is running
docker compose exec db mongosh --eval "db.adminCommand('ping')"
```

### Problem: "502 Bad Gateway"
```bash
# App hasn't started yet, wait for health check
docker compose logs -f app
# Wait until you see "Ready in Xs"
```

---

## Self-Study: Deep Dive Resources

Use these resources to deepen your understanding:

### Docker Compose Basics

| Topic | Resource | Time |
|-------|----------|------|
| Docker Compose Intro | [YouTube: TechWorld with Nana](https://www.youtube.com/watch?v=MVIcrmeV_6c) | 20 min |
| Docker Networks Explained | [YouTube: NetworkChuck](https://www.youtube.com/watch?v=bKFMS5C4CG0) | 15 min |
| Docker Volumes Deep Dive | [YouTube: TechWorld with Nana](https://www.youtube.com/watch?v=p2PH_YPCsis) | 18 min |

### Multi-stage Builds & Optimization

| Topic | Resource | Time |
|-------|----------|------|
| Multi-stage Dockerfile | [YouTube: DevOps Directive](https://www.youtube.com/watch?v=zpkqNPwEzac) | 12 min |
| Docker Security Best Practices | [YouTube: IBM Technology](https://www.youtube.com/watch?v=JE2PJbbpjsM) | 10 min |

### Nginx as Reverse Proxy

| Topic | Resource | Time |
|-------|----------|------|
| Nginx Reverse Proxy | [YouTube: The Digital Life](https://www.youtube.com/watch?v=lZVAI3PqgHc) | 14 min |
| Nginx Configuration | [YouTube: Traversy Media](https://www.youtube.com/watch?v=7VAI73roXaY) | 25 min |

### Official Documentation

- [Docker Compose Specification](https://docs.docker.com/compose/compose-file/)
- [Docker Networking](https://docs.docker.com/network/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Nginx Documentation](https://nginx.org/en/docs/)

### Interactive Exercises

- [Play with Docker](https://labs.play-with-docker.com/) - Free Docker environment in browser
- [Docker 101 Tutorial](https://www.docker.com/101-tutorial/) - Official hands-on tutorial

---

## What's Next

### Week 4: CI/CD Pipeline
- GitHub Actions
- Automated builds
- Container registry

### Week 5-6: Security
- Trivy container scanning
- SBOM generation
- Firebase authentication

---

## Checklist

Before finishing, make sure you:

- [ ] Can start all 3 services with `docker compose up`
- [ ] Understand what each service does
- [ ] Can explain network isolation
- [ ] Have tested health endpoints
- [ ] Have answered the knowledge check questions
- [ ] Know where to find deep dive materials

---

## Need Help?

- **Something broken?** Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
- **Review basics?** Go back to [Week 2: Single Container](WEEK2_SINGLE_CONTAINER.md)
- **Ready for more?** Continue to Week 4: CI/CD Pipeline (coming soon)

---

**Good luck! Ask if you get stuck!**

---

> **📚 Navigation:** [Docs Index](README.md) | [Week 2: Single Container](WEEK2_SINGLE_CONTAINER.md) | **Week 3: Docker Compose** | [Troubleshooting](TROUBLESHOOTING.md)
