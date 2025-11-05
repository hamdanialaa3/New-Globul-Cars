# MyListingsPage Modular Structure

This directory contains the modular implementation of the MyListingsPage component, designed for managing user car listings with comprehensive filtering and statistics.

## Structure

```
MyListingsPage/
├── index.tsx              # Main component that composes all sections
├── types.ts               # Shared TypeScript interfaces
├── styles.ts              # Shared styled-components
├── StatsSection.tsx       # Platform statistics display
├── FiltersSection.tsx     # Filtering and sorting controls
├── ListingsGrid.tsx       # Grid display of user listings
└── README.md              # This documentation
```

## Components

### StatsSection
- Displays comprehensive statistics about user's listings
- Shows total listings, active listings, sold cars, views, and inquiries
- Uses StatCard components with hover effects and icons

### FiltersSection
- Provides filtering and sorting controls
- Status filter (all, active, sold, pending, inactive)
- Sort options (date, price, views, inquiries)
- Search functionality
- Responsive filter bar layout

### ListingsGrid
- Grid layout displaying user's car listings
- Each listing card shows image, title, price, stats, and actions
- Status badges with color coding
- Action buttons for view, edit, feature/unfeature, and delete
- Empty state and loading state handling

## Shared Resources

### types.ts
Contains TypeScript interfaces:
- `MyListing`: Complete listing data structure
- `MyListingsStats`: Statistics data for dashboard
- `MyListingsFilters`: Filter and sort configuration
- `MyListingsSection`: Generic section props

### styles.ts
Shared styled-components:
- `MyListingsContainer`: Main page container
- `SectionContainer`: Consistent section wrapper
- `SectionHeader`: Standardized section headers
- `StatsGrid` & `StatCard`: Statistics display components
- `FiltersBar`: Filter controls styling
- `ListingsGrid` & `ListingCard`: Listing display components
- `ActionButton`: Consistent button styling
- `EmptyState` & `LoadingState`: State handling components

## Features

### Statistics Dashboard
- Real-time statistics calculation
- Visual representation with icons and colors
- Hover effects for better UX

### Advanced Filtering
- Multi-criteria filtering (status, search)
- Flexible sorting options
- Real-time filter application

### Listing Management
- CRUD operations support
- Featured listing toggle
- Status management
- Performance tracking (views, inquiries)

### Responsive Design
- Mobile-friendly grid layouts
- Adaptive component sizing
- Touch-friendly buttons

## Performance Optimizations

- All sections are lazy-loaded with React.lazy()
- Suspense boundaries with loading fallbacks
- Efficient re-rendering with proper state management
- Component composition for better code splitting

## Usage

```tsx
import MyListingsPage from './pages/MyListingsPage';

// Use in routing
<Route path="/my-listings" element={<MyListingsPage />} />
```

## Dependencies

- React 18+
- styled-components
- react-router-dom
- Custom hooks: useTranslation
- Bulgarian localization support

## Data Flow

1. **Loading**: Component fetches user listings and calculates statistics
2. **Filtering**: User applies filters which update the displayed listings
3. **Actions**: User can edit, delete, or toggle featured status
4. **Updates**: Changes are reflected in real-time in the UI

## Mock Data

Currently uses mock data for demonstration. In production, this would be replaced with:
- Firebase Firestore queries for listings
- Real-time statistics calculation
- Actual CRUD operations
- Image upload and management