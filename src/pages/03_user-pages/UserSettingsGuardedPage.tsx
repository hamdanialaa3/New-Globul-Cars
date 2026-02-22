/**
 * User Settings Guarded Page
 * Access-controlled page for user settings
 * 
 * Access control:
 * - Only the profile owner can access their own settings
 * - Admins can access any user's settings
 * - Unauthenticated users redirected to /login
 * - Unauthorized users redirected to /unauthorized
 * 
 * @file UserSettingsGuardedPage.tsx
 * @since 2026-02-19
 */

import React, { Suspense } from 'react';
import { useUserSettingsGuard } from '../../hooks/useUserSlugRedirect';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the settings page (if it exists, otherwise placeholder)
// Update this import path when you have the actual settings component
const SettingsPage = React.lazy(() => 
  import('../../pages/03_user-pages/profile/ProfilePage/SettingsPage').catch(() => ({
    default: () => (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>User Settings</h1>
        <p>Settings page component not yet implemented.</p>
        <p>Create src/pages/03_user-pages/SettingsPage.tsx to replace this placeholder.</p>
      </div>
    )
  }))
);

const UserSettingsGuardedPage: React.FC = () => {
  useUserSettingsGuard();

  // The hook handles access control and redirects; if we reach here, render settings
  return (
    <Suspense fallback={<LoadingSpinner size="medium" text="Loading settings..." />}>
      <SettingsPage />
    </Suspense>
  );
};

export default UserSettingsGuardedPage;
