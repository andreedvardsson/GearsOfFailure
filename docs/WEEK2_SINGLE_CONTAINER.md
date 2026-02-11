# Week 2: Single Container - From Zero to Container

> **📚 Navigation:** [Docs Index](README.md) | **Week 2: Single Container** | [Week 3: Docker Compose](WEEK3_BOILER_ROOM.md) | [Troubleshooting](TROUBLESHOOTING.md)

**Goal**: Get the Team Flags app running in a Docker container

**Prerequisites**: Docker Desktop installed

**Next Step**: After completing this, continue to [Week 3: Docker Compose](WEEK3_BOILER_ROOM.md)

---

## 🎯 Session Objectives

By the end of this session, you will:
- ✅ Fork and clone the Team Flags repository
- ✅ Run the app locally (without Docker)
- ✅ Understand the Dockerfile structure
- ✅ Build your first Docker image
- ✅ Run your app in a container
- ✅ Debug common Docker issues

---

## 📋 Pre-Session Checklist

Before 08:00, make sure you have:
- [ ] Docker Desktop installed and running
- [ ] `docker --version` works in your terminal
- [ ] GitHub account ready
- [ ] Code editor installed (VS Code recommended)
- [ ] Terminal/command prompt ready

**Quick test:**
```bash
docker run hello-world
```
If you see "Hello from Docker!" you're ready! ✅

---

## Part 1: Fork & Clone (08:00-08:20) - 20 min

### Step 1: Fork the Repository

1. Go to: `https://github.com/YOUR-ORG/team-flags-edu`
2. Click **Fork** (top right)
3. This creates YOUR copy of the repo

### Step 2: Clone to Your Computer

```bash
# Navigate to where you want the project
cd ~/Desktop  # or wherever you prefer

# Clone YOUR fork (replace YOUR-USERNAME)
git clone https://github.com/YOUR-USERNAME/team-flags-edu.git

# Enter the directory
cd team-flags-edu
```

### Step 3: Explore the Structure

```bash
# List files
ls -la

# Look at key files
cat package.json    # Project dependencies
cat Dockerfile      # Container definition (we'll dive into this later)
cat README.md       # Documentation
```

**Checkpoint**: Everyone should have the code on their machine.

---

## Part 2: Run Locally Without Docker (08:20-08:50) - 30 min

### Step 1: Install Dependencies

```bash
# Install Node.js packages
npm install
```

This might take 2-3 minutes. You'll see a lot of output - that's normal!

### Step 2: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Open .env.local in your editor
code .env.local  # or nano .env.local
```

**You need a MongoDB connection string!**

**Option A - Use the provided test database** (easiest):
```
MONGODB_URI=mongodb+srv://test-user:PROVIDED-PASSWORD@cluster.mongodb.net/
MONGODB_DB=team-flags-edu
STUDENTS_COLLECTION=students
```
*(Läraren will provide the real credentials)*

**Option B - Create your own** (recommended for later):
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create free cluster
4. Get connection string
5. Paste into `.env.local`

### Step 3: Run the Development Server

```bash
npm run dev
```

You should see:
```
> team-flags-edu@1.0.0 dev
> next dev

  ▲ Next.js 16.1.3
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### Step 4: Test in Browser

Open: **http://localhost:3000**

**What you'll see:**
- A status page showing "Docker Container Running! 🐳"
- Green checkmark: Next.js Application is working
- Yellow alerts: Firebase and MongoDB not configured yet

**This is perfect for Week 2!** You're learning Docker, not database setup.
The status page proves your development environment works correctly.

**Common Issues:**
- Port already in use? The app will use 3001 automatically, check terminal output
- Seeing errors? Check your `.env.local` exists (copied from .env.example)

### Step 5: Stop the Server

Press `Ctrl+C` in the terminal

**Checkpoint**: Everyone should have seen the app running in browser.

---

## Part 3: Understanding the Dockerfile (08:50-09:20) - 30 min

### Step 1: Open the Dockerfile

```bash
# View the Dockerfile
cat Dockerfile

# Or open in editor
code Dockerfile
```

### Step 2: Understand Each Section

