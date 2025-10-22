# القسم 5: Analytics & Insights Dashboard

## 5.1 Private Analytics

```typescript
interface PrivateAnalytics {
  listings: {
    total: number;
    active: number;
    sold: number;
    expired: number;
  };
  
  performance: {
    totalViews: number;
    totalInquiries: number;
    totalFavorites: number;
    conversionRate: number; // inquiries / views
  };
  
  perListing: {
    carId: string;
    views: number;
    inquiries: number;
    favorites: number;
    daysActive: number;
  }[];
  
  engagement: {
    avgResponseTime: number; // milliseconds
    responseRate: number; // 0-1
    messagesReceived: number;
    messagesSent: number;
  };
}
```

**Dashboard UI:**
```
┌─────────────────────────────────────────────┐
│ My Statistics                               │
├─────────────────────────────────────────────┤
│                                             │
│ [3] Active   [5] Total   [2] Sold          │
│                                             │
│ Performance This Month:                     │
│ Views:       850  [+12% vs last month]     │
│ Inquiries:   23   [+5%]                    │
│ Favorites:   15   [-3%]                    │
│                                             │
│ Top Performing Listing:                     │
│ BMW X5 2020 - 245 views, 12 inquiries      │
│                                             │
│ Response Rate: 87% [Good]                   │
│ Avg Response Time: 3.5 hours               │
└─────────────────────────────────────────────┘
```

## 5.2 Dealer Analytics

```typescript
interface DealerAnalytics {
  inventory: {
    total: number;
    active: number;
    pending: number;
    sold: number;
    totalValue: number; // EUR
    avgPrice: number;
    byMake: Record<string, number>;
    byYear: Record<string, number>;
  };
  
  sales: {
    thisMonth: number;
    revenue: number; // EUR
    avgSellingTime: number; // days
    conversionRate: number;
    bestSellingMake: string;
    seasonality: MonthlyData[];
  };
  
  leads: {
    total: number;
    hot: number; // responded <1h
    warm: number; // responded <24h
    cold: number; // >24h or no response
    converted: number;
    sources: {
      organic: number;
      featured: number;
      dealer_page: number;
      social: number;
    };
  };
  
  customers: {
    totalInquiries: number;
    uniqueVisitors: number;
    returningVisitors: number;
    avgSessionDuration: number;
    topCities: string[];
  };
  
  competition: {
    avgMarketPrice: Record<string, number>; // by make
    yourPosition: 'above' | 'market' | 'below';
    suggestions: string[];
  };
}
```

**Dashboard UI:**
```
┌─────────────────────────────────────────────────────────────┐
│ Dealer Dashboard                                [Oct 2025]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Quick Stats:                                                │
│ ┌─────────┬─────────┬─────────┬─────────┐                 │
│ │   42    │    5    │ €380K   │  18d    │                 │
│ │ Active  │  Sold   │ Value   │ Avg Sale│                 │
│ └─────────┴─────────┴─────────┴─────────┘                 │
│                                                             │
│ This Month:                                                 │
│ Revenue: €45,000  [+15% vs Sept]                           │
│ Sold: 5 cars      [+2 vs Sept]                             │
│ Conversion: 8.5%  [Above average 6.2%]                     │
│                                                             │
│ Top Performers:                                             │
│ 1. BMW 3 Series 2021 - 420 views → SOLD in 12 days        │
│ 2. Mercedes C-Class - 380 views, 18 inquiries             │
│ 3. Audi A4 - 295 views, 12 inquiries                      │
│                                                             │
│ Leads Breakdown:                                            │
│ Hot (45) | Warm (23) | Cold (12)                           │
│                                                             │
│ [View Full Reports] [Export Excel]                         │
└─────────────────────────────────────────────────────────────┘
```

## 5.3 Company Analytics

```typescript
interface CompanyAnalytics extends DealerAnalytics {
  fleet: {
    totalVehicles: number;
    byLocation: Record<string, number>;
    byDepartment: Record<string, number>;
    utilizationRate: number; // active vs total
    avgAge: number; // years
    maintenanceCosts: number;
  };
  
  team: {
    totalMembers: number;
    activeMembers: number;
    byRole: Record<string, number>;
    performance: {
      memberId: string;
      listingsAdded: number;
      sold: number;
      revenue: number;
    }[];
  };
  
  contracts: {
    active: number;
    pending: number;
    completed: number;
    totalValue: number;
    byType: Record<string, number>;
  };
  
  roi: {
    totalInvestment: number;
    totalRevenue: number;
    profitMargin: number;
    roi: number; // percentage
  };
}
```

**Dashboard UI:**
```
┌─────────────────────────────────────────────────────────────┐
│ Enterprise Command Center                      [Q4 2025]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Fleet Overview:                                             │
│ ┌──────────┬──────────┬──────────┬──────────┐             │
│ │   185    │   142    │  €2.8M   │   94%    │             │
│ │ Total    │ Active   │ Value    │ Utilized │             │
│ └──────────┴──────────┴──────────┴──────────┘             │
│                                                             │
│ Multi-Location Performance:                                 │
│ Sofia HQ:     78 vehicles | €45K revenue this month        │
│ Plovdiv:      52 vehicles | €28K revenue                   │
│ Varna:        55 vehicles | €32K revenue                   │
│                                                             │
│ Team Performance (Top 3):                                   │
│ 1. Ivan Petrov    - 12 sold | €105K revenue               │
│ 2. Maria Dimitrova- 8 sold  | €85K revenue                │
│ 3. Georgi Ivanov - 7 sold  | €72K revenue                 │
│                                                             │
│ ROI Analysis:                                               │
│ Investment: €850K | Revenue: €1.2M | Profit: 41%           │
│                                                             │
│ [Full Analytics] [Trends] [Export] [Settings] │
└─────────────────────────────────────────────────────────────┘
```
