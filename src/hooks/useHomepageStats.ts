/**
 * useHomepageStats hook
 * Provides real platform metrics from HomepageStatsService
 */

import { useState, useEffect } from 'react';
import {
  homepageStatsService,
  HomepageStats,
} from '@/services/homepage-stats-service';

interface UseHomepageStatsReturn {
  stats: HomepageStats | null;
  loading: boolean;
}

export function useHomepageStats(): UseHomepageStatsReturn {
  const [stats, setStats] = useState<HomepageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    homepageStatsService
      .getStats()
      .then(data => {
        if (isActive) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return { stats, loading };
}
