# NemoRDP Production Deployment Runbook

## Quick Start

### Prerequisites
- Ubuntu 20.04+ server with Docker and Docker Compose installed
- Domain name pointed to server IP
- Minimum 4GB RAM, 2 CPU cores
- Ports 80, 443, 8000, 3000 open

### Initial Deployment

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/nemorDP.git
cd nemorDP
```

2. **Configure environment**
```bash
cp .env.production.example .env.production
nano .env.production  # Edit with your actual values
```

3. **Generate secure keys**
```bash
# Generate SECRET_KEY and JWT_SECRET_KEY
openssl rand -hex 32
```

4. **Set up SSL certificates**
```bash
./scripts/setup-ssl.sh yourdomain.com
```

5. **Deploy the application**
```bash
./scripts/deploy.sh
```

6. **Verify deployment**
```bash
# Check all services are running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Common Operations

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f celery-worker
```

### Restart Services
```bash
# All services
docker-compose -f docker-compose.prod.yml restart

# Specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Database Operations
```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python -m alembic upgrade head

# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U nemorDP_user nemorDP_prod > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20260116.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U nemorDP_user nemorDP_prod
```

### Update Application
```bash
git pull origin main
./scripts/deploy.sh
```

---

## Troubleshooting

### Backend Not Starting
**Symptoms**: Backend container keeps restarting

**Solutions**:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs backend`
2. Verify database connection: `docker-compose -f docker-compose.prod.yml exec backend python -c "from backend.database.connection import engine; engine.connect()"`
3. Check environment variables: `docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE_URL`

### Database Connection Errors
**Symptoms**: "could not connect to server"

**Solutions**:
1. Ensure postgres is running: `docker-compose -f docker-compose.prod.yml ps postgres`
2. Check postgres logs: `docker-compose -f docker-compose.prod.yml logs postgres`
3. Verify credentials in .env.production

### Celery Worker Not Processing Tasks
**Symptoms**: Instances not provisioning

**Solutions**:
1. Check worker logs: `docker-compose -f docker-compose.prod.yml logs celery-worker`
2. Verify Redis connection: `docker-compose -f docker-compose.prod.yml exec redis redis-cli ping`
3. Restart worker: `docker-compose -f docker-compose.prod.yml restart celery-worker`

### SSL Certificate Issues
**Symptoms**: HTTPS not working

**Solutions**:
1. Verify certificates exist: `ls -la nginx/ssl/`
2. Check nginx logs: `docker-compose -f docker-compose.prod.yml logs nginx`
3. Renew certificates: `sudo certbot renew`

### High Memory Usage
**Symptoms**: Server running out of memory

**Solutions**:
1. Check resource usage: `docker stats`
2. Reduce worker count in backend Dockerfile (change --workers 4 to --workers 2)
3. Add swap space: `sudo fallocate -l 4G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`

---

## Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# Frontend health
curl http://localhost:3000

# Database health
docker-compose -f docker-compose.prod.yml exec postgres pg_isready
```

### Resource Usage
```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

---

## Scaling

### Increase Backend Workers
Edit `backend/Dockerfile` line 47:
```dockerfile
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "8"]
```

### Add More Celery Workers
Edit `docker-compose.prod.yml` and add:
```yaml
celery-worker-2:
  build:
    context: ./backend
    dockerfile: Dockerfile.celery
  # ... same config as celery-worker
```

### Database Connection Pooling
Add to `backend/core/config.py`:
```python
SQLALCHEMY_POOL_SIZE = 20
SQLALCHEMY_MAX_OVERFLOW = 40
```

---

## Security

### Update Secrets
1. Generate new keys: `openssl rand -hex 32`
2. Update .env.production
3. Restart services: `docker-compose -f docker-compose.prod.yml restart`

### Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

### Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.prod.yml pull
./scripts/deploy.sh
```

---

## Backup Strategy

### Automated Daily Backups
Add to crontab (`crontab -e`):
```bash
0 2 * * * cd /path/to/nemorDP && docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U nemorDP_user nemorDP_prod | gzip > /backups/nemorDP_$(date +\%Y\%m\%d).sql.gz
```

### Backup to S3 (Optional)
```bash
# Install AWS CLI
sudo apt install awscli

# Configure
aws configure

# Backup script
aws s3 cp backup_$(date +%Y%m%d).sql.gz s3://your-bucket/backups/
```

---

## Rollback Procedure

If deployment fails:

1. **Stop new containers**
```bash
docker-compose -f docker-compose.prod.yml down
```

2. **Restore database from backup**
```bash
cat backup_YYYYMMDD.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U nemorDP_user nemorDP_prod
```

3. **Checkout previous version**
```bash
git checkout <previous-commit-hash>
```

4. **Redeploy**
```bash
./scripts/deploy.sh
```

---

## Performance Tuning

### PostgreSQL
Add to `docker-compose.prod.yml` under postgres service:
```yaml
command: postgres -c shared_buffers=256MB -c max_connections=200
```

### Redis
Add to `docker-compose.prod.yml` under redis service:
```yaml
command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Nginx
Increase worker connections in `nginx/nginx.conf`:
```nginx
events {
    worker_connections 2048;
}
```

---

## Contact & Support

For issues not covered in this runbook:
1. Check application logs
2. Review GitHub issues
3. Contact DevOps team
