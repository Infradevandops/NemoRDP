# NemoRDP - Series A Sprint 3 (Week 5-6)
*Dashboard Enhancement & Launch Preparation*

## 🎯 Sprint Goal
Polish user experience, implement customer management features, and prepare for beta launch

## 📋 Sprint Backlog

### **Epic 1: Advanced Dashboard Features**
**Story Points**: 18 | **Priority**: P0

#### Task 1.1: Instance Management System
**Assignee**: Backend Dev | **Estimate**: 6h | **Day**: 1-2
```python
# File: routers/instances.py
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
import io

router = APIRouter(prefix="/instances", tags=["instances"])

@router.get("/", response_model=List[RDPInstanceResponse])
async def get_user_instances(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all RDP instances for current user"""
    instances = db.query(RDPInstance).filter(
        RDPInstance.user_id == current_user.id
    ).order_by(RDPInstance.created_at.desc()).all()
    
    return instances

@router.post("/{instance_id}/restart")
async def restart_instance(
    instance_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Restart RDP instance"""
    instance = db.query(RDPInstance).filter(
        RDPInstance.id == instance_id,
        RDPInstance.user_id == current_user.id
    ).first()
    
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    # Call provider API to restart
    provisioning_service = ProvisioningService()
    
    try:
        if instance.provider == "vultr":
            success = await provisioning_service.vultr.restart_instance(instance.provider_id)
        else:
            success = await provisioning_service.contabo.restart_instance(instance.provider_id)
        
        if success:
            return {"status": "restarting", "message": "Instance restart initiated"}
        else:
            raise HTTPException(status_code=500, detail="Restart failed")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Restart error: {str(e)}")

@router.delete("/{instance_id}")
async def terminate_instance(
    instance_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Terminate RDP instance"""
    instance = db.query(RDPInstance).filter(
        RDPInstance.id == instance_id,
        RDPInstance.user_id == current_user.id
    ).first()
    
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    # Terminate with provider
    provisioning_service = ProvisioningService()
    
    try:
        success = await provisioning_service.terminate_rdp(
            instance.provider, 
            instance.provider_id
        )
        
        if success:
            # Update database
            instance.status = "terminated"
            db.commit()
            
            # Cancel Stripe subscription if exists
            if instance.stripe_subscription_id:
                stripe.Subscription.delete(instance.stripe_subscription_id)
            
            return {"status": "terminated", "message": "Instance terminated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Termination failed")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Termination error: {str(e)}")

@router.get("/{instance_id}/rdp-file")
async def download_rdp_file(
    instance_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and return RDP connection file"""
    instance = db.query(RDPInstance).filter(
        RDPInstance.id == instance_id,
        RDPInstance.user_id == current_user.id,
        RDPInstance.status == "active"
    ).first()
    
    if not instance:
        raise HTTPException(status_code=404, detail="Active instance not found")
    
    rdp_content = f"""screen mode id:i:2
use multimon:i:0
desktopwidth:i:1920
desktopheight:i:1080
session bpp:i:32
winposstr:s:0,3,0,0,800,600
compression:i:1
keyboardhook:i:2
audiocapturemode:i:0
videoplaybackmode:i:1
connection type:i:7
networkautodetect:i:1
bandwidthautodetect:i:1
displayconnectionbar:i:1
enableworkspacereconnect:i:0
disable wallpaper:i:0
allow font smoothing:i:0
allow desktop composition:i:0
disable full window drag:i:1
disable menu anims:i:1
disable themes:i:0
disable cursor setting:i:0
bitmapcachepersistenable:i:1
full address:s:{instance.ip_address}
audiomode:i:0
redirectprinters:i:1
redirectcomports:i:0
redirectsmartcards:i:1
redirectclipboard:i:1
redirectposdevices:i:0
autoreconnection enabled:i:1
authentication level:i:2
prompt for credentials:i:0
negotiate security layer:i:1
remoteapplicationmode:i:0
alternate shell:s:
shell working directory:s:
gatewayhostname:s:
gatewayusagemethod:i:4
gatewaycredentialssource:i:4
gatewayprofileusagemethod:i:0
promptcredentialonce:i:0
gatewaybrokeringtype:i:0
use redirection server name:i:0
rdgiskdcproxy:i:0
kdcproxyname:s:
username:s:{instance.username}
"""
    
    return Response(
        content=rdp_content,
        media_type="application/rdp",
        headers={
            "Content-Disposition": f"attachment; filename=nemordp-{instance_id}.rdp"
        }
    )

@router.get("/{instance_id}/usage")
async def get_instance_usage(
    instance_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get instance usage statistics"""
    instance = db.query(RDPInstance).filter(
        RDPInstance.id == instance_id,
        RDPInstance.user_id == current_user.id
    ).first()
    
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    # Calculate uptime, data transfer, etc.
    uptime_hours = (datetime.utcnow() - instance.created_at).total_seconds() / 3600
    
    return {
        "uptime_hours": round(uptime_hours, 2),
        "status": instance.status,
        "created_at": instance.created_at,
        "last_accessed": instance.last_accessed,
        "data_transfer_gb": instance.data_transfer_gb or 0
    }

# Acceptance Criteria
- [ ] Instance restart functionality
- [ ] Instance termination with cleanup
- [ ] RDP file generation working
- [ ] Usage statistics tracking
- [ ] Proper error handling
```

