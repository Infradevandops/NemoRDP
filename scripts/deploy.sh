#!/bin/bash
set -e

echo "🚀 NemoRDP Production Deployment Script"
echo "========================================"

# Colors for output
GREEN='\033[0.32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production file not found!${NC}"
    echo "Please copy .env.production.example to .env.production and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

echo -e "${YELLOW}Step 1: Pulling latest code...${NC}"
git pull origin main

echo -e "${YELLOW}Step 2: Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

echo -e "${YELLOW}Step 3: Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down

echo -e "${YELLOW}Step 4: Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml run --rm backend python -m alembic upgrade head

echo -e "${YELLOW}Step 5: Starting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

echo -e "${YELLOW}Step 6: Waiting for services to be healthy...${NC}"
sleep 10

# Check backend health
echo "Checking backend health..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    echo "Rolling back..."
    docker-compose -f docker-compose.prod.yml down
    exit 1
fi

# Check frontend
echo "Checking frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is healthy${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
    echo "Rolling back..."
    docker-compose -f docker-compose.prod.yml down
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Services running:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "View logs with: docker-compose -f docker-compose.prod.yml logs -f"
