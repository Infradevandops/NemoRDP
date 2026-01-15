# NemoRDP Plan ROI Analysis

## Plan Structure & Pricing

### Basic Tier (Windows - 2 vCPU, 4GB RAM)
| Duration | Price | Days | Provider | Provider Cost | Gross Profit | Margin |
|:---------|------:|-----:|:---------|-------------:|-------------:|-------:|
| Trial    | $5.00 | 3    | Vultr    | $2.50        | $2.50        | 50%    |
| Weekly   | $8.00 | 7    | Vultr    | $5.00        | $3.00        | 37.5%  |
| Monthly  | $15.00| 30   | Vultr    | $10.00       | $5.00        | 33.3%  |

### Pro Tier (Windows - 4 vCPU, 8GB RAM)
| Duration | Price | Days | Provider | Provider Cost | Gross Profit | Margin |
|:---------|------:|-----:|:---------|-------------:|-------------:|-------:|
| Trial    | $8.00 | 3    | Vultr    | $4.00        | $4.00        | 50%    |
| Weekly   | $12.00| 7    | Vultr    | $7.00        | $5.00        | 41.7%  |
| Monthly  | $25.00| 30   | Vultr    | $15.00       | $10.00       | 40%    |

### Linux Tier (Ubuntu Desktop - 1 vCPU, 4GB RAM)
| Duration | Price | Days | Provider | Provider Cost | Gross Profit | Margin |
|:---------|------:|-----:|:---------|-------------:|-------------:|-------:|
| Trial    | $4.00 | 3    | Contabo  | $10.00*      | -$6.00       | -150%  |
| Weekly   | $6.00 | 7    | Contabo  | $10.00*      | -$4.00       | -67%   |
| Monthly  | $12.00| 30   | Contabo  | $10.00       | $2.00        | 16.7%  |

*Contabo bills full month upfront - short-duration plans are loss-makers

## Strategic Recommendations

### ✅ Offer Immediately (High ROI)
1. **Basic Monthly** - Core product, 33% margin
2. **Basic Weekly** - Conversion funnel, 37% margin
3. **Pro Monthly** - Premium offering, 40% margin

### ⚠️ Offer with Caution
4. **Basic Trial** - Loss leader (50% margin but attracts tire-kickers)
5. **Pro Weekly** - Good margin but may cannibalize monthly sales

### ❌ Do Not Offer (Negative ROI)
6. **Linux Trial/Weekly** - Loses money due to Contabo's monthly billing
7. **Any Hourly Plans** - Payment processing fees destroy margins

## Revenue Projections (100 Users/Month)

### Conservative Mix (60% Monthly, 30% Weekly, 10% Trial)
```
Basic Monthly:  60 users × $15 = $900  (Cost: $600,  Profit: $300)
Basic Weekly:   30 users × $8  = $240  (Cost: $150,  Profit: $90)
Basic Trial:    10 users × $5  = $50   (Cost: $25,   Profit: $25)
────────────────────────────────────────────────────────────────
Total Revenue:                  $1,190
Total Costs:                    $775
Net Profit:                     $415 (34.9% margin)
```

### Aggressive Mix (40% Monthly, 40% Weekly, 20% Trial)
```
Basic Monthly:  40 users × $15 = $600  (Cost: $400,  Profit: $200)
Basic Weekly:   40 users × $8  = $320  (Cost: $200,  Profit: $120)
Basic Trial:    20 users × $5  = $100  (Cost: $50,   Profit: $50)
────────────────────────────────────────────────────────────────
Total Revenue:                  $1,020
Total Costs:                    $650
Net Profit:                     $370 (36.3% margin)
```

## Conversion Funnel Strategy

```
Trial (3d) → Weekly (7d) → Monthly (30d)
   ↓            ↓              ↓
  $5           $8            $15
  50%          37%           33%
margin       margin        margin

Expected Flow:
100 Trial users → 40 convert to Weekly (40% CVR)
40 Weekly users → 20 convert to Monthly (50% CVR)

Lifetime Value Calculation:
Trial:   $5
Weekly:  $5 + $8 = $13
Monthly: $5 + $8 + ($15 × 6 months avg) = $103

Blended LTV: $40.60 per acquired user
```

## Break-Even Analysis

### Fixed Costs (Monthly)
- Domain & SSL: $2
- Database (Managed Postgres): $15
- Redis (Managed): $10
- Email Service (SendGrid): $15
- **Total Fixed:** $42/month

### Break-Even Point
```
Monthly Revenue Needed: $42 ÷ 0.33 (avg margin) = $127
Minimum Users: $127 ÷ $15 (avg plan) = 9 users
```

**Conclusion:** Need just 9 monthly users to break even.

## Scaling Milestones

| Users | Monthly Revenue | Monthly Profit | Annual Profit |
|------:|----------------:|---------------:|--------------:|
| 10    | $150            | $8             | $96           |
| 50    | $750            | $206           | $2,472        |
| 100   | $1,500          | $453           | $5,436        |
| 500   | $7,500          | $2,433         | $29,196       |
| 1,000 | $15,000         | $4,908         | $58,896       |
| 5,000 | $75,000         | $24,558        | $294,696      |

*Assumes 60/30/10 mix and 33% blended margin*
