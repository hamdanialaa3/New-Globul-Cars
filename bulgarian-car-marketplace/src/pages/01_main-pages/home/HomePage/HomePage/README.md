# HomePage Modular Structure

This directory contains the modular implementation of the HomePage component, broken down into smaller, maintainable sections.

## Structure

```
HomePage/
├── index.tsx              # Main component that composes all sections
├── types.ts               # Shared TypeScript interfaces
├── styles.ts              # Shared styled-components
├── HeroSection.tsx        # Hero section with title and CTA buttons
├── StatsSection.tsx       # Platform statistics section
├── LogoCollectionSection.tsx  # Logo collection showcase
├── ImageGallerySection.tsx    # Image gallery section
├── FeaturedCarsSection.tsx    # Featured cars display
├── FeaturesSection.tsx        # Platform features grid
└── README.md              # This documentation
```

## Components

### HeroSection
- Main hero banner with title, subtitle, and call-to-action buttons
- Includes language toggle functionality
- Responsive design with gradient background

### StatsSection
- Displays platform statistics (cars, users, deals)
- Uses SectionContainer wrapper for consistent styling
- Animated counters for engagement

### LogoCollectionSection
- Showcases complete logo collection
- Lazy loads CompleteLogoCollection component
- Includes navigation to brand gallery

### ImageGallerySection
- Displays image gallery with thumbnails
- Lazy loads ImageGallery component
- Configurable number of images

### FeaturedCarsSection
- Shows handpicked featured cars
- Lazy loads FeaturedCars component
- Navigation to full car listings

### FeaturesSection
- Grid layout of platform features
- Uses translation hooks for internationalization
- Hover effects and responsive cards

## Shared Resources

### types.ts
Contains TypeScript interfaces used across components:
- `HomePageStats`: Statistics data structure
- `HomePageFeature`: Feature item structure
- `HomePageSection`: Generic section props

### styles.ts
Shared styled-components:
- `HomeContainer`: Main page container
- `SectionContainer`: Consistent section wrapper
- `SectionHeader`: Standardized section headers
- `ViewAllButton`: Consistent navigation buttons

## Performance Optimizations

- All sections are lazy-loaded with React.lazy()
- Suspense boundaries with loading fallbacks
- Component composition for better code splitting
- Shared styles to reduce bundle size

## Usage

```tsx
import HomePage from './pages/HomePage';

// Use in routing
<Route path="/" element={<HomePage />} />
```

## Dependencies

- React 18+
- styled-components
- react-router-dom
- Custom hooks: useTranslation
- Components: CompleteLogoCollection, ImageGallery, FeaturedCars