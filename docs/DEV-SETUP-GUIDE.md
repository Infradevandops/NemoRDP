# NemoRDP - Development Setup & Project Structure

## 🚀 Quick Start

### **1. Repository Setup**
```bash
# Clone and setup
git clone <your-repo-url> nemordp
cd nemordp

# Project structure
mkdir -p {frontend,backend,docs,scripts,infrastructure}
```

### **2. Environment Setup**
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

### **3. Environment Variables**
```bash
# backend/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/nemordp
REDIS_URL=redis://localhost:6379/0
STRIPE_SECRET_KEY=sk_test_...
VULTR_API_KEY=your_vultr_key
CONTABO_CLIENT_ID=your_contabo_id
CONTABO_CLIENT_SECRET=your_contabo_secret
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

---

## 📁 Project Structure

```
nemordp/
├── frontend/                 # Next.js 14 application
│   ├── app/                 # App router pages
│   │   ├── page.tsx         # Landing page
│   │   ├── dashboard/       # User dashboard
│   │   ├── auth/           # Authentication pages
│   │   ├── settings/       # User settings
│   │   └── support/        # Support center
│   ├── components/         # Reusable components
│   │   ├── ui/            # UI components
│   │   ├── Header.tsx     # Navigation
│   │   ├── Footer.tsx     # Footer
│   │   └── AuthForm.tsx   # Auth forms
│   ├── lib/               # Utilities
│   │   ├── auth.ts        # Auth helpers
│   │   ├── api.ts         # API client
│   │   └── utils.ts       # General utilities
│   └── styles/            # Global styles
│
├── backend/                 # FastAPI application
│   ├── main.py             # Application entry point
│   ├── routers/            # API routes
│   │   ├── auth.py         # Authentication
│   │   ├── billing.py      # Stripe integration
│   │   ├── instances.py    # RDP management
│   │   └── support.py      # Support system
│   ├── models/             # Database models
│   │   ├── user.py         # User model
│   │   ├── rdp_instance.py # RDP instance model
│   │   └── support_ticket.py # Support tickets
│   ├── providers/          # Cloud provider clients
│   │   ├── vultr.py        # Vultr API client
│   │   ├── contabo.py      # Contabo API client
│   │   └── base.py         # Provider interface
│   ├── services/           # Business logic
│   │   ├── provisioning.py # VM provisioning
│   │   ├── email.py        # Email service
│   │   └── billing.py      # Billing logic
│   ├── tasks/              # Background tasks
│   │   ├── provisioning.py # Celery tasks
│   │   └── cleanup.py      # Maintenance tasks
│   ├── middleware/         # Custom middleware
│   │   ├── auth.py         # JWT middleware
│   │   ├── cors.py         # CORS configuration
│   │   └── rate_limit.py   # Rate limiting
│   ├── database/           # Database configuration
│   │   ├── connection.py   # DB connection
│   │   └── migrations/     # Alembic migrations
│   └── tests/              # Test files
│       ├── test_auth.py    # Auth tests
│       ├── test_billing.py # Billing tests
│       └── test_provisioning.py # Provisioning tests
│
├── infrastructure/         # Infrastructure as Code
│   ├── terraform/          # Terraform configs
│   ├── docker/            # Docker configurations
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   └── docker-compose.yml
│   └── k8s/               # Kubernetes manifests
│
├── docs/                   # Documentation
│   ├── api/               # API documentation
│   ├── user-guide/        # User guides
│   └── deployment/        # Deployment guides
│
├── scripts/               # Utility scripts
│   ├── setup.sh          # Development setup
│   ├── deploy.sh         # Deployment script
│   └── backup.sh         # Backup script
│
└── .github/              # GitHub workflows
    └── workflows/
        ├── frontend.yml   # Frontend CI/CD
        ├── backend.yml    # Backend CI/CD
        └── tests.yml      # Test automation
```

---

## 🛠️ Development Workflow

### **Daily Development**
```bash
# Start backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Start frontend (new terminal)
cd frontend
npm run dev

# Start Redis (for background jobs)
redis-server

# Start Celery worker (new terminal)
cd backend
celery -A tasks.provisioning worker --loglevel=info
```

### **Database Management**
```bash
# Create migration
cd backend
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head

