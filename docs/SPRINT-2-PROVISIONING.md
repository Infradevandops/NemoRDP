# NemoRDP - Series A Sprint 2 (Week 3-4)
*Provider API Integration & VM Provisioning*

## 🎯 Sprint Goal
Implement Vultr/Contabo API integration with automated VM provisioning and credential delivery

## 📋 Sprint Backlog

### **Epic 1: Provider API Integration**
**Story Points**: 21 | **Priority**: P0

#### Task 1.1: Vultr API Client
**Assignee**: Backend Dev | **Estimate**: 6h | **Day**: 1-2
```python
# File: providers/vultr.py
import httpx
import asyncio
from typing import Dict, Optional

class VultrProvider:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.vultr.com/v2"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def create_windows_instance(self, order_id: str) -> Dict:
        """Create Windows Server 2022 RDP instance"""
        payload = {
            "region": "ewr",  # New Jersey
            "plan": "vc2-2c-4gb",  # 2 vCPU, 4GB RAM
            "os_id": 240,  # Windows Server 2022
            "label": f"nemordp-{order_id}",
            "hostname": f"nemordp-{order_id}",
            "enable_ipv6": False,
            "backups": "disabled",
            "ddos_protection": False
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/instances",
                json=payload,
                headers=self.headers,
                timeout=30.0
            )
            
            if response.status_code == 202:
                instance = response.json()["instance"]
                return await self._wait_for_instance_ready(instance["id"])
            else:
                raise Exception(f"Vultr API error: {response.text}")

    async def _wait_for_instance_ready(self, instance_id: str) -> Dict:
        """Wait for instance to be ready and get credentials"""
        max_attempts = 30  # 5 minutes max
        attempt = 0
        
        while attempt < max_attempts:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/instances/{instance_id}",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    instance = response.json()["instance"]
                    
                    if (instance["server_status"] == "ok" and 
                        instance["main_ip"] and 
                        instance["main_ip"] != "0.0.0.0"):
                        
                        return {
                            "provider_id": instance_id,
                            "ip_address": instance["main_ip"],
                            "username": "Administrator",
                            "password": instance.get("default_password", ""),
                            "status": "active"
                        }
            
            await asyncio.sleep(10)  # Wait 10 seconds
            attempt += 1
        
        raise Exception("Timeout waiting for instance to be ready")

    async def delete_instance(self, instance_id: str) -> bool:
        """Delete instance"""
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{self.base_url}/instances/{instance_id}",
                headers=self.headers
            )
            return response.status_code == 204

# Acceptance Criteria
- [ ] Vultr API client implemented
- [ ] Windows instance creation working
- [ ] Instance status monitoring
- [ ] Credential retrieval functional
- [ ] Error handling implemented
```

#### Task 1.2: Contabo API Client
**Assignee**: Backend Dev | **Estimate**: 6h | **Day**: 2-3
```python
# File: providers/contabo.py
import httpx
import base64
from typing import Dict

class ContaboProvider:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = "https://api.contabo.com/v1"
        self.token = None

    async def get_access_token(self) -> str:
        """Get OAuth2 access token"""
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
            else:
                raise Exception("Failed to get Contabo access token")

    async def create_linux_instance(self, order_id: str) -> Dict:
        """Create Ubuntu Desktop RDP instance"""
        if not self.token:
            await self.get_access_token()
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "imageId": "ubuntu-22.04",
            "productId": "VPS-1-SSD-20",  # 1 vCPU, 4GB RAM
            "region": "EU",
            "period": 1,
            "displayName": f"nemordp-{order_id}",
            "defaultUser": "ubuntu",
            "userData": self._get_ubuntu_desktop_script()
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/compute/instances",
                json=payload,
                headers=headers,
                timeout=60.0
            )
            
            if response.status_code == 201:
                instance = response.json()["data"][0]
                return await self._wait_for_linux_ready(instance["instanceId"])
            else:
                raise Exception(f"Contabo API error: {response.text}")

    def _get_ubuntu_desktop_script(self) -> str:
        """Cloud-init script for Ubuntu Desktop with RDP"""
        return """#cloud-config
packages:
  - ubuntu-desktop-minimal
  - xrdp
  - firefox
  - code

runcmd:
  - systemctl enable xrdp
  - systemctl start xrdp
  - ufw allow 3389
  - echo 'ubuntu:NemoRDP2024!' | chpasswd
  - adduser ubuntu sudo
  - sed -i 's/^#*WaylandEnable=false/WaylandEnable=false/' /etc/gdm3/custom.conf
  - systemctl restart gdm3
  - reboot
"""

# Acceptance Criteria
- [ ] Contabo OAuth2 authentication
- [ ] Linux instance creation working
- [ ] Ubuntu Desktop setup script
- [ ] Instance monitoring implemented
- [ ] Error handling and retries
```

