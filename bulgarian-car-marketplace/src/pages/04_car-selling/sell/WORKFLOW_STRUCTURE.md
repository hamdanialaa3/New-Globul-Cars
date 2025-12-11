# 🚗 Sell Workflow Structure

## Overview

The sell workflow consists of **8 unified steps** in a clean, sequential flow.

## Workflow Steps

| Step | ID | Route | Component | Description |
|------|----|----|-----------|-------------|
| 1 | `vehicle-selection` | `/sell/auto` | `VehicleStartPage` | Choose vehicle type (car, motorcycle, truck, etc.) |
| 2 | `vehicle-data` | `/sell/inserat/:vehicleType/data` | `VehicleDataPageUnified` | Enter vehicle data + **seller type** (unified) |
| 3 | `equipment` | `/sell/inserat/:vehicleType/equipment` | `UnifiedEquipmentPage` | Select equipment/features (all categories in one page) |
| 4 | `images` | `/sell/inserat/:vehicleType/images` | `ImagesPageUnified` | Upload vehicle images (up to 20 photos) |
| 5 | `pricing` | `/sell/inserat/:vehicleType/pricing` | `PricingPage` / `MobilePricingPage` | Set price and financing options |
| 6 | `contact` | `/sell/inserat/:vehicleType/contact` | `UnifiedContactPage` / `MobileContactPage` | Enter contact information (all fields unified) |
| 7 | `preview` | `/sell/inserat/:vehicleType/preview` | `DesktopPreviewPage` / `MobilePreviewPage` | Review all entered information |
| 8 | `publish` | `/sell/inserat/:vehicleType/submission` | `DesktopSubmissionPage` / `MobileSubmissionPage` | Final submission and publish |

## Key Features

### ✅ Unified Pages
- **Step 2**: Vehicle data + seller type selection in one page (previously separate)
- **Step 3**: All equipment categories (safety, comfort, infotainment, extras) in one unified page
- **Step 6**: All contact fields (name, address, phone) in one unified page

### 📱 Responsive Design
- Some pages have separate mobile variants (pricing, contact, preview, submission)
- Other pages are fully responsive (vehicle-start, vehicle-data, equipment, images)

### 🔄 Navigation
Use the `sellWorkflowNavigation.ts` helper for consistent navigation:

```typescript
import { useSellWorkflowNavigation } from '@/utils/sellWorkflowNavigation';

const nav = useSellWorkflowNavigation({
  vehicleType: 'car',
  searchParams: currentSearchParams
});

// Navigate to next step
const nextPath = nav.getNextStepPath('vehicle-data');
if (nextPath) navigate(nextPath);

// Navigate to previous step
const prevPath = nav.getPreviousStepPath('equipment');
if (prevPath) navigate(prevPath);
```

## Legacy Routes (Redirects)

For backward compatibility, old routes redirect to new unified routes:

- `/sell/inserat/:vehicleType/verkaeufertyp` → `/sell/inserat/:vehicleType/data`
- `/sell/inserat/:vehicleType/ausstattung/*` → `/sell/inserat/:vehicleType/equipment`
- `/sell/inserat/:vehicleType/kontakt/*` → `/sell/inserat/:vehicleType/contact`
- `/sell/inserat/:vehicleType/details/bilder` → `/sell/inserat/:vehicleType/images`
- `/sell/inserat/:vehicleType/details/preis` → `/sell/inserat/:vehicleType/pricing`

## Removed/Deprecated Pages

The following pages are no longer used and have been replaced by unified pages:

- ❌ `SellerTypePageNew` → Now part of `VehicleDataPageUnified`
- ❌ `SafetyPage`, `ComfortPage`, `InfotainmentPage`, `ExtrasPage` → Replaced by `UnifiedEquipmentPage`
- ❌ `EquipmentMainPage` → Replaced by `UnifiedEquipmentPage`
- ❌ `ContactNamePage`, `ContactAddressPage`, `ContactPhonePage` → Replaced by `UnifiedContactPage`

## File Structure

```
src/
├── pages/
│   └── 04_car-selling/
│       └── sell/
│           ├── VehicleStartPageNew.tsx         # Step 1
│           ├── VehicleDataPageUnified.tsx      # Step 2 (includes seller type)
│           ├── Equipment/
│           │   └── UnifiedEquipmentPage.tsx    # Step 3
│           ├── ImagesPageUnified.tsx           # Step 4
│           ├── Pricing/
│           │   ├── PricingPage.tsx             # Step 5 (Desktop)
│           │   └── MobilePricingPage.tsx       # Step 5 (Mobile)
│           ├── UnifiedContactPage.tsx          # Step 6 (Desktop)
│           ├── MobileContactPage.tsx           # Step 6 (Mobile)
│           ├── DesktopPreviewPage.tsx          # Step 7 (Desktop)
│           ├── MobilePreviewPage.tsx           # Step 7 (Mobile)
│           ├── DesktopSubmissionPage.tsx       # Step 8 (Desktop)
│           └── MobileSubmissionPage.tsx        # Step 8 (Mobile)
├── constants/
│   └── sellWorkflowSteps.ts                    # Step definitions & order
└── utils/
    └── sellWorkflowNavigation.ts               # Navigation helper utilities
```

## State Management

All workflow pages use:
- `useUnifiedWorkflow` hook for data management
- `WorkflowPersistenceService` for auto-save (localStorage + Firestore)
- `SellWorkflowStepStateService` for step completion tracking

## Last Updated
December 2025
