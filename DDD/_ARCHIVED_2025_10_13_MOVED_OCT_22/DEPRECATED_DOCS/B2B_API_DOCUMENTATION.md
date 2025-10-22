# Bulgarian Car Marketplace B2B API Documentation

## Overview
The Bulgarian Car Marketplace B2B API provides advanced analytics and AI-powered car valuation services for dealerships and automotive businesses operating in Bulgaria.

## Base URL
```
https://europe-west1-globul-cars.cloudfunctions.net
```

## Authentication
All API requests require Firebase Authentication. Include the Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## Subscription Tiers

### Basic (€49/month)
- 1,000 API requests per month
- 2 concurrent users
- Basic analytics access

### Premium (€149/month)
- 10,000 API requests per month
- 10 concurrent users
- Advanced analytics + AI car valuation

### Enterprise (€499/month)
- 100,000 API requests per month
- 50 concurrent users
- Custom analytics + API access + white-label options

## API Endpoints

### B2B Subscription Management

#### Create Subscription
```http
POST /createB2BSubscription
Content-Type: application/json
Authorization: Bearer <token>

{
  "tier": "premium",
  "billingInfo": {
    "companyName": "ABC Auto Ltd",
    "address": "Sofia, Bulgaria",
    "contactEmail": "billing@abc-auto.bg"
  },
  "paymentMethod": "card",
  "autoRenew": true
}
```

**Response:**
```json
{
  "success": true,
  "subscriptionId": "sub_123456",
  "status": "active",
  "startDate": "2024-01-15T00:00:00Z"
}
```

#### Get Subscription Status
```http
POST /getB2BSubscription
Authorization: Bearer <token>
```

**Response:**
```json
{
  "hasSubscription": true,
  "subscriptionId": "sub_123456",
  "tier": "premium",
  "status": "active",
  "isActive": true,
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-02-15T00:00:00Z",
  "autoRenew": true,
  "usage": {
    "requestsThisMonth": 1250
  },
  "limits": {
    "requests_per_month": 10000,
    "concurrent_users": 10
  }
}
```

#### Upgrade Subscription
```http
POST /upgradeB2BSubscription
Content-Type: application/json
Authorization: Bearer <token>

{
  "newTier": "enterprise"
}
```

#### Cancel Subscription
```http
POST /cancelB2BSubscription
Authorization: Bearer <token>
```

### AI Car Valuation

#### Get Car Valuation (Premium+ Required)
```http
POST /getCarValuation
Content-Type: application/json
Authorization: Bearer <token>

{
  "carId": "car_789",
  "carData": {
    "make": "BMW",
    "model": "X3",
    "year": 2020,
    "mileage": 45000,
    "condition": "excellent",
    "fuelType": "diesel",
    "transmission": "automatic",
    "engineSize": 2.0,
    "power": 190,
    "location": "София",
    "features": ["navigation", "leather_seats", "sunroof"]
  }
}
```

**Response:**
```json
{
  "estimatedPrice": 28500,
  "confidence": 87,
  "priceRange": {
    "min": 26500,
    "max": 30500
  },
  "marketComparison": {
    "averagePrice": 27500,
    "percentile": 75,
    "similarCars": 23
  },
  "factors": {
    "positive": [
      "Low mileage for age",
      "Excellent condition",
      "Popular model"
    ],
    "negative": [
      "Market saturation",
      "Slight price decline trend"
    ]
  },
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### B2B Analytics

#### Get Analytics Dashboard
```http
POST /getB2BAnalytics
Content-Type: application/json
Authorization: Bearer <token>

{
  "dateRange": "30d",
  "tier": "premium"
}
```

**Response:**
```json
{
  "totalListings": 15420,
  "activeListings": 12850,
  "totalUsers": 3250,
  "averagePrice": 18500,
  "priceTrend": 2.3,
  "popularMakes": [
    { "make": "BMW", "count": 1250, "avgPrice": 28500 },
    { "make": "Mercedes", "count": 980, "avgPrice": 32000 },
    { "make": "Audi", "count": 875, "avgPrice": 26500 }
  ],
  "locationStats": [
    { "location": "София", "count": 5200, "avgPrice": 22500 },
    { "location": "Пловдив", "count": 2800, "avgPrice": 19500 },
    { "location": "Варна", "count": 2100, "avgPrice": 18500 }
  ],
  "monthlyStats": [
    { "month": "2024-01", "listings": 1450, "avgPrice": 18200 },
    { "month": "2024-02", "listings": 1680, "avgPrice": 18700 }
  ],
  "marketInsights": {
    "topPerformingMakes": ["BMW", "Mercedes", "Audi"],
    "priceVolatility": 8.5,
    "marketGrowth": 3.2
  }
}
```

#### Export Analytics Data
```http
POST /exportB2BAnalytics
Content-Type: application/json
Authorization: Bearer <token>

{
  "dateRange": "90d",
  "format": "csv"
}
```

**Response:** CSV file download

## Rate Limiting
- Basic: 1,000 requests/month
- Premium: 10,000 requests/month
- Enterprise: 100,000 requests/month

## Error Codes
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Invalid or missing authentication
- `403`: Forbidden - Insufficient subscription tier
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server-side error

## Bulgarian Localization
- Currency: EUR (€)
- Language: Bulgarian (bg) with English (en) fallback
- Date Format: DD.MM.YYYY
- Number Format: 1 234,56 (comma decimal separator)

## Support
For API support and integration assistance:
- Email: api@globul-cars.bg
- Documentation: https://docs.globul-cars.bg
- Status Page: https://status.globul-cars.bg

## Changelog
- **v1.0.0** (2024-01-15): Initial B2B API release
  - Subscription management
  - AI car valuation
  - Analytics dashboard
  - Bulgarian market localization