# Reset database (development only)
alembic downgrade base
alembic upgrade head
```

### **Testing**
```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

---

## 📋 Sprint Task Templates

### **Backend Task Template**
```markdown
## Task: [Feature Name]
**Assignee**: Backend Dev
**Estimate**: Xh
**Sprint**: X
**Priority**: P0/P1/P2

### Description
Brief description of what needs to be implemented.

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests written and passing
- [ ] API documentation updated

### Implementation Notes
```python
# Code snippets or architectural notes
```

### Testing Checklist
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing
- [ ] Performance testing
```

### **Frontend Task Template**
```markdown
## Task: [Component/Page Name]
**Assignee**: Frontend Dev
**Estimate**: Xh
**Sprint**: X
**Priority**: P0/P1/P2

### Description
Brief description of the UI component or page.

### Acceptance Criteria
- [ ] Responsive design
- [ ] Accessibility compliant
- [ ] Loading states
- [ ] Error handling
- [ ] Tests written

### Design Notes
```typescript
// Component structure or state management notes
```

### Testing Checklist
- [ ] Component tests
- [ ] User interaction tests
- [ ] Mobile responsiveness
- [ ] Cross-browser testing
```

---

## 🔄 Git Workflow

### **Branch Strategy**
```bash
main                    # Production branch
├── develop            # Development branch
├── feature/auth       # Feature branches
├── feature/billing    # Feature branches
├── hotfix/bug-fix     # Hotfix branches
└── release/v1.0.0     # Release branches
```

### **Commit Convention**
```bash
feat: add user authentication
fix: resolve payment processing bug
docs: update API documentation
test: add unit tests for billing
refactor: optimize database queries
style: fix code formatting
chore: update dependencies
```

### **Pull Request Template**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

---

## 📊 Sprint Planning Template

### **Sprint Planning Meeting Agenda**
1. **Sprint Goal Definition** (15 min)
2. **Backlog Refinement** (30 min)
3. **Task Estimation** (30 min)
4. **Capacity Planning** (15 min)
5. **Sprint Commitment** (15 min)

### **Story Point Estimation**
- **1 Point**: Simple task, <2 hours
- **2 Points**: Small feature, 2-4 hours
- **3 Points**: Medium feature, 4-8 hours
- **5 Points**: Large feature, 1-2 days
- **8 Points**: Complex feature, 2-3 days
- **13 Points**: Epic, needs breakdown

### **Sprint Capacity**
- **Developer**: 6-8 hours/day coding
- **Buffer**: 20% for meetings, reviews, bugs
- **Sprint Length**: 2 weeks (10 working days)
- **Total Capacity**: ~50-60 hours per developer

---

## 🚀 Deployment Pipeline

### **Development Environment**
```bash
# Local development
npm run dev          # Frontend
uvicorn main:app --reload  # Backend
```

### **Staging Environment**
```bash
# Automated deployment on push to develop
git push origin develop
# Triggers GitHub Actions
# Deploys to staging.nemordp.com
```

### **Production Environment**
```bash
# Manual deployment from main branch
git checkout main
git merge develop
git push origin main
# Triggers production deployment
```

### **Environment URLs**
- **Local**: http://localhost:3000
- **Staging**: https://staging.nemordp.com
- **Production**: https://nemordp.com

---

## 📈 Monitoring & Metrics

### **Key Metrics to Track**
- **Performance**: API response time, page load time
- **Reliability**: Uptime, error rate, success rate
- **Business**: User signups, conversions, churn
- **Technical**: Database performance, queue length

### **Monitoring Tools**
- **Application**: Sentry (error tracking)
- **Infrastructure**: Uptime Robot (availability)
- **Performance**: Lighthouse (frontend), custom metrics (backend)
- **Business**: Google Analytics, Stripe dashboard

---

## 🎯 Success Criteria

### **Sprint Success**
- [ ] All P0 tasks completed
- [ ] Demo-ready features
- [ ] Tests passing (>80% coverage)
- [ ] Performance benchmarks met
- [ ] Security review passed

### **Launch Readiness**
- [ ] End-to-end user journey working
- [ ] Payment processing functional
- [ ] VM provisioning automated
- [ ] Support system ready
- [ ] Monitoring and alerting active

**Ready to start Sprint 1! 🚀**