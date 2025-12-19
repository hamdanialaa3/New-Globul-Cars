// src/pages/AdminPage/UsersManagement.tsx
// User management panel (Placeholder - to be implemented in P1)

import React from 'react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import UsersTable from './UsersTable';

const UsersManagement: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">{t('admin.usersManagement')}</h2>
      </div>
      <UsersTable />
    </div>
  );
};

export default UsersManagement;
