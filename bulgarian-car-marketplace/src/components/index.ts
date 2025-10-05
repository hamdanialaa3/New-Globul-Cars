/**
 * 🎨 Globul Cars Components Export
 * تصدير جميع المكونات الموحدة
 */

// Design System
export { default as designSystem } from '../design-system';
export * from '../design-system';

// UI Components
export { default as Button } from './ui/Button';
export { default as Card } from './ui/Card';

// Animation Components
export { default as FadeInImage } from './animations/FadeInImage';
export { default as CarCard } from './animations/CarCard';

// Form Components
export { default as StepIndicator } from './forms/StepIndicator';

// Search Components
export { default as AdvancedSearch } from './search/AdvancedSearch';

// Car Elements
export { default as Speedometer } from './car-elements/Speedometer';
export { default as CarGallery } from './car-elements/CarGallery';
export { default as CarSpecs } from './car-elements/CarSpecs';

// Icons
export { default as CarIcons } from './icons/CarIcons';
export * from './icons/CarIcons';

// Re-export commonly used types
export type { ButtonProps } from './ui/Button';
export type { CardProps } from './ui/Card';
export type { CarCardProps } from './animations/CarCard';
export type { FadeInImageProps } from './animations/FadeInImage';
export type { StepIndicatorProps } from './forms/StepIndicator';
export type { AdvancedSearchProps } from './search/AdvancedSearch';
export type { SpeedometerProps } from './car-elements/Speedometer';
export type { CarGalleryProps } from './car-elements/CarGallery';
export type { CarSpecsProps } from './car-elements/CarSpecs';
