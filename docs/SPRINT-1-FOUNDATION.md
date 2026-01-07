# NemoRDP - Series A Sprint 1 (Week 1-2)
*Foundation & Core Infrastructure*

## 🎯 Sprint Goal
Launch NemoRDP foundation with landing page, backend API, Paystack & crypto payment integration

## 📋 Phase Checklist

### **Phase 1: Setup & Foundation** (Days 1-3)
- [ ] Project structure and repository setup
- [ ] Domain and hosting configuration
- [ ] Development environment ready
- [ ] Basic CI/CD pipeline active
- [ ] Team access and permissions configured

### **Phase 2: Frontend Development** (Days 4-8)
- [ ] Next.js application scaffolded
- [ ] Landing page with NemoRDP branding
- [ ] Pricing section with crypto payment options
- [ ] Authentication UI components
- [ ] Responsive design implemented

### **Phase 3: Backend Development** (Days 9-12)
- [ ] FastAPI application structure
- [ ] Database models and migrations
- [ ] JWT authentication system
- [ ] Paystack integration working
- [ ] Crypto payment processing

### **Phase 4: Integration & Testing** (Days 13-14)
- [ ] Frontend-backend integration
- [ ] Payment flow end-to-end testing
- [ ] Security measures implemented
- [ ] Performance optimization
- [ ] Sprint demo preparation

## 📋 Sprint Backlog

### **Epic 1: Project Foundation**
**Story Points**: 8 | **Priority**: P0

#### Task 1.1: Project Setup & Structure
**Assignee**: Dev Lead | **Estimate**: 4h | **Day**: 1
```bash
# Deliverables
- GitHub repository: nemo-rdp
- Project structure with frontend/backend
- Development environment setup
- CI/CD pipeline basic setup

# Acceptance Criteria
- [ ] Repository created with proper structure
- [ ] Local development environment working
- [ ] Basic CI/CD pipeline configured
- [ ] Environment variables template created
```

#### Task 1.2: Domain & Infrastructure Setup
**Assignee**: DevOps | **Estimate**: 2h | **Day**: 1
```bash
# Deliverables
- Domain: nemordp.com (or alternative)
- SSL certificates configured
- DNS setup complete
- Hosting accounts created

# Acceptance Criteria
- [ ] Domain purchased and configured
- [ ] SSL certificates active
- [ ] Vercel/Railway accounts setup
- [ ] DNS propagation complete
```

---

### **Epic 2: Frontend Foundation**
**Story Points**: 13 | **Priority**: P0

#### Task 2.1: Next.js Project Setup
**Assignee**: Frontend Dev | **Estimate**: 3h | **Day**: 2
```typescript
// File: package.json dependencies
{
  "dependencies": {
    "next": "14.0.0",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10",
    "postcss": "^8",
    "tailwindcss": "^3",
    "typescript": "^5",
    "@paystack/inline-js": "^2.0.0",
    "web3": "^4.0.0",
    "ethers": "^6.0.0",
    "@tanstack/react-query": "^5.0.0",
    "lucide-react": "^0.290.0"
  }
}

# Acceptance Criteria
- [ ] Next.js 14 with App Router configured
- [ ] TypeScript setup complete
- [ ] Tailwind CSS configured
- [ ] Basic routing structure created
```

#### Task 2.2: Landing Page Development
**Assignee**: Frontend Dev | **Estimate**: 6h | **Day**: 3-4
```typescript
// File: app/page.tsx - Hero Section
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Header />
      <HeroSection />
      <PricingSection />
      <FeaturesSection />
      <Footer />
    </div>
  )
}

// Components to create:
- components/Header.tsx
- components/HeroSection.tsx  
- components/PricingSection.tsx
- components/FeaturesSection.tsx
- components/Footer.tsx

# Acceptance Criteria
- [ ] Responsive landing page complete
- [ ] NemoRDP branding implemented
- [ ] Pricing cards functional
- [ ] CTA buttons connected
- [ ] Mobile-first design
```

#### Task 2.3: Authentication UI
**Assignee**: Frontend Dev | **Estimate**: 4h | **Day**: 5
```typescript
// Files to create:
- app/auth/login/page.tsx
- app/auth/signup/page.tsx
- components/AuthForm.tsx
- lib/auth.ts

# Acceptance Criteria
- [ ] Login/signup forms created
- [ ] Form validation implemented
- [ ] Supabase auth integration
- [ ] Protected route middleware
```

---

### **Epic 3: Backend Foundation**
**Story Points**: 15 | **Priority**: P0

#### Task 3.1: FastAPI Project Setup
**Assignee**: Backend Dev | **Estimate**: 3h | **Day**: 2
```python
# File: requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
redis==5.0.1
celery==5.3.4
paystackapi==2.1.0
web3==6.11.3
httpx==0.25.2
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
cryptography==41.0.7

# File: main.py structure
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, billing, instances
from database import engine, Base

app = FastAPI(title="NemoRDP API", version="1.0.0")

# Acceptance Criteria
- [ ] FastAPI project structure created
- [ ] Dependencies installed and configured
- [ ] Basic middleware setup
- [ ] Health check endpoint working
```

#### Task 3.2: Database Models & Schema
**Assignee**: Backend Dev | **Estimate**: 4h | **Day**: 3
```python
# File: models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    paystack_customer_id = Column(String, nullable=True)
    crypto_wallet_address = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# File: models/rdp_instance.py
class RDPInstance(Base):
    __tablename__ = "rdp_instances"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider = Column(String, nullable=False)  # 'vultr' or 'contabo'
    provider_id = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)
    os_type = Column(String, nullable=False)  # 'windows' or 'linux'
    plan = Column(String, nullable=False)  # 'basic', 'performance'
    status = Column(String, default="provisioning")
    created_at = Column(DateTime, default=datetime.utcnow)

# Acceptance Criteria
- [ ] Database models created
- [ ] Relationships defined
- [ ] Migration scripts ready
- [ ] Database connection tested
```