#### Task 1.2: Billing & Subscription Management
**Assignee**: Backend Dev | **Estimate**: 5h | **Day**: 2-3
```python
# File: routers/billing.py (Enhanced)
from fastapi import APIRouter, Depends, HTTPException, Request
import stripe
from datetime import datetime, timedelta

router = APIRouter(prefix="/billing", tags=["billing"])

@router.get("/subscription")
async def get_user_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's current subscription details"""
    if not current_user.stripe_customer_id:
        return {"status": "no_subscription"}
    
    try:
        # Get customer from Stripe
        customer = stripe.Customer.retrieve(current_user.stripe_customer_id)
        
        # Get active subscriptions
        subscriptions = stripe.Subscription.list(
            customer=current_user.stripe_customer_id,
            status='active'
        )
        
        if subscriptions.data:
            sub = subscriptions.data[0]
            return {
                "status": "active",
                "subscription_id": sub.id,
                "current_period_start": sub.current_period_start,
                "current_period_end": sub.current_period_end,
                "plan_name": sub.items.data[0].price.nickname,
                "amount": sub.items.data[0].price.unit_amount / 100,
                "currency": sub.items.data[0].price.currency,
                "cancel_at_period_end": sub.cancel_at_period_end
            }
        else:
            return {"status": "no_active_subscription"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Billing error: {str(e)}")

@router.post("/cancel-subscription")
async def cancel_subscription(
    current_user: User = Depends(get_current_user)
):
    """Cancel user's subscription at period end"""
    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=404, detail="No subscription found")
    
    try:
        subscriptions = stripe.Subscription.list(
            customer=current_user.stripe_customer_id,
            status='active'
        )
        
        if subscriptions.data:
            sub = subscriptions.data[0]
            updated_sub = stripe.Subscription.modify(
                sub.id,
                cancel_at_period_end=True
            )
            
            return {
                "status": "cancelled",
                "message": "Subscription will cancel at period end",
                "period_end": updated_sub.current_period_end
            }
        else:
            raise HTTPException(status_code=404, detail="No active subscription")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cancellation error: {str(e)}")

@router.get("/invoices")
async def get_user_invoices(
    current_user: User = Depends(get_current_user)
):
    """Get user's billing history"""
    if not current_user.stripe_customer_id:
        return {"invoices": []}
    
    try:
        invoices = stripe.Invoice.list(
            customer=current_user.stripe_customer_id,
            limit=10
        )
        
        return {
            "invoices": [
                {
                    "id": inv.id,
                    "amount_paid": inv.amount_paid / 100,
                    "currency": inv.currency,
                    "status": inv.status,
                    "created": inv.created,
                    "invoice_pdf": inv.invoice_pdf
                }
                for inv in invoices.data
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Invoice error: {str(e)}")

@router.post("/upgrade-plan")
async def upgrade_plan(
    new_plan: str,
    current_user: User = Depends(get_current_user)
):
    """Upgrade user's subscription plan"""
    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=404, detail="No subscription found")
    
    plan_prices = {
        "basic": "price_basic_monthly",
        "performance": "price_performance_monthly",
        "gpu": "price_gpu_monthly"
    }
    
    if new_plan not in plan_prices:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    try:
        subscriptions = stripe.Subscription.list(
            customer=current_user.stripe_customer_id,
            status='active'
        )
        
        if subscriptions.data:
            sub = subscriptions.data[0]
            
            # Update subscription
            updated_sub = stripe.Subscription.modify(
                sub.id,
                items=[{
                    'id': sub.items.data[0].id,
                    'price': plan_prices[new_plan],
                }],
                proration_behavior='always_invoice'
            )
            
            return {
                "status": "upgraded",
                "new_plan": new_plan,
                "effective_date": updated_sub.current_period_start
            }
        else:
            raise HTTPException(status_code=404, detail="No active subscription")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upgrade error: {str(e)}")

# Acceptance Criteria
- [ ] Subscription status retrieval
- [ ] Subscription cancellation
- [ ] Invoice history display
- [ ] Plan upgrade functionality
- [ ] Proper error handling
```

