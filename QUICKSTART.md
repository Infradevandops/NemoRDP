# NemoRDP - Quick Start Guide

## 🚀 Getting Started (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional, recommended)

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd RDP-SaaS

# 2. Create environment file
cp .env.example .env
# Edit .env with your credentials

# 3. Start all services
docker-compose up -d

# 4. Check logs
docker-compose logs -f

# 5. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up database
# Make sure PostgreSQL is running
createdb nemordp

# Run migrations (if using Alembic)
# alembic upgrade head

# Start backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# In another terminal, start Celery worker
celery -A core.celery_app worker --loglevel=info

# In another terminal, start Celery beat
celery -A core.celery_app beat --loglevel=info
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
```

### Testing Your Setup

```bash
# Run the setup test script
python test_setup.py

# This will check:
# - Environment variables
# - Database connection
# - Redis connection
# - Python dependencies
```

## 🔧 Configuration

### Required Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/nemordp

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here

# Payment
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key

# Provider APIs (Optional for testing)
VULTR_API_KEY=your_vultr_api_key
CONTABO_API_KEY=your_contabo_api_key

# Email (Optional for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Redis
REDIS_URL=redis://localhost:6379/0
```

### Frontend Environment

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
```

## 📝 Development Workflow

### 1. Create a new feature
```bash
git checkout -b feature/your-feature-name
```

### 2. Make changes
- Backend: Edit files in `backend/`
- Frontend: Edit files in `frontend/`

### 3. Test locally
```bash
# Backend tests (if implemented)
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Build test
npm run build
```

### 4. Commit and push
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

## 🚀 Production Deployment

### Quick Deploy (Docker Compose)

```bash
# 1. Set up production environment
cp .env.prod.example .env.prod
# Edit .env.prod with production credentials

# 2. Run deployment script
./deploy.sh

# 3. Check status
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### Manual Production Deploy

See `beta_launch_checklist.md` for detailed production deployment steps.

## 🔍 Troubleshooting

### Backend won't start
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Check if Redis is running
redis-cli ping

# Check Python dependencies
pip list | grep fastapi
```

### Frontend won't build
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build
```

### Database connection errors
```bash
# Verify DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Reset database (WARNING: deletes all data)
dropdb nemordp
createdb nemordp
```

### Celery worker not processing tasks
```bash
# Check Redis connection
redis-cli ping

# Check Celery logs
celery -A core.celery_app worker --loglevel=debug

# Purge all tasks (if stuck)
celery -A core.celery_app purge
```

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs (when backend is running)
- **Project Roadmap**: See `docs/RDP-MASTER-ROADMAP.md`
- **Beta Launch Guide**: See `beta_launch_checklist.md`
- **Architecture**: See `docs/SERIES-A-B-EXECUTION.md`

## 🆘 Getting Help

1. Check the troubleshooting section above
2. Review error logs: `docker-compose logs [service-name]`
3. Check GitHub issues (if repository is public)
4. Contact the development team

## 📄 License

[Your License Here]

---

**Happy Coding! 🚀**
