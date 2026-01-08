# 🗓️ Subscription System - Phase 3 Roadmap

**Status:** Planning Phase  
**Target Start:** January 9, 2026  
**Estimated Duration:** 2-3 weeks  
**Priority:** High

---

## 📋 Overview

Phase 1 & 2 are complete (backend services + UI components). Phase 3 focuses on:
1. Backend API endpoints
2. Email notification system
3. Production deployment
4. Analytics & monitoring

---

## 🎯 Phase 3 Goals

- [ ] Complete backend API for payment processing
- [ ] Set up automated email notifications
- [ ] Deploy to production
- [ ] Monitor and optimize
- [ ] Collect user feedback

---

## 📅 Week-by-Week Breakdown

### Week 1: Backend API Implementation (Jan 9-15)

**Priority: Critical** 🔴

#### Day 1-2: Stripe Payment Intents API
- [ ] Create `createPromotionPaymentIntent` Cloud Function
  - **Location:** `functions/src/api/stripe/create-payment-intent.ts`
  - **Purpose:** Generate Stripe client secret for frontend
  - **Input:** userId, listingId, promotionType, amount
  - **Output:** clientSecret
  - **Security:** Verify user auth, validate amounts
  
- [ ] Test with Stripe test mode
  - Use test cards: `4242 4242 4242 4242`
  - Test success, decline, error cases
  
- [ ] Add error handling
  - Invalid user
  - Invalid listing
  - Invalid promotion type
  - Stripe API errors

**Success Criteria:**
- ✅ Payment intent created successfully
- ✅ Client secret returned to frontend
- ✅ Test cards work in development
- ✅ Proper error messages displayed

---

#### Day 3-4: Webhook Handlers Update
- [ ] Update `functions/src/stripe-webhooks.ts`
  - Already exists, needs enhancement
  - Add handlers for micro-transaction events
  
- [ ] Implement `payment_intent.succeeded` handler
  ```typescript
  // Apply promotion to listing
  await db.collection('listings').doc(listingId)
    .collection('promotions').add({
      type: promotionType,
      startsAt: now,
      expiresAt: calculateExpiry(promotionType),
      isActive: true
    });
  ```

- [ ] Implement `payment_intent.payment_failed` handler
  ```typescript
  // Log failure, notify user
  await db.collection('users').doc(userId)
    .collection('failed_payments').add({
      type: 'promotion',
      reason: error.message,
      timestamp: now
    });
  ```

- [ ] Test webhooks locally
  - Use `stripe listen --forward-to localhost:5001`
  - Trigger test events
  - Verify Firestore updates

**Success Criteria:**
- ✅ Webhooks receive events
- ✅ Promotions applied on success
- ✅ Failures logged properly
- ✅ No duplicate processing

---

#### Day 5: Scheduled Functions
- [ ] Create `expirePromotions` function (already defined in webhook file)
  - Run every 6 hours
  - Deactivate expired promotions
  - Update Algolia index
  
- [ ] Create `checkGracePeriods` function (already defined)
  - Run daily at 9 AM (Sofia timezone)
  - Send reminders at 7, 3, 1 days
  - Expire grace periods
  
- [ ] Test scheduled functions locally
  ```bash
  firebase functions:shell
  > checkGracePeriods()
  ```

**Success Criteria:**
- ✅ Functions run on schedule
- ✅ Expired promotions deactivated
- ✅ Grace period reminders sent
- ✅ No performance issues

---

### Week 2: Email Notification System (Jan 16-22)

**Priority: High** 🟠

#### Day 1-2: Email Service Setup
- [ ] Choose email provider
  - **Option A:** SendGrid (recommended)
  - **Option B:** Firebase Extensions (Email Trigger)
  - **Option C:** Custom SMTP
  
- [ ] Set up SendGrid account (if chosen)
  ```bash
  firebase functions:config:set sendgrid.api_key="SG.xxx"
  ```
  
- [ ] Create email templates
  - Grace period started (BG/EN)
  - 7-day reminder (BG/EN)
  - 3-day reminder (BG/EN)
  - 1-day reminder (BG/EN)
  - Promotion purchased (BG/EN)
  - Retention offer (BG/EN)

