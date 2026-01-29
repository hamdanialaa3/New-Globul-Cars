/**
 * Landing Pages Routes Configuration
 * تكوين مسارات صفحات الهبوط
 * 
 * @since January 17, 2026
 */

import { RouteObject } from 'react-router-dom';

/**
 * Landing pages routes
 * المسارات تستخدم lazy loading لتقليل حجم البيئة الأولية
 */
export const landingRoutes: RouteObject[] = [
  {
    path: '/why-us',
    lazy: async () => {
      const module = await import('@/pages/10_landing/WhyUsPage');
      return { Component: module.default };
    },
  },
  {
    path: '/competitive-comparison',
    lazy: async () => {
      const module = await import('@/pages/10_landing/CompetitiveComparisonPage');
      return { Component: module.default };
    },
  },
];

export default landingRoutes;