Let's break it down together:

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
```
- `FROM` = Base image (Node.js 20 on Alpine Linux)
- `AS deps` = Name this stage "deps" (for multi-stage build)
- **Why Alpine?** Smaller size = faster builds, smaller final image

```dockerfile
WORKDIR /app
```
- Sets working directory inside container to `/app`
- All following commands run from here

```dockerfile
COPY package.json package-lock.json* ./
RUN npm ci
```
- Copy only package files first (for layer caching!)
- `npm ci` = Clean install (reproducible builds)

```dockerfile
# Stage 2: Builder
FROM node:20-alpine AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
```
- **Multi-stage build!** New stage starts here
- Copy dependencies from previous stage
- Copy all source code
- Build the production app

```dockerfile
# Stage 3: Runner
FROM node:20-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
USER nextjs
```
- **Final stage** = what ends up in the image
- Creates non-root user for **security**
- Never run containers as root!

```dockerfile
EXPOSE 3000
CMD ["npm", "start"]
```
- Document which port the app uses
- Command to run when container starts

### Discussion Questions (as a group):

1. Why do we have 3 stages instead of just 1?
2. What security practices do you see?
3. Why copy `package.json` before copying everything else?

**Key Concepts:**
- 🏗️ **Multi-stage builds** = Smaller final image
- 🔒 **Non-root user** = Security best practice
- ⚡ **Layer caching** = Faster rebuilds
- 📦 **Alpine Linux** = Minimal base image

**Checkpoint**: Everyone understands the Dockerfile structure.

---

## ☕ BREAK (09:20-09:35) - 15 min

Fika time! Stretch, grab coffee, help teammates catch up.

---

## Part 4: Build Your Docker Image (09:35-10:15) - 40 min

### Step 1: Build the Image

```bash
# Build the Docker image
docker build -t team-flags:v1 .
```

**Command breakdown:**
- `docker build` = Build an image from Dockerfile
- `-t team-flags:v1` = Tag it with name:version
- `.` = Use Dockerfile in current directory

**This will take 2-5 minutes!** You'll see:
```
[+] Building 156.3s (17/17) FINISHED
 => [deps 1/3] FROM docker.io/library/node:20-alpine
 => [deps 2/3] COPY package.json package-lock.json* ./
 => [deps 3/3] RUN npm ci
 => [builder 1/4] COPY --from=deps /app/node_modules ./node_modules
 ...
```

### Step 2: Verify the Image

```bash
# List all Docker images
docker images

# You should see:
REPOSITORY    TAG    IMAGE ID      CREATED         SIZE
team-flags    v1     abc123def     2 minutes ago   XXX MB
```

### Step 3: Inspect Image Details

```bash
# See detailed information
docker inspect team-flags:v1

# See image history (layers)
docker history team-flags:v1
```

**Discussion**: Notice how small the final image is compared to node_modules!

**Common Issues:**
- Build fails? Check syntax in Dockerfile
- "No space left on device"? Run: `docker system prune`
- Network timeout? Check internet connection

**Checkpoint**: Everyone has built their image successfully.

---

## Part 5: Run Your Container (10:15-10:50) - 35 min

### Step 1: Run the Container

```bash
# Run the container
docker run -p 3000:3000 \
  -e MONGODB_URI="your-connection-string-here" \
  -e MONGODB_DB="team-flags-edu" \
  -e STUDENTS_COLLECTION="students" \
  team-flags:v1
```

**Command breakdown:**
- `docker run` = Create and start a container
- `-p 3000:3000` = Map port 3000 (host) to 3000 (container)
- `-e` = Set environment variable
- `team-flags:v1` = Which image to use

You should see Next.js start up inside the container!

### Step 2: Test in Browser

Open: **http://localhost:3000**

**It's the same app, but now running in a container!** 🎉

### Step 3: Explore the Running Container

Open a **new terminal** (keep the container running in the first one):

```bash
# List running containers
docker ps

# You'll see:
CONTAINER ID   IMAGE           COMMAND         PORTS
abc123         team-flags:v1   "npm start"     0.0.0.0:3000->3000/tcp

# Copy the CONTAINER ID (e.g., abc123)
```

### Step 4: Get a Shell Inside the Container

```bash
# Replace abc123 with YOUR container ID
docker exec -it abc123 sh

# You're now INSIDE the container!
# Try these commands:
whoami          # Should show "nextjs" (non-root user!)
ls -la          # See the app files
pwd             # Should show /app
cat package.json
exit            # Leave the container
```

### Step 5: View Container Logs

```bash
# See what's happening inside
docker logs abc123

# Follow logs in real-time
docker logs -f abc123
# Press Ctrl+C to stop following
```

### Step 6: Stop the Container

Go back to the terminal running the container and press `Ctrl+C`

Or from another terminal:
```bash
docker stop abc123
```

### Step 7: Clean Up

```bash
# Remove stopped containers
docker ps -a           # See all containers
docker rm abc123       # Remove specific container

