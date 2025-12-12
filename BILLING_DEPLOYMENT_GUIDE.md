✅ **BILLING SYSTEM DEPLOYMENT & TESTING GUIDE**

## Status: Ready for Production

All components have been built and are ready to deploy. This guide covers deployment and end-to-end testing.

---

## Part 1: Deploy Functions

**Step 1: Verify Firebase CLI**
```bash
firebase --version
```
If not installed:
```bash
npm install -g firebase-tools
firebase login
firebase use fire-new-globul
```

**Step 2: Set Runtime Config** (using your Stripe test keys)
```bash
cd "c:\Users\hamda\Desktop\New Globul Cars\functions"
firebase functions:config:set \
  stripe.secret_key="sk_test_51SaPwfKdXsQ61OHNPY1oPEckpq2LqwRoISxpZI9PSHrKoVaG2Ja1QoTi4ogsf130IVd4G2wcTb0HIn00kwmJQwNH000kJAhbcW" \
  stripe.publishable_key="pk_test_51SaPwfKdXsQ61OHNOBeuRfdLo9O96D4yt6zdGysqJU0Y5god1I4DvRTKL6fGKN11LyARehZNczfDkPS8H4CVROIE00KYQXqYbT" \
  stripe.webhook_secret="whsec_NcLnfuwKmRHPUIaOguR2mmJxnUJOY3BY" \
  app.frontend_url="https://fire-new-globul.web.app"
```

**Step 3: Verify Config Is Set**
```bash
firebase functions:config:get
```
Expected output should include:
```
stripe:
  publishable_key: pk_test_...
  secret_key: sk_test_...
  webhook_secret: whsec_...
app:
  frontend_url: https://fire-new-globul.web.app
```

**Step 4: Deploy Functions**
```bash
cd "c:\Users\hamda\Desktop\New Globul Cars\functions"
npm run deploy
```

This will deploy:
- `createCheckoutSession` - Creates Stripe checkout session
- `verifyCheckoutSession` - Verifies payment after checkout
- `cancelSubscription` - Schedules cancellation at period end
- `getSubscriptionStatus` (**NEW**) - Fetches current subscription status from Firestore/extension
- `stripeWebhook` - Handles Stripe webhook events

**Step 5: Verify Deployment**
```bash
firebase functions:list
```
Should see all 5 functions deployed to `europe-west1`.

---

## Part 2: Verify Webhook Delivery

**Check in Stripe Dashboard:**
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Globul Cars Subscription Payments" endpoint
3. Expand "Signing secret" and verify it matches `whsec_NcLnfuwKmRHPUIaOguR2mmJxnUJOY3BY`
4. Click "Latest events" tab
5. Confirm last webhook shows:
   - **Delivered** status (green checkmark)
   - Endpoint: `https://europe-west1-fire-new-globul.cloudfunctions.net/ext-firestore-stripe-payments-handleWebhookEvents`

---

## Part 3: Frontend Testing

**Deploy Frontend Build**
```bash
cd "c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace"
npm run build
firebase deploy --only hosting
```

**Test Scenarios:**

### Scenario 1: No Subscription → Plan Selection
1. Go to https://fire-new-globul.web.app/billing
2. Expected: "Choose a plan" section visible with Dealer/Company cards
3. Toggle between Monthly/Annual pricing

### Scenario 2: Start Checkout
1. Click "Choose plan" on Dealer or Company
2. Expected: Redirects to Stripe test checkout
3. Use test card: `4242 4242 4242 4242` | exp: `12/25` | CVC: `123`
4. Complete payment

### Scenario 3: Verify Subscription Status
1. After successful checkout, browser redirects to `/billing/success`
2. Go back to `/billing`
3. Expected: Status banner shows "✓ You have an active subscription"
   - Shows renewal date
   - Shows "Cancel at period end" button

### Scenario 4: Cancel Subscription
1. Click "Cancel at period end" button
2. Confirm in dialog
3. Expected: Toast shows "Cancellation scheduled at period end"
4. Button becomes disabled ("Cancellation pending")
5. Check Firestore: `users/{uid}.subscription.cancelAtPeriodEnd` = true

