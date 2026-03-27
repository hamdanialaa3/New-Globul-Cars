import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from '../services/logger-service';

export interface PageHeroConfig {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  imageUrl: string;
  visible: boolean;
  align: 'left' | 'center' | 'right';
}

export interface PageSectionConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  backgroundColor: string;
  category?: string;
}

export interface PageBuilderConfig {
  pageId: string;
  pageName: string;
  hero: PageHeroConfig;
  sections: PageSectionConfig[];
}

// Default fallback configuration in case nothing exists in Firestore yet
const DEFAULT_CONFIG: Record<string, PageBuilderConfig> = {
  home: {
    pageId: 'home',
    pageName: 'الرئيسية (Home)',
    hero: {
      id: 'home-hero',
      title: 'KOLI ONE',
      subtitle: 'Premium Auto Marketplace',
      backgroundColor: 'default',
      textColor: 'default',
      imageUrl: '',
      visible: true,
      align: 'center',
    },
    sections: [
      { id: 'search-filter', label: 'Advanced Search Filter', visible: true, order: 1, backgroundColor: 'default' },
      { id: 'featured-cars', label: 'Featured Cars', visible: true, order: 2, backgroundColor: 'default' },
      { id: 'brands-carousel', label: 'Brands Carousel', visible: true, order: 3, backgroundColor: 'default' },
      { id: 'top-dealers', label: 'Top Dealerships', visible: true, order: 4, backgroundColor: 'default' },
      { id: 'latest-news', label: 'Latest News & Offers', visible: true, order: 5, backgroundColor: 'default' },
    ],
  },
  search: {
    pageId: 'search',
    pageName: 'مستكشف السيارات (Search)',
    hero: {
      id: 'search-hero',
      title: 'Find Your Dream Car',
      subtitle: 'Thousands of premium cars across Bulgaria',
      backgroundColor: '#0f172a',
      textColor: '#ffffff',
      imageUrl: '',
      visible: true,
      align: 'center',
    },
    sections: [
      { id: 'filters-sidebar', label: 'Filters Sidebar', visible: true, order: 1, backgroundColor: 'default' },
      { id: 'results-grid', label: 'Results Grid', visible: true, order: 2, backgroundColor: 'default' },
      { id: 'ai-recommendations', label: 'AI Recommended', visible: true, order: 3, backgroundColor: 'default' },
    ],
  },
  dealers: {
    pageId: 'dealers',
    pageName: 'قائمة المعارض (Dealerships)',
    hero: {
      id: 'dealers-hero',
      title: 'Certified Dealerships',
      subtitle: 'Buy from the most trusted dealers in Bulgaria',
      backgroundColor: '#172033',
      textColor: '#ffffff',
      imageUrl: '',
      visible: true,
      align: 'center',
    },
    sections: [
      { id: 'dealers-map', label: 'Interactive Map', visible: true, order: 1, backgroundColor: 'default' },
      { id: 'dealers-list', label: 'Dealerships Directory', visible: true, order: 2, backgroundColor: 'default' },
    ],
  },
  sell: {
    pageId: 'sell',
    pageName: 'بيع سيارتك (Sell Car)',
    hero: {
      id: 'sell-hero',
      title: 'Sell Your Car Instantly',
      subtitle: 'Reach millions of active buyers with Koli One AI Valuation',
      backgroundColor: '#0a0f1c',
      textColor: '#ffffff',
      imageUrl: '',
      visible: true,
      align: 'center',
    },
    sections: [
      { id: 'ai-valuation', label: 'AI Auto-Valuation', visible: true, order: 1, backgroundColor: 'default' },
      { id: 'upload-photos', label: 'Smart Photo Uploader', visible: true, order: 2, backgroundColor: 'default' },
      { id: 'car-details', label: 'Vehicle Specifications', visible: true, order: 3, backgroundColor: 'default' },
    ],
  },
};

/**
 * Hook to retrieve live dynamic page configuration for the visitor.
 * Any edits made in the Super Admin Page Builder instantly reflect here.
 * 
 * @param pageId The identifier of the page (e.g., 'home', 'search', 'dealers')
 */
export function usePageBuilder(pageId: string) {
  const [config, setConfig] = useState<PageBuilderConfig>(DEFAULT_CONFIG[pageId] || DEFAULT_CONFIG['home']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    // Read live doc from app_settings / page_builder
    const docRef = doc(db, 'app_settings', `page_builder_${pageId}`);
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (!isActive) return;

      if (snapshot.exists()) {
        const data = snapshot.data() as PageBuilderConfig;
        
        // Ensure sections are sorted by order
        const sortedSections = [...(data.sections || [])].sort((a, b) => a.order - b.order);
        
        setConfig({
          ...data,
          sections: sortedSections
        });
      } else {
        // If it doesn't exist yet, we stick to the default config
        // The admin panel will seed the database upon first save
        if (DEFAULT_CONFIG[pageId]) {
          setConfig(DEFAULT_CONFIG[pageId]);
        }
      }
      
      setLoading(false);
    }, (error) => {
      logger.error(`Error fetching page builder config for ${pageId}`, error as Error);
      setLoading(false); // fall back to defaults
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [pageId]);

  return { config, loading };
}