# Or remove all stopped containers
docker container prune
```

**Checkpoint**: Everyone has run their app in a container!

---

## Part 6: Experimentation & Challenges (10:50-11:00) - 10 min

### Challenge 1: Run in Background

```bash
# Run container in detached mode (background)
docker run -d -p 3000:3000 \
  -e MONGODB_URI="..." \
  team-flags:v1

# Check it's running
docker ps
```

### Challenge 2: Name Your Container

```bash
# Give your container a friendly name
docker run -d --name my-team-flags -p 3000:3000 \
  -e MONGODB_URI="..." \
  team-flags:v1

# Now you can use the name instead of ID
docker logs my-team-flags
docker stop my-team-flags
docker start my-team-flags
```

### Challenge 3: Use .env File (Advanced)

```bash
# Create a docker.env file
cat > docker.env << EOF
MONGODB_URI=your-connection-string
MONGODB_DB=team-flags-edu
STUDENTS_COLLECTION=students
EOF

# Run with env file
docker run -d --env-file docker.env -p 3000:3000 team-flags:v1
```

### Challenge 4: Rebuild with Your Changes

1. Make a small change to the app (e.g., edit `app/page.tsx`)
2. Rebuild: `docker build -t team-flags:v2 .`
3. Run the new version: `docker run -d -p 3000:3000 ... team-flags:v2`
4. Compare build times - was it faster? (Layer caching!)

---

## 📊 Check Point (11:00-12:00)

### Team Status Report

Each team prepares to share:

**What we accomplished:**
- [ ] Forked and cloned repository
- [ ] Ran app locally
- [ ] Built Docker image
- [ ] Ran app in container

**What we learned:**
- Multi-stage Docker builds
- Layer caching
- Container security (non-root user)
- Port mapping
- Environment variables in containers

**Challenges we faced:**
- [List any blockers or confusion]

**Questions for the group:**
- [What are you still unsure about?]

---

## 🎯 Homework / Next Steps

Before next Tuesday:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Docker support"
   git push origin main
   ```

2. **Experiment with Docker commands**
   - Try rebuilding after code changes
   - Practice starting/stopping containers
   - Explore `docker inspect`, `docker stats`

3. **Read ahead**: Week 3 will cover GitHub Actions CI/CD

4. **Optional**: Create a `docker-compose.yml` file (we'll cover this later)

---

## 📚 Key Commands Summary

```bash
# Building
docker build -t name:tag .              # Build image
docker images                           # List images

# Running
docker run -p 3000:3000 image-name      # Run container
docker run -d --name my-app image       # Run in background with name
docker ps                               # List running containers
docker ps -a                            # List all containers

# Managing
docker stop container-id                # Stop container
docker start container-id               # Start stopped container
docker rm container-id                  # Remove container
docker rmi image-name                   # Remove image

# Debugging
docker logs container-id                # View logs
docker exec -it container-id sh         # Shell into container
docker inspect container-id             # Detailed info

# Cleanup
docker system prune                     # Clean up everything unused
docker container prune                  # Remove stopped containers
docker image prune                      # Remove unused images
```

---

## 🆘 Common Issues & Solutions

### "Cannot connect to Docker daemon"
```bash
# Make sure Docker Desktop is running
# Restart Docker Desktop if needed
```

### "Port 3000 already in use"
```bash
# Find what's using port 3000
lsof -ti:3000

# Kill it
lsof -ti:3000 | xargs kill

# Or use a different port
docker run -p 8080:3000 ...  # Access via localhost:8080
```

### "npm install failed" during build
```bash
# Clear Docker build cache
docker builder prune

# Rebuild
docker build --no-cache -t team-flags:v1 .
```

### "MONGODB connection failed"
- Double-check `.env.local` has correct credentials
- Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check if you're using the test credentials provided

### Container starts then immediately stops
```bash
# Check logs to see what happened
docker logs container-id

# Common causes:
# - Missing environment variables
# - Port already in use
# - Application error
```

---

## 🎉 Success Criteria

You've successfully completed Week 2 Boiler Room if:

- ✅ You can build a Docker image from a Dockerfile
- ✅ You understand multi-stage builds
- ✅ You can run a containerized application
- ✅ You can debug containers using logs and exec
- ✅ You understand basic Docker security (non-root user)
- ✅ Your code is committed to GitHub

---

**Great work! See you at Check Point! 🚀**
