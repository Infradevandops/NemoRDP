# NemoRDP - API Documentation & Integration Guide

## 🎯 API Overview

**Base URL**: `https://api.nemordp.com/v1`
**Authentication**: Bearer Token (JWT)
**Content-Type**: `application/json`

---

## 🔐 Authentication

### **Register User**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### **Login User**
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=SecurePass123!
```

### **Get Current User**
```http
GET /auth/me
Authorization: Bearer <token>
```

---

## 💻 RDP Instance Management

### **List User Instances**
```http
GET /instances
Authorization: Bearer <token>
```

**Response**:
```json
{
  "instances": [
    {
      "id": 1,
      "provider": "vultr",
      "provider_id": "12345678-1234-1234-1234-123456789012",
      "ip_address": "203.0.113.45",
      "username": "Administrator",
      "password": "SecurePass@2024!",
      "os_type": "windows",
      "plan": "basic",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "last_accessed": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### **Create RDP Instance**
```http
POST /instances
Authorization: Bearer <token>
Content-Type: application/json

{
  "os_type": "windows",
  "plan": "basic"
}
```

**Response**:
```json
{
  "instance_id": 1,
  "status": "provisioning",
  "estimated_time": 180,
  "message": "Your RDP instance is being created. You'll receive an email when ready."
}
```

### **Get Instance Details**
```http
GET /instances/{instance_id}
Authorization: Bearer <token>
```

### **Restart Instance**
```http
POST /instances/{instance_id}/restart
Authorization: Bearer <token>
```

### **Terminate Instance**
```http
DELETE /instances/{instance_id}
Authorization: Bearer <token>
```

### **Download RDP File**
```http
GET /instances/{instance_id}/rdp-file
Authorization: Bearer <token>
```

**Response**: Binary RDP file download

---

## 💳 Billing & Subscriptions

### **Create Checkout Session**
```http
POST /billing/create-checkout-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": "basic",
  "os_type": "windows"
}
```

**Response**:
```json
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_...",
  "session_id": "cs_test_..."
}
```

### **Get Subscription Status**
```http
GET /billing/subscription
Authorization: Bearer <token>
```

**Response**:
```json
{
  "status": "active",
  "subscription_id": "sub_1234567890",
  "plan_name": "Basic Windows RDP",
  "amount": 30.00,
  "currency": "usd",
  "current_period_start": 1704067200,
  "current_period_end": 1706745600,
  "cancel_at_period_end": false
}
```

### **Cancel Subscription**
```http
POST /billing/cancel-subscription
Authorization: Bearer <token>
```

### **Get Invoices**
```http
GET /billing/invoices
Authorization: Bearer <token>
```

---

## 🎫 Support System

### **Create Support Ticket**
```http
POST /support/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Cannot connect to RDP",
  "priority": "high",
  "message": "I'm unable to connect to my Windows RDP instance. Getting connection timeout error."
}
```

### **List Support Tickets**
```http
GET /support/tickets
Authorization: Bearer <token>
```

### **Get Ticket Details**
```http
GET /support/tickets/{ticket_id}
Authorization: Bearer <token>
```

---

## 📊 System Status

### **Health Check**
```http
GET /health
```

**Response**:
```json
{
  "status": "healthy",
  "checks": {
    "api": "healthy",
    "database": "healthy",
    "redis": "healthy",
    "providers": "healthy"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### **System Metrics**
```http
GET /metrics
```

**Response**: Prometheus metrics format

---

## 🔌 Webhook Integration

### **Stripe Webhooks**
```http
POST /billing/webhook
Content-Type: application/json
Stripe-Signature: t=1234567890,v1=...

{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_...",
      "customer_email": "user@example.com",
      "metadata": {
        "user_id": "1",
        "plan": "basic",
        "os_type": "windows"
      }
    }
  }
}
```

---

## 📝 Provider Integration Examples

### **Vultr API Integration**
```python
import httpx
import asyncio

class VultrClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.vultr.com/v2"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def create_instance(self, order_id: str):
        payload = {
            "region": "ewr",
            "plan": "vc2-2c-4gb",
            "os_id": 240,  # Windows Server 2022
            "label": f"nemordp-{order_id}",
            "hostname": f"nemordp-{order_id}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/instances",
                json=payload,
                headers=self.headers
            )
            
            if response.status_code == 202:
                return response.json()["instance"]
            else:
                raise Exception(f"Vultr API error: {response.text}")

# Usage
vultr = VultrClient("your_api_key")
instance = await vultr.create_instance("order_123")
```

### **Contabo API Integration**
```python
import httpx
import base64

class ContaboClient:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = "https://api.contabo.com/v1"
        self.token = None

    async def get_access_token(self):
        auth_string = f"{self.client_id}:{self.client_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            "Authorization": f"Basic {auth_b64}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {"grant_type": "client_credentials"}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/auth/oauth/token",
                data=data,
                headers=headers
            )
            
            if response.status_code == 200:
                self.token = response.json()["access_token"]
                return self.token

    async def create_instance(self, order_id: str):
        if not self.token:
            await self.get_access_token()
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "imageId": "ubuntu-22.04",
            "productId": "VPS-1-SSD-20",
            "region": "EU",
            "period": 1,
            "displayName": f"nemordp-{order_id}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/compute/instances",
                json=payload,
                headers=headers
            )
            
            if response.status_code == 201:
                return response.json()["data"][0]