#### Task 1.3: Provider Abstraction Layer
**Assignee**: Backend Dev | **Estimate**: 4h | **Day**: 3
```python
# File: services/provisioning.py
from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, Optional

class OSType(Enum):
    WINDOWS = "windows"
    LINUX = "linux"

class ProviderInterface(ABC):
    @abstractmethod
    async def create_instance(self, order_id: str, os_type: OSType) -> Dict:
        pass
    
    @abstractmethod
    async def delete_instance(self, instance_id: str) -> bool:
        pass
    
    @abstractmethod
    async def get_instance_status(self, instance_id: str) -> str:
        pass

class ProvisioningService:
    def __init__(self):
        self.vultr = VultrProvider(os.getenv("VULTR_API_KEY"))
        self.contabo = ContaboProvider(
            os.getenv("CONTABO_CLIENT_ID"),
            os.getenv("CONTABO_CLIENT_SECRET")
        )

    async def provision_rdp(self, order_id: str, os_type: OSType, plan: str) -> Dict:
        """Route provisioning to appropriate provider"""
        try:
            if os_type == OSType.WINDOWS:
                return await self.vultr.create_windows_instance(order_id)
            else:
                return await self.contabo.create_linux_instance(order_id)
        except Exception as e:
            # Log error and potentially retry with different provider
            raise Exception(f"Provisioning failed: {str(e)}")

    async def terminate_rdp(self, provider: str, instance_id: str) -> bool:
        """Terminate RDP instance"""
        if provider == "vultr":
            return await self.vultr.delete_instance(instance_id)
        elif provider == "contabo":
            return await self.contabo.delete_instance(instance_id)
        else:
            raise ValueError(f"Unknown provider: {provider}")

# Acceptance Criteria
- [ ] Provider abstraction implemented
- [ ] Routing logic working
- [ ] Error handling and fallbacks
- [ ] Logging and monitoring
```

#### Task 1.4: Background Job Processing
**Assignee**: Backend Dev | **Estimate**: 5h | **Day**: 4
```python
# File: tasks/provisioning.py
from celery import Celery
from services.provisioning import ProvisioningService, OSType
from services.email import EmailService
from database import SessionLocal
from models.rdp_instance import RDPInstance

celery_app = Celery('nemordp')
celery_app.config_from_object('celeryconfig')

@celery_app.task(bind=True, max_retries=3)
def provision_rdp_task(self, user_id: int, order_id: str, os_type: str, plan: str, user_email: str):
    """Background task to provision RDP instance"""
    db = SessionLocal()
    provisioning_service = ProvisioningService()
    email_service = EmailService()
    
    try:
        # Create database record
        rdp_instance = RDPInstance(
            user_id=user_id,
            provider="vultr" if os_type == "windows" else "contabo",
            os_type=os_type,
            plan=plan,
            status="provisioning"
        )
        db.add(rdp_instance)
        db.commit()
        
        # Provision VM
        result = await provisioning_service.provision_rdp(
            order_id, 
            OSType(os_type), 
            plan
        )
        
        # Update database with credentials
        rdp_instance.provider_id = result["provider_id"]
        rdp_instance.ip_address = result["ip_address"]
        rdp_instance.username = result["username"]
        rdp_instance.password = result["password"]
        rdp_instance.status = result["status"]
        db.commit()
        
        # Send credentials email
        await email_service.send_rdp_credentials(
            user_email, 
            result, 
            os_type
        )
        
        return {"status": "success", "instance_id": rdp_instance.id}
        
    except Exception as e:
        # Update status to failed
        if 'rdp_instance' in locals():
            rdp_instance.status = "failed"
            db.commit()
        
        # Retry logic
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (2 ** self.request.retries))
        
        raise e
    finally:
        db.close()

# File: celeryconfig.py
broker_url = 'redis://localhost:6379/0'
result_backend = 'redis://localhost:6379/0'
task_serializer = 'json'
accept_content = ['json']
result_serializer = 'json'
timezone = 'UTC'
enable_utc = True

# Acceptance Criteria
- [ ] Celery task queue configured
- [ ] Provisioning task implemented
- [ ] Retry logic working
- [ ] Database updates handled
- [ ] Error notifications sent
```

