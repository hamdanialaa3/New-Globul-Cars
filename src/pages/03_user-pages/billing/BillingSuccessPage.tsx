// src/pages/03_user-pages/billing/BillingSuccessPage.tsx
// Thin wrapper to existing billing success page + analytics hook

import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SuccessPage from '../billing/SuccessPage';
import { analyticsService } from '../../../services/analytics/UnifiedAnalyticsService';

const BillingSuccessPage: React.FC = () => {
  const [params] = useSearchParams();

  useEffect(() => {
    const sessionId = params.get('session_id');
    analyticsService.trackEvent('billing_success_view', {
      sessionId,
      source: 'stripe_checkout',
    });
  }, [params]);

  return <SuccessPage />;
};

export default BillingSuccessPage;
