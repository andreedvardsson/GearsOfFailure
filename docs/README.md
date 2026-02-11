# Documentation

Learning guides for the Team Flags EDU DevSecOps platform.

## Quick Navigation

| Guide | Description | When to Use |
|-------|-------------|-------------|
| [Week 2: Single Container](WEEK2_SINGLE_CONTAINER.md) | Docker basics, building your first container | Start here if new to Docker |
| [Week 3: Docker Compose](WEEK3_BOILER_ROOM.md) | Multi-container orchestration | After completing Week 2 |
| [Troubleshooting](TROUBLESHOOTING.md) | Common issues and solutions | When things break |

## Learning Path

```
Week 2                          Week 3                          Week 4+
──────────────────────────────────────────────────────────────────────────

┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Single Container  │ -> │   Docker Compose    │ -> │   CI/CD Pipeline    │
│                     │    │                     │    │                     │
│ • Dockerfile        │    │ • 3 services        │    │ • GitHub Actions    │
│ • docker build      │    │ • Networks          │    │ • Automated builds  │
│ • docker run        │    │ • Volumes           │    │ • Security scanning │
│ • Multi-stage       │    │ • Health checks     │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## File Structure

```
docs/
├── README.md                    # This file - navigation index
├── WEEK2_SINGLE_CONTAINER.md    # Week 2: Docker basics
├── WEEK3_BOILER_ROOM.md         # Week 3: Docker Compose (main lab)
└── TROUBLESHOOTING.md           # Common issues & solutions
```

## Quick Commands Reference

### Week 2 (Single Container)
```bash
docker build -t myapp .
docker run -p 3000:3000 myapp
docker ps
docker logs <container_id>
```

### Week 3 (Docker Compose)
```bash
docker compose up --build      # Start all services
docker compose ps              # Check status
docker compose logs -f         # View logs
docker compose down            # Stop all services
```

## Need Help?

1. Check [Troubleshooting](TROUBLESHOOTING.md) first
2. Review the specific week's guide
3. Ask your instructor or post in the course channel
