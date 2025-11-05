// src/pages/BillingSuccessPage/index.tsx
// Billing Success Page - After successful Stripe checkout

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const BillingSuccessPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Simulate loading/verification
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('billing.verifyingPayment')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('billing.successTitle')}
          </h1>
          <p className="text-gray-600">
            {t('billing.successMessage')}
          </p>
        </div>

        {/* Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {t('billing.nextSteps')}
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {t('billing.step1')}
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {t('billing.step2')}
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {t('billing.step3')}
            </li>
          </ul>
        </div>

        {/* Session Info */}
        {sessionId && (
          <div className="text-xs text-gray-500 mb-6 p-3 bg-gray-50 rounded border border-gray-200">
            <p className="font-mono">
              {t('billing.sessionId')}: {sessionId.substring(0, 20)}...
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleGoToDashboard}
            className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {t('billing.goToDashboard')}
          </button>
          <button
            onClick={handleGoToProfile}
            className="w-full py-3 px-6 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('billing.viewProfile')}
          </button>
        </div>

        {/* Email Confirmation Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          {t('billing.emailConfirmation')}
        </p>
      </div>
    </div>
  );
};

export default BillingSuccessPage;