**Templates Structure:**
```html
<!-- grace-period-started-bg.html -->
<html>
  <body>
    <h1>⚠️ Внимание: Проблем с плащането</h1>
    <p>Здравейте {{userName}},</p>
    <p>Имахме проблем с обработката на вашето плащане...</p>
    <a href="{{updatePaymentUrl}}">Актуализирай метод на плащане</a>
  </body>
</html>
```

**Success Criteria:**
- ✅ Email service configured
- ✅ Templates created (BG/EN)
- ✅ Test emails sent successfully
- ✅ Links work correctly

---

#### Day 3-4: Email Trigger Functions
- [ ] Create `sendGracePeriodEmail` function
  ```typescript
  export const sendGracePeriodEmail = functions
    .firestore.document('users/{userId}')
    .onUpdate(async (change, context) => {
      const after = change.after.data();
      const before = change.before.data();
      
      // Check if grace period started
      if (after.subscription.gracePeriod.isActive && 
          !before.subscription.gracePeriod.isActive) {
        await sendEmail({
          to: after.email,
          template: 'grace-period-started',
          language: after.language || 'bg',
          data: { userName: after.displayName }
        });
      }
    });
  ```

- [ ] Create `sendPromotionConfirmationEmail`
  - Triggered when promotion purchased
  - Include promotion details
  - Show expiry date

- [ ] Create `sendRetentionOfferEmail`
  - Triggered at grace period milestones
  - Show available offers
  - Include CTA buttons

**Success Criteria:**
- ✅ Emails sent automatically
- ✅ Correct template used
- ✅ Multi-language works
- ✅ No duplicate emails

---

#### Day 5: Email Testing
- [ ] Test all email templates
  - Grace period emails
  - Promotion confirmation
  - Retention offers
  
- [ ] Test edge cases
  - User has no email
  - User language preference missing
  - Email service down
  
- [ ] Performance testing
  - Batch emails (100+ users)
  - Rate limiting
  - Delivery reports

**Success Criteria:**
- ✅ All templates render correctly
- ✅ Emails delivered within 5 minutes
- ✅ No errors in Cloud Functions logs
- ✅ Graceful fallback on failures

---

### Week 3: Production Deployment & Monitoring (Jan 23-29)

**Priority: Critical** 🔴

#### Day 1: Pre-Deployment Preparation
- [ ] Run full test suite
  ```bash
  npm test -- --coverage
  npm run type-check
  npm run build
  ```
  
- [ ] Review all documentation
  - Verify accuracy
  - Update if needed
  
- [ ] Backup production database
  ```bash
  firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)
  ```
  
- [ ] Notify team
  - Deployment window
  - Rollback plan
  - Monitoring schedule

**Success Criteria:**
- ✅ All tests passing
- ✅ Database backed up
- ✅ Team notified

---

#### Day 2: Firestore Rules Deployment
- [ ] Merge subscription rules
  ```bash
  cat firestore-rules-subscription-update.rules >> firestore.rules
  ```
  
- [ ] Test rules in Rules Playground
  - Free user: 4th listing blocked ✅
  - Dealer user: 31st listing blocked ✅
  - Promotion write: blocked for users ✅
  - Grace period write: blocked for users ✅
  
- [ ] Deploy rules
  ```bash
  firebase deploy --only firestore:rules
  ```
  
- [ ] Monitor logs
  ```bash
  firebase functions:log
  ```

**Success Criteria:**
- ✅ Rules deployed successfully
- ✅ No security violations
- ✅ Performance not impacted

---

#### Day 3: Cloud Functions Deployment
- [ ] Deploy all functions
  ```bash
  npm run deploy:subscription-system
  ```
  
- [ ] Verify functions deployed
  ```bash
  firebase functions:list
  ```
  
- [ ] Test webhook endpoint
  ```bash
  curl https://europe-west1-your-project.cloudfunctions.net/stripeWebhook
  ```
  
- [ ] Configure Stripe webhooks
  - Add production endpoint
  - Select events
  - Test webhook delivery

**Success Criteria:**
- ✅ All functions deployed
- ✅ Webhooks receiving events
- ✅ No errors in logs

---

#### Day 4: Frontend Deployment
- [ ] Deploy hosting
  ```bash
  firebase deploy --only hosting
  ```
  
- [ ] Verify site accessible
  - Check HTTPS
  - Test on mobile
  - Verify assets load
  
