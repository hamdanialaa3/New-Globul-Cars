// src/pages/AdminPage/SettingsPanel.tsx
// Admin settings panel (Placeholder - to be implemented in P1)

import React from 'react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';

const SettingsPanel: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">{t('admin.settings')}</h2>
      <p className="text-gray-600">
        {t('admin.comingSoon')} - Admin settings will be implemented in Phase 1.
      </p>
      <div className="mt-4 text-sm text-gray-500">
        <p>Planned settings:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>System configuration</li>
          <li>Email templates</li>
          <li>Pricing plans management</li>
          <li>Feature flags</li>
          <li>Security settings</li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsPanel;
