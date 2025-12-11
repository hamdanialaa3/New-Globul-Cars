/**
 * Sell Workflow Step IDs
 * 
 * Represents the 8 unified steps in the car selling workflow:
 * 1. vehicle-selection: Choose vehicle type (car, motorcycle, truck, etc.)
 * 2. vehicle-data: Enter vehicle data + seller type (unified page)
 * 3. equipment: Select equipment/features (unified - all categories in one page)
 * 4. images: Upload vehicle images (up to 20 photos)
 * 5. pricing: Set price and financing options
 * 6. contact: Enter contact information (unified - all fields in one page)
 * 7. preview: Review all entered information
 * 8. publish: Final submission and publish
 */
export type SellWorkflowStepId =
  | 'vehicle-selection'
  | 'vehicle-data'
  | 'equipment'
  | 'images'
  | 'pricing'
  | 'contact'
  | 'preview'
  | 'publish';

export interface SellWorkflowStep {
  id: SellWorkflowStepId;
  labels: {
    bg: string;
    en: string;
  };
}

/**
 * All workflow steps in order
 * Note: Step 2 (vehicle-data) now includes seller type selection (previously separate)
 */
export const SELL_WORKFLOW_STEPS: SellWorkflowStep[] = [
  {
    id: 'vehicle-selection',
    labels: {
      bg: 'Избор на превозно средство',
      en: 'Vehicle Type'
    }
  },
  {
    id: 'vehicle-data',
    labels: {
      bg: 'Данни за превозното средство',
      en: 'Vehicle Data & Seller Type' // Updated to reflect unified nature
    }
  },
  {
    id: 'equipment',
    labels: {
      bg: 'Оборудване',
      en: 'Equipment'
    }
  },
  {
    id: 'images',
    labels: {
      bg: 'Снимки',
      en: 'Images'
    }
  },
  {
    id: 'pricing',
    labels: {
      bg: 'Цена',
      en: 'Pricing'
    }
  },
  {
    id: 'contact',
    labels: {
      bg: 'Контакт',
      en: 'Contact'
    }
  },
  {
    id: 'preview',
    labels: {
      bg: 'Преглед',
      en: 'Preview'
    }
  },
  {
    id: 'publish',
    labels: {
      bg: 'Публикуване',
      en: 'Publish'
    }
  }
];

export const SELL_WORKFLOW_STEP_ORDER = SELL_WORKFLOW_STEPS.map(step => step.id);

export interface SellWorkflowStepGroup {
  id: string;
  steps: SellWorkflowStepId[];
  labels: {
    bg: string;
    en: string;
  };
}

/**
 * Workflow Step Groups
 * Groups related steps together for UI display and progress tracking
 * 
 * Note: 'vehicle-data' step now includes seller type selection (previously separate)
 */
export const SELL_WORKFLOW_STEP_GROUPS: SellWorkflowStepGroup[] = [
  {
    id: 'vehicle-basics',
    steps: ['vehicle-selection'],
    labels: {
      bg: 'Тип превозно средство',
      en: 'Vehicle Type'
    }
  },
  {
    id: 'vehicle-data',
    steps: ['vehicle-data'], // Includes: vehicle data + seller type (unified)
    labels: {
      bg: 'Данни за превозното средство',
      en: 'Vehicle Data & Seller Type'
    }
  },
  {
    id: 'equipment',
    steps: ['equipment'],
    labels: {
      bg: 'Оборудване',
      en: 'Equipment'
    }
  },
  {
    id: 'media-pricing-contact',
    steps: ['images', 'pricing', 'contact'],
    labels: {
      bg: 'Снимки и контакт',
      en: 'Media & Contact'
    }
  },
  {
    id: 'review-publish',
    steps: ['preview', 'publish'],
    labels: {
      bg: 'Преглед и публикуване',
      en: 'Review & Publish'
    }
  }
];