---

### **Epic 2: Email & Notification System**
**Story Points**: 8 | **Priority**: P0

#### Task 2.1: Email Service Implementation
**Assignee**: Backend Dev | **Estimate**: 4h | **Day**: 5
```python
# File: services/email.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
import os

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.sendgrid.net")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@nemordp.com")

    async def send_rdp_credentials(self, to_email: str, credentials: dict, os_type: str):
        """Send RDP credentials to user"""
        subject = f"Your NemoRDP {os_type.title()} Server is Ready! 🚀"
        
        template = Template(self._get_credentials_template())
        html_content = template.render(
            os_type=os_type.title(),
            ip_address=credentials['ip_address'],
            username=credentials['username'],
            password=credentials['password'],
            rdp_port=3389
        )
        
        await self._send_email(to_email, subject, html_content)

    async def send_provisioning_failed(self, to_email: str, order_id: str):
        """Send provisioning failure notification"""
        subject = "NemoRDP Provisioning Failed - Support Ticket Created"
        
        html_content = f"""
        <h2>Provisioning Failed</h2>
        <p>We encountered an issue provisioning your RDP server (Order: {order_id}).</p>
        <p>Our support team has been notified and will contact you within 24 hours.</p>
        <p>For immediate assistance, reply to this email.</p>
        """
        
        await self._send_email(to_email, subject, html_content)

    def _get_credentials_template(self) -> str:
        return """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .credentials { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .cred-item { margin: 10px 0; }
        .cred-label { font-weight: bold; color: #495057; }
        .cred-value { font-family: monospace; background: #e9ecef; padding: 5px 10px; border-radius: 4px; }
        .instructions { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Your {{ os_type }} RDP is Ready!</h1>
            <p>Connect to your remote desktop in seconds</p>
        </div>
        
        <div class="credentials">
            <h3>Connection Details:</h3>
            <div class="cred-item">
                <span class="cred-label">IP Address:</span>
                <span class="cred-value">{{ ip_address }}</span>
            </div>
            <div class="cred-item">
                <span class="cred-label">Port:</span>
                <span class="cred-value">{{ rdp_port }}</span>
            </div>
            <div class="cred-item">
                <span class="cred-label">Username:</span>
                <span class="cred-value">{{ username }}</span>
            </div>
            <div class="cred-item">
                <span class="cred-label">Password:</span>
                <span class="cred-value">{{ password }}</span>
            </div>
        </div>
        
        <div class="instructions">
            <h3>Quick Connect:</h3>
            <ol>
                <li><strong>Windows:</strong> Search "Remote Desktop Connection"</li>
                <li><strong>Mac:</strong> Download "Microsoft Remote Desktop" from App Store</li>
                <li><strong>Linux:</strong> Use Remmina or similar RDP client</li>
                <li>Enter the IP address: <code>{{ ip_address }}</code></li>
                <li>Use the credentials above to login</li>
            </ol>
        </div>
        
        <div class="footer">
            <p>Need help? Reply to this email or visit our support center.</p>
            <p>© 2024 NemoRDP. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """

    async def _send_email(self, to_email: str, subject: str, html_content: str):
        """Send email via SMTP"""
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = self.from_email
        msg['To'] = to_email
        
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
        except Exception as e:
            # Log error but don't fail the provisioning
            print(f"Email sending failed: {e}")

# Acceptance Criteria
- [ ] Email templates created
- [ ] SMTP configuration working
- [ ] Credentials email functional
- [ ] Error notification system
- [ ] HTML email formatting
```

