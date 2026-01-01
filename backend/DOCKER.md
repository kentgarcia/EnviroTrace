# Docker Deployment Guide

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your actual values
nano .env  # or use your preferred editor

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Build Docker Image Only

```bash
# Build the image
docker build -t envirotrace-backend .

# Run the container
docker run -d \
  --name envirotrace-backend \
  -p 8000:8000 \
  --env-file .env \
  envirotrace-backend
```

## Database Migrations

Run migrations inside the container:

```bash
# Using docker-compose
docker-compose exec backend alembic upgrade head

# Using docker run
docker exec -it envirotrace-backend alembic upgrade head
```

## Health Check

```bash
curl http://localhost:8000/health
```

## Production Deployment

### Environment Variables

Make sure to set these in production:
- `SECRET_KEY` - Use a strong random key
- `DATABASE_URL` - Your production database URL
- `ALLOWED_ORIGINS` - Your frontend domain(s)
- `ENVIRONMENT=production`
- `DEBUG=false`

### Building for Production

```bash
docker build -t envirotrace-backend:v1.0.0 .
docker tag envirotrace-backend:v1.0.0 your-registry/envirotrace-backend:v1.0.0
docker push your-registry/envirotrace-backend:v1.0.0
```

## Useful Commands

```bash
# View running containers
docker-compose ps

# Access container shell
docker-compose exec backend bash

# View logs
docker-compose logs -f backend

# Restart service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build

# Clean up
docker-compose down -v  # Warning: This removes volumes/data
```

## Development Mode

For hot-reload during development, the docker-compose.yml mounts the app directory. Code changes will automatically reload.

## Troubleshooting

### Container won't start
- Check logs: `docker-compose logs backend`
- Verify environment variables in `.env`
- Ensure database is accessible

### Database connection issues
- Verify `DATABASE_URL` is correct
- Check if db container is running: `docker-compose ps`
- Test db connection: `docker-compose exec db psql -U postgres`

### Port already in use
- Change port mapping in `docker-compose.yml`
- Example: `"8001:8000"` instead of `"8000:8000"`
