# القسم 16: Technical Standards and Implementation Guidelines

## 16.1 Global Technical Constraints

```
Code Standards:
  - File size limit: 300 lines maximum
  - Split larger modules by responsibility
  - Reuse shared components (DRY principle)
  - No code duplication
  - Clear, concise comments in English

UI/UX Standards:
  - No emojis in production code or UI
  - Icons: SVG from svgrepo.com only
  - Languages: Bulgarian (primary) + English
  - Currency: EUR (display), cents (internal calculations)
  - All features must be production-ready

Documentation:
  - Technical specs in English
  - User-facing content in BG/EN
  - Remove emojis from all documents
```

## 16.2 Module Organization

```
Suggested Directory Structure:

src/
├── contexts/
│   └── ProfileTypeContext.tsx           (~100 lines)
│       - Provides: profileType, theme, permissions
│       - Switches between private/dealer/company
│
├── pages/
│   └── ProfilePage/
│       ├── index.tsx                    (~250 lines - main)
│       ├── components/
│       │   ├── ProfileModeSwitcher.tsx  (~150 lines)
│       │   ├── LEDProgressAvatar.tsx    (~150 lines)
│       │   ├── PrivateProfile.tsx       (~280 lines)
│       │   ├── DealerProfile.tsx        (~280 lines)
│       │   └── CompanyProfile.tsx       (~280 lines)
│       └── hooks/
│           ├── useProfileCompletion.ts  (~80 lines)
│           └── useProfileTheme.ts       (~60 lines)
│
├── features/
│   ├── verification/
│   │   ├── DocumentUpload.tsx           (~200 lines)
│   │   ├── VerificationService.ts       (~250 lines)
│   │   └── AdminApprovalQueue.tsx       (~280 lines)
│   │
│   ├── billing/
│   │   ├── SubscriptionPlans.tsx        (~250 lines)
│   │   ├── StripeCheckout.tsx           (~200 lines)
│   │   ├── InvoiceGenerator.ts          (~150 lines)
│   │   └── BillingService.ts            (~280 lines)
│   │
│   ├── reviews/
│   │   ├── ReviewsList.tsx              (~200 lines)
│   │   ├── ReviewComposer.tsx           (~150 lines)
│   │   ├── ReviewModeration.tsx         (~250 lines)
│   │   └── ReviewsService.ts            (~200 lines)
│   │
│   ├── analytics/
│   │   ├── PrivateDashboard.tsx         (~250 lines)
│   │   ├── DealerDashboard.tsx          (~280 lines)
│   │   ├── CompanyDashboard.tsx         (~280 lines)
│   │   └── AnalyticsService.ts          (~280 lines)
│   │
│   └── messaging/
│       ├── ConversationList.tsx         (~200 lines)
│       ├── ChatWindow.tsx               (~250 lines)
│       ├── QuickReplies.tsx             (~150 lines)
│       └── MessagingService.ts          (~280 lines)
│
└── utils/
    ├── profile-completion.ts            (~100 lines)
    ├── trust-score.ts                   (~150 lines)
    └── bulgarian-validation.ts          (~120 lines)

All modules respect 300-line limit
Each module has single responsibility
Shared components reused across features
```

## 16.3 Route Alignment with Existing System

```
Current Routes (preserved):
  /profile                                    - Main profile page
  /sell/inserat/:type/fahrzeugdaten/*        - Vehicle data
  /sell/inserat/:type/equipment              - Equipment
  /sell/inserat/:type/details/bilder         - Images
  /sell/inserat/:type/details/preis          - Pricing
  /sell/inserat/:type/contact                - Contact

New Routes (added):
  /dealer/:slug                              - Public dealer page
  /company/:slug                             - Public company page
  /verification                              - Document upload
  /billing                                   - Subscription management
  /analytics                                 - Analytics dashboard
  /team                                      - Team management (company)

Profile Type Context Injection:
  - ProfileTypeContext wraps app
  - Injects profileType, permissions, theme
  - Sell flow reads context to customize fields
  - URLs remain unchanged (backward compatible)
  - Query params can override (e.g., ?preview=dealer)
```
