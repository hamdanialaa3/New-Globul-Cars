// src/pages/ProfilePage/ProfileRouter.tsx
// Profile Router - Handles routing for all profile sub-pages
// ✅ FIXED: All routes now point to real, functional pages

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfilePageWrapper from './ProfilePageWrapper';
import ProfileOverview from './ProfileOverview';
import ProfileCampaigns from './ProfileCampaigns';
import ProfileAnalytics from './ProfileAnalytics';
import ProfileSettingsNew from './ProfileSettingsNew';
import ProfileConsultations from './ProfileConsultations';
import MyListingsPage from '../MyListingsPage'; // ✅ Real user's cars

/**
 * Profile Router Component
 * 
 * Routes (All Fixed & Real):
 * - /profile → Profile Overview (default)
 * - /profile/my-ads → Real user's car listings (not redirect!)
 * - /profile/campaigns → Advertising campaigns management
 * - /profile/analytics → Real analytics dashboard
 * - /profile/settings → NEW Phase 5 settings (with all new features!)
 * - /profile/consultations → Expert consultations
 * 
 * ✅ Each tab shows REAL data, not test/demo data
 * ✅ Settings connected to Phase 5 integration
 * ✅ My Ads shows actual user cars from Firestore
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
        
        {/* Tab Routes - ALL REAL & FUNCTIONAL */}
        {/* ✅ FIXED: My Ads now shows real user cars (no redirect) */}
        <Route path="my-ads" element={<MyListingsPage />} />
        
        {/* ✅ Real campaigns page */}
        <Route path="campaigns" element={<ProfileCampaigns />} />
        
        {/* ✅ Real analytics dashboard */}
        <Route path="analytics" element={<ProfileAnalytics />} />
        
        {/* ✅ FIXED: Settings with Phase 5 integration (ProfileTypeSwitcher, DealershipForm, etc.) */}
        <Route path="settings" element={<ProfileSettingsNew />} />
        
        {/* ✅ Real consultations system */}
        <Route path="consultations" element={<ProfileConsultations />} />
        
        {/* Fallback: Redirect to overview */}
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Route>
    </Routes>
  );
};

export default ProfileRouter;