#### Task 2.2: Dashboard Integration
**Assignee**: Frontend Dev | **Estimate**: 4h | **Day**: 5-6
```typescript
// File: app/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Download, Power, Trash2 } from 'lucide-react'

interface RDPInstance {
  id: string
  ip_address: string
  username: string
  password: string
  os_type: string
  plan: string
  status: string
  created_at: string
  provider: string
}

export default function Dashboard() {
  const { data: instances, isLoading, refetch } = useQuery({
    queryKey: ['rdp-instances'],
    queryFn: async () => {
      const response = await fetch('/api/instances', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      return response.json()
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show toast notification
  }

  const downloadRDPFile = async (instanceId: string) => {
    const response = await fetch(`/api/instances/${instanceId}/rdp-file`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nemordp-${instanceId}.rdp`
    a.click()
  }

  const restartInstance = async (instanceId: string) => {
    await fetch(`/api/instances/${instanceId}/restart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    refetch()
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My RDP Instances</h1>
          <Button onClick={() => window.location.href = '/pricing'}>
            Create New RDP
          </Button>
        </div>
        
        <div className="grid gap-6">
          {instances?.map((instance: RDPInstance) => (
            <Card key={instance.id} className="w-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {instance.os_type === 'windows' ? '🪟' : '🐧'} 
                      {instance.os_type === 'windows' ? 'Windows Server' : 'Ubuntu Desktop'}
                      <Badge variant={instance.status === 'active' ? 'default' : 'secondary'}>
                        {instance.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {instance.plan} • Created {new Date(instance.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {instance.status === 'active' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">IP Address</label>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {instance.ip_address}
                          </code>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyToClipboard(instance.ip_address)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Username</label>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {instance.username}
                          </code>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyToClipboard(instance.username)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Password</label>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {instance.password}
                          </code>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyToClipboard(instance.password)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => downloadRDPFile(instance.id)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download RDP File
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => restartInstance(instance.id)}
                        className="flex items-center gap-2"
                      >
                        <Power className="h-4 w-4" />
                        Restart
                      </Button>
                      
                      <Button 
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Terminate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">
                      {instance.status === 'provisioning' ? 'Setting up your RDP server...' : 'Processing...'}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      This usually takes 2-3 minutes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {instances?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No RDP instances yet</h3>
            <p className="text-gray-500 mb-4">Create your first remote desktop to get started</p>
            <Button onClick={() => window.location.href = '/pricing'}>
              Create RDP Instance
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

# Acceptance Criteria
- [ ] Real-time instance status updates
- [ ] Credential copy functionality
- [ ] RDP file download working
- [ ] Instance management actions
- [ ] Loading states implemented
```

---

## 🔄 Sprint Ceremonies

### **Daily Standups** (15 min)
**Focus Areas**:
- API integration progress
- Provisioning pipeline status
- Blocking issues with providers

### **Sprint Review** (Day 14)
**Demo Checklist**:
- [ ] End-to-end provisioning working
- [ ] Windows RDP creation (Vultr)
- [ ] Linux RDP creation (Contabo)
- [ ] Email delivery functional
- [ ] Dashboard showing instances
- [ ] RDP file download working

### **Sprint Retrospective** (Day 14)
**Key Questions**:
- How effective was our provider integration approach?
- What challenges did we face with async operations?
- How can we improve error handling?

---

## 🚨 Risk Mitigation

### **Technical Risks**
| Risk | Impact | Mitigation |
|------|--------|------------|
| Provider API downtime | Critical | Implement circuit breakers, fallback providers |
| Long provisioning times | High | Set realistic expectations, progress indicators |
| Credential delivery failures | High | Retry mechanisms, manual fallback process |
| Rate limiting | Medium | Implement request queuing, multiple API keys |

### **Business Risks**
| Risk | Impact | Mitigation |
|------|--------|------------|
| High provisioning failure rate | Critical | Extensive testing, monitoring, alerts |
| Customer support load | High | Comprehensive documentation, FAQ |
| Provider cost increases | Medium | Monitor usage, negotiate better rates |

---

## 📊 Definition of Done

### **Feature Complete**
- [ ] Provider APIs integrated and tested
- [ ] Provisioning pipeline working end-to-end
- [ ] Error handling and retries implemented
- [ ] Email notifications functional
- [ ] Dashboard updates in real-time
- [ ] Performance benchmarks met (<3 min provisioning)

### **Quality Gates**
- [ ] Unit tests: >85% coverage
- [ ] Integration tests: All critical paths covered
- [ ] Load testing: 10 concurrent provisions
- [ ] Security review: API keys secured, data encrypted

---

## 🎯 Sprint Success Metrics

### **Technical Metrics**
- Provisioning success rate: >95%
- Average provisioning time: <3 minutes
- API response time: <500ms
- Email delivery rate: >98%

### **Business Metrics**
- Customer satisfaction: >4.5/5
- Support ticket volume: <5% of provisions
- Conversion rate: Payment → Active RDP >90%

**Next Sprint**: Dashboard Enhancement & Customer Management