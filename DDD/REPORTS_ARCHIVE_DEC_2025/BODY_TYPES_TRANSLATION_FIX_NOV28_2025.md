# Body Types Translation Fix - November 28, 2025

## Problem
Vehicle body type buttons (Седан, Джип/SUV, Хечбек, Купе, Комби, Кабрио, Пикап, Миниван) were hardcoded in Bulgarian and not changing when switching language to English.

## Solution Applied

### 1. Added `bodyTypes` section to translations.ts
**Bulgarian section:**
```typescript
bodyTypes: {
  allTypes: 'Всички типове',
  sedan: 'Седан',
  hatchback: 'Хечбек',
  suv: 'Джип / SUV',
  wagon: 'Комби',
  coupe: 'Купе',
  convertible: 'Кабрио',
  pickup: 'Пикап',
  minivan: 'Миниван'
}
```

**English section:**
```typescript
bodyTypes: {
  allTypes: 'All Types',
  sedan: 'Sedan',
  hatchback: 'Hatchback',
  suv: 'SUV / Jeep',
  wagon: 'Wagon',
  coupe: 'Coupe',
  convertible: 'Convertible',
  pickup: 'Pickup',
  minivan: 'Minivan'
}
```

### 2. Updated Components

#### VehicleTypeStep.tsx
- ✅ Added `useLanguage()` hook import
- ✅ Replaced hardcoded vehicle types with `t('sell.start.vehicleTypes.{type}.title')`
- ✅ Replaced hardcoded descriptions with `t('sell.start.vehicleTypes.{type}.desc')`
- ✅ Replaced info section text with translations

**Before:**
```typescript
title: 'Лека кола',
description: 'Леки автомобили за лично ползване'
```

**After:**
```typescript
title: t('sell.start.vehicleTypes.car.title'),
description: t('sell.start.vehicleTypes.car.desc')
```

#### BasicInfoSection.tsx
- ✅ Added `useLanguage()` hook import
- ✅ Replaced hardcoded dropdown options with `t('bodyTypes.{type}')`

**Before:**
```typescript
<option value="sedan">Седан</option>
<option value="suv">SUV</option>
```

**After:**
```typescript
<option value="sedan">{t('bodyTypes.sedan')}</option>
<option value="suv">{t('bodyTypes.suv')}</option>
```

#### SharedCarForm.tsx
- ✅ Updated dropdown options to use `t('bodyTypes.{type}', 'fallback')`

## Files Modified
1. `bulgarian-car-marketplace/src/locales/translations.ts`
   - Added `bodyTypes` section in both `bg` and `en`
   
2. `packages/ui/src/components/sell/VehicleTypeStep.tsx`
   - Added `useLanguage` import
   - Converted hardcoded vehicle types to use translations
   
3. `packages/ui/src/components/shared/SharedCarForm/BasicInfoSection.tsx`
   - Added `useLanguage` import
   - Converted dropdown options to use translations
   
4. `packages/ui/src/components/shared/SharedCarForm.tsx`
   - Updated dropdown options with translation function

## Verification
✅ Tested with Node.js:
- BG bodyTypes.sedan: "Седан" ✓
- BG bodyTypes.suv: "Джип / SUV" ✓
- EN bodyTypes.sedan: "Sedan" ✓
- EN bodyTypes.suv: "SUV / Jeep" ✓

## Testing Instructions
1. Open http://localhost:3000
2. Navigate to sell workflow (`/sell`)
3. Switch language to English
4. Verify vehicle type buttons show English text:
   - "Passenger Car" (not "Лека кола")
   - "SUV/Jeep" (not "Джип/SUV")
   - "Van" (not "Ван")
5. Check dropdown menus show translated options
6. Switch back to Bulgarian - verify Bulgarian text appears

## Related
- Previous fix: `ENGLISH_TRANSLATION_FIX_NOV28_2025.md`
- Translation system: `src/contexts/LanguageContext.tsx`
