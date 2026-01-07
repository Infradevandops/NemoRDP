# NemoRDP - Series A Sprint 3 (Week 5-6)
*Dashboard Enhancement & Production Launch*

## 🎯 Sprint Goal
Polish user experience, implement advanced features, crypto wallet management, and prepare for production launch

## 📋 Phase Checklist

### **Phase 1: Advanced Payment Features** (Days 1-3)
- [ ] Crypto wallet management system
- [ ] Multi-currency dashboard
- [ ] Payment history with crypto transactions
- [ ] Subscription management (Paystack)
- [ ] Refund and dispute handling

### **Phase 2: Enhanced User Experience** (Days 4-7)
- [ ] Advanced instance management
- [ ] Real-time monitoring dashboard
- [ ] Usage analytics and reporting
- [ ] Performance optimization
- [ ] Mobile app considerations

### **Phase 3: Production Readiness** (Days 8-11)
- [ ] Security hardening and auditing
- [ ] Comprehensive monitoring setup
- [ ] Load testing and optimization
- [ ] Backup and disaster recovery
- [ ] Compliance and legal requirements

### **Phase 4: Launch Preparation** (Days 12-14)
- [ ] Beta testing with real users
- [ ] Documentation and support materials
- [ ] Marketing assets and campaigns
- [ ] Launch checklist completion
- [ ] Go-live preparation

---

## 📋 Sprint Backlog

### **Epic 1: Advanced Payment & Wallet Management**
**Story Points**: 15 | **Priority**: P0

#### Task 1.1: Crypto Wallet Management System
**Assignee**: Backend Dev | **Estimate**: 6h | **Day**: 1-2
```python
# File: services/wallet_manager.py
from web3 import Web3
from eth_account import Account
import secrets
from cryptography.fernet import Fernet

class CryptoWalletManager:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(os.getenv('ETH_RPC_URL')))
        self.encryption_key = os.getenv('WALLET_ENCRYPTION_KEY').encode()
        self.cipher = Fernet(self.encryption_key)
    
    def generate_payment_wallet(self, user_id: int, crypto_type: str) -> dict:
        """Generate unique wallet for payment"""
        if crypto_type.upper() == 'ETH' or crypto_type.upper() == 'USDT':
            return self._generate_eth_wallet(user_id)
        elif crypto_type.upper() == 'BTC':
            return self._generate_btc_wallet(user_id)
    
    def _generate_eth_wallet(self, user_id: int) -> dict:
        """Generate Ethereum wallet"""
        private_key = secrets.token_hex(32)
        account = Account.from_key(private_key)
        
        # Encrypt private key
        encrypted_key = self.cipher.encrypt(private_key.encode())
        
        # Store in database
        wallet = CryptoWallet(
            user_id=user_id,
            crypto_type='ETH',
            address=account.address,
            encrypted_private_key=encrypted_key.decode(),
            status='active'
        )
        db.add(wallet)
        db.commit()
        
        return {
            'address': account.address,
            'crypto_type': 'ETH',
            'wallet_id': wallet.id
        }
    
    async def check_wallet_balance(self, wallet_address: str, crypto_type: str) -> float:
        """Check wallet balance"""
        if crypto_type.upper() == 'ETH':
            balance_wei = self.w3.eth.get_balance(wallet_address)
            return float(self.w3.from_wei(balance_wei, 'ether'))
        elif crypto_type.upper() == 'USDT':
            return await self._check_usdt_balance(wallet_address)
        elif crypto_type.upper() == 'BTC':
            return await self._check_btc_balance(wallet_address)
    
    async def sweep_wallet_funds(self, wallet_id: int, destination_address: str):
        """Sweep funds from payment wallet to main wallet"""
        wallet = db.query(CryptoWallet).filter(CryptoWallet.id == wallet_id).first()
        if not wallet:
            raise Exception("Wallet not found")
        
        # Decrypt private key
        private_key = self.cipher.decrypt(wallet.encrypted_private_key.encode()).decode()
        
        # Perform sweep transaction
        if wallet.crypto_type == 'ETH':
            return await self._sweep_eth_wallet(private_key, destination_address)

# Acceptance Criteria
- [ ] Secure wallet generation
- [ ] Private key encryption
- [ ] Balance monitoring
- [ ] Fund sweeping capability
```