- [ ] Smoke tests
  - Login works
  - Browse listings
  - Open promotion modal
  - View grace period banner

**Success Criteria:**
- ✅ Site deployed and accessible
- ✅ No console errors
- ✅ All features work

---

#### Day 5: Post-Deployment Monitoring
- [ ] Run manual test suite (from deployment guide)
  - Test 1: Free user limit ✅
  - Test 2: Dealer user limit (30!) ✅
  - Test 3: Company unlimited ✅
  - Test 4: Promotion purchase ✅
  - Test 5: Grace period trigger ✅
  
- [ ] Monitor metrics
  - Error rates
  - Response times
  - User activity
  
- [ ] Check logs every hour
  ```bash
  firebase functions:log --only stripeWebhook
  ```
  
- [ ] User feedback
  - Monitor support tickets
  - Check social media
  - Direct user surveys

**Success Criteria:**
- ✅ All manual tests pass
- ✅ No critical errors
- ✅ Positive user feedback

---

## 📊 Success Metrics (Track for 30 Days)

### Revenue Metrics
- [ ] Micro-transaction revenue
  - Target: 1,650€/month
  - Track daily: VIP Badge, Top of Page, Instant Refresh sales
  
- [ ] Churn rate
  - Current: 20%
  - Target: 14% (30% reduction)
  - Track weekly
  
- [ ] Dealer upgrades
  - Current: ~100 dealers
  - Target: +20 upgrades (20% increase)
  - Track monthly

### Technical Metrics
- [ ] API response times
  - Payment intent creation: <500ms
  - Webhook processing: <1s
  
- [ ] Error rates
  - Payment failures: <5%
  - Email delivery: >95%
  
- [ ] Grace period conversions
  - Target: 30% retention
  - Track weekly

### User Experience Metrics
- [ ] Promotion purchases
  - Daily active promotions
  - Most popular product
  - Conversion rate from modal view
  
- [ ] Grace period effectiveness
  - How many users update payment
  - How many accept retention offers
  - How many downgrade vs cancel

---

## 🚧 Potential Blockers

| Blocker | Probability | Impact | Mitigation |
|---------|-------------|--------|------------|
| Stripe API issues | Low | High | Test thoroughly in sandbox |
| Email delivery delays | Medium | Medium | Use SendGrid (99.9% uptime) |
| Production database issues | Low | Critical | Full backup before deploy |
| User confusion | Medium | Medium | Clear UI messages, docs |
| Payment fraud | Low | High | Implement Stripe Radar |

---

## 🎯 Definition of Done (Phase 3)

Phase 3 is complete when:

- [x] Backend API endpoints deployed and tested
- [x] Email notifications working for all scenarios
- [x] Production deployment successful
- [x] All manual tests passing
- [x] No critical errors for 7 days
- [x] Monitoring dashboards set up
- [x] Documentation updated
- [x] Team trained on new features
- [x] Support team briefed
- [x] Marketing materials ready

---

## 🔄 Maintenance Plan (Post-Phase 3)

### Daily (First Week)
- Check error logs
- Monitor revenue metrics
- Review user feedback

### Weekly (First Month)
- Analyze conversion rates
- Review grace period effectiveness
- Optimize email templates
- A/B test pricing

### Monthly (Ongoing)
- Full metrics review
- Feature improvements
- User surveys
- Competitor analysis

---

## 📚 Documentation to Update

After Phase 3 completion, update:

- [ ] [SUBSCRIPTION_SYSTEM_COMPLETE_SUMMARY.md](SUBSCRIPTION_SYSTEM_COMPLETE_SUMMARY.md) - Mark Phase 3 complete
- [ ] [README.md](README.md) - Add new features section
- [ ] [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Link to all docs
- [ ] [.github/copilot-instructions.md](.github/copilot-instructions.md) - Update with Phase 3 info

---

## 🎉 Celebration Plan

When Phase 3 is complete:

1. **Team Meeting**: Share metrics and wins
2. **Case Study**: Document the journey
3. **Blog Post**: Announce new features
4. **Customer Email**: Thank users, explain benefits
5. **Internal Retro**: What went well, what to improve

---

**Last Updated:** January 8, 2026  
**Owner:** Globul Cars Engineering Team  
**Review Date:** After Phase 3 completion  
**Next Phase:** Phase 4 (Analytics & Optimization)
