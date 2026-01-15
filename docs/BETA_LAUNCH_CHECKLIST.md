# NemoRDP Beta Launch Checklist

## 🎯 Pre-Launch Setup (Complete Before Going Live)

### 1. Environment Configuration
- [ ] Copy `.env.prod.example` to `.env.prod`
- [ ] Generate strong secrets: `openssl rand -hex 32`
- [ ] Add real Vultr API key
- [ ] Add real Contabo API credentials
- [ ] Add real Paystack secret key
- [ ] Replace crypto wallet addresses with your own
- [ ] Configure SMTP credentials (Gmail App Password)
- [ ] Set up Sentry account and add DSN

### 2. Domain & SSL Setup
- [ ] Register domain (e.g., nemordp.com)
- [ ] Point DNS A records to your server IP
  - `@` → Your Server IP
  - `www` → Your Server IP
  - `api` → Your Server IP
- [ ] Wait for DNS propagation (check with `dig nemordp.com`)
- [ ] SSL will auto-configure via Docker Compose

### 3. Server Preparation
- [ ] Provision VPS (DigitalOcean/Hetzner/Vultr - $10-20/month)
- [ ] Install Docker & Docker Compose
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  sudo apt install docker-compose-plugin
  ```
- [ ] Clone repository to server
- [ ] Configure firewall (ports 80, 443, 22)

### 4. Database & Redis
- [ ] Create PostgreSQL database
- [ ] Run migrations: `docker-compose exec backend alembic upgrade head`
- [ ] Verify Redis connectivity

### 5. Payment Testing
- [ ] Test Paystack with test keys first
- [ ] Verify webhook endpoint is accessible: `https://api.nemordp.com/webhooks/paystack`
- [ ] Add webhook URL in Paystack dashboard
- [ ] Test crypto payment flow (manual verification for MVP)

### 6. Provider API Testing
- [ ] Test Vultr API connection
- [ ] Test Contabo API connection
- [ ] Verify instance provisioning works
- [ ] Test email delivery of credentials

### 7. Monitoring Setup
- [ ] Create Sentry account (free tier)
- [ ] Add Sentry DSN to `.env.prod`
- [ ] Create UptimeRobot monitors:
  - `https://nemordp.com` (frontend)
  - `https://api.nemordp.com/health` (backend)
- [ ] Set up email alerts

### 8. Security Hardening
- [ ] Enable rate limiting (already implemented ✅)
- [ ] Review CORS settings
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Review database permissions

## 🚀 Deployment Steps

### Step 1: Build & Deploy
```bash
# On your server
cd /path/to/RDP-SaaS
docker-compose -f docker-compose.prod.yml up -d --build
```

### Step 2: Verify Services
```bash
# Check all containers are running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Test health endpoint
curl https://api.nemordp.com/health
```

### Step 3: Create Admin User (Optional)
```bash
docker-compose exec backend python -m scripts.create_admin
```

### Step 4: Test Complete Flow
- [ ] Visit https://nemordp.com
- [ ] Register new account
- [ ] Navigate to Deploy page
- [ ] Select plan and payment method
- [ ] Complete test payment (Paystack test mode)
- [ ] Verify RDP credentials received via email
- [ ] Test RDP connection

## 📊 Post-Launch Monitoring (First 24 Hours)

### Metrics to Watch
- [ ] User registrations
- [ ] Payment success rate
- [ ] RDP provisioning success rate (target: >95%)
- [ ] Email delivery rate
- [ ] API response times
- [ ] Error rates (Sentry)

### Daily Checks
- [ ] Review Sentry errors
- [ ] Check UptimeRobot alerts
- [ ] Monitor server resources (CPU, RAM, disk)
- [ ] Review payment transactions
- [ ] Check support tickets/emails

## 🐛 Troubleshooting

### If payments fail:
1. Check Paystack webhook logs
2. Verify webhook URL is correct
3. Check backend logs: `docker-compose logs backend`

### If RDP provisioning fails:
1. Check provider API credentials
2. Review Celery worker logs: `docker-compose logs worker`
3. Verify provider account has sufficient credits

### If emails don't send:
1. Verify SMTP credentials
2. Check Gmail "Less secure apps" or use App Password
3. Review email service logs

## 🎯 Beta User Onboarding

### Invite List (5-10 users)
- [ ] Friend/colleague 1
- [ ] Friend/colleague 2
- [ ] Tech community member 1
- [ ] Tech community member 2
- [ ] Potential customer 1

### Onboarding Email Template
```
Subject: You're invited to NemoRDP Beta!

Hi [Name],

You're invited to try NemoRDP - instant Windows & Linux remote desktops.

🎁 Beta Perks:
- 50% off first month
- Priority support
- Influence product roadmap

Get started: https://nemordp.com

Your feedback is invaluable!

Best,
[Your Name]
NemoRDP Team
```

## ✅ Success Criteria (Week 1)

- [ ] 5+ beta users signed up
- [ ] 3+ successful RDP deployments
- [ ] 95%+ provisioning success rate
- [ ] <3 minute average delivery time
- [ ] Zero critical bugs
- [ ] Positive user feedback

## 📈 Next Steps After Beta

### Week 2-4:
- [ ] Implement user feedback
- [ ] Add more OS options
- [ ] SEO optimization
- [ ] Content marketing (blog)
- [ ] Social media presence

### Month 2:
- [ ] Launch referral program
- [ ] Add GPU instances
- [ ] Implement analytics dashboard
- [ ] Scale to 25 customers

---

**Remember:** Start small, iterate fast, and listen to users!