#### Task 1.3: User Profile & Settings
**Assignee**: Frontend Dev | **Estimate**: 4h | **Day**: 3
```typescript
// File: app/settings/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface UserProfile {
  id: string
  email: string
  created_at: string
  preferences: {
    email_notifications: boolean
    auto_shutdown: boolean
    default_os: string
  }
}

interface BillingInfo {
  status: string
  subscription_id?: string
  plan_name?: string
  amount?: number
  current_period_end?: number
  cancel_at_period_end?: boolean
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      return response.json()
    }
  })

  const { data: billingInfo } = useQuery({
    queryKey: ['billing-info'],
    queryFn: async () => {
      const response = await fetch('/api/billing/subscription', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      return response.json()
    }
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      })
      return response.json()
    }
  })

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      return response.json()
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    value={userProfile?.email || ''} 
                    disabled 
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Contact support to change your email address
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="created">Member Since</Label>
                  <Input 
                    id="created" 
                    value={userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : ''} 
                    disabled 
                  />
                </div>
                
                <Button 
                  onClick={() => updateProfileMutation.mutate({})}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  {billingInfo?.status === 'active' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Plan</Label>
                          <p className="font-medium">{billingInfo.plan_name}</p>
                        </div>
                        <div>
                          <Label>Amount</Label>
                          <p className="font-medium">${billingInfo.amount}/month</p>
                        </div>
                        <div>
                          <Label>Next Billing Date</Label>
                          <p className="font-medium">
                            {new Date(billingInfo.current_period_end * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <p className="font-medium">
                            {billingInfo.cancel_at_period_end ? 'Cancelling' : 'Active'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline">Upgrade Plan</Button>
                        <Button 
                          variant="destructive"
                          onClick={() => cancelSubscriptionMutation.mutate()}
                          disabled={cancelSubscriptionMutation.isPending || billingInfo.cancel_at_period_end}
                        >
                          {billingInfo.cancel_at_period_end ? 'Cancelled' : 'Cancel Subscription'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No active subscription</p>
                      <Button onClick={() => window.location.href = '/pricing'}>
                        Choose a Plan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Invoice history will appear here</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive emails about your RDP instances
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-shutdown</Label>
                    <p className="text-sm text-gray-500">
                      Automatically shutdown idle instances after 2 hours
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div>
                  <Label>Default OS</Label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option value="windows">Windows Server</option>
                    <option value="linux">Ubuntu Desktop</option>
                  </select>
                </div>
                
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Change Password</Label>
                  <div className="space-y-2 mt-2">
                    <Input type="password" placeholder="Current password" />
                    <Input type="password" placeholder="New password" />
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                  <Button className="mt-2">Update Password</Button>
                </div>
                
                <div className="border-t pt-4">
                  <Label className="text-red-600">Danger Zone</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    Permanently delete your account and all data
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

# Acceptance Criteria
- [ ] Profile information display
- [ ] Billing status and history
- [ ] User preferences management
- [ ] Security settings functional
- [ ] Responsive design
```

