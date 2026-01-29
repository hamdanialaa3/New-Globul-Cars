# 📊 Analytics & Monitoring Guide (Jan 17, 2026)

**المراجعة:** 17 يناير 2026  
**الإصدار:** 2.1 (Full Firebase Integration)  
**الحالة:** ✅ إنتاج جاهز

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [خدمات التحليلات](#خدمات-التحليلات)
3. [مؤشرات الأداء](#مؤشرات-الأداء)
4. [المراقبة والتنبيهات](#المراقبة-والتنبيهات)
5. [لوحات المعلومات](#لوحات-المعلومات)
6. [أمثلة الاستخدام](#أمثلة-الاستخدام)

---

## نظرة عامة

نظام التحليلات الشامل يتتبع:

- **تحليلات المستخدم:** سلوك المستخدم والنشاط
- **تحليلات البيع:** عمليات البيع والعروض
- **تحليلات الأداء:** سرعة الموقع والموثوقية
- **تحليلات الإيرادات:** الدخل والرسوم والاشتراكات
- **تحليلات السوق:** اتجاهات السوق والطلب

### الخدمات

```
Analytics Services (6)
├── User Analytics Service
├── Sales Analytics Service
├── Performance Analytics Service
├── Revenue Analytics Service
├── Market Analytics Service
└── Custom Event Tracking

Monitoring Services (5)
├── Performance Monitor
├── Error Tracking
├── Uptime Monitor
├── Cache Monitor
└── API Rate Limiter

Reporting Services (4)
├── Dashboard Generator
├── Report Builder
├── Export Service
└── Alert Manager
```

---

## خدمات التحليلات

### 1. User Analytics Service

```typescript
import { UserAnalyticsService } from '@/services/analytics/user-analytics.service';

// Track user events
await UserAnalyticsService.trackEvent('user_signup', {
  userId: user.id,
  signupMethod: 'email',
  timestamp: new Date()
});

// Get user metrics
const metrics = await UserAnalyticsService.getUserMetrics(userId);
// {
//   totalLogins: 45,
//   lastActive: timestamp,
//   sessionDuration: 2340,
//   pagesViewed: 156,
//   clickCount: 2890
// }

// Get cohort analysis
const cohort = await UserAnalyticsService.getCohortAnalysis({
  cohortType: 'signup-date',
  dateRange: '2025-01-01 to 2026-01-17'
});
```

### 2. Sales Analytics Service

```typescript
import { SalesAnalyticsService } from '@/services/analytics/sales-analytics.service';

// Track sales events
await SalesAnalyticsService.trackEvent('car_sold', {
  carId: car.id,
  sellerId: seller.id,
  buyerId: buyer.id,
  price: 15000,
  daysOnMarket: 12,
  timestamp: new Date()
});

// Get sales metrics
const metrics = await SalesAnalyticsService.getSalesMetrics({
  dateRange: 'last-30-days',
  groupBy: 'daily'
});
// {
//   totalSales: 1250,
//   totalRevenue: 3750000,
//   averagePrice: 3000,
//   conversionRate: 2.3%
// }

// Analyze by category
const categoryAnalysis = await SalesAnalyticsService.analyzeByCategory({
  vehicleType: 'passenger_cars',
  timeframe: 'last-90-days'
});
```

### 3. Performance Analytics Service

```typescript
import { PerformanceAnalyticsService } from '@/services/analytics/performance-analytics.service';

// Get page performance
const pageMetrics = await PerformanceAnalyticsService.getPageMetrics('/listings');
// {
//   avgLoadTime: 1240,          // milliseconds
//   p95LoadTime: 2100,
//   errorRate: 0.01,
//   bounceRate: 0.15,
//   fps: 58,                    // frames per second
//   interactivity: 0.92         // score 0-1
// }

// Get API performance
const apiMetrics = await PerformanceAnalyticsService.getAPIMetrics('search');
// {
//   avgResponseTime: 450,
//   p99ResponseTime: 1200,
//   errorRate: 0.002,
//   throughput: 1450,            // requests/second
//   cacheHitRate: 0.82
// }

// Monitor Core Web Vitals
const vitals = await PerformanceAnalyticsService.getCoreWebVitals();
// {
//   LCP: 1800,                   // Largest Contentful Paint (ms)
//   FID: 120,                    // First Input Delay (ms)
//   CLS: 0.08,                   // Cumulative Layout Shift (0-1)
//   TTFB: 300,                   // Time to First Byte (ms)
//   INP: 150                     // Interaction to Next Paint (ms)
// }
```

### 4. Revenue Analytics Service

```typescript
import { RevenueAnalyticsService } from '@/services/analytics/revenue-analytics.service';

// Track revenue events
await RevenueAnalyticsService.trackRevenue('subscription', {
  userId: user.id,
  plan: 'dealer',
  amount: 20.11,
  currency: 'EUR',
  frequency: 'monthly'
});

// Get revenue metrics
const revenue = await RevenueAnalyticsService.getRevenueMetrics({
  dateRange: 'last-30-days'
});
// {
//   totalRevenue: 45230.50,
//   bySource: {
//     subscriptions: 38000,
//     listings: 5000,
//     premium_features: 2230.50
//   },
//   mrr: 45230.50,              // Monthly Recurring Revenue
//   arr: 542766,                // Annual Recurring Revenue
//   churnRate: 0.03
// }

// Get LTV (Lifetime Value)
const ltv = await RevenueAnalyticsService.getLifetimeValue(userId);
// { ltv: 1250, predictions: {...} }
```

### 5. Market Analytics Service

```typescript
import { MarketAnalyticsService } from '@/services/analytics/market-analytics.service';

// Analyze market trends
const trends = await MarketAnalyticsService.getMarketTrends({
  vehicleType: 'passenger_cars',
  region: 'Bulgaria',
  timeframe: 'last-90-days'
});
// {
//   demandTrend: 'increasing',
//   priceTrend: '+2.3%',
//   supplyTrend: 'stable',
//   competitiveLandscape: {...},
//   opportunities: [...]
// }

// Get demand forecast
const forecast = await MarketAnalyticsService.getDemandForecast({
  vehicleType: 'suvs',
  days: 30
});
```

---

## مؤشرات الأداء

### KPIs الرئيسية

| المؤشر | الهدف | الأداة |
|-------|------|-------|
| Daily Active Users (DAU) | +10% شهرياً | User Analytics |
| Conversion Rate | >2.5% | Sales Analytics |
| Average Session Duration | >5 min | User Analytics |
| Page Load Time | <2 sec | Performance Analytics |
| API Response Time | <500ms | Performance Analytics |
| Error Rate | <0.1% | Performance Monitor |
| Revenue (MRR) | +15% شهرياً | Revenue Analytics |
| Customer Retention | >85% | User Analytics |

### لوحة المعلومات

```typescript
interface AnalyticsDashboard {
  // User Metrics
  users: {
    total: number;
    daily: number;
    monthly: number;
    new: number;
    returnRate: number;
    activationRate: number;
  };

  // Sales Metrics
  sales: {
    total: number;
    byCategory: Record<string, number>;
    averagePrice: number;
    conversionRate: number;
    daysToSell: number;
  };

  // Performance Metrics
  performance: {
    pageLoadTime: number;
    apiResponseTime: number;
    errorRate: number;
    uptime: number;
    coreWebVitals: {
      LCP: number;
      FID: number;
      CLS: number;
    };
  };

  // Revenue Metrics
  revenue: {
    total: number;
    mrr: number;
    arr: number;
    bySource: Record<string, number>;
    ltv: number;
    churn: number;
  };

  // Market Metrics
  market: {
    demandTrend: string;
    priceTrend: number;
    supplyLevel: string;
    competitors: number;
  };
}
```

---

## المراقبة والتنبيهات

### Performance Monitoring

```typescript
import { PerformanceMonitor } from '@/services/performance-monitor.service';

// Monitor real-time metrics
const monitor = new PerformanceMonitor();

// Page load monitoring
monitor.onPageLoadTimeExceeds(2000, () => {
  console.warn('Page load time exceeded 2 seconds');
  alertAdmin('Slow page load detected');
});

// API monitoring
monitor.onAPIResponseTimeExceeds(500, () => {
  alertAdmin('Slow API response detected');
});

// Error monitoring
monitor.onErrorRateExceeds(0.01, () => {
  alertAdmin('Error rate exceeded 1%');
});

// Memory leak detection
monitor.onMemoryLeakDetected(() => {
  alertAdmin('Potential memory leak detected');
});
```

### Custom Alerts

```typescript
// Setup custom alerts
await analyticsService.setupAlert({
  name: 'High Error Rate',
  condition: 'errorRate > 0.05',
  frequency: 'once_per_hour',
  action: 'email',
  recipients: ['admin@example.com']
});

// Real-time anomaly detection
analyticsService.onAnomalyDetected((anomaly) => {
  console.log(`Anomaly detected: ${anomaly.metric}`);
  // Take action
});
```

---

## لوحات المعلومات

### Admin Dashboard

```typescript
// Get comprehensive admin dashboard
const adminDashboard = await analyticsService.getAdminDashboard({
  dateRange: 'last-30-days'
});

interface AdminDashboard {
  overview: {
    totalUsers: number;
    totalRevenue: number;
    totalListings: number;
    totalOffers: number;
  };
  
  topMetrics: [
    { name: 'DAU', value: 1250, change: '+5.2%' },
    { name: 'Conversion Rate', value: '2.3%', change: '-0.1%' },
    { name: 'Revenue', value: '$45,230', change: '+12.3%' },
    { name: 'Error Rate', value: '0.08%', change: '-0.02%' }
  ];

  charts: {
    userGrowth: ChartData;
    revenueBySource: ChartData;
    conversionFunnel: ChartData;
    performanceMetrics: ChartData;
  };

  alerts: Alert[];
  recentEvents: Event[];
}
```

### User Analytics Dashboard

```typescript
const userDashboard = await UserAnalyticsService.getUserDashboard(userId);

interface UserDashboard {
  profile: {
    userId: string;
    name: string;
    joinDate: date;
    lastActive: date;
  };

  activity: {
    totalLogins: number;
    lastLogin: date;
    sessionCount: number;
    avgSessionDuration: number;
    pagesViewed: number;
    actions: ActivityLog[];
  };

  behavior: {
    searchPatterns: SearchPattern[];
    favoriteBrands: string[];
    viewedCategories: string[];
    purchaseHistory: Purchase[];
  };

  engagement: {
    engagementScore: number;
    churnRisk: boolean;
    nextBestAction: string;
    recommendations: Recommendation[];
  };
}
```

---

## أمثلة الاستخدام

### مثال 1: تتبع حدث مبيعات

```typescript
import { analyticsService } from '@/services/analytics/analytics.service';

async function trackCarSold(sale: SaleData) {
  // Track the sale event
  await analyticsService.trackEvent('car_sold', {
    sellerId: sale.seller.id,
    buyerId: sale.buyer.id,
    carId: sale.car.id,
    price: sale.price,
    daysOnMarket: calculateDays(sale.listDate, sale.saleDate),
    category: sale.car.vehicleType,
    timestamp: new Date()
  });

  // Update revenue metrics
  await RevenueAnalyticsService.trackRevenue('listing_sale', {
    amount: sale.price * 0.03,  // Platform fee
    userId: sale.seller.id,
    currency: 'EUR'
  });

  // Trigger conversion tracking
  await analyticsService.trackConversion('sale_completed', {
    value: sale.price,
    category: 'sales'
  });
}
```

### مثال 2: عرض لوحة المعلومات

```typescript
import { AnalyticsDashboardComponent } from '@/components/admin/AnalyticsDashboard';

function AdminPage() {
  const [dashboardData, setDashboardData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      const data = await analyticsService.getAdminDashboard({
        dateRange: 'last-30-days'
      });
      setDashboardData(data);
      setLoading(false);
    };

    fetchDashboard();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <AnalyticsDashboard 
      data={dashboardData}
      onAlertClick={handleAlertClick}
      onExportClick={handleExport}
    />
  );
}
```

### مثال 3: تقارير مخصصة

```typescript
async function generateMonthlyReport() {
  const report = await analyticsService.generateReport({
    type: 'monthly',
    dateRange: 'last-month',
    metrics: [
      'user_growth',
      'revenue',
      'sales_volume',
      'performance',
      'market_trends'
    ]
  });

  // Send email
  await sendEmail({
    to: 'admin@example.com',
    subject: 'Monthly Analytics Report',
    body: report.html,
    attachments: [
      { filename: 'report.pdf', content: report.pdf },
      { filename: 'data.csv', content: report.csv }
    ]
  });
}
```

---

## البيانات المجمعة في Firestore

```
analytics/
├── events/{eventId}/
│   ├── type: string
│   ├── userId: string
│   ├── timestamp: timestamp
│   ├── data: object
│   └── metadata: object
│
├── daily_metrics/{date}/
│   ├── dau: number
│   ├── sales: number
│   ├── revenue: number
│   ├── errors: number
│   └── performance: object
│
├── user_analytics/{userId}/
│   ├── totalLogins: number
│   ├── lastActive: timestamp
│   ├── sessionDuration: number
│   ├── pagesViewed: number
│   └── actions: array
│
└── revenue_metrics/{date}/
    ├── total: number
    ├── bySource: object
    ├── mrr: number
    ├── arr: number
    └── churn: number
```

---

## الخلاصة

✅ **نظام تحليلات متكامل مع:**
- ✅ 6 خدمات تحليلات متخصصة
- ✅ مراقبة أداء فعلية
- ✅ لوحات معلومات شاملة
- ✅ تنبيهات ذكية
- ✅ تقارير مفصلة

**التاريخ:** 17 يناير 2026  
**الحالة:** ✅ إنتاج جاهز
