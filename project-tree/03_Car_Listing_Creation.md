# 🚗 Car Listing Creation (Sell Workflow) Documentation
## نظام إنشاء إعلان السيارة (سير عمل البيع) - توثيق شامل

> **Last Updated:** January 23, 2026  
> **Version:** 0.4.0  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Sell Workflow Architecture](#sell-workflow-architecture)
3. [Workflow Steps](#workflow-steps)
4. [Multi-Collection System](#multi-collection-system)
5. [Image Upload System](#image-upload-system)
6. [Data Validation](#data-validation)
7. [Subscription Limits](#subscription-limits)
8. [Technical Implementation](#technical-implementation)

---

## 🎯 Overview

The Car Listing Creation system (Sell Workflow) is a comprehensive multi-step wizard that guides users through creating a car listing. It supports 6 vehicle types (passenger cars, SUVs, vans, motorcycles, trucks, buses) and includes features like auto-save, image optimization, AI description generation, and subscription limit validation.

### Key Features

- **Multi-Step Wizard** - 6-7 steps with progress tracking
- **Auto-Save** - Automatic draft saving
- **Image Optimization** - WebP conversion, compression
- **AI Description** - AI-powered description generation
- **Multi-Collection Support** - 6 vehicle collections
- **Subscription Validation** - Plan-based listing limits
- **Numeric ID System** - Privacy-first car IDs

---

## 🏗️ Sell Workflow Architecture

### File Structure

```
src/pages/04_car-selling/sell/
├── SellModalPage.tsx            # Entry point
├── MobileSubmissionPage.tsx     # Mobile submission
├── ContactPageUnified.tsx       # Contact step
├── Submission/
│   ├── useSubmissionFlow.ts    # Submission hook
│   └── SubmissionPage.tsx      # Submission UI
└── [69 files total]

src/components/SellWorkflow/
├── WizardOrchestrator.tsx       # Main wizard controller
├── SellVehicleModal.tsx         # Modal wrapper
├── Step1_BasicInfo.tsx          # Step 1: Vehicle type
├── Step2_TechnicalDetails.tsx   # Step 2: Vehicle data
├── Step3_Equipment.tsx          # Step 3: Equipment
├── Step4_Images.tsx            # Step 4: Images
├── Step5_Price.tsx             # Step 5: Pricing
├── Step6_Description.tsx       # Step 6: Description
├── Step6_5_AI_Description.tsx  # Step 6.5: AI Description
├── Step7_Publish.tsx            # Step 7: Publish
└── styles.ts                   # Shared styles
```

### Component Hierarchy

```
SellModalPage
└── WizardOrchestrator
    ├── StepIndicator (Progress bar)
    ├── Step1_BasicInfo
    ├── Step2_TechnicalDetails
    ├── Step3_Equipment
    ├── Step4_Images
    ├── Step5_Price
    ├── Step6_Description
    ├── Step6_5_AI_Description (optional)
    ├── Step7_Publish
    └── NavigationButtons (Previous/Next)
```

---

## 📝 Workflow Steps

### Step 1: Vehicle Type Selection

**Component:** `Step1_BasicInfo.tsx`

**Purpose:** Select vehicle type and basic category

**Options:**
- Passenger Car (Sedan, Hatchback, Coupe)
- SUV (SUV, Crossover)
- Van (Van, Minivan)
- Motorcycle
- Truck
- Bus

**Data Collected:**
```typescript
{
  vehicleType: 'passenger_car' | 'suv' | 'van' | 'motorcycle' | 'truck' | 'bus';
  category?: string; // Optional subcategory
}
```

**Validation:**
- Vehicle type is required
- Must be one of the 6 supported types

### Step 2: Vehicle Data

**Component:** `Step2_TechnicalDetails.tsx`

**Purpose:** Collect technical specifications

**Fields:**
- Make (Brand) - Required
- Model - Required
- Year - Required (1900-2026)
- Mileage (km) - Required
- Fuel Type - Required (Petrol, Diesel, Electric, Hybrid, LPG, CNG)
- Transmission - Required (Manual, Automatic, CVT)
- Engine Size (L) - Optional
- Power (HP) - Optional
- Color - Required
- Body Type - Optional
- Doors - Optional
- Seats - Optional

**Data Collected:**
```typescript
{
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  engineSize?: number;
  power?: number;
  color: string;
  bodyType?: string;
  doors?: number;
  seats?: number;
}
```

**Validation:**
- Make, Model, Year, Mileage, Fuel Type, Transmission, Color are required
- Year must be between 1900 and current year + 1
- Mileage must be >= 0

### Step 3: Equipment

**Component:** `Step3_Equipment.tsx`

**Purpose:** Select vehicle equipment and features

**Equipment Categories:**
- Safety (ABS, ESP, Airbags, etc.)
- Comfort (AC, Heated Seats, Navigation, etc.)
- Entertainment (Radio, Bluetooth, USB, etc.)
- Exterior (Alloy Wheels, Sunroof, etc.)
- Interior (Leather Seats, etc.)

**Data Collected:**
```typescript
{
  equipment: string[]; // Array of equipment IDs
  // Example: ['abs', 'esp', 'airbags', 'ac', 'navigation']
}
```

**UI:**
- Checkbox grid
- Category grouping
- Search/filter equipment

### Step 4: Images

**Component:** `Step4_Images.tsx`

**Purpose:** Upload and manage vehicle images

**Features:**
- Multiple image upload (drag & drop)
- Image preview
- Image reordering
- Image deletion
- Automatic compression (WebP)
- Max 20 images
- Min 1 image required

**Image Processing:**
```typescript
1. User selects images
2. Validate file type (jpg, png, webp)
3. Validate file size (max 10MB per image)
4. Compress images (browser-image-compression)
5. Convert to WebP format
6. Upload to Firebase Storage
7. Get download URLs
8. Store URLs in workflow state
```

**Data Collected:**
```typescript
{
  images: string[]; // Array of Firebase Storage URLs
  // Example: ['https://storage.../image1.webp', ...]
}
```

**Validation:**
- At least 1 image required
- Maximum 20 images
- Each image max 10MB
- Supported formats: jpg, jpeg, png, webp

### Step 5: Pricing

**Component:** `Step5_Price.tsx`

**Purpose:** Set vehicle price and pricing options

**Fields:**
- Price (EUR) - Required
- Price Negotiable - Checkbox
- Financing Available - Checkbox
- Trade-In Accepted - Checkbox

**Data Collected:**
```typescript
{
  price: number; // Price in EUR
  priceNegotiable: boolean;
  financingAvailable: boolean;
  tradeInAccepted: boolean;
}
```

**Validation:**
- Price is required
- Price must be > 0
- Price must be <= 1,000,000 EUR (sanity check)

**AI Pricing Suggestion:**
- Optional AI-powered price recommendation
- Based on make, model, year, mileage, condition

### Step 6: Description

**Component:** `Step6_Description.tsx`

**Purpose:** Write vehicle description

**Fields:**
- Description (Text) - Required, min 50 characters
- Condition - Required (Excellent, Very Good, Good, Fair, Poor)
- Accident History - Required (Yes/No)
- Service History - Optional
- Additional Notes - Optional

**Data Collected:**
```typescript
{
  description: string; // Min 50 characters
  condition: 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';
  accidentHistory: boolean;
  serviceHistory?: string;
  additionalNotes?: string;
}
```

**Validation:**
- Description required, min 50 characters
- Condition required
- Accident history required

### Step 6.5: AI Description (Optional)

**Component:** `Step6_5_AI_Description.tsx`

**Purpose:** Generate description using AI

**Features:**
- AI-powered description generation
- Multiple language support (Bulgarian/English)
- Customizable tone (Professional, Casual, Detailed)
- Regenerate option
- Edit generated description

**AI Service:**
- `ai-router.service.ts` - Routes to Gemini/DeepSeek/OpenAI
- `vehicle-description-generator.service.ts` - Description generation

**Usage:**
```typescript
const description = await AIRouter.generate({
  task: 'description',
  input: {
    make: 'BMW',
    model: '320d',
    year: 2020,
    mileage: 50000,
    condition: 'excellent',
    equipment: ['abs', 'esp', 'navigation']
  },
  options: { language: 'bg', tone: 'professional' }
});
```

### Step 7: Contact & Publish

**Component:** `ContactPageUnified.tsx` + `Step7_Publish.tsx`

**Purpose:** Set contact information and publish listing

**Contact Fields:**
- Phone Number - Required (validated +359 format)
- Email - Optional (uses user email if not provided)
- Location - Required (City, Region)
- Show Phone - Checkbox
- Show Email - Checkbox
- Preferred Contact Method - Radio (Phone, Email, Both)

**Data Collected:**
```typescript
{
  phoneNumber: string; // +359 format
  email?: string;
  location: {
    city: string;
    region: string;
    coordinates?: { lat: number; lng: number };
  };
  showPhone: boolean;
  showEmail: boolean;
  preferredContactMethod: 'phone' | 'email' | 'both';
}
```

**Publish Process:**
```typescript
1. Validate all required fields
2. Check subscription limits
3. Create car listing document
4. Upload images to Firebase Storage
5. Assign numeric car ID
6. Set status to 'active' or 'pending' (if moderation required)
7. Clear draft state
8. Redirect to car details page or my-listings
```

---

## 🗂️ Multi-Collection System

### Overview

The system uses 6 separate Firestore collections for different vehicle types to optimize queries and organization.

### Collections

1. **`passenger_cars`** - Sedans, Hatchbacks, Coupes
2. **`suvs`** - SUVs, Crossovers
3. **`vans`** - Vans, Minivans
4. **`motorcycles`** - Motorcycles
5. **`trucks`** - Trucks
6. **`buses`** - Buses

### Collection Resolution

**Service:** `SellWorkflowCollections`

**Location:** `src/services/sell-workflow-collections.service.ts`

**Usage:**
```typescript
import { SellWorkflowCollections } from '@/services/sell-workflow-collections.service';

const collectionName = SellWorkflowCollections
  .getCollectionNameForVehicleType(vehicleType);

// ✅ CORRECT: Dynamic collection resolution
await addDoc(collection(db, collectionName), carData);

// ❌ WRONG: Never hardcode collection names
await addDoc(collection(db, 'passenger_cars'), carData);
```

**Methods:**
```typescript
class SellWorkflowCollections {
  static getCollectionNameForVehicleType(vehicleType: string): string;
  static getAllCollections(): string[];
  static isValidVehicleType(vehicleType: string): boolean;
}
```

### Why Multi-Collection?

**Benefits:**
- Better query performance (smaller collections)
- Easier data management
- Type-specific indexes
- Clearer data organization
- Easier to scale

---

## 📸 Image Upload System

### Image Processing Pipeline

**Service:** `ImageUploadService`

**Location:** `src/services/image/image-upload.service.ts`

**Process:**
```typescript
1. User selects files
2. Validate file type (jpg, png, webp)
3. Validate file size (max 10MB)
4. Compress image (browser-image-compression)
5. Convert to WebP (if not already)
6. Generate unique filename
7. Upload to Firebase Storage: cars/{userId}/{carId}/{filename}.webp
8. Get download URL
9. Store URL in workflow state
```

### Image Optimization

**Library:** `browser-image-compression`

**Settings:**
```typescript
{
  maxSizeMB: 1,           // Max 1MB per image
  maxWidthOrHeight: 1920,  // Max dimension
  useWebWorker: true,     // Use web worker for performance
  fileType: 'image/webp'  // Convert to WebP
}
```

### Firebase Storage Structure

```
cars/
  {userId}/
    {carId}/
      image_0.webp
      image_1.webp
      ...
      image_19.webp
```

### Image Limits

- **Minimum:** 1 image required
- **Maximum:** 20 images per listing
- **File Size:** Max 10MB per image (compressed to ~1MB)
- **Formats:** jpg, jpeg, png, webp

---

## ✅ Data Validation

### Validation Service

**Location:** `src/services/sell-workflow-service.ts`

**Method:** `validateWorkflowData()`

**Validation Rules:**
```typescript
interface ValidationResult {
  isValid: boolean;
  criticalMissing: boolean;
  missingFields: string[];
  errors: ValidationError[];
}

// Required fields check
const requiredFields = [
  'vehicleType',
  'make',
  'model',
  'year',
  'mileage',
  'fuelType',
  'transmission',
  'color',
  'price',
  'description',
  'condition',
  'phoneNumber',
  'location'
];

// Field-specific validation
- year: 1900 <= year <= currentYear + 1
- mileage: >= 0
- price: > 0 && <= 1,000,000
- description: min 50 characters
- images: min 1, max 20
- phoneNumber: +359 format
```

### Validation Flow

```typescript
1. Validate required fields
2. Validate field formats (email, phone, etc.)
3. Validate ranges (year, mileage, price)
4. Validate file uploads (images)
5. Check subscription limits
6. Return validation result
```

---

## 💳 Subscription Limits

### Limit Checking

**Service:** `listing-limits.ts`

**Location:** `src/utils/listing-limits.ts`

**Methods:**
```typescript
// Check if user can add listing
export async function canAddListing(userId: string): Promise<boolean>

// Get remaining listings
export async function getRemainingListings(userId: string): Promise<number>

// Get listing limit for user's plan
export async function getListingLimit(userId: string): Promise<number>
```

### Plan Limits

| Plan | Listings Limit |
|------|----------------|
| Free | 3 active listings |
| Dealer | 30 listings/month |
| Company | Unlimited |

### Limit Validation Flow

```typescript
1. User attempts to create listing
2. Check current active listings count
3. Get user's plan limit
4. Compare: activeCount < limit
5. If limit reached:
   - Show error message
   - Suggest upgrade
   - Block listing creation
6. If within limit:
   - Allow listing creation
```

**Implementation:**
```typescript
// In SellWorkflowService.createCarListing()
const canAdd = await canAddListing(userId);
if (!canAdd) {
  const remaining = await getRemainingListings(userId);
  throw new Error(
    remaining === 0
      ? 'Listing limit reached. Please upgrade your plan.'
      : `You have ${remaining} listing slot(s) remaining.`
  );
}
```

---

## 🔧 Technical Implementation

### Workflow State Management

**Service:** `WorkflowPersistenceService`

**Location:** `src/services/sell-workflow/workflow-persistence.service.ts`

**Features:**
- Auto-save to localStorage
- Load draft on return
- Clear state after submission
- Image file persistence

**Methods:**
```typescript
class WorkflowPersistenceService {
  // Save workflow state
  static saveState(data: WorkflowData): void
  
  // Load workflow state
  static loadState(): WorkflowData | null
  
  // Clear workflow state
  static clearState(): void
  
  // Save images as files
  static async saveImagesAsFiles(files: File[]): Promise<void>
  
  // Get images as files
  static async getImagesAsFiles(): Promise<File[]>
}
```

### Sell Workflow Service

**Location:** `src/services/sell-workflow-service.ts`

**Main Method:**
```typescript
static async createCarListing(
  payload: any,
  userId: string,
  imageFiles: File[]
): Promise<{ carId: string; redirectUrl?: string; sellerNumericId?: number; carNumericId?: number }>
```

**Process:**
```typescript
1. Validate subscription limits
2. Upload images to Firebase Storage
3. Get collection name for vehicle type
4. Create car document structure
5. Assign numeric car ID
6. Save to Firestore collection
7. Sync to Algolia (if enabled)
8. Return car ID and redirect URL
```

### Numeric ID Assignment

**Service:** `numeric-car-system.service.ts`

**Process:**
```typescript
1. Get user's numeric ID
2. Get counter: counters/{uid}/cars
3. Increment counter
4. Assign car numeric ID
5. Store mapping
6. Return numeric IDs
```

**URL Format:**
```
/car/:sellerNumericId/:carNumericId
Example: /car/18/42
```

---

## 📊 Data Models

### Car Listing Structure

```typescript
interface CarListing {
  // Identifiers
  id: string;                    // Firestore document ID
  sellerId: string;               // Firebase UID
  sellerNumericId: number;        // Numeric ID for URL
  carNumericId: number;           // Numeric ID for URL
  
  // Vehicle Info
  vehicleType: string;            // Collection name
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color: string;
  
  // Pricing
  price: number;
  priceNegotiable: boolean;
  currency: 'EUR';
  
  // Description
  description: string;
  condition: string;
  accidentHistory: boolean;
  
  // Images
  images: string[];               // Firebase Storage URLs
  
  // Location
  location: {
    city: string;
    region: string;
    coordinates?: { lat: number; lng: number };
  };
  
  // Contact
  phoneNumber: string;
  email?: string;
  showPhone: boolean;
  showEmail: boolean;
  
  // Status
  status: 'active' | 'sold' | 'draft' | 'pending';
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}
```

---

## 🔍 Best Practices

### Workflow Design

1. **Auto-save frequently** - Save after each step
2. **Validate early** - Validate on step change, not just on submit
3. **Show progress** - Clear progress indicator
4. **Allow navigation** - Previous/Next buttons
5. **Handle errors gracefully** - Show user-friendly error messages

### Image Handling

1. **Compress before upload** - Reduce file size
2. **Use WebP format** - Better compression
3. **Validate file types** - Only allow images
4. **Limit image count** - Enforce max 20 images
5. **Show upload progress** - User feedback

### Data Validation

1. **Validate on client** - Fast feedback
2. **Validate on server** - Security
3. **Check subscription limits** - Before creating listing
4. **Sanitize user input** - Prevent XSS
5. **Validate file uploads** - Type and size

---

## 🔗 Related Documentation

- [User Authentication & Profile](./02_User_Authentication_and_Profile.md)
- [Subscriptions & Billing](./05_Subscriptions_and_Billing.md)
- [Search & Filtering](./07_Search_and_Filtering.md)
- [PROJECT_CONSTITUTION.md](../PROJECT_CONSTITUTION.md)

---

**Last Updated:** January 23, 2026  
**Maintained By:** Development Team  
**Status:** ✅ Production Ready
