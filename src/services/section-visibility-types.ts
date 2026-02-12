/**
 * Homepage Section Visibility Types
 * Used by SectionVisibilityService, useSectionVisibility hook,
 * and SectionControlPanel.
 */

export interface HomepageSection {
  /** Unique key matching the Slot in HomePageComposer. NEVER change these. */
  key: string;
  /** Human-readable label shown in admin panel */
  label: string;
  /** Short description of what this section displays */
  description: string;
  /** true = visible on homepage, false = hidden */
  visible: boolean;
  /** Integer for display order (1-based). Lower = higher on page */
  order: number;
  /** Section category for grouping in admin panel */
  category: 'main' | 'floating' | 'conditional';
}

export interface HomepageSectionsConfig {
  sections: HomepageSection[];
  updatedAt: string; // ISO 8601 string
  updatedBy: string; // Admin email
}
