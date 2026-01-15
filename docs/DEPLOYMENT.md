# Deployment Guide - NemoRDP Platform

This guide details how to deploy the NemoRDP platform to a production VPS using Docker Compose.

## 📋 Prerequisites

1.  **VPS Server**:
    *   OS: Ubuntu 22.04 LTS (Recommended)
    *   Specs: 2 vCPU, 4GB RAM, 40GB SSD (Minimum)
    *   Provider: Hetzner, DigitalOcean, Vultr, or any cloud provider.
2.  **Domain Name**: Pointed to your VPS IP address (A Record).
3.  **Vendor Accounts**:
    *   **Vultr** (API Key) - For Windows instances.
    *   **Contabo** (Client ID/Secret) - For Linux instances.
    *   **Paystack** (Secret Key) - For payments.
    *   **SMTP Service** (SendGrid/Mailgun) - For emails.

---

## 🚀 Step 1: Server Setup

Connect to your VPS via SSH:
```bash
ssh root@your_server_ip
```

### Install Docker & Docker Compose
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify installation
docker --version
docker compose version
```

---

## 📂 Step 2: Deploy the Application

### 1. Clone the Repository
```bash
git clone https://github.com/Infradevandops/NemoRDP.git
cd NemoRDP
```

### 2. Configure Environment Variables
Create the production environment file:
```bash
cp backend/.env.prod .env.prod
nano .env.prod
```

**Fill in the following details:**

```ini
# Database (Auto-configured by Docker, verify passwords match)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_db_password_here
POSTGRES_DB=nemordp

# Security
SECRET_KEY=generate_A_STRONG_RANDOM_STRING_HERE

# Domain
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Providers
VULTR_API_KEY=your_vultr_key
CONTABO_CLIENT_ID=your_contabo_id
CONTABO_CLIENT_SECRET=your_contabo_secret

# Payments
PAYSTACK_SECRET_KEY=sk_live_xxxx

# Crypto (Optional)
CRYPTO_WALLET_BTC=your_btc_address

# Email (SMTP)
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your_smtp_password
FROM_EMAIL=noreply@yourdomain.com
```

### 3. Start the Stack
Run in detached mode:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. Verify Running Services
```bash
docker compose -f docker-compose.prod.yml ps
```
*You should see `backend`, `frontend`, `worker`, `beat`, `db`, and `redis` all running.*

---

## 🌐 Step 3: Domain & SSL Setup (Nginx)

We recommend using Nginx as a reverse proxy with Let's Encrypt SSL.

### 1. Install Nginx & Certbot
```bash
apt install nginx certbot python3-certbot-nginx -y
```

### 2. Configure Nginx
Create a config file: `/etc/nginx/sites-available/nemordp`

```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000; # Frontend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000; # Backend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable & Secure
```bash
# Enable site
ln -s /etc/nginx/sites-available/nemordp /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx

# Get SSL Certificates
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

## 🛡️ Step 4: Post-Deployment Config

### 1. Create Admin User
Shell into the backend container to create the first admin (or update DB manually).
```bash
docker exec -it nemordp_backend python
```
```python
# Python Shell
from backend.database.connection import SessionLocal
from backend.models.user import User
db = SessionLocal()
user = db.query(User).filter(User.email=="your@email.com").first()
# Assume you have Logic to set admin flag, or rely on hardcoded email for MVP
```

### 2. Live Testing
1.  Visit `https://yourdomain.com`.
2.  Sign up a new account.
3.  Test a payment (using a small real amount or test card if in test mode).
4.  Verify that an RDP instance is provisioned and email arrives.

---

## 🔄 Maintenance

-   **Update App**:
    ```bash
    git pull
    docker compose -f docker-compose.prod.yml up -d --build
    ```
-   **View Logs**:
    ```bash
    docker compose -f docker-compose.prod.yml logs -f backend
    ```
-   **Backup Database**:
    ```bash
    docker exec -t nemordp_db pg_dumpall -c -U postgres > dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql
    ```
