# Payment System Migration: Stripe → Manual Bank Transfer
**Date:** January 16, 2026  
**Status:** ✅ COMPLETED  
**Impact:** CRITICAL - Payment processing system overhaul

---

## 📋 Migration Summary

### What Changed?
**FROM:** Stripe automated subscription billing  
**TO:** Manual bank transfer payments via iCard (Bulgaria) + Revolut (International)

### Why?
- Stripe overhead costs reduced
- Faster local transactions (BLINK support on iCard)
- Better control over subscription lifecycle
- Support for both local (Bulgaria) and international payments

---

## 🏦 New Payment System

### Supported Payment Methods

#### 1️⃣ **iCard (Bulgaria)**
```
Bank: iCard / myPOS
IBAN: BG98INTF40012039023344
BIC: INTFBGSF
Beneficiary: ALAA HAMID MOHAMMED SHAKER AL-HAMADANI
Processing: 1-2 hours
Features: BLINK instant transfers supported
```

#### 2️⃣ **Revolut (International)**
```
Bank: Revolut Bank UAB
IBAN: LT44 3250 0419 1285 4116
BIC: REVOLT21
RevTag: @hamdanialaa
Beneficiary: Alaa Al-Hamadani
Processing: Instant (up to 1 hour)
Features: International transfers, instant payment
```

### Current Pricing (Manual Bank Transfer)

| Plan     | Monthly  | Annual | Listings | Team Members |
|----------|----------|--------|----------|--------------|
| Free     | €0       | €0     | 3        | 0            |
| Dealer   | **€20.11** | **€193** | 30       | 3            |
| Company  | **€100.11** | **€961** | Unlimited | 10           |

---

## 📁 Modified Files

### Configuration Files
- ✅ `src/config/stripe-extension.config.ts` - Marked Stripe as DEPRECATED
- ✅ `src/config/bank-details.ts` - Complete payment configuration
- ✅ `src/types/payment.types.ts` - Payment type definitions

### Documentation Files
- ✅ `src/pages/legal/PrivacyPolicyPage.tsx` - Updated payment processors mention
- ✅ `src/pages/01_main-pages/help/HelpPage/index.tsx` - Updated payment methods FAQ
- ✅ `src/utils/seo/SchemaGenerator.ts` - Updated schema for payment acceptance
- ✅ `src/pages/ArchitectureDiagramPage.tsx` - Updated architecture diagram

### Admin Interface
- ✅ `src/pages/09_admin/manual-payments/AdminManualPaymentsDashboard.tsx` - Verify & manage manual payments

---

## 🔄 Migration Details

### What Was Disabled?
```typescript
// ❌ DISABLED IN stripe-extension.config.ts
STRIPE_PRICE_IDS          // Old Stripe Price IDs
STRIPE_PRODUCT_IDS        // Old Stripe Product IDs
STRIPE_COLLECTIONS        // Firestore extension collections
STRIPE_FUNCTIONS          // Cloud Functions for Stripe
getStripeRedirectUrls()   // Checkout success/cancel URLs
```

### What Was Enabled?
```typescript
// ✅ ACTIVE IN bank-details.ts
BANK_DETAILS              // iCard & Revolut account info
PAYMENT_METHODS           // Bank transfer, RevTag, WhatsApp
PAYMENT_INSTRUCTIONS      // Multi-language instructions
generatePaymentReference() // Reference number generator
```

---

## 📊 Pricing Changes Summary

### Before (Stripe)
```
Dealer:  €27.78/month → €278/year
Company: €137.88/month → €1288/year
```

### After (Manual Bank Transfer)
```
Dealer:  €20.11/month → €193/year (30% cheaper)
Company: €100.11/month → €961/year (27% cheaper)
```

---

## 🎯 Next Steps

### For Users
1. Users select subscription plan
2. Receive payment instructions with:
   - Bank details (iCard or Revolut)
   - Reference number (GLOBUL-SUB-{tier}-{timestamp})
   - Amount to transfer
3. Make bank transfer from their account
4. Optionally send proof via WhatsApp (for instant activation)
5. Admin verifies payment within 1-2 hours
6. Subscription activated

### For Admin
1. Go to: `/admin/manual-payments`
2. Review pending transactions
3. Verify bank transfers against reference numbers
4. Mark as verified when payment confirmed
5. System auto-activates subscription

### For Developers
1. ❌ Stop using Stripe functions
2. ✅ Use `bank-details.ts` for payment config
3. ✅ Use `payment.types.ts` for TypeScript types
4. ✅ Direct users to AdminManualPaymentsDashboard for verification

---

## 🔗 Related Files

```
# Payment Configuration
src/config/bank-details.ts
src/types/payment.types.ts

# Admin Interface
src/pages/09_admin/manual-payments/AdminManualPaymentsDashboard.tsx

# Legacy (Deprecated)
src/config/stripe-extension.config.ts  ⚠️ DO NOT USE
src/services/billing/subscription-service.ts ⚠️ LEGACY

# Documentation
src/pages/legal/PrivacyPolicyPage.tsx
src/pages/01_main-pages/help/HelpPage/index.tsx
```

---

## ⚠️ Important Notes

### Backwards Compatibility
- Stripe integration kept in code for backwards compatibility
- All old Price IDs marked as `DO NOT USE`
- Legacy collections prefixed with `_legacy`

### No Breaking Changes
- Existing subscriptions continue to work
- Users can upgrade via manual bank transfer
- Admin can migrate old Stripe users manually if needed

### Firestore Structure
```
manual_payments/
  ├── {transactionId}/
  │   ├── userId: string
  │   ├── amount: number
  │   ├── status: PaymentStatus
  │   ├── selectedBankAccount: 'revolut' | 'icard'
  │   ├── createdAt: timestamp
  │   └── verifiedAt: timestamp

user_subscriptions/
  ├── {userId}/
  │   ├── active: Subscription
  │   └── history: Subscription[]
```

---

## 📞 Support

**Payment Issues?** Contact:
- 📧 Email: `support@mobilebg.eu`
- 💬 WhatsApp: `+359 87 983 9671`
- 📍 Office: Bulgaria, Sofia, Tsar Simeon 77

---

## ✅ Verification Checklist

- [x] stripe-extension.config.ts updated
- [x] bank-details.ts verified
- [x] Privacy Policy updated
- [x] Help/FAQ updated
- [x] Admin dashboard functional
- [x] Architecture diagram updated
- [x] Documentation complete

**Status:** Ready for production ✅
