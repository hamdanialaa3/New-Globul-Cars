# Billing Components Documentation

**Version:** 2.0.0 | **Created:** January 8, 2026

## 📦 Available Components

### 1. PromotionPurchaseModal

Modal component for purchasing one-time promotions (Micro-Transactions).

**Import:**
```typescript
import { PromotionPurchaseModal } from '@/components/billing';
```

**Usage:**
```typescript
<PromotionPurchaseModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  listingId="listing_123"
  userId="user_456"
  onSuccess={() => {
    toast.success('Promotion activated!');
    refreshListingData();
  }}
/>
```

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Called when modal is closed
- `listingId: string` - ID of the listing to promote
- `userId: string` - ID of the current user
- `onSuccess: () => void` - Called after successful purchase

**Features:**
- 3 promotion products (VIP Badge, Top of Page, Instant Refresh)
- Stripe payment integration with CardElement
- Multi-language support (BG/EN)
- Beautiful UI with hover effects
- Loading states and error handling

**Example Integration in Car Detail Page:**
```typescript
import { PromotionPurchaseModal } from '@/components/billing';
import { useState } from 'react';

function CarDetailPage({ carId }) {
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const { currentUser } = useAuth();
  
  return (
    <>
      <button onClick={() => setShowPromotionModal(true)}>
        🚀 Промоция
      </button>
      
      <PromotionPurchaseModal
        isOpen={showPromotionModal}
        onClose={() => setShowPromotionModal(false)}
        listingId={carId}
        userId={currentUser.uid}
        onSuccess={() => {
          toast.success('Обявата е промотирана успешно!');
          window.location.reload(); // Refresh to show promotion badge
        }}
      />
    </>
  );
}
```

---

### 2. GracePeriodBanner

Banner component that displays when user is in grace period (after payment failure).

**Import:**
```typescript
import { GracePeriodBanner } from '@/components/billing';
```

**Usage:**
```typescript
// In your Layout or App component
<GracePeriodBanner />
```

**Props:**
- None (automatically fetches user's grace period status)

**Features:**
- Auto-detects grace period status
- Shows countdown timer
- 3 severity levels (info, urgent, critical)
- Action buttons (Update Payment, View Offers)
- Retention offers modal integrated
- Multi-language support (BG/EN)
- Auto-refreshes every hour

**Example Integration in Layout:**
```typescript
import { GracePeriodBanner } from '@/components/billing';

function AppLayout({ children }) {
  return (
    <div>
      <Header />
      <GracePeriodBanner /> {/* Shows only when grace period is active */}
      <main>{children}</main>
      <Footer />
    </div>
  );
}
```

**Severity Levels:**
- **Info** (7+ days): Blue background, informational
- **Urgent** (3-6 days): Orange background, warning
- **Critical** (1-2 days): Red background, pulsing animation

---

## 🎨 Styling

Both components use Styled Components with:
- Responsive design (mobile-friendly)
- Smooth animations
- Theme-consistent colors
- Accessibility features

**Color Palette:**
- VIP Badge: `#FFD700` (Gold)
- Top of Page: `#FF6B6B` (Red)
- Instant Refresh: `#4ECDC4` (Teal)
- Primary Action: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

---

## 🔧 Setup Requirements

### 1. Install Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Environment Variables

Add to `.env`:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 3. Backend API Endpoint

Create `/api/create-promotion-payment-intent` endpoint in Cloud Functions:

```typescript
// functions/src/api/create-promotion-payment-intent.ts
import * as functions from 'firebase-functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const createPromotionPaymentIntent = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    const { userId, listingId, promotionType, amount } = data;
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
      currency: 'eur',
      metadata: {
        userId,
        listingId,
        promotionType,
      },
    });
    
    return { clientSecret: paymentIntent.client_secret };
  });
```

---

## 🧪 Testing

### Manual Testing Checklist

**PromotionPurchaseModal:**
- [ ] Modal opens/closes correctly
- [ ] All 3 products display with correct prices
- [ ] Product selection works
- [ ] Back button returns to product list
- [ ] Stripe CardElement renders
- [ ] Payment succeeds and promotion applies
- [ ] Error messages display correctly
- [ ] Multi-language switching works

**GracePeriodBanner:**
- [ ] Banner shows only when grace period is active
- [ ] Countdown displays correctly
- [ ] Severity levels change based on remaining days
- [ ] Update Payment button links to billing settings
- [ ] View Offers button opens retention offers modal
- [ ] Banner auto-hides when grace period ends

### Unit Tests

```bash
# Test billing components
npm test -- PromotionPurchaseModal --watchAll=false
npm test -- GracePeriodBanner --watchAll=false
```

---

## 📊 Analytics Integration

Track events for analytics:

```typescript
// In PromotionPurchaseModal
import { analytics } from '@/services/firebase-config';

// After successful purchase
logEvent(analytics, 'promotion_purchased', {
  promotion_type: selectedPromotion.type,
  amount: selectedPromotion.price,
  listing_id: listingId,
  user_id: userId,
});

// In GracePeriodBanner
// When retention offer is viewed
logEvent(analytics, 'retention_offer_viewed', {
  remaining_days: gracePeriod.remainingDays,
  user_id: userId,
});
```

---

## 🐛 Troubleshooting

### PromotionPurchaseModal Issues

**Problem:** Stripe CardElement not rendering
- **Solution:** Check `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set correctly
- Ensure `@stripe/stripe-js` is installed

**Problem:** Payment fails with "Missing metadata"
- **Solution:** Verify backend API is passing `userId`, `listingId`, `promotionType`

**Problem:** Modal doesn't close after success
- **Solution:** Ensure `onSuccess` callback calls `onClose()`

### GracePeriodBanner Issues

**Problem:** Banner doesn't show
- **Solution:** Check user has `subscription.gracePeriod.isActive = true` in Firestore

**Problem:** Countdown not updating
- **Solution:** Verify `useEffect` cleanup is not preventing updates

**Problem:** Retention offers not loading
- **Solution:** Check `getRetentionOffers()` service is implemented correctly

---

## 📚 Related Documentation

- [SUBSCRIPTION_SYSTEM_OVERHAUL_JAN7_2026.md](../../SUBSCRIPTION_SYSTEM_OVERHAUL_JAN7_2026.md) - Complete system documentation
- [SUBSCRIPTION_SYSTEM_QUICK_START.md](../../docs/SUBSCRIPTION_SYSTEM_QUICK_START.md) - Developer quick reference
- [SUBSCRIPTION_SYSTEM_DEPLOYMENT_GUIDE.md](../../docs/SUBSCRIPTION_SYSTEM_DEPLOYMENT_GUIDE.md) - Deployment instructions

---

## 🎯 Best Practices

1. **Always handle loading states** - Show spinners during async operations
2. **Validate Stripe responses** - Check `paymentIntent.status` before applying promotion
3. **Log all actions** - Use `logger.info()` for successful purchases, `logger.error()` for failures
4. **Test with Stripe test mode** - Use test cards before going live
5. **Handle edge cases** - Network failures, expired grace periods, etc.

---

**Last Updated:** January 8, 2026  
**Maintainer:** Globul Cars Dev Team  
**Status:** ✅ Production-ready