```

---

## 🔄 Background Job Processing

### **Celery Task Example**
```python
from celery import Celery
from services.provisioning import ProvisioningService
from services.email import EmailService

celery_app = Celery('nemordp')

@celery_app.task(bind=True, max_retries=3)
def provision_rdp_task(self, user_id: int, order_id: str, os_type: str, plan: str):
    try:
        # Provision VM
        provisioning_service = ProvisioningService()
        result = await provisioning_service.provision_rdp(order_id, os_type, plan)
        
        # Update database
        # ... database update logic
        
        # Send email
        email_service = EmailService()
        await email_service.send_rdp_credentials(user_email, result, os_type)
        
        return {"status": "success", "instance_id": result["id"]}
        
    except Exception as e:
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (2 ** self.request.retries))
        raise e
```

---

## 📧 Email Templates

### **RDP Credentials Email**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .credentials { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .cred-value { font-family: monospace; background: #e9ecef; padding: 5px 10px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Your {{ os_type }} RDP is Ready!</h1>
        </div>
        
        <div class="credentials">
            <h3>Connection Details:</h3>
            <p><strong>IP Address:</strong> <span class="cred-value">{{ ip_address }}</span></p>
            <p><strong>Username:</strong> <span class="cred-value">{{ username }}</span></p>
            <p><strong>Password:</strong> <span class="cred-value">{{ password }}</span></p>
            <p><strong>Port:</strong> <span class="cred-value">3389</span></p>
        </div>
        
        <div class="instructions">
            <h3>Quick Connect:</h3>
            <ol>
                <li>Open Remote Desktop Connection</li>
                <li>Enter IP: {{ ip_address }}</li>
                <li>Use credentials above</li>
            </ol>
        </div>
    </div>
</body>
</html>
```

---

## 🛡️ Security Best Practices

### **API Security**
```python
# Rate limiting
from fastapi import Request, HTTPException
from collections import defaultdict
import time

class RateLimiter:
    def __init__(self, calls: int = 100, period: int = 60):
        self.calls = calls
        self.period = period
        self.clients = defaultdict(list)
    
    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        
        # Clean old requests
        self.clients[client_ip] = [
            req_time for req_time in self.clients[client_ip]
            if now - req_time < self.period
        ]
        
        # Check limit
        if len(self.clients[client_ip]) >= self.calls:
            return False
        
        self.clients[client_ip].append(now)
        return True

# Input validation
from pydantic import BaseModel, validator

class CreateInstanceRequest(BaseModel):
    os_type: str
    plan: str
    
    @validator('os_type')
    def validate_os_type(cls, v):
        if v not in ['windows', 'linux']:
            raise ValueError('Invalid OS type')
        return v
```

### **Data Encryption**
```python
from cryptography.fernet import Fernet

class EncryptionService:
    def __init__(self, key: str):
        self.cipher = Fernet(key.encode())
    
    def encrypt(self, data: str) -> str:
        return self.cipher.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        return self.cipher.decrypt(encrypted_data.encode()).decode()

# Usage
encryption = EncryptionService(os.getenv('ENCRYPTION_KEY'))
encrypted_password = encryption.encrypt(rdp_password)
```

---

## 📈 Monitoring & Logging

### **Structured Logging**
```python
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
            
        return json.dumps(log_entry)

# Usage
logger = logging.getLogger(__name__)
logger.info("RDP provisioning started", extra={'user_id': 123, 'order_id': 'ord_456'})
```

### **Metrics Collection**
```python
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_INSTANCES = Gauge('rdp_instances_active', 'Number of active RDP instances')

# Usage in endpoints
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    REQUEST_DURATION.observe(duration)
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    return response
```

---

## 🧪 Testing Examples

### **API Testing**
```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_instance():
    # Login first
    login_response = client.post("/auth/login", data={
        "username": "test@example.com",
        "password": "testpass"
    })
    token = login_response.json()["access_token"]
    
    # Create instance
    response = client.post(
        "/instances",
        json={"os_type": "windows", "plan": "basic"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["status"] == "provisioning"

def test_rate_limiting():
    # Make 101 requests (assuming limit is 100)
    for i in range(101):
        response = client.get("/health")
        if i < 100:
            assert response.status_code == 200
        else:
            assert response.status_code == 429
```

### **Frontend Testing**
```typescript
// __tests__/Dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from '../app/dashboard/page'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

test('displays RDP instances', async () => {
  // Mock API response
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({
        instances: [{
          id: '1',
          ip_address: '203.0.113.45',
          username: 'Administrator',
          password: 'test123',
          os_type: 'windows',
          status: 'active'
        }]
      }),
    })
  ) as jest.Mock

  render(<Dashboard />, { wrapper: Wrapper })

  await waitFor(() => {
    expect(screen.getByText('Windows Server')).toBeInTheDocument()
    expect(screen.getByText('203.0.113.45')).toBeInTheDocument()
  })
})
```

---

## 🚀 Deployment Configuration

### **Docker Configuration**
```dockerfile
# Dockerfile.backend
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Dockerfile.frontend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### **Docker Compose**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/nemordp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=nemordp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

**Ready for development! Start with Sprint 1 tasks. 🚀**