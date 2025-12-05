// src/pages/AdminPage/UsersManagement.tsx
// User management panel (Placeholder - to be implemented in P1)

import React from 'react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';

const UsersManagement: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">{t('admin.usersManagement')}</h2>
      <p className="text-gray-600">
        {t('admin.comingSoon')} - User management features will be implemented in Phase 1.
      </p>
      <div className="mt-4 text-sm text-gray-500">
        <p>Planned features:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>View all users</li>
          <li>Search and filter users</li>
          <li>Edit user profiles</li>
          <li>Suspend/activate accounts</li>
          <li>View user activity logs</li>
        </ul>
      </div>
    </div>
  );
};

export default UsersManagement;
