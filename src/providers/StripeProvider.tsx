// src/providers/StripeProvider.tsx
// Stripe Elements Provider

import React, { useMemo } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripeInstance } from '../services/billing-service';

interface StripeProviderProps {
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const stripePromise = useMemo(() => getStripeInstance(), []);

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
