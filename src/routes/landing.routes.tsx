/**
 * Landing Pages Routes
 * صفحات الهبوط
 * 
 * Routes:
 * - /why-us - Value proposition page
 * - /competitive-comparison - Market comparison
 * - /launch-offer - First listing free campaign
 * 
 * @since January 17, 2026
 */

import React from 'react';
import { RouteObject } from 'react-router-dom';
import { WhyUsPage } from './WhyUsPage';

export const landingRoutes: RouteObject[] = [
  {
    path: 'why-us',
    element: <WhyUsPage />,
    handle: {
      title: 'Why Us - Globul Cars',
      breadcrumb: 'Why Us',
      description: 'Discover why Globul Cars is the fastest, most transparent car marketplace in Bulgaria',
      keywords: ['why us', 'marketplace', 'cars', 'Bulgaria', 'trusted']
    }
  },
  {
    path: 'competitive-comparison',
    lazy: async () => {
      const { CompetitiveComparisonPage } = await import('./CompetitiveComparisonPage');
      return { Component: CompetitiveComparisonPage };
    },
    handle: {
      title: 'Competitive Comparison',
      breadcrumb: 'Comparison',
      description: 'See how Globul Cars compares to other marketplaces',
      keywords: ['comparison', 'marketplace', 'features', 'cars']
    }
  },
  {
    path: 'launch-offer',
    lazy: async () => {
      const { LaunchOfferPage } = await import('./LaunchOfferPage');
      return { Component: LaunchOfferPage };
    },
    handle: {
      title: 'Launch Offer - First Listing Free',
      breadcrumb: 'Launch Offer',
      description: 'Special launch offer: List your first car for free',
      keywords: ['offer', 'promotion', 'free', 'listing']
    }
  }
];

export default landingRoutes;
