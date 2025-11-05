# Advanced Search Page

## Overview
The Advanced Search Page is a comprehensive car search interface inspired by mobile.de, providing users with extensive filtering options for finding their ideal vehicle. This component has been refactored from a monolithic 1699-line file into a modular structure for better maintainability.

## Architecture
```
AdvancedSearchPage/
├── AdvancedSearchPage.tsx    # Main component (JSX structure)
├── hooks/
│   └── useAdvancedSearch.ts  # State management hook
├── styles.ts                 # Styled components
├── types.ts                  # TypeScript interfaces
├── index.ts                  # Module exports
└── README.md                 # This documentation
```

## Features

### Search Sections
- **Basic Data**: Make, model, vehicle type, seats, doors, condition, price, mileage
- **Technical Data**: Fuel type, power, engine specs, transmission, emissions
- **Exterior**: Colors, trailer options, parking sensors, cruise control
- **Interior**: Colors, materials, airbags, air conditioning, extras
- **Offer Details**: Seller type, ratings, special offers, warranties
- **Location**: Country, city, radius, delivery options
- **Search Description**: Keyword search in descriptions

### UI/UX Features
- Mobile.de inspired design system
- Collapsible sections for better organization
- Custom circular checkboxes
- Responsive grid layout
- Loading states and form validation
- Bulgarian localization support

## Usage

```tsx
import AdvancedSearchPage from './pages/AdvancedSearchPage';

// Use as a page component
<AdvancedSearchPage />
```

### Custom Hook Usage

```tsx
import { useAdvancedSearch } from './pages/AdvancedSearchPage';

const MyComponent = () => {
  const {
    searchData,
    isSearching,
    sectionsOpen,
    handleSearch,
    handleReset,
    toggleSection
  } = useAdvancedSearch();

  // Use hook data and functions
};
```

## State Management

The `useAdvancedSearch` hook provides:
- `searchData`: Current search form values
- `isSearching`: Loading state during search
- `sectionsOpen`: UI section collapse/expand state
- `handleSearch`: Form submission handler
- `handleReset`: Reset form to initial state
- `toggleSection`: Toggle section visibility
- `handleInputChange`: Generic input change handler
- `handleCheckboxToggle`: Array-based checkbox handler

## Styling

All styles are defined in `styles.ts` using styled-components with:
- Mobile.de color palette
- Consistent spacing and typography
- Responsive design patterns
- Custom form controls and animations

## Types

Key interfaces defined in `types.ts`:
- `SearchData`: Complete search form data structure
- `SectionState`: UI section visibility state
- `SectionName`: Union type for section keys

## Dependencies

- React hooks (useState)
- React Router (useNavigate)
- Styled Components
- Translation hook (useTranslation)

## Refactoring Benefits

### Before (1699 lines)
- Single monolithic file
- Mixed concerns (logic, styles, types)
- Difficult to maintain and test
- Poor reusability

### After (Modular structure)
- Separated concerns
- Reusable custom hook
- Type-safe interfaces
- Easier testing and maintenance
- Better code organization

## Testing

The refactored structure enables:
- Unit testing of individual hooks
- Component testing with mocked dependencies
- Style testing in isolation
- Type checking with TypeScript

## Future Enhancements

- Add search result integration
- Implement advanced filtering logic
- Add search history/presets
- Enhance mobile responsiveness
- Add accessibility improvements