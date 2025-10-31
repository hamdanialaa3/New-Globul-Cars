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
      <Route path="/" element={<ProfilePageWrapper />}>
        {/* Default: Overview */}
        <Route index element={<ProfileOverview />} />
        
        {/* Tab Routes */}
        {/* Redirect legacy my-ads to centralized listings page */}
        <Route path="my-ads" element={<Navigate to="/my-listings" replace />} />
        <Route path="campaigns" element={<ProfileCampaigns />} />
        <Route path="analytics" element={<ProfileAnalytics />} />
        <Route path="settings" element={<ProfileSettingsNew />} />
        <Route path="settings-old" element={<ProfileSettings />} />
        <Route path="consultations" element={<ProfileConsultations />} />
        
        {/* Fallback: Redirect to overview */}
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Route>
    </Routes>
  );
};

export default ProfileRouter;
