// src/pages/AdminPage/ReportsView.tsx
// Reports and analytics panel (Placeholder - to be implemented in P0/P1)

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const ReportsView: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">{t('admin.reports')}</h2>
      <p className="text-gray-600">
        {t('admin.comingSoon')} - Analytics and reporting features will be implemented in Phase 0/1.
      </p>
      <div className="mt-4 text-sm text-gray-500">
        <p>Planned reports:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>User growth analytics</li>
          <li>Verification statistics</li>
          <li>Revenue reports</li>
          <li>Listing performance</li>
          <li>System health metrics</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportsView;
