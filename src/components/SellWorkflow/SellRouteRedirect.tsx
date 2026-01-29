// Sell Route Redirect Component
// Component لإعادة توجيه Routes القديمة للـ Modal

import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { logger } from '../../services/logger-service';

interface SellRouteRedirectProps {
  step: number;
}

export const SellRouteRedirect: React.FC<SellRouteRedirectProps> = ({ step }) => {
  const params = useParams<{ vehicleType: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const vehicleType = params.vehicleType || 'car';
  
  useEffect(() => {
    // ✅ Force redirect immediately
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('step', step.toString());
    searchParams.set('vt', vehicleType);
    
    const targetUrl = `/sell/auto?${searchParams.toString()}`;
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Redirecting old route to Modal', {
        from: location.pathname,
        to: targetUrl,
        step,
        vehicleType
      });
    }
    
    // Use navigate with replace to ensure redirect happens immediately
    navigate(targetUrl, { replace: true });
  }, [step, vehicleType, location.pathname, location.search, navigate]);
  
  // Show nothing while redirecting (redirect happens immediately)
  return null;
};

export default SellRouteRedirect;
