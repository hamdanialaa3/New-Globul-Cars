# SimilarCars Component - Import Guide

## Overview
The `SimilarCarsWidget` component displays similar car listings on car detail pages.

## Correct Import Patterns

### From `src/pages/01_main-pages/components/` (Same Directory)
```typescript
import { SimilarCarsWidget } from './SimilarCarsWidget';
```

### From `src/pages/01_main-pages/` (Parent Directory)
```typescript
import { SimilarCarsWidget } from './components/SimilarCarsWidget';
```

### From `src/pages/01_main-pages/` using Re-Export
```typescript
// Option 1: Named import
import { SimilarCarsWidget } from '../../components/SimilarCars';

// Option 2: Default import
import SimilarCars from '../../components/SimilarCars';
```

### From Anywhere Using Path Alias (RECOMMENDED)
```typescript
import { SimilarCarsWidget } from '@/pages/01_main-pages/components/SimilarCarsWidget';
// OR via re-export
import { SimilarCarsWidget } from '@/components/SimilarCars';
```

## File Locations

- **Actual Component**: `src/pages/01_main-pages/components/SimilarCarsWidget.tsx`
- **Re-Export**: `src/components/SimilarCars.tsx`

## Common Mistakes to Avoid

❌ **Wrong - From subdirectories (e.g., `src/pages/01_main-pages/home/HomePage/`):**
```typescript
// This goes to src/pages/components (doesn't exist!)
import { SimilarCarsWidget } from '../../components/SimilarCarsWidget';
```

✅ **Correct - Use proper relative path or path alias:**
```typescript
// From home/HomePage/ - need 4 levels up
import { SimilarCarsWidget } from '../../../../components/SimilarCars';

// Better: Use path alias
import { SimilarCarsWidget } from '@/components/SimilarCars';
```

## Usage Example

```typescript
import React from 'react';
import { SimilarCarsWidget } from '@/components/SimilarCars';
import { CarListing } from '@/types/CarListing';

interface MyComponentProps {
  car: CarListing;
  language: 'bg' | 'en';
}

const MyComponent: React.FC<MyComponentProps> = ({ car, language }) => {
  return (
    <div>
      {/* Your content */}
      
      <SimilarCarsWidget currentCar={car} language={language} />
    </div>
  );
};

export default MyComponent;
```

## Why the Re-Export Exists

The `src/components/SimilarCars.tsx` re-export file exists to:
1. Provide a centralized import point
2. Support multiple import styles
3. Prevent module resolution errors
4. Maintain backward compatibility

## Troubleshooting

If you get a "Module not found" error:

1. **Check your relative path depth:**
   - From `src/pages/01_main-pages/`: use `../../components/SimilarCars`
   - From subdirectories: add more `../` as needed

2. **Use path aliases (recommended):**
   - `@/components/SimilarCars` works from anywhere

3. **Clear build cache:**
   ```bash
   npm run clean:all
   npm install
   npm run build
   ```

## Related Files

- `src/pages/01_main-pages/components/CarDetailsMobileDEStyle.tsx` - Example usage
- `src/pages/01_main-pages/components/CarSuggestionsList.tsx` - Alternative similar cars display
- `src/services/car/unified-car-queries.ts` - `getSimilarCars()` service method
