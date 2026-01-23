# 📊 B2B Features & Analytics Documentation
## ميزات الشركات والتحليلات المتقدمة - توثيق شامل

> **Last Updated:** January 23, 2026  
> **Version:** 0.5.0  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [B2B Analytics Portal](#analytics-portal)
3. [Dealer Dashboard](#dealer-dashboard)
4. [Seller Dashboard](#seller-dashboard)
5. [Market Intelligence](#market-intelligence)
6. [Team Management](#team-management)
7. [Subscription Tiers](#subscription-tiers)

---

## 🎯 Overview

B2B Features provide professional tools for dealerships, companies, and power sellers. Advanced analytics, market intelligence, and team management transform Koli One into an enterprise-grade platform.

### Key Features
- **Analytics Portal**: Market trends, price intelligence
- **Dealer Dashboard**: Inventory and performance tracking
- **Team Management**: Multi-user access control
- **API Access**: Enterprise data integration
- **White-Label**: Custom branding options

---

## 📈 B2B Analytics Portal {#analytics-portal}

Enterprise-grade market analytics for subscribers.

### Page: `src/pages/07_advanced-features/B2BAnalyticsPortal.tsx`

### Access Control
Requires active B2B subscription:
- **Basic**: Limited analytics
- **Premium**: Full market data
- **Enterprise**: Custom reports + API

### Available Analytics

#### 1. Price Analytics
- Average price by model
- Min/Max price ranges
- Sample size (listings analyzed)
- Price trends over time

#### 2. Market Trends
- Popular makes/models
- Total listings over time
- Price change percentage
- Demand indicators

#### 3. Regional Variations
- City-by-city price comparison
- Regional demand heatmaps
- Sofia vs other cities delta

#### 4. Sales Peak Hours
- Best time to list (hour-by-hour)
- Day-of-week analysis
- Seasonal patterns

### Cloud Functions Integration
```typescript
const getAveragePrice = httpsCallable(functions, 'getAveragePriceByModel');
const getTrends = httpsCallable(functions, 'getMarketTrends');
const getRegional = httpsCallable(functions, 'getRegionalPriceVariations');
const getSalesPeaks = httpsCallable(functions, 'getSalesPeakHours');
```

---

## 🏢 Dealer Dashboard {#dealer-dashboard}

Comprehensive management for dealership accounts.

### Page: `src/pages/09_dealer-company/DealerDashboardPage.tsx`

### Features
- **Inventory Overview**: All active listings
- **Performance Metrics**: Views, inquiries, conversions
- **Lead Management**: Incoming contact requests
- **Team Activity**: Staff performance tracking
- **Financial Summary**: Revenue, subscription status

### Dealer Registration
**Page:** `src/pages/09_dealer-company/DealerRegistrationPage.tsx`

Required documents:
- EIK (Bulgarian business number)
- VAT certificate (if applicable)
- Business address verification

---

## 👤 Seller Dashboard {#seller-dashboard}

For individual power sellers and small businesses.

### Page: `src/pages/09_dealer-company/SellerDashboardPage.tsx`

### Metrics Displayed
- Active listings count
- Total views (weekly/monthly)
- Inquiry conversion rate
- Average days to sell
- Revenue from completed sales

### Quick Actions
- Create new listing
- Boost existing listings
- Respond to inquiries
- Update profile

---

## 🧠 Market Intelligence {#market-intelligence}

Data-driven insights for competitive advantage.

### Price Intelligence
```typescript
interface PriceAnalytics {
  averagePrice: number;
  sampleSize: number;
  minPrice: number;
  maxPrice: number;
  currency: 'EUR';
}
```

### Competitive Analysis
- Compare your prices vs market average
- Identify underpriced/overpriced inventory
- Optimal pricing recommendations

### Demand Forecasting
- Predict peak selling seasons
- Model popularity trends
- Regional demand shifts

---

## 👥 Team Management {#team-management}

Multi-user access for dealership teams.

### Page: `src/pages/06_admin/TeamManagement/TeamManagementPage.tsx`

### Role Hierarchy
1. **Owner**: Full access, billing control
2. **Manager**: Create listings, manage team
3. **Agent**: Create listings, respond to inquiries
4. **Viewer**: Read-only access

### Features
- Invite team members via email
- Role assignment and revocation
- Activity logging per user
- Permission granularity

### Invitation Flow
**Page:** `src/pages/03_user-pages/AcceptInvitePage.tsx`

1. Owner sends invitation email
2. Invitee clicks link
3. Creates account or links existing
4. Assigned role automatically

---

## 💳 Subscription Tiers {#subscription-tiers}

B2B features unlocked by subscription level.

### Tiers
| Feature | Basic | Premium | Enterprise |
|---------|-------|---------|------------|
| Listings | 10 | 50 | Unlimited |
| Analytics | Basic | Full | Custom |
| Team Size | 2 | 10 | Unlimited |
| API Access | ❌ | ❌ | ✅ |
| White-Label | ❌ | ❌ | ✅ |
| Support | Email | Priority | Dedicated |

### Stripe Setup
**Page:** `src/pages/09_dealer-company/StripeSetupPage.tsx`

Dealers can:
- Connect Stripe for payments
- Set up payout schedules
- View transaction history

---

## 🔧 Technical Implementation

### Subscription Check
```typescript
const getSubscriptionStatus = httpsCallable(functions, 'getSubscriptionStatus');
const result = await getSubscriptionStatus();

interface SubscriptionStatus {
  hasSubscription: boolean;
  tier: 'basic' | 'premium' | 'enterprise' | null;
  status: 'active' | 'canceled' | 'past_due';
  expiresAt: Date;
  isActive: boolean;
}
```

### Currency Formatting
```typescript
formatCurrency(15000);
// "€15,000" in Bulgarian locale
```

---

## 🔗 Related Documentation

- [05_Subscriptions_and_Billing.md](./05_Subscriptions_and_Billing.md) - Payment processing
- [08_Admin_Panel_and_Moderation.md](./08_Admin_Panel_and_Moderation.md) - Admin controls
- [11_Legal_Compliance_and_Safety.md](./11_Legal_Compliance_and_Safety.md) - Business verification

---

**Last Updated:** January 23, 2026  
**Maintained By:** Enterprise Solutions Team  
**Status:** ✅ Active Documentation
