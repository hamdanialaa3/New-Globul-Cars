// src/routes/NumericProfileRouter.tsx
// 🔢 Numeric ID Profile Router - World-class URL structure
// 
// URL Structure:
// ✅ /profile                → Current user's profile (auto-redirect or show own)
// ✅ /profile/18             → User 18 profile (clean, SEO-friendly)
// ✅ /profile/18/my-ads      → User 18's ads
// ✅ /profile/18/car/abc123  → User 18's specific car
// 
// Backward Compatibility:
// ✅ /profile/{firebaseUID}  → Auto-redirect to /profile/{numericId}
//
// Note: This router uses ProfilePageWrapper which handles all the logic via useProfile hook
// The hook already supports numeric IDs and converts them to Firebase UIDs internally

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProfilePageWrapper from '../pages/03_user-pages/profile/ProfilePage/ProfilePageWrapper';
import { ProfileOverview } from '../pages/03_user-pages/profile/ProfilePage/tabs/ProfileOverview';
import ProfileMyAds from '../pages/03_user-pages/profile/ProfilePage/ProfileMyAds';
import ProfileCampaigns from '../pages/03_user-pages/profile/ProfilePage/ProfileCampaigns';
import ProfileAnalytics from '../pages/03_user-pages/profile/ProfilePage/ProfileAnalytics';
import ProfileConsultations from '../pages/03_user-pages/profile/ProfilePage/ProfileConsultations';
import SettingsPage from '../pages/03_user-pages/profile/ProfilePage/SettingsPage';

const EditCarPage = React.lazy(() => import('../pages/04_car-selling/EditCarPage'));
const CarDetailsPage = React.lazy(() => import('../pages/01_main-pages/CarDetailsPage'));

/**
 * Numeric Profile Router
 * 
 * Routes:
 * ✅ /profile                             → Auto-redirect to /profile/{currentUser.numericId}
 * ✅ /profile/:userId                     → Profile view (numeric ID or username)
 * ✅ /profile/:userId/my-ads              → My Ads tab
 * ✅ /profile/:userId/campaigns           → Campaigns tab
 * ✅ /profile/:userId/analytics           → Analytics tab
 * ✅ /profile/:userId/settings            → Settings tab
 * ✅ /profile/:userId/consultations       → Consultations tab
 * 
 * Legacy Support:
 * ✅ /profile/{firebaseUID} → Auto-redirect to /profile/{numericId}
 */
export const NumericProfileRouter: React.FC = () => {
  return (
    <Routes>
      {/* Main profile page with nested routes */}
      <Route path="" element={<ProfilePageWrapper />}>
        {/* Default: Redirect to current user's profile (or show own profile) */}
        <Route index element={<ProfileOverview />} />

        {/* Profile Tabs - Must come BEFORE :userId route to avoid conflicts */}
        <Route path="my-ads" element={<ProfileMyAds />} />
        <Route path="campaigns" element={<ProfileCampaigns />} />
        <Route path="analytics" element={<ProfileAnalytics />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="consultations" element={<ProfileConsultations />} />

        {/* Car Edit (Must come before :userId route) */}
        <Route path=":userId/car/:carId/edit" element={<EditCarPage />} />

        {/* Car View (Must come before :userId route) */}
        <Route path=":userId/car/:id" element={<CarDetailsPage />} />

        {/* User profile view by numeric ID - Must come AFTER specific routes */}
        <Route path=":userId" element={<ProfileOverview />} />
      </Route>
    </Routes>
  );
};

export default NumericProfileRouter;
