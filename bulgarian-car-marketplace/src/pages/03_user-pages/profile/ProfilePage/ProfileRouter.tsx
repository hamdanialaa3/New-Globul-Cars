// src/pages/ProfilePage/ProfileRouter.tsx
// Profile Router - Handles routing for all profile sub-pages

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfilePageWrapper from './ProfilePageWrapper';
import { ProfileOverview } from './tabs/ProfileOverview';
import ProfileMyAds from './ProfileMyAds';
import ProfileCampaigns from './ProfileCampaigns';
import ProfileAnalytics from './ProfileAnalytics';

import ProfileConsultations from './ProfileConsultations';
import SettingsPage from './SettingsPage';

const EditCarPage = React.lazy(() => import('../../../04_car-selling/EditCarPage'));
const CarDetailsPage = React.lazy(() => import('../../../01_main-pages/CarDetailsPage'));

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
        <Route path="settings" element={<SettingsPage />} />

        <Route path="consultations" element={<ProfileConsultations />} />

        {/* 101-1-2: Edit Car (Must come before view) */}
        <Route path=":userId/car/:carId/edit" element={<EditCarPage />} />

        {/* 101-1-1: View Car */}
        <Route path=":userId/car/:id" element={<CarDetailsPage />} />

        {/* User profile view - Must come AFTER specific routes */}
        <Route path=":userId" element={<ProfileOverview />} />
      </Route>
    </Routes>
  );
};

export default ProfileRouter;
