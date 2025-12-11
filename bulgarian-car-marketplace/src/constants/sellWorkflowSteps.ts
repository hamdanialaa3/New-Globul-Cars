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
      en: 'Vehicle Data'
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
    steps: ['vehicle-data'],
    labels: {
      bg: 'Данни за превозното средство',
      en: 'Vehicle Data'
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