#### Task 1.2: Enhanced Billing Dashboard
**Assignee**: Frontend Dev | **Estimate**: 5h | **Day**: 2-3
```typescript
// File: app/billing/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bitcoin, Ethereum, CreditCard, Wallet } from 'lucide-react'

interface PaymentHistory {
  id: string
  amount: number
  currency: string
  payment_method: 'paystack' | 'crypto'
  crypto_type?: string
  status: string
  created_at: string
  transaction_hash?: string
}

interface CryptoWallet {
  id: string
  address: string
  crypto_type: string
  balance: number
  status: string
}

export default function BillingDashboard() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  
  const { data: paymentHistory } = useQuery({
    queryKey: ['payment-history'],
    queryFn: async () => {
      const response = await fetch('/api/billing/history', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      return response.json()
    }
  })

  const { data: cryptoWallets } = useQuery({
    queryKey: ['crypto-wallets'],
    queryFn: async () => {
      const response = await fetch('/api/billing/crypto-wallets', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      return response.json()
    }
  })

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await fetch('/api/billing/subscription', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      return response.json()
    }
  })

  const getCryptoIcon = (cryptoType: string) => {
    switch (cryptoType?.toLowerCase()) {
      case 'btc': return <Bitcoin className="h-5 w-5 text-orange-500" />
      case 'eth': return <Ethereum className="h-5 w-5 text-blue-500" />
      default: return <Wallet className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Billing & Payments</h1>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="wallets">Crypto Wallets</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Total Spent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${paymentHistory?.reduce((sum: number, p: PaymentHistory) => sum + p.amount, 0) || 0}
                  </div>
                  <p className="text-sm text-gray-500">Across all payment methods</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Crypto Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {paymentHistory?.filter((p: PaymentHistory) => p.payment_method === 'crypto').length || 0}
                  </div>
                  <p className="text-sm text-gray-500">Successful transactions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {subscription?.status === 'active' ? subscription.plan_name : 'None'}
                  </div>
                  <p className="text-sm text-gray-500">
                    {subscription?.status === 'active' ? 
                      `Next billing: ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}` :
                      'No active subscription'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentHistory?.map((payment: PaymentHistory) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {payment.payment_method === 'crypto' ? 
                          getCryptoIcon(payment.crypto_type || '') : 
                          <CreditCard className="h-5 w-5 text-blue-500" />
                        }
                        <div>
                          <p className="font-medium">
                            {payment.payment_method === 'crypto' ? 
                              `${payment.crypto_type} Payment` : 
                              'Paystack Payment'
                            }
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString()}
                            {payment.transaction_hash && (
                              <span className="ml-2">
                                • <a href={`https://etherscan.io/tx/${payment.transaction_hash}`} 
                                     target="_blank" 
                                     className="text-blue-500 hover:underline">
                                  View on blockchain
                                </a>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{payment.amount} {payment.currency}</p>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wallets">
            <div className="grid md:grid-cols-2 gap-6">
              {cryptoWallets?.map((wallet: CryptoWallet) => (
                <Card key={wallet.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getCryptoIcon(wallet.crypto_type)}
                      {wallet.crypto_type} Wallet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs flex-1">
                          {wallet.address}
                        </code>
                        <Button size="sm" variant="ghost">Copy</Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Balance</label>
                      <p className="text-lg font-medium">
                        {wallet.balance} {wallet.crypto_type}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Transactions</Button>
                      <Button size="sm" variant="outline">Generate New</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
              </CardHeader>
              <CardContent>
                {subscription?.status === 'active' ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Current Plan</label>
                        <p className="text-lg font-medium">{subscription.plan_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Monthly Cost</label>
                        <p className="text-lg font-medium">${subscription.amount}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Next Billing</label>
                        <p className="text-lg font-medium">
                          {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <Badge className="ml-2">
                          {subscription.cancel_at_period_end ? 'Cancelling' : 'Active'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline">Change Plan</Button>
                      <Button variant="destructive">Cancel Subscription</Button>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

# Acceptance Criteria
- [ ] Payment history with crypto transactions
- [ ] Crypto wallet management interface
- [ ] Subscription management
- [ ] Multi-currency support
- [ ] Transaction tracking and verification
```

#### Task 1.3: Advanced Instance Analytics
**Assignee**: Backend Dev | **Estimate**: 4h | **Day**: 3
```python
# File: services/analytics.py
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from models.rdp_instance import RDPInstance
from models.usage_stats import UsageStats

class InstanceAnalytics:
    def __init__(self):
        self.db = SessionLocal()
    
    async def get_user_analytics(self, user_id: int, days: int = 30) -> dict:
        """Get comprehensive user analytics"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Instance statistics
        total_instances = self.db.query(RDPInstance).filter(
            RDPInstance.user_id == user_id
        ).count()
        
        active_instances = self.db.query(RDPInstance).filter(
            and_(
                RDPInstance.user_id == user_id,
                RDPInstance.status == 'active'
            )
        ).count()
        
        # Usage statistics
        usage_stats = self.db.query(
            func.sum(UsageStats.cpu_hours).label('total_cpu_hours'),
            func.sum(UsageStats.data_transfer_gb).label('total_data_transfer'),
            func.avg(UsageStats.uptime_percentage).label('avg_uptime')
        ).filter(
            and_(
                UsageStats.user_id == user_id,
                UsageStats.date >= start_date.date()
            )
        ).first()
        
        # Cost analysis
        total_cost = self.db.query(
            func.sum(RDPInstance.monthly_cost)
        ).filter(
            and_(
                RDPInstance.user_id == user_id,
                RDPInstance.created_at >= start_date
            )
        ).scalar() or 0
        
        # Performance metrics
        avg_provisioning_time = self.db.query(
            func.avg(RDPInstance.provisioning_time_seconds)
        ).filter(
            and_(
                RDPInstance.user_id == user_id,
                RDPInstance.created_at >= start_date
            )
        ).scalar() or 0
        
        return {
            'total_instances': total_instances,
            'active_instances': active_instances,
            'total_cpu_hours': float(usage_stats.total_cpu_hours or 0),
            'total_data_transfer_gb': float(usage_stats.total_data_transfer or 0),
            'average_uptime_percentage': float(usage_stats.avg_uptime or 0),
            'total_cost_usd': float(total_cost),
            'average_provisioning_time_seconds': float(avg_provisioning_time),
            'period_days': days
        }
    
    async def get_instance_performance(self, instance_id: int) -> dict:
        """Get detailed instance performance metrics"""
        instance = self.db.query(RDPInstance).filter(
            RDPInstance.id == instance_id
        ).first()
        
        if not instance:
            raise Exception("Instance not found")
        
        # Get recent performance data
        recent_stats = self.db.query(UsageStats).filter(
            and_(
                UsageStats.instance_id == instance_id,
                UsageStats.date >= (datetime.utcnow() - timedelta(days=7)).date()
            )
        ).order_by(UsageStats.date.desc()).all()
        
        return {
            'instance_id': instance_id,
            'uptime_hours': sum(stat.uptime_hours for stat in recent_stats),
            'cpu_usage_avg': sum(stat.cpu_usage_avg for stat in recent_stats) / len(recent_stats) if recent_stats else 0,
            'memory_usage_avg': sum(stat.memory_usage_avg for stat in recent_stats) / len(recent_stats) if recent_stats else 0,
            'data_transfer_gb': sum(stat.data_transfer_gb for stat in recent_stats),
            'connection_count': sum(stat.connection_count for stat in recent_stats),
            'performance_score': self._calculate_performance_score(recent_stats)
        }
    
    def _calculate_performance_score(self, stats: list) -> float:
        """Calculate overall performance score (0-100)"""
        if not stats:
            return 0
        
        # Weighted scoring based on uptime, CPU efficiency, and connection stability
        uptime_score = sum(stat.uptime_percentage for stat in stats) / len(stats)
        cpu_efficiency = max(0, 100 - sum(stat.cpu_usage_avg for stat in stats) / len(stats))
        connection_stability = min(100, sum(stat.connection_count for stat in stats) / len(stats) * 10)
        
        return (uptime_score * 0.5 + cpu_efficiency * 0.3 + connection_stability * 0.2)

# Acceptance Criteria
- [ ] Comprehensive user analytics
- [ ] Instance performance tracking
- [ ] Cost analysis and reporting
- [ ] Performance scoring system
```

---

## 🔄 Sprint Ceremonies

### **Daily Standups** (15 min)
**Focus Areas**:
- Advanced feature development progress
- Production readiness checklist
- Beta testing feedback integration
- Launch preparation status

### **Sprint Review** (Day 14)
**Demo Checklist**:
- [ ] Advanced billing dashboard with crypto support
- [ ] Instance analytics and monitoring
- [ ] Enhanced user management features
- [ ] Production-grade security measures
- [ ] Performance optimizations
- [ ] Beta user feedback incorporated
- [ ] Launch readiness confirmed

### **Sprint Retrospective** (Day 14)
**Key Questions**:
- Are we ready for production launch?
- What features provide the most value to users?
- How can we improve the onboarding experience?
- What lessons learned for future sprints?

---

## 🚨 Risk Mitigation

### **Launch Risks**
| Risk | Impact | Mitigation |
|------|--------|------------|
| Crypto payment volatility | High | Real-time rate updates, buffer margins |
| High user load on launch | Critical | Load testing, auto-scaling, CDN |
| Security vulnerabilities | Critical | Security audit, penetration testing |
| User experience issues | High | Beta testing, user feedback integration |

### **Technical Risks**
| Risk | Impact | Mitigation |
|------|--------|------------|
| Database performance under load | High | Connection pooling, query optimization, read replicas |
| Crypto network congestion | Medium | Multiple blockchain support, fee optimization |
| Provider API rate limits | Medium | Request queuing, multiple API keys |

---

## 📊 Definition of Done

### **Feature Complete**
- [ ] Advanced billing and crypto wallet management
- [ ] Instance analytics and monitoring
- [ ] Enhanced user experience features
- [ ] Production-grade security measures
- [ ] Performance optimizations applied
- [ ] Comprehensive testing completed

### **Production Ready**
- [ ] Load testing completed (500 concurrent users)
- [ ] Security audit passed
- [ ] Crypto payment testing across all currencies
- [ ] Documentation complete
- [ ] Monitoring and alerting active
- [ ] Beta user feedback incorporated
- [ ] Launch checklist 100% complete

---

## 🎯 Sprint Success Metrics

### **Technical Metrics**
- Dashboard load time: <1.5 seconds
- API response time: <150ms
- Database query time: <50ms
- Error rate: <0.5%
- Crypto payment confirmation: <5 minutes average

### **User Experience Metrics**
- Task completion rate: >95%
- User satisfaction: >4.7/5
- Feature adoption: >80% for core features
- Support ticket rate: <5% of users

### **Business Metrics**
- Beta conversion rate: >20%
- User retention (14-day): >85%
- Payment success rate: >95% (Paystack), >90% (Crypto)
- Average revenue per user: >$25

**Result**: Production-ready NemoRDP platform ready for public launch