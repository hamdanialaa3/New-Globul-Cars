// src/features/billing/StripeCheckout.tsx
// Stripe Checkout Component

import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebase-config';
import { useAuth } from '../../contexts/AuthProvider';  /* ⚡ FIXED */
import { useLanguage } from '../../contexts/LanguageContext';

interface StripeCheckoutProps {
  planId: string;
  planName: string;
  planPrice: number;
  currency: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  buttonText?: string;
  buttonClassName?: string;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  planId,
  planName,
  planPrice,
  currency,
  onSuccess,
  onError,
  buttonText,
  buttonClassName,
}) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!currentUser) {
      setError(t('billing.loginRequired'));
      if (onError) onError(t('billing.loginRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call Cloud Function to create checkout session
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      
      const result = await createCheckoutSession({
        userId: currentUser.uid,
        planId,
        successUrl: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/billing`,
      });

      const data = result.data as {
        success: boolean;
        checkoutUrl: string;
        sessionId: string;
        message?: string;
      };

      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
        if (onSuccess) onSuccess();
      } else {
        throw new Error(data.message || t('billing.checkoutError'));
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      const errorMessage = err.message || t('billing.checkoutError');
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={
          buttonClassName ||
          `w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`
        }
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {t('billing.processing')}
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            {buttonText || `${t('billing.subscribe')} - ${planPrice} ${currency}`}
          </span>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default StripeCheckout;
