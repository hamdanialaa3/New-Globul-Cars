// SettingsPage.tsx - Wrapper for SettingsTab that gets data from ProfilePageWrapper
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { SettingsTab } from './tabs/SettingsTab';
import type { BulgarianUser } from '../../../../types/user/bulgarian-user.types';
import type { ProfileTheme } from '../../../../contexts/ProfileTypeContext';

interface ProfilePageContext {
  user: BulgarianUser | null;
  viewer: BulgarianUser | null;
  isOwnProfile: boolean;
  theme: ProfileTheme;
  userCars?: any[];
  refresh?: () => Promise<void>;
  setUser?: React.Dispatch<React.SetStateAction<BulgarianUser | null>>;
}

const SettingsPage: React.FC = () => {
  const { user, theme, refresh, setUser } = useOutletContext<ProfilePageContext>();

  return <SettingsTab user={user} theme={theme} refresh={refresh} setUser={setUser} />;
};

export default SettingsPage;