#### Task 1.4: Support & Help System
**Assignee**: Frontend Dev | **Estimate**: 3h | **Day**: 4
```typescript
// File: app/support/page.tsx
'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  {
    question: "How long does it take to provision an RDP?",
    answer: "Most RDP instances are ready within 2-3 minutes. Windows servers may take slightly longer than Linux instances."
  },
  {
    question: "Can I install my own software?",
    answer: "Yes! You have full administrator/root access to install any software you need."
  },
  {
    question: "What happens if I exceed my bandwidth limit?",
    answer: "We'll notify you when you reach 80% of your limit. You can upgrade your plan or purchase additional bandwidth."
  },
  {
    question: "How do I connect to my RDP?",
    answer: "Use the built-in Remote Desktop Connection on Windows, Microsoft Remote Desktop on Mac, or Remmina on Linux."
  },
  {
    question: "Can I get a refund?",
    answer: "We offer a 7-day money-back guarantee for new customers. Contact support for refund requests."
  }
]

export default function SupportPage() {
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    priority: 'medium',
    message: ''
  })

  const submitTicket = async () => {
    const response = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(ticketForm)
    })
    
    if (response.ok) {
      setTicketForm({ subject: '', priority: 'medium', message: '' })
      // Show success message
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Support Center</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  📖 Getting Started Guide
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🔧 Troubleshooting
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  💰 Billing Help
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🔒 Security Best Practices
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Support Ticket Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input 
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                    placeholder="Brief description of your issue"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                  >
                    <option value="low">Low - General question</option>
                    <option value="medium">Medium - Issue affecting usage</option>
                    <option value="high">High - Service disruption</option>
                    <option value="urgent">Urgent - Complete service failure</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea 
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                    placeholder="Please describe your issue in detail..."
                    rows={6}
                  />
                </div>
                
                <Button onClick={submitTicket} className="w-full">
                  Submit Ticket
                </Button>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <strong>Email Support:</strong>
                  <p className="text-sm text-gray-600">support@nemordp.com</p>
                  <Badge variant="secondary">Response within 24 hours</Badge>
                </div>
                
                <div>
                  <strong>Live Chat:</strong>
                  <p className="text-sm text-gray-600">Available 9 AM - 6 PM EST</p>
                  <Button size="sm" className="mt-1">Start Chat</Button>
                </div>
                
                <div>
                  <strong>Emergency:</strong>
                  <p className="text-sm text-gray-600">For urgent issues affecting multiple customers</p>
                  <Badge variant="destructive">emergency@nemordp.com</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

# Acceptance Criteria
- [ ] FAQ section with common questions
- [ ] Support ticket creation form
- [ ] Contact information display
- [ ] Quick links to documentation
- [ ] Responsive design
```

---

### **Epic 2: Launch Preparation**
**Story Points**: 12 | **Priority**: P0

