# ⭐ Reviews & Rating System Documentation
## نظام التقييمات والمراجعات - توثيق شامل لبناء الثقة

> **Last Updated:** January 23, 2026  
> **Version:** 0.5.0  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Review Submission System](#submission)
3. [Rating Display & Analytics](#analytics)
4. [Moderation Workflow](#moderation)
5. [Seller Response System](#responses)
6. [Trust Score Integration](#trust-score)
7. [Anti-Spam Protection](#anti-spam)

---

## 🎯 Overview

The Reviews & Rating System creates transparency and accountability in the marketplace by allowing buyers to rate sellers and share their experiences. It integrates deeply with the trust score system to reward excellent service and flag problematic sellers.

### Key Features
- **5-Star Rating System**: Industry-standard star ratings (1-5)
- **Verified Purchase Badges**: Highlight authentic transactions
- **Seller Responses**: Two-way communication
- **Helpful Voting**: Community-driven quality indicators
- **Auto-Moderation**: AI-assisted review screening
- **Trust Score Impact**: Ratings influence seller reputation

---

## 📝 Review Submission System {#submission}

Buyers can submit detailed reviews after interacting with sellers.

### Service Architecture
**Location:** `src/services/reviews/review-service.ts`

### Review Data Model
```typescript
interface Review {
  sellerId: string;
  buyerId: string;
  carId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;               // Min 10 chars
  comment: string;             // 50-1000 chars
  pros?: string[];             // Optional highlights
  cons?: string[];             // Optional negatives
  wouldRecommend: boolean;
  transactionType: 'purchase' | 'inquiry' | 'viewing';
  verifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  response?: {                 // Seller's reply
    text: string;
    createdAt: Date;
    userId: string;
  };
}
```

### Submission Flow

#### 1. Rate Limiting
**Protection:** 1 review per seller per user (permanent)
**Throttle:** Max 3 reviews per hour per user (spam prevention)

```typescript
const rateLimit = rateLimiter.checkRateLimit(
  buyerId,
  'review',
  RATE_LIMIT_CONFIGS.review
);
```

#### 2. Validation Rules
- **Title**: Minimum 10 characters
- **Comment**: 50-1000 characters
- **Rating**: Must be 1-5 (integer)
- **Duplicate Check**: User cannot review same seller twice

#### 3. Auto-Status Assignment
- **Pending**: Default state for all new reviews
- **Approved**: After admin/AI moderation
- **Rejected**: Spam, offensive, or irrelevant content

#### 4. Post-Submission Actions
```typescript
// Update seller statistics
await updateSellerStats(sellerId);

// Recalculate trust score (affects badges)
await trustScoreService.calculateTrustScore(sellerId);

// Send notification to seller
await notificationService.notifyNewReview(sellerId, reviewId);
```

---

## 📊 Rating Display & Analytics {#analytics}

Comprehensive statistics to help buyers make informed decisions.

### Service Layer
**Location:** `src/services/reviews/rating-service.ts`

### Rating Statistics

#### Seller Review Stats
```typescript
interface ReviewStats {
  totalReviews: number;
  averageRating: number;        // 0.0 - 5.0
  ratingDistribution: {
    5: number,  // Count of 5-star reviews
    4: number,
    3: number,
    2: number,
    1: number
  };
  recommendationRate: number;   // % who would recommend
  verifiedPurchaseRate: number; // % verified transactions
}
```

#### Rating Level Classification
```typescript
getRatingLevel(rating: number): RatingLevel

// Output:
{
  level: 'excellent' | 'good' | 'average' | 'poor' | 'very_poor',
  color: '#4caf50',  // Green for excellent
  label_bg: 'Отличен',
  label_en: 'Excellent'
}
```

### Display Helpers

#### Star Visualization
```typescript
getStarDisplay(4.7) 
// Returns: { full: 4, half: true, empty: 0 }
```

#### Summary Text Generation
```typescript
getRatingSummaryText(4.8, 127, 'bg')
// "Отличен • 4.8 ⭐ • 127 отзива"
```

---

## 🛡️ Moderation Workflow {#moderation}

Ensures review quality and prevents abuse.

### Moderation States
1. **Pending**: Awaiting admin review
2. **Approved**: Published and visible
3. **Rejected**: Hidden from public view

### Auto-Moderation Triggers
- **Profanity Filter**: Automatic flagging of offensive language
- **Spam Detection**: Generic/repeated content patterns
- **Length Validation**: Too short or suspiciously long
- **Link Detection**: External URLs in reviews

### Admin Dashboard Actions
**Location:** Admin Panel → Reviews Management

- View all pending reviews
- Bulk approve/reject
- Edit review content (with audit trail)
- Ban repeat offenders
- Reply on behalf of sellers (dealer support)

### Moderation Metadata
```typescript
{
  moderatedAt: Timestamp,
  moderatedBy: 'admin_user_id',
  moderationReason: 'Contains promotional links'
}
```

---

## 💬 Seller Response System {#responses}

Sellers can publicly respond to reviews, building trust through transparency.

### Response Features
- **One Response Per Review**: Sellers can edit but not delete
- **Character Limit**: Max 500 characters
- **Notification**: Buyer notified of seller response
- **Timestamp**: Visible "responded on" date

### Response Best Practices
Encouraged by the platform:
- Thank reviewers for feedback
- Address specific concerns
- Offer solutions for negative experiences
- Maintain professional tone

### Technical Implementation
```typescript
// Response stored as nested object in review document
reviews/{reviewId}/response = {
  text: "شكراً على تقييمك الإيجابي...",
  createdAt: Timestamp,
  userId: sellerId
}
```

---

## 🏆 Trust Score Integration {#trust-score}

Reviews directly impact seller trust scores and badges.

### Trust Impact Calculation
**Service:** `trustScoreService.calculateTrustScore(sellerId)`

```typescript
calculateTrustImpact(stats: RatingData): number {
  // Volume bonus: More reviews = more trust (max +10)
  const volumeBonus = Min(totalRatings * 0.5, 10);
  
  // Rating bonus: Higher rating = more trust (max +10)
  const ratingBonus = averageRating * 2;
  
  // Penalty for low ratings
  const lowRatingPenalty = (1-star + 2-star) * -0.5;
  
  return Max(0, Min(25, volumeBonus + ratingBonus + lowRatingPenalty));
}
```

### Badge Qualification
Automatically awarded based on review performance:

| Badge | Requirement | Trust Impact |
|-------|-------------|--------------|
| **5-Star Seller** | 4.8+ rating, 10+ reviews | +15 points |
| **Top Rated** | 4.5+ rating, 25+ reviews | +10 points |
| **Recommended** | 4.0+ rating, 5+ reviews | +5 points |

### Seller Dashboard Display
Sellers see:
- Current average rating (real-time)
- Rating distribution chart
- Recent reviews (approved only)
- Recommendation rate %
- Next badge milestone

---

## 🚫 Anti-Spam Protection {#anti-spam}

Multi-layered defenses against fake reviews.

### Rate Limiting
**Service:** `rate-limiting/rateLimiter.service.ts`

```typescript
RATE_LIMIT_CONFIGS.review = {
  windowMs: 3600000,  // 1 hour
  maxRequests: 3,     // Max 3 reviews per hour
  message: 'Too many reviews submitted'
}
```

### Duplicate Prevention
```typescript
private async hasUserReviewedSeller(buyerId, sellerId): boolean {
  // Query: WHERE buyerId == X AND sellerId == Y
  // Returns true if review exists
}
```

### Helpful/Not Helpful Voting
Community-driven quality indicator:
- Users can mark reviews as "Helpful" or "Not Helpful"
- High "Not Helpful" count triggers admin review
- Helpful count displayed prominently

```typescript
await markHelpful(reviewId, helpful: boolean);
// Increments helpful or notHelpful counter
```

### Report System
Users can report suspicious reviews:
- **Report Reasons**: Spam, Fake, Offensive, Off-topic
- **Report Threshold**: 3+ reports → Auto-flagged for moderation
- **Automatic Hiding**: >5 reports temporarily hides review

---

## 🔧 Technical Implementation

### Firestore Collections

#### reviews
```
reviews/{reviewId}
  - sellerId: string
  - buyerId: string
  - rating: number (1-5)
  - title: string
  - comment: string
  - verifiedPurchase: boolean
  - status: 'pending' | 'approved' | 'rejected'
  - helpful: number
  - notHelpful: number
  - reportCount: number
  - response: object | null
  - createdAt: Timestamp
```

#### users (seller stats)
```
users/{sellerId}/stats
  - totalReviews: number
  - averageRating: number
  - recommendationRate: number
```

### Real-Time Updates
- Firestore snapshot listeners for live review count
- Optimistic UI updates (pending → approved)
- Background sync for seller stats

---

## 🔗 Related Documentation

- [02_User_Authentication_and_Profile.md](./02_User_Authentication_and_Profile.md) - User verification
- [10_Performance_Monitoring_and_Audit.md](./10_Performance_Monitoring_and_Audit.md) - Review audit logging
- [08_Admin_Panel_and_Moderation.md](./08_Admin_Panel_and_Moderation.md) - Review moderation tools

---

**Last Updated:** January 23, 2026  
**Maintained By:** Trust & Safety Team  
**Status:** ✅ Active Documentation
