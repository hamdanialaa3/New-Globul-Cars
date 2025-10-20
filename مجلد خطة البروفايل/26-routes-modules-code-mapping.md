# القسم 26: Routes, Modules, and Code Mapping (P1)

## 26.1 Complete Route Map

```typescript
EXISTING ROUTES (Preserved):
  / - HomePage
  /cars - CarsPage (search, filters)
  /car-details/:carId - CarDetailsPage
  /sell/inserat/:type/* - SellCarFlow
  /profile - ProfilePage
  /messages - MessagesPage
  /admin - AdminDashboard

NEW ROUTES (To be added):
  /verification - VerificationPage
  /billing - BillingPage
  /analytics - AnalyticsDashboard
  /dealer/:slug - DealerPublicPage
  /company/:slug - CompanyPublicPage
  /team - TeamManagement (company only)
```

## 26.2 Module Organization Map

(File structure with 300-line rule enforced; module paths; splitting plan for large files)
