# 📚 Globul Cars - API Reference

## 🔧 Services API Documentation

---

## 1. SellWorkflowService

### `createCarListing(workflowData, userId, imageFiles?)`

Creates a new car listing in Firebase.

**Parameters:**
- `workflowData` (object): All workflow data from URL params
- `userId` (string): Firebase UID of the seller
- `imageFiles` (File[]?, optional): Array of image files to upload

**Returns:**
- `Promise<string>`: Car listing ID

**Throws:**
- Missing required fields
- Firebase errors
- Image upload errors

**Example:**
```typescript
const carId = await SellWorkflowService.createCarListing(
  {
    make: 'BMW',
    model: 'X5',
    year: '2020',
    price: '25000',
    sellerName: 'Ivan',
    sellerEmail: 'ivan@example.com',
    sellerPhone: '+359888123456',
    region: 'sofia-grad'
  },
  'user_firebase_uid_123',
  [imageFile1, imageFile2]
);

console.log('Car created:', carId); // "abc123def456"
```

---

### `uploadCarImages(carId, imageFiles)`

Uploads images to Firebase Storage.

**Parameters:**
- `carId` (string): ID of the car listing
- `imageFiles` (File[]): Array of image files

**Returns:**
- `Promise<string[]>`: Array of download URLs

**Example:**
```typescript
const urls = await SellWorkflowService.uploadCarImages(
  'abc123',
  [imageFile1, imageFile2]
);

// urls = ['https://firebasestorage...', 'https://firebasestorage...']
```

---

### `validateWorkflowData(workflowData)`

Validates if all required fields are present.

**Parameters:**
- `workflowData` (object): Workflow data to validate

**Returns:**
```typescript
{
  isValid: boolean;
  missingFields: string[]; // e.g., ['Make', 'Price']
}
```

**Example:**
```typescript
const validation = SellWorkflowService.validateWorkflowData({
  make: 'BMW',
  model: 'X5'
  // missing price, sellerName, etc.
});

if (!validation.isValid) {
  console.error('Missing:', validation.missingFields);
  // ['Price (Цена)', 'Seller Name (Име)', ...]
}
```

---

## 2. CityCarCountService

### `getCarsCountByCity(cityId)`

Get car count for a specific city (with caching).

**Parameters:**
- `cityId` (string): City ID (e.g., 'sofia-grad')

**Returns:**
- `Promise<number>`: Number of active cars in that city

**Cache:** 5 minutes

**Example:**
```typescript
const count = await CityCarCountService.getCarsCountByCity('sofia-grad');
console.log('Sofia has', count, 'cars');
```

---

### `getAllCityCounts()`

Get counts for all 28 Bulgarian cities in parallel.

**Returns:**
```typescript
Promise<Record<string, number>>
// { 'sofia-grad': 45, 'plovdiv': 32, 'varna': 28, ... }
```

**Performance:** Fetches all cities in parallel using `Promise.allSettled()`

**Example:**
```typescript
const counts = await CityCarCountService.getAllCityCounts();

Object.entries(counts).forEach(([cityId, count]) => {
  console.log(`${cityId}: ${count} cars`);
});
```

---

### `clearCacheForCity(cityId)`

Clear cache for a specific city.

**Parameters:**
- `cityId` (string): City to clear

**Returns:** void

**Use case:** After adding a new car in a city

**Example:**
```typescript
CityCarCountService.clearCacheForCity('sofia-grad');
```

---

### `clearAllCache()`

Clear all cached city counts.

**Returns:** void

**Use case:** Admin refreshes or bulk operations

**Example:**
```typescript
CityCarCountService.clearAllCache();
```

---

### `getTopCities(limit)`

Get cities with the most cars.

**Parameters:**
- `limit` (number, default: 10): Number of top cities

**Returns:**
```typescript
Promise<Array<{ cityId: string; count: number }>>
```