#### Task 3.3: Authentication System
**Assignee**: Backend Dev | **Estimate**: 5h | **Day**: 4-5
```python
# File: routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # User registration logic
    pass

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # User login logic
    pass

@router.get("/me")
async def get_current_user(current_user: User = Depends(get_current_user)):
    return current_user

# Acceptance Criteria
- [ ] JWT authentication implemented
- [ ] Password hashing working
- [ ] User registration endpoint
- [ ] Login endpoint functional
- [ ] Protected routes working
```

#### Task 3.4: Paystack & Crypto Integration
**Assignee**: Backend Dev | **Estimate**: 6h | **Day**: 5-6
```python
# File: routers/billing.py
from paystackapi.paystack import Paystack
from web3 import Web3
from fastapi import APIRouter, HTTPException
import os

router = APIRouter(prefix="/billing", tags=["billing"])
paystack = Paystack(secret_key=os.getenv("PAYSTACK_SECRET_KEY"))

@router.post("/create-paystack-payment")
async def create_paystack_payment(plan: str, current_user: User = Depends(get_current_user)):
    try:
        amount = get_plan_price(plan) * 100  # Paystack uses kobo
        
        response = paystack.transaction.initialize(
            email=current_user.email,
            amount=amount,
            callback_url=f"{FRONTEND_URL}/payment/success",
            metadata={
                'user_id': current_user.id,
                'plan': plan,
                'payment_type': 'fiat'
            }
        )
        
        return {
            "payment_url": response['data']['authorization_url'],
            "reference": response['data']['reference']
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create-crypto-payment")
async def create_crypto_payment(plan: str, crypto_type: str, current_user: User = Depends(get_current_user)):
    try:
        # Generate unique wallet address for this payment
        wallet_address = generate_payment_wallet(crypto_type)
        amount_crypto = convert_usd_to_crypto(get_plan_price(plan), crypto_type)
        
        # Store payment request in database
        payment_request = CryptoPaymentRequest(
            user_id=current_user.id,
            plan=plan,
            crypto_type=crypto_type,
            wallet_address=wallet_address,
            amount_crypto=amount_crypto,
            status="pending"
        )
        db.add(payment_request)
        db.commit()
        
        return {
            "wallet_address": wallet_address,
            "amount": amount_crypto,
            "crypto_type": crypto_type,
            "payment_id": payment_request.id,
            "expires_in": 3600  # 1 hour
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook/paystack")
async def paystack_webhook(request: Request):
    # Handle Paystack webhooks
    signature = request.headers.get('x-paystack-signature')
    payload = await request.body()
    
    if verify_paystack_signature(payload, signature):
        event = await request.json()
        if event['event'] == 'charge.success':
            await process_successful_payment(event['data'])
    
    return {"status": "success"}

@router.get("/crypto-payment-status/{payment_id}")
async def check_crypto_payment_status(payment_id: int):
    # Check blockchain for payment confirmation
    payment = db.query(CryptoPaymentRequest).filter(CryptoPaymentRequest.id == payment_id).first()
    
    if payment:
        confirmed = check_blockchain_payment(payment.wallet_address, payment.amount_crypto, payment.crypto_type)
        if confirmed:
            payment.status = "confirmed"
            db.commit()
            # Trigger RDP provisioning
            await process_successful_payment(payment)
        
        return {"status": payment.status, "confirmed": confirmed}
    
    raise HTTPException(status_code=404, detail="Payment not found")

# Acceptance Criteria
- [ ] Paystack payment initialization
- [ ] Crypto payment wallet generation
- [ ] Webhook endpoint configured
- [ ] Payment verification working
- [ ] Blockchain payment monitoring
- [ ] Multi-currency support (BTC, ETH, USDT)
```

---

## 🔄 Sprint Ceremonies

### **Daily Standups** (15 min)
- What did you complete yesterday?
- What will you work on today?
- Any blockers or impediments?

### **Sprint Review** (Day 14)
**Demo Checklist**:
- [ ] Landing page live at nemordp.com
- [ ] User registration/login working
- [ ] Paystack & crypto payments functional
- [ ] Backend API responding
- [ ] Database operations working

### **Sprint Retrospective** (Day 14)
**Questions**:
- What went well?
- What could be improved?
- What will we commit to improve?

---

## 🚨 Risk Mitigation

### **Technical Risks**
| Risk | Impact | Mitigation |
|------|--------|------------|
| API rate limits | High | Implement caching, request queuing |
| Database connection issues | High | Connection pooling, retry logic |
| Payment webhook failures | Medium | Implement idempotency, retry mechanism |
| Crypto payment delays | Medium | Real-time blockchain monitoring, timeout handling |

### **Timeline Risks**
| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | High | Strict sprint boundaries, MVP focus |
| Integration delays | Medium | Early integration testing |
| Third-party service delays | Medium | Fallback plans, early account setup |

---

## 📊 Definition of Done

### **Feature Complete**
- [ ] Code written and reviewed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Product owner approval

### **Sprint Complete**
- [ ] All P0 tasks completed
- [ ] Demo-ready application
- [ ] No critical bugs
- [ ] Performance benchmarks met
- [ ] Security review passed

---

## 🎯 Sprint Success Metrics

### **Technical Metrics**
- API response time: <200ms
- Frontend load time: <2s
- Test coverage: >80%
- Zero critical security vulnerabilities

### **Business Metrics**
- Landing page conversion: >2%
- Registration completion: >70%
- Payment success rate: >95%
- User satisfaction: >4/5

**Next Sprint**: Provider API Integration & VM Provisioning