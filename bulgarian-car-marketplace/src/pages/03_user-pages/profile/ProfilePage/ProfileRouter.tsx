// src/pages/ProfilePage/ProfileRouter.tsx
// Profile Router - Handles routing for all profile sub-pages

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfilePageWrapper from './ProfilePageWrapper';
import ProfileOverview from './ProfileOverview';
import ProfileMyAds from './ProfileMyAds';
import ProfileCampaigns from './ProfileCampaigns';
import ProfileAnalytics from './ProfileAnalytics';
import ProfileSettings from './ProfileSettings';
import ProfileSettingsNew from './ProfileSettingsNew';
import ProfileSettingsMobileDe from './ProfileSettingsMobileDe';
import ProfileConsultations from './ProfileConsultations';

/**
 * Profile Router Component
 * 
 * Routes:
 * - /profile → Profile Overview (default)
 * - /profile/my-ads → My Ads/Garage
 * - /profile/campaigns → Advertising Campaigns
 * - /profile/analytics → Analytics Dashboard
 * - /profile/settings → Privacy & Settings
 * - /profile/consultations → Expert Consultations
 * 
 * ✅ Each tab is now a separate route for better navigation
 * ✅ Direct links work perfectly
 * ✅ Browser back/forward buttons work
 * ✅ SEO-friendly URLs
 */
export const ProfileRouter: React.FC = () => {
  return (
    <Routes>
      {/* Main profile page with nested routes */}
      {/* IMPORTANT: use empty path so routes are relative to /profile base */}
      <Route path="" element={<ProfilePageWrapper />}>
        {/* Default: Overview */}
        <Route index element={<ProfileOverview />} />
        
        {/* Tab Routes - Must come BEFORE :userId route */}
        <Route path="my-ads" element={<ProfileMyAds />} />
        <Route path="campaigns" element={<ProfileCampaigns />} />
        <Route path="analytics" element={<ProfileAnalytics />} />
        <Route path="settings" element={<ProfileSettingsMobileDe />} />
        <Route path="settings-old" element={<ProfileSettings />} />
        <Route path="settings-new" element={<ProfileSettingsNew />} />
        <Route path="consultations" element={<ProfileConsultations />} />
        
        {/* User profile view - Must come AFTER specific routes */}
        <Route path=":userId" element={<ProfileOverview />} />
      </Route>
    </Routes>
  );
};

export default ProfileRouter;