**Example:**
```typescript
const top5 = await CityCarCountService.getTopCities(5);
// [
//   { cityId: 'sofia-grad', count: 145 },
//   { cityId: 'plovdiv', count: 89 },
//   ...
// ]
```

---

## 3. ImageOptimizationService

### `optimizeImage(file, options)`

Optimize a single image.

**Parameters:**
- `file` (File): Image file to optimize
- `options` (object):
  ```typescript
  {
    maxWidth?: number;    // default: 1920
    maxHeight?: number;   // default: 1080
    quality?: number;     // default: 0.85 (0-1)
    format?: 'image/jpeg' | 'image/webp' | 'image/png';
  }
  ```

**Returns:**
- `Promise<File>`: Optimized image file

**Example:**
```typescript
const optimized = await ImageOptimizationService.optimizeImage(
  originalFile,
  { maxWidth: 1280, quality: 0.8 }
);

console.log('Size reduced:', 
  originalFile.size, '→', optimized.size
);
```

---

### `optimizeImages(files, options)`

Optimize multiple images in parallel.

**Parameters:**
- `files` (File[]): Array of image files
- `options` (object): Same as `optimizeImage`

**Returns:**
- `Promise<File[]>`: Array of optimized files

**Example:**
```typescript
const optimized = await ImageOptimizationService.optimizeImages(
  [file1, file2, file3],
  { quality: 0.85 }
);
```

---

### `validateImage(file)`

Validate a single image file.

**Parameters:**
- `file` (File): Image to validate

**Returns:**
```typescript
{
  isValid: boolean;
  error?: string; // e.g., "File must be an image"
}
```

**Validation Rules:**
- Must be image type
- Max 10MB size
- Supported formats: JPEG, PNG, WebP

---

### `imageToBase64(file)`

Convert image file to base64 string.

**Parameters:**
- `file` (File): Image file

**Returns:**
- `Promise<string>`: Base64-encoded string

**Use case:** Store in localStorage

**Example:**
```typescript
const base64 = await ImageOptimizationService.imageToBase64(file);
localStorage.setItem('myImage', base64);
```

---

### `base64ToFile(base64, filename)`

Convert base64 string back to File.

**Parameters:**
- `base64` (string): Base64-encoded image
- `filename` (string): Name for the file

**Returns:**
- `File`: File object

**Use case:** Restore from localStorage

**Example:**
```typescript
const file = ImageOptimizationService.base64ToFile(
  base64String,
  'car-image.jpg'
);
```

---

## 4. WorkflowPersistenceService

### `saveState(data, currentStep)`

Save workflow state to localStorage.

**Parameters:**
- `data` (Record<string, any>): All workflow data
- `currentStep` (string): Current step identifier

**Returns:** void

**Example:**
```typescript
WorkflowPersistenceService.saveState(
  { make: 'BMW', model: 'X5', year: '2020' },
  'vehicle-data'
);
```

---

### `loadState()`

Load workflow state from localStorage.

**Returns:**
```typescript
WorkflowState | null
// {
//   data: { ... },
//   images: ['base64...', 'base64...'],
//   lastUpdated: 1696176000000,
//   currentStep: 'pricing'
// }
```

**Expiry:** Returns null if > 24 hours old

---

### `clearState()`

Clear all workflow data and images.

**Returns:** void

**Example:**
```typescript
WorkflowPersistenceService.clearState();
```

---

### `saveImages(files)`

Save images as base64 to localStorage.

**Parameters:**
- `files` (File[]): Image files to save

**Returns:** `Promise<void>`

**Example:**
```typescript
await WorkflowPersistenceService.saveImages([file1, file2]);
```

---

### `getImagesAsFiles()`

Restore images from localStorage as File objects.

**Returns:**
- `File[]`: Array of restored image files

**Example:**
```typescript
const savedImages = WorkflowPersistenceService.getImagesAsFiles();
// Ready to upload to Firebase
```

---

## 5. carListingService

