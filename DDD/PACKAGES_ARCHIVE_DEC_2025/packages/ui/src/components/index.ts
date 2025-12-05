// UI components exports
export { default as ProgressBar } from './ProgressBar';
export { LoadingSpinner } from './LoadingSpinner';
export { default as ErrorBoundary } from './ErrorBoundary';
export * from './Toast';

// HomePage components
export { default as TrustStrip } from './HomePage/TrustStrip';
export { default as LiveMomentumCounter } from './HomePage/LiveMomentumCounter';
export { default as AIAnalyticsTeaser } from './HomePage/AIAnalyticsTeaser';
export { default as SmartSellStrip } from './HomePage/SmartSellStrip';
export { default as DealerSpotlight } from './HomePage/DealerSpotlight';
export { default as LifeMomentsBrowse } from './HomePage/LifeMomentsBrowse';
export { default as LoyaltyBanner } from './HomePage/LoyaltyBanner';

// Bulgarian-specific components
export { default as DatePickerBulgarian } from './DatePickerBulgarian';
export { default as NumberInputBulgarian } from './NumberInputBulgarian';
export { default as SelectWithOther } from './SelectWithOther';

// Responsive Components
export { ResponsiveCard } from './ResponsiveCard';
export { ResponsiveButton } from './ResponsiveButton';

// Mobile Components (require mobile-design-system)
// Note: These components depend on mobile-design-system styles
// TODO: Move mobile-design-system to UI package
export { MobileInput, MobileTextarea } from './MobileInput';
export type { InputSize, InputType } from './MobileInput';
export { MobileButton, MobileButtonGroup } from './MobileButton';
export type { ButtonVariant as MobileButtonVariant, ButtonSize as MobileButtonSize } from './MobileButton';
export { default as Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