#### Task 2.1: Performance Optimization
**Assignee**: Full Stack | **Estimate**: 4h | **Day**: 4-5
```python
# File: middleware/performance.py
from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
import time
import logging

class PerformanceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        # Log slow requests
        if process_time > 1.0:
            logging.warning(f"Slow request: {request.url} took {process_time:.2f}s")
        
        return response

# File: database/optimization.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

def create_optimized_engine(database_url: str):
    return create_engine(
        database_url,
        poolclass=QueuePool,
        pool_size=20,
        max_overflow=30,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False  # Disable in production
    )

# File: cache/redis_cache.py
import redis.asyncio as redis
import json
from typing import Any, Optional

class CacheService:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
    
    async def get(self, key: str) -> Optional[Any]:
        value = await self.redis.get(key)
        if value:
            return json.loads(value)
        return None
    
    async def set(self, key: str, value: Any, expire: int = 300):
        await self.redis.setex(key, expire, json.dumps(value))
    
    async def delete(self, key: str):
        await self.redis.delete(key)

# Frontend optimization
# File: next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['nemordp.com'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
}

module.exports = nextConfig

# Acceptance Criteria
- [ ] API response times <200ms
- [ ] Database connection pooling
- [ ] Redis caching implemented
- [ ] Frontend bundle optimization
- [ ] Performance monitoring
```

#### Task 2.2: Security Hardening
**Assignee**: Backend Dev | **Estimate**: 4h | **Day**: 5
```python
# File: security/middleware.py
from fastapi import Request, HTTPException
from fastapi.middleware.base import BaseHTTPMiddleware
import time
from collections import defaultdict

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, calls: int = 100, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.clients = defaultdict(list)
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        now = time.time()
        
        # Clean old requests
        self.clients[client_ip] = [
            req_time for req_time in self.clients[client_ip]
            if now - req_time < self.period
        ]
        
        # Check rate limit
        if len(self.clients[client_ip]) >= self.calls:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        self.clients[client_ip].append(now)
        response = await call_next(request)
        return response

# File: security/validation.py
from pydantic import BaseModel, validator
import re

class CreateInstanceRequest(BaseModel):
    os_type: str
    plan: str
    
    @validator('os_type')
    def validate_os_type(cls, v):
        if v not in ['windows', 'linux']:
            raise ValueError('Invalid OS type')
        return v
    
    @validator('plan')
    def validate_plan(cls, v):
        if v not in ['basic', 'performance', 'gpu']:
            raise ValueError('Invalid plan')
        return v

# File: security/encryption.py
from cryptography.fernet import Fernet
import os

class EncryptionService:
    def __init__(self):
        key = os.getenv('ENCRYPTION_KEY')
        if not key:
            key = Fernet.generate_key()
            # Store this key securely
        self.cipher = Fernet(key)
    
    def encrypt(self, data: str) -> str:
        return self.cipher.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        return self.cipher.decrypt(encrypted_data.encode()).decode()

# Acceptance Criteria
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Sensitive data encryption
- [ ] HTTPS enforcement
- [ ] Security headers configured
```