### `createListing(listing)`

Create a new car listing.

**Parameters:**
- `listing` (Omit<CarListing, 'id' | 'createdAt' | 'updatedAt'>)

**Returns:**
- `Promise<string>`: Listing ID

---

### `getListings(filters)`

Get all listings with optional filters.

**Parameters:**
- `filters` (CarListingFilters):
  ```typescript
  {
    vehicleType?: string;
    make?: string;
    model?: string;
    yearFrom?: number;
    yearTo?: number;
    priceFrom?: number;
    priceTo?: number;
    location?: string;
    region?: string;
    sortBy?: 'price' | 'year' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }
  ```

**Returns:**
```typescript
Promise<{
  listings: CarListing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}>
```

**Example:**
```typescript
const result = await carListingService.getListings({
  location: 'sofia-grad',
  priceFrom: 10000,
  priceTo: 30000,
  limit: 20
});

console.log('Found', result.listings.length, 'cars');
```

---

### `getListing(id)`

Get a single car listing by ID.

**Parameters:**
- `id` (string): Listing ID

**Returns:**
- `Promise<CarListing | null>`

---

### `updateListing(id, updates)`

Update an existing listing.

**Parameters:**
- `id` (string): Listing ID
- `updates` (Partial<CarListing>): Fields to update

**Returns:**
- `Promise<void>`

---

### `deleteListing(id)`

Delete a listing.

**Parameters:**
- `id` (string): Listing ID

**Returns:**
- `Promise<void>`

---

### `markAsSold(id)`

Mark a listing as sold.

**Parameters:**
- `id` (string): Listing ID

**Returns:**
- `Promise<void>`

**Effect:** Sets `status: 'sold'`, updates timestamp

---

### `publishListing(id)`

Publish a draft listing.

**Parameters:**
- `id` (string): Listing ID

**Returns:**
- `Promise<void>`

**Effect:** Sets `status: 'active'`, sets expiry (30 days)

---

### `getListingsBySeller(sellerEmail)`

Get all listings for a specific seller.

**Parameters:**
- `sellerEmail` (string): Seller's email

**Returns:**
- `Promise<CarListing[]>`

**Example:**
```typescript
const myListings = await carListingService.getListingsBySeller(
  'ivan@example.com'
);
```

---

## 📊 Types Reference

### CarListing

```typescript
interface CarListing {
  // Basic
  id?: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  
  // Equipment
  safetyEquipment?: string[];
  comfortEquipment?: string[];
  infotainmentEquipment?: string[];
  extras?: string[];
  
  // Images
  images?: File[] | string[];
  
  // Pricing
  price: number;
  currency: string;
  negotiable: boolean;
  financing: boolean;
  warranty: boolean;
  paymentMethods: string[];
  
  // Location
  city: string;
  region: string;
  postalCode?: string;
  
  // Seller
  sellerType: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  
  // System
  status: 'draft' | 'active' | 'sold' | 'expired' | 'deleted';
  views?: number;
  favorites?: number;
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
}
```

### BulgarianCity

```typescript
interface BulgarianCity {
  id: string;              // 'sofia-grad'
  nameEn: string;          // 'Sofia - City'
  nameBg: string;          // 'София - град'
  nameAr: string;          // 'صوفيا – المدينة'
  coordinates: {
    lat: number;           // 42.6977
    lng: number;           // 23.3219
  };
  isCapital?: boolean;     // true
  population?: number;     // 1241675
}
```

---

## 🔥 Firebase Integration

### Firestore Queries

#### Get cars by city
```typescript
const q = query(
  collection(db, 'cars'),
  where('location.cityId', '==', 'sofia-grad'),
  where('isActive', '==', true),
  where('isSold', '==', false),
  orderBy('createdAt', 'desc')
);

const snapshot = await getDocs(q);
```

