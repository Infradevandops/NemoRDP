#!/bin/bash

# NemoRDP Quick Deployment Script
# This script helps you deploy NemoRDP to production quickly

set -e

echo "🚀 NemoRDP Production Deployment Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}❌ Please do not run as root${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Installing...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✅ Docker installed. Please log out and back in, then run this script again.${NC}"
    exit 0
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker Compose plugin not found. Installing...${NC}"
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo -e "${YELLOW}⚠️  .env.prod not found${NC}"
    echo "Creating from template..."
    
    if [ -f .env.prod.example ]; then
        cp .env.prod.example .env.prod
        echo -e "${YELLOW}📝 Please edit .env.prod with your actual credentials${NC}"
        echo "   Required: POSTGRES_PASSWORD, SECRET_KEY, VULTR_API_KEY, PAYSTACK_SECRET_KEY"
        echo ""
        read -p "Press Enter after you've updated .env.prod..."
    else
        echo -e "${RED}❌ .env.prod.example not found${NC}"
        exit 1
    fi
fi

# Validate critical environment variables
echo "🔍 Validating environment variables..."
source .env.prod

REQUIRED_VARS=(
    "POSTGRES_PASSWORD"
    "SECRET_KEY"
    "PAYSTACK_SECRET_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ] || [ "${!var}" == "YOUR_"* ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing or invalid environment variables:${NC}"
    printf '%s\n' "${MISSING_VARS[@]}"
    echo ""
    echo "Please update .env.prod with real values"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables validated${NC}"
echo ""

# Ask for deployment confirmation
echo "📋 Deployment Summary:"
echo "   - Database: PostgreSQL (Docker)"
echo "   - Cache: Redis (Docker)"
echo "   - Backend: FastAPI"
echo "   - Frontend: Next.js"
echo "   - Workers: Celery + Beat"
echo ""

read -p "🚀 Ready to deploy? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

# Build and start services
echo "🔨 Building and starting services..."
docker compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
docker compose -f docker-compose.prod.yml ps

# Test backend health endpoint
echo "🔍 Testing backend health..."
if docker compose -f docker-compose.prod.yml exec -T backend curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed (this is normal if database is still initializing)${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "📊 Next Steps:"
echo "   1. Check logs: docker compose -f docker-compose.prod.yml logs -f"
echo "   2. Access frontend: http://localhost:3000"
echo "   3. Access backend: http://localhost:8000"
echo "   4. Health check: http://localhost:8000/health"
echo ""
echo "🔧 Useful Commands:"
echo "   - View logs: docker compose -f docker-compose.prod.yml logs -f [service]"
echo "   - Restart: docker compose -f docker-compose.prod.yml restart [service]"
echo "   - Stop all: docker compose -f docker-compose.prod.yml down"
echo "   - Shell access: docker compose -f docker-compose.prod.yml exec [service] /bin/bash"
echo ""
echo "📚 Documentation: Check beta_launch_checklist.md for full setup guide"
echo ""
