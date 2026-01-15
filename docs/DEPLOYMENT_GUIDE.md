# NemoRDP Deployment Guide

This guide details how to deploy NemoRDP to a production Linux server using Docker Compose.

## 📋 Prerequisites

- **VPS Server**: Ubuntu 22.04 LTS (Recommended)
- **Specs**: Min 2 vCPU, 4GB RAM, 20GB SSD
- **Domain**: Pointed to your server IP via A records (`@`, `www`, `api`)

## 🚀 Quick Deployment (Recommended)

We have included a script that automates the entire process.

1. **SSH into your server**:
   ```bash
   ssh root@your-server-ip
   ```

2. **Clone the repository**:
   ```bash
   git clone https://github.com/Infradevandops/NemoRDP.git /opt/nemordp
   cd /opt/nemordp
   ```

3. **Run the deployment script**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

   The script will:
   - Install Docker & Docker Compose
   - Create the `.env.prod` file from template
   - Ask for confirmation
   - Build and start all services

4. **Update Configuration**:
   Edit `.env.prod` with your real API keys:
   ```bash
   nano .env.prod
   ```
   *Restart services after editing: `docker compose -f docker-compose.prod.yml restart`*

## 🛠️ Manual Deployment

If you prefer to deploy manually:

### 1. Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo apt install docker-compose-plugin
```

### 2. Configure Environment
```bash
cp .env.prod.example .env.prod
nano .env.prod
```
*Fill in your secrets, database credentials, and API keys.*

### 3. Build & Run
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. Run Migrations
```bash
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## 🔄 Maintenance & Updates

### Updating the App
To deploy the latest code from GitHub:
```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

### Viewing Logs
```bash
# All logs
docker compose -f docker-compose.prod.yml logs -f

# Backend logs only
docker compose -f docker-compose.prod.yml logs -f backend

# Worker logs only
docker compose -f docker-compose.prod.yml logs -f worker
```

### Backing Up Database
```bash
docker compose -f docker-compose.prod.yml exec db pg_dump -U postgres nemordp > backup.sql
```

## 🐛 Troubleshooting Common Issues

### 1. "Backend container keeps restarting"
Check the logs first:
```bash
docker compose -f docker-compose.prod.yml logs backend
```
Common causes:
- **Database connection failed**: Check `DATABASE_URL` in `.env.prod`.
- **Missing variable**: Ensure `SECRET_KEY` is set.

### 2. "Email failed to send"
- Ensure `SMTP_PASSWORD` is an App Password, not your login password.
- Check firewall rules (allow outbound port 587).

### 3. "Permission denied" errors
- Ensure you are running as `root` or a user in the `docker` group.

### 4. "Port already in use"
- Check if another service (like Apache/Nginx) is using port 80 or 443.
- Stop them: `systemctl stop apache2` or `systemctl stop nginx`.

## 🔒 Security Best Practices

1. **Firewall (UFW)**:
   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 22/tcp
   ufw enable
   ```

2. **Secrets**:
   - Never commit `.env.prod` to Git.
   - Use long, random strings for `SECRET_KEY` and `POSTGRES_PASSWORD`.

3. **Backups**:
   - Schedule regular database backups using cron and `pg_dump`.