#### Get car count (optimized)
```typescript
const q = query(
  collection(db, 'cars'),
  where('location.cityId', '==', 'sofia-grad'),
  where('isActive', '==', true),
  where('isSold', '==', false)
);

const snapshot = await getCountFromServer(q);
const count = snapshot.data().count;
```

#### Get user's listings
```typescript
const q = query(
  collection(db, 'cars'),
  where('sellerEmail', '==', 'user@example.com'),
  orderBy('createdAt', 'desc')
);

const snapshot = await getDocs(q);
```

### Storage Paths

#### Car images
```
cars/{carId}/images/{timestamp}_{index}_{filename}
```

**Example:**
```
cars/abc123/images/1696176000000_0_bmw-x5-front.jpg
cars/abc123/images/1696176000000_1_bmw-x5-interior.jpg
```

---

## 🗺️ Google Maps Integration

### Configuration

```typescript
import { useJsApiLoader } from '@react-google-maps/api';

const { isLoaded, loadError } = useJsApiLoader({
  id: 'google-map-script',
  googleMapsApiKey: 'AIzaSyDvULqHtzVQFWshx2fO755CMELUaMcm5_4'
});
```

### Marker Icons

```typescript
// Orange for selected city
'http://maps.google.com/mapfiles/ms/icons/orange-dot.png'

// Blue for active cities (with cars)
'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'

// Grey for inactive cities (no cars)
'http://maps.google.com/mapfiles/ms/icons/grey-dot.png'
```

### Map Options

```typescript
{
  center: { lat: 42.7339, lng: 25.4858 }, // Bulgaria center
  zoom: 7,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true
}
```

---

## 🔄 Workflow URL Structure

### Step 1: Vehicle Type
```
/sell/auto?vt=car
```

### Step 2: Seller Type
```
/sell/inserat/car/verkaeufertyp?vt=car&st=private
```

### Step 3: Vehicle Data
```
/sell/inserat/car/details/fahrzeugdaten
  ?vt=car
  &st=private
  &mk=BMW
  &md=X5
  &fm=Diesel
  &fy=2020
  &mi=45000
  &i=used
```

### Step 4-7: Equipment
```
/sell/inserat/car/ausstattung/sicherheit?...
/sell/inserat/car/ausstattung/komfort?...
/sell/inserat/car/ausstattung/infotainment?...
/sell/inserat/car/ausstattung/extras?...
```

### Step 8: Images
```
/sell/inserat/car/details/bilder?...&safety=ABS,ESP&comfort=AC
```

### Step 9: Pricing
```
/sell/inserat/car/details/preis?...&images=5
```

### Step 10: Contact
```
/sell/inserat/car/kontakt/name?...&price=25000&currency=EUR
/sell/inserat/car/kontakt/adresse?...&sellerName=Ivan
/sell/inserat/car/kontakt/telefonnummer?...&region=sofia-grad
```

---

## 🎨 Component Props

### CarCard

```typescript
interface CarCardProps {
  car: CarListing;
}

// Usage
<CarCard car={carObject} />
```

### AdvancedFilters

```typescript
interface AdvancedFiltersProps {
  initialFilters?: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

// Usage
<AdvancedFilters
  initialFilters={{ city: 'sofia-grad' }}
  onApplyFilters={(filters) => console.log(filters)}
  onClearFilters={() => console.log('cleared')}
/>
```

### SellWorkflowProgress

```typescript
interface SellWorkflowProgressProps {
  currentStep: string; // 'auto', 'verkaeufertyp', 'details', etc.
  language: 'bg' | 'en';
}

// Usage
<SellWorkflowProgress currentStep="bilder" language="bg" />
```

---

## 🔍 Query Examples

### Example 1: Get all BMW cars in Sofia

```typescript
const result = await carListingService.getListings({
  make: 'BMW',
  location: 'sofia-grad',
  limit: 50
});

const bmwCars = result.listings;
```

### Example 2: Get cars under 15000 EUR

