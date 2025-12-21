// src/pages/BillingCanceledPage/index.tsx
// Billing Canceled Page - When user cancels Stripe checkout

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

const BillingCanceledPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate('/billing');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Canceled Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('billing.canceledTitle')}
          </h1>
          <p className="text-gray-600">
            {t('billing.canceledMessage')}
          </p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">{t('billing.needHelp')}</span>
            <br />
            {t('billing.contactSupport')}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleTryAgain}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {t('billing.tryAgain')}
          </button>
          <button
            onClick={handleGoHome}
            className="w-full py-3 px-6 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('billing.goHome')}
          </button>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          {t('billing.noCharges')}
        </p>
      </div>
    </div>
  );
};

export default BillingCanceledPage;
