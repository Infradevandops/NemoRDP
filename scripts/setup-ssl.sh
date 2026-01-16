#!/bin/bash
set -e

echo "🔐 Setting up SSL certificates with Let's Encrypt"
echo "================================================"

# Check if domain is provided
if [ -z "$1" ]; then
    echo "Usage: ./setup-ssl.sh yourdomain.com"
    exit 1
fi

DOMAIN=$1
EMAIL="admin@$DOMAIN"

echo "Domain: $DOMAIN"
echo "Email: $EMAIL"

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot
fi

# Create directory for certificates
mkdir -p nginx/ssl

# Stop nginx if running
docker-compose -f docker-compose.prod.yml stop nginx || true

# Obtain certificate
echo "Obtaining SSL certificate..."
sudo certbot certonly --standalone \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/

# Set permissions
sudo chmod 644 nginx/ssl/fullchain.pem
sudo chmod 600 nginx/ssl/privkey.pem

# Set up auto-renewal
echo "Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 0 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/*.pem /path/to/nginx/ssl/ && docker-compose -f docker-compose.prod.yml restart nginx") | crontab -

echo "✓ SSL certificates installed successfully!"
echo "Certificates location: nginx/ssl/"
echo "Auto-renewal configured via cron"

# Restart nginx
docker-compose -f docker-compose.prod.yml up -d nginx

echo "✓ Nginx restarted with SSL enabled"