#### Task 2.3: Monitoring & Alerting
**Assignee**: DevOps | **Estimate**: 4h | **Day**: 6
```python
# File: monitoring/health.py
from fastapi import APIRouter
from sqlalchemy import text
from database import get_db
import redis
import httpx

router = APIRouter()

@router.get("/health")
async def health_check():
    """Comprehensive health check"""
    checks = {
        "api": "healthy",
        "database": await check_database(),
        "redis": await check_redis(),
        "providers": await check_providers()
    }
    
    overall_status = "healthy" if all(
        status == "healthy" for status in checks.values()
    ) else "unhealthy"
    
    return {
        "status": overall_status,
        "checks": checks,
        "timestamp": datetime.utcnow().isoformat()
    }

async def check_database():
    try:
        db = next(get_db())
        result = db.execute(text("SELECT 1"))
        return "healthy"
    except Exception:
        return "unhealthy"

async def check_redis():
    try:
        r = redis.Redis.from_url(os.getenv("REDIS_URL"))
        await r.ping()
        return "healthy"
    except Exception:
        return "unhealthy"

async def check_providers():
    try:
        # Quick API check to providers
        async with httpx.AsyncClient() as client:
            vultr_response = await client.get(
                "https://api.vultr.com/v2/account",
                headers={"Authorization": f"Bearer {os.getenv('VULTR_API_KEY')}"},
                timeout=5.0
            )
            if vultr_response.status_code == 200:
                return "healthy"
    except Exception:
        pass
    return "degraded"

# File: monitoring/metrics.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import time

# Metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_INSTANCES = Gauge('rdp_instances_active', 'Number of active RDP instances')
PROVISIONING_FAILURES = Counter('rdp_provisioning_failures_total', 'Provisioning failures')

@router.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type="text/plain")

# File: monitoring/alerts.py
import smtplib
from email.mime.text import MIMEText

class AlertService:
    def __init__(self):
        self.smtp_server = os.getenv("ALERT_SMTP_SERVER")
        self.smtp_username = os.getenv("ALERT_SMTP_USERNAME")
        self.smtp_password = os.getenv("ALERT_SMTP_PASSWORD")
        self.alert_email = os.getenv("ALERT_EMAIL")
    
    async def send_alert(self, subject: str, message: str, severity: str = "warning"):
        """Send alert email"""
        if severity == "critical":
            subject = f"🚨 CRITICAL: {subject}"
        elif severity == "warning":
            subject = f"⚠️ WARNING: {subject}"
        
        msg = MIMEText(message)
        msg['Subject'] = subject
        msg['From'] = self.smtp_username
        msg['To'] = self.alert_email
        
        try:
            with smtplib.SMTP(self.smtp_server, 587) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
        except Exception as e:
            print(f"Failed to send alert: {e}")

# Acceptance Criteria
- [ ] Health check endpoint working
- [ ] Prometheus metrics exposed
- [ ] Alert system configured
- [ ] Uptime monitoring setup
- [ ] Error tracking active
```

---

## 🔄 Sprint Ceremonies

### **Daily Standups** (15 min)
**Focus Areas**:
- Dashboard feature completion
- Performance optimization progress
- Launch preparation status

### **Sprint Review** (Day 12)
**Demo Checklist**:
- [ ] Complete user dashboard with all features
- [ ] Instance management working (restart, terminate, download)
- [ ] Billing and subscription management
- [ ] User settings and preferences
- [ ] Support system functional
- [ ] Performance benchmarks met
- [ ] Security measures implemented

### **Sprint Retrospective** (Day 12)
**Key Questions**:
- Are we ready for beta launch?
- What features are most important to users?
- How can we improve the onboarding experience?

---

## 🚨 Risk Mitigation

### **Launch Risks**
| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance issues under load | Critical | Load testing, performance monitoring |
| Security vulnerabilities | Critical | Security audit, penetration testing |
| User experience problems | High | User testing, feedback collection |
| Support ticket volume | High | Comprehensive documentation, FAQ |

### **Technical Risks**
| Risk | Impact | Mitigation |
|------|--------|------------|
| Database performance | High | Connection pooling, query optimization |
| Provider API failures | High | Circuit breakers, fallback mechanisms |
| Email delivery issues | Medium | Multiple email providers, monitoring |

---

## 📊 Definition of Done

### **Feature Complete**
- [ ] All dashboard features implemented and tested
- [ ] User management system working
- [ ] Billing integration complete
- [ ] Support system functional
- [ ] Performance optimizations applied
- [ ] Security measures implemented

### **Launch Ready**
- [ ] Load testing completed (100 concurrent users)
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Monitoring and alerting active
- [ ] Beta user onboarding process ready

---

## 🎯 Sprint Success Metrics

### **Technical Metrics**
- Dashboard load time: <2 seconds
- API response time: <200ms
- Database query time: <100ms
- Error rate: <1%

### **User Experience Metrics**
- Task completion rate: >90%
- User satisfaction: >4.5/5
- Support ticket rate: <10% of users
- Feature adoption: >70% for core features

### **Business Metrics**
- Beta signup conversion: >15%
- User retention (7-day): >80%
- Payment success rate: >95%

**Next Phase**: Beta Launch & Customer Acquisition