### Scenario 5: Payment Method Update (past_due)
1. Manually update subscription status to `past_due` in Firestore (testing)
2. Refresh `/billing`
3. Expected: "Update payment method" button appears
4. Click button → Opens Stripe Billing Portal
5. Can update card/payment info in portal

---

## Part 4: Database Integration Points

**Firestore Structure:**
```
users/{uid}/
  subscription: {
    id: "sub_xxx",           // Stripe subscription ID
    planTier: "dealer",      // or "company", "free"
    status: "active",        // "active", "past_due", "canceled", etc.
    currentPeriodStart: timestamp,
    currentPeriodEnd: timestamp,
    cancelAtPeriodEnd: boolean
  }

customers/{uid}/            // Firebase Stripe Payments extension
  stripeId: "cus_xxx"
  subscriptions/{subId}/
    id: "sub_xxx"
    status: "active"
    current_period_start: timestamp
    current_period_end: timestamp
    cancel_at_period_end: boolean
```

**How getSubscriptionStatus works:**
1. First, reads `users/{uid}.subscription` (our app's cache)
2. Falls back to `customers/{uid}/subscriptions/{subId}` (extension data)
3. Returns subscription info to frontend

---

## Part 5: Live Deployment (When Ready)

**Switch to Live Keys:**
1. Get live Stripe keys from: https://dashboard.stripe.com/apikeys
2. Create live Stripe Billing Portal webhook at: https://dashboard.stripe.com/webhooks
3. Update runtime config with live keys:
   ```bash
   firebase functions:config:set \
     stripe.secret_key="sk_live_..." \
     stripe.publishable_key="pk_live_..." \
     stripe.webhook_secret="whsec_live_..." \
     app.frontend_url="https://YOUR-LIVE-DOMAIN"
   ```
4. Redeploy functions: `npm run deploy`
5. Test with real credit cards

---

## Summary of Changes

**Backend:**
- ✅ `functions/src/subscriptions/getSubscriptionStatus.ts` (NEW) - Fetches subscription status
- ✅ `functions/src/subscriptions/config.ts` - Fixed TypeScript config getter
- ✅ `functions/src/subscriptions/index.ts` - Exports new function
- ✅ `functions/src/index.ts` - Main entry point exports function

**Frontend:**
- ✅ `src/services/billing/subscription-service.ts` - Added getSubscriptionStatus() + createBillingPortalLink()
- ✅ `src/pages/03_user-pages/billing/BillingPage.tsx` - Toast-based UX, status banner, manage section
- ✅ `src/locales/bg/billing.ts` & `src/locales/en/billing.ts` - Full translations

**Build Status:**
- ✅ React app: Compiled successfully
- ✅ Cloud Functions: Built successfully
- ✅ Ready to deploy

---

## Troubleshooting

**Problem: Webhook not delivering**
- Check Stripe Dashboard → Webhooks → endpoint details
- Verify `stripe.webhook_secret` in Firebase config matches Stripe's signing secret
- Check Cloud Functions logs: `firebase functions:log`

**Problem: Subscription status not fetching**
- Ensure `getSubscriptionStatus` is deployed: `firebase functions:list`
- Check browser console for callable errors
- Verify user is authenticated (test in /profile first)

**Problem: Billing portal link fails**
- Verify extension `firestore-stripe-payments` is installed
- Check `customers/{uid}/stripeId` exists in Firestore
- Manually create customer in Stripe if missing, then update Firestore

**Problem: Test checkout doesn't create subscription**
- Verify webhook is **delivering** (not retrying/failed)
- Check Cloud Functions logs for errors in webhook handler
- Ensure Stripe API version is compatible (currently set to `2025-11-17.clover`)

---

**Next Steps:**
1. Run deployment commands (firebase login, set config, deploy)
2. Test each scenario
3. Monitor webhook delivery in Stripe Dashboard
4. When ready, upgrade to live keys

**Questions or Issues:**
- Check Cloud Functions logs: `firebase functions:log`
- Check Firestore data: https://console.firebase.google.com → fire-new-globul → Firestore
- Check Stripe Dashboard webhooks for delivery status
