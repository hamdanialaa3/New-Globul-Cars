// src/pages/03_user-pages/billing/BillingCanceledPage.tsx
// Thin wrapper to existing billing cancel page + analytics hook

import React, { useEffect } from 'react';
import CancelPage from '@/pages/billing/CancelPage';
import { analyticsService } from '@/services/analytics/UnifiedAnalyticsService';

const BillingCanceledPage: React.FC = () => {
  useEffect(() => {
    analyticsService.trackEvent('billing_canceled_view', {
      source: 'stripe_checkout',
    });
  }, []);

  return <CancelPage />;
};

export default BillingCanceledPage;