```typescript
const result = await carListingService.getListings({
  priceTo: 15000,
  sortBy: 'price',
  sortOrder: 'asc'
});
```

### Example 3: Get diesel cars from 2018-2022

```typescript
const result = await carListingService.getListings({
  fuelType: 'Diesel',
  yearFrom: 2018,
  yearTo: 2022,
  sortBy: 'year',
  sortOrder: 'desc'
});
```

---

## 🛠️ Utility Functions

### Parse Equipment Arrays

```typescript
const parseArray = (str: string | undefined): string[] => {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(s => s);
};

// Example
parseArray('ABS,ESP,Airbags'); // ['ABS', 'ESP', 'Airbags']
```

### Format Price

```typescript
const formatPrice = (price: number, currency: string): string => {
  return `${price.toLocaleString('bg-BG')} ${currency}`;
};

// Example
formatPrice(25000, 'EUR'); // "25 000 EUR"
```

### Get City Name

```typescript
const getCityName = (cityId: string, language: 'bg' | 'en'): string => {
  const city = BULGARIAN_CITIES.find(c => c.id === cityId);
  return language === 'bg' ? city?.nameBg : city?.nameEn;
};

// Example
getCityName('sofia-grad', 'bg'); // "София - град"
```

---

## 🎯 Best Practices

### 1. Always Optimize Images
```typescript
// ❌ Bad
const urls = await uploadImages(carId, rawFiles);

// ✅ Good
const optimized = await ImageOptimizationService.optimizeImages(rawFiles);
const urls = await uploadImages(carId, optimized);
```

### 2. Use Cache for City Counts
```typescript
// ✅ Service handles caching automatically
const count = await CityCarCountService.getCarsCountByCity('sofia-grad');
// First call: Firebase query
// Subsequent calls (within 5 min): Cache
```

### 3. Validate Before Save
```typescript
const validation = SellWorkflowService.validateWorkflowData(data);

if (!validation.isValid) {
  alert(`Missing: ${validation.missingFields.join(', ')}`);
  return;
}

// Proceed with save
```

### 4. Handle Errors Gracefully
```typescript
try {
  const carId = await SellWorkflowService.createCarListing(data, userId);
  navigate('/my-listings');
} catch (error) {
  console.error('Error:', error);
  alert('Failed to create listing. Please try again.');
}
```

---

## 📝 Code Snippets

### Create a Car Listing (Complete Example)

```typescript
import SellWorkflowService from './services/sellWorkflowService';
import { useAuth } from './contexts/AuthContext';

const CreateCar = () => {
  const { user } = useAuth();

  const handleSubmit = async () => {
    try {
      const workflowData = {
        vehicleType: 'car',
        sellerType: 'private',
        make: 'BMW',
        model: 'X5',
        year: '2020',
        mileage: '45000',
        fuelType: 'Diesel',
        transmission: 'Automatic',
        price: '25000',
        currency: 'EUR',
        sellerName: 'Ivan Petrov',
        sellerEmail: user.email,
        sellerPhone: '+359888123456',
        region: 'sofia-grad',
        city: 'Sofia'
      };

      const imageFiles = [/* File objects */];

      const carId = await SellWorkflowService.createCarListing(
        workflowData,
        user.uid,
        imageFiles
      );

      console.log('✅ Car created:', carId);
      
      // Navigate to success page
      navigate('/my-listings');
      
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };
};
```

### Get City Cars Count

```typescript
import CityCarCountService from './services/cityCarCountService';

const CityCounts = () => {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const load = async () => {
      const allCounts = await CityCarCountService.getAllCityCounts();
      setCounts(allCounts);
    };
    load();
  }, []);

  return (
    <div>
      {Object.entries(counts).map(([city, count]) => (
        <div key={city}>
          {city}: {count} cars
        </div>
      ))}
    </div>
  );
};
```

---

*For more details, see SYSTEM_COMPLETE_OVERVIEW.md*


