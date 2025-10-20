# القسم 4: نظام التقييمات والثقة (Trust System)

## 4.1 نظام التقييم (5 Stars)

```tsx
Interface ReviewSystem {
  sellerId: string;
  buyerId: string;
  carId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  review?: string; // optional text
  categories: {
    communication: 1-5;
    carCondition: 1-5;
    professionalism: 1-5;
    valueForMoney: 1-5;
  };
  verified: boolean; // only if transaction completed
  response?: string; // seller can respond once
  helpful: number; // count of "helpful" votes
  createdAt: Timestamp;
  status: 'pending' | 'approved' | 'rejected';
}
```

## 4.2 Trust Score Calculation (0-100)

```javascript
calculateTrustScore(seller) {
  let score = 0;
  
  // Base verifications
  if (seller.emailVerified) score += 10;
  if (seller.phoneVerified) score += 10;
  if (seller.idVerified) score += 20;
  if (seller.addressVerified) score += 10;
  
  // Business verifications (Dealer/Company)
  if (seller.businessVerified) score += 20;
  
  // Performance metrics
  const avgRating = seller.rating?.average || 0;
  score += (avgRating / 5) * 20; // max 20 points
  
  // Activity
  const yearsActive = getYearsActive(seller);
  score += Math.min(yearsActive * 2, 10); // max 10 points
  
  // Response metrics
  if (seller.stats?.responseRate > 0.8) score += 10;
  if (seller.stats?.avgResponseTime < 2 * 60 * 60 * 1000) score += 5; // <2h
  
  // Deal completion
  if (seller.stats?.completionRate > 0.7) score += 10;
  
  // Negative factors
  if (seller.disputes > 0) score -= seller.disputes * 5;
  if (seller.warnings > 0) score -= seller.warnings * 10;
  
  return Math.max(0, Math.min(100, score));
}
```

## 4.3 الشارات (Badges)

```
Verification Badges:
  • Email Verified
  • Phone Verified
  • ID Verified
  • Business Verified
  • Address Verified

Performance Badges:
  • Top Rated (trust score ≥90)
  • Elite Seller (trust score 95+)
  • Fast Responder (<2h avg)
  • Perfect Score (100/100)
  • Veteran (5+ years)

Achievement Badges:
  • 100 Cars Sold
  • 50 Cars Sold
  • 10 Cars Sold
  • Trending Dealer (most views this month)
  • Best Prices (competitive pricing)
```
