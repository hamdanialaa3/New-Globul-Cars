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

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProfilePageWrapper from '../pages/03_user-pages/profile/ProfilePage/ProfilePageWrapper';

// ✅ Phase 4.1.1: Code Splitting - Lazy load tabs for better performance
const ProfileOverview = React.lazy(() => import('../pages/03_user-pages/profile/ProfilePage/tabs/ProfileOverview'));
const ProfileMyAds = React.lazy(() => import('../pages/03_user-pages/profile/ProfilePage/ProfileMyAds'));
const ProfileCampaigns = React.lazy(() => import('../pages/03_user-pages/profile/ProfilePage/ProfileCampaigns'));
const ProfileAnalytics = React.lazy(() => import('../pages/03_user-pages/profile/ProfilePage/ProfileAnalytics'));
const ProfileConsultations = React.lazy(() => import('../pages/03_user-pages/profile/ProfilePage/ProfileConsultations'));
const SettingsPage = React.lazy(() => import('../pages/03_user-pages/profile/ProfilePage/SettingsPage'));

const EditCarPage = React.lazy(() => import('../pages/04_car-selling/EditCarPage'));
const CarDetailsPage = React.lazy(() => import('../pages/01_main-pages/CarDetailsPage'));

// Loading fallback component
const TabLoadingFallback: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '400px',
    color: '#666',
    fontSize: '14px'
  }}>
    Loading...
  </div>
);

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
        {/* Default: Show current user's profile overview */}
        <Route index element={
          <Suspense fallback={<TabLoadingFallback />}>
            <ProfileOverview />
          </Suspense>
        } />
        
        {/* Current user's tabs (without userId in path) - ✅ Phase 4.1.1: Lazy loaded */}
        <Route path="my-ads" element={
          <Suspense fallback={<TabLoadingFallback />}>
            <ProfileMyAds />
          </Suspense>
        } />
        <Route path="campaigns" element={
          <Suspense fallback={<TabLoadingFallback />}>
            <ProfileCampaigns />
          </Suspense>
        } />
        <Route path="analytics" element={
          <Suspense fallback={<TabLoadingFallback />}>
            <ProfileAnalytics />
          </Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<TabLoadingFallback />}>
            <SettingsPage />
          </Suspense>
        } />
        <Route path="consultations" element={
          <Suspense fallback={<TabLoadingFallback />}>
            <ProfileConsultations />
          </Suspense>
        } />

        {/* Specific user profile routes */}
        <Route path=":userId">
          {/* User profile overview */}
          <Route index element={
            <Suspense fallback={<TabLoadingFallback />}>
              <ProfileOverview />
            </Suspense>
          } />
          
          {/* User's tabs - ✅ Phase 4.1.1: Lazy loaded */}
          <Route path="my-ads" element={
            <Suspense fallback={<TabLoadingFallback />}>
              <ProfileMyAds />
            </Suspense>
          } />
          <Route path="campaigns" element={
            <Suspense fallback={<TabLoadingFallback />}>
              <ProfileCampaigns />
            </Suspense>
          } />
          <Route path="analytics" element={
            <Suspense fallback={<TabLoadingFallback />}>
              <ProfileAnalytics />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<TabLoadingFallback />}>
              <SettingsPage />
            </Suspense>
          } />
          <Route path="consultations" element={
            <Suspense fallback={<TabLoadingFallback />}>
              <ProfileConsultations />
            </Suspense>
          } />
          
          {/* Car routes */}
          <Route path="car/:carId/edit" element={
            <Suspense fallback={<TabLoadingFallback />}>
              <EditCarPage />
            </Suspense>
          } />
          <Route path="car/:id" element={
            <Suspense fallback={<TabLoadingFallback />}>
              <CarDetailsPage />
            </Suspense>
          } />
        </Route>
      </Route>
    </Routes>
  );
};

export default NumericProfileRouter;
