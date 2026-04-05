// src/routes/NumericProfileRouter.tsx
// 🔢 Numeric ID Profile Router - World-class URL structure
// 
// 🔒 STRICT PROFILE ACCESS RULES:
// ✅ /profile                → Current user's profile (auto-redirect to /profile/{numericId})
// ✅ /profile/{numericId}    → ONLY for own profile (current user's numericId)
// ✅ /profile/view/{numericId} → View other users' profiles
// ✅ /profile/{numericId}/my-ads → Own profile tabs
// ✅ /profile/view/{numericId}/my-ads → Other user's public tabs
// 
// ⚠️ CRITICAL: /profile/{otherUserNumericId} will auto-redirect to /profile/view/{otherUserNumericId}
//
// Note: This router uses ProfilePageWrapper which handles all the logic via useProfile hook
// The hook already supports numeric IDs and converts them to Firebase UIDs internally

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProfilePageWrapper from '../pages/03_user-pages/profile/ProfilePage/ProfilePageWrapper';
import ProtectedRoute from '../components/ProtectedRoute';
import ProtectedRouteAuth from '../components/auth/ProtectedRoute';

// ✅ Phase 4.1.1: Code Splitting - Lazy load tabs for better performance
const ProfileOverview = React.lazy(() => import('../pages/03_user-pages/profile/ProfilePage/tabs/ProfileOverview'));
const ProfileMyAds = React.lazy(() => import('../pages/03_user-pages/profile/ProfilePage/ProfileMyAds'));
const ProfileCampaigns = React.lazy(() => import('../pages/03_user-pages/profile/ProfilePage/ProfileCampaigns'));
const ProfileAnalytics = React.lazy(() => import('../pages/03_user-pages/profile/ProfilePage/ProfileAnalytics'));
const ProfileConsultations = React.lazy(() => import('../pages/03_user-pages/profile/ProfilePage/ProfileConsultations'));
const SettingsPage = React.lazy(() => import('../pages/03_user-pages/profile/ProfilePage/SettingsPage'));

const EditCarPage = React.lazy(() => import('../pages/04_car-selling/EditCarPage'));
const CarDetailsPage = React.lazy(() => import('../pages/01_main-pages/CarDetailsPage'));
const UserFavoritesPage = React.lazy(() => import('../pages/03_user-profile/UserFavoritesPage'));
const FollowingTab = React.lazy(() => import('../pages/03_user-pages/profile/ProfilePage/tabs/FollowingTab'));

// Loading fallback component
const TabLoadingFallback: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '400px',
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      border: '3px solid rgba(0, 0, 0, 0.1)',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

/**
 * Numeric Profile Router
 * 
 * Routes:
 * ✅ /profile                             → Auto-redirect to /profile/{currentUser.numericId}
 * ✅ /profile/:userId                     → Profile view (numeric ID or username)
 * ✅ /profile/:userId/my-ads              → My Ads tab
 * ✅ /profile/:userId/favorites           → User Favorites tab (NEW)
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
      {/* ✅ PUBLIC: View other users' profiles — no auth required */}
      <Route path="view/:userId" element={<ProfilePageWrapper />}>
        {/* Other user's profile overview */}
        <Route index element={
          <Suspense fallback={<TabLoadingFallback />}>
            <ProfileOverview />
          </Suspense>
        } />
        
        {/* Other user's public tabs (read-only) */}
        <Route path="my-ads" element={
          <Suspense fallback={<TabLoadingFallback />}>
            <ProfileMyAds />
          </Suspense>
        } />
        <Route path="favorites" element={
          <Suspense fallback={<TabLoadingFallback />}>
            <UserFavoritesPage />
          </Suspense>
        } />
        <Route path="following" element={
          <Suspense fallback={<TabLoadingFallback />}>
            <FollowingTab />
          </Suspense>
        } />
        
        {/* Car routes for other users */}
        <Route path="car/:id" element={
          <Suspense fallback={<TabLoadingFallback />}>
            <CarDetailsPage />
          </Suspense>
        } />
      </Route>

      {/* ✅ PROTECTED: Main profile page with nested routes */}
      <Route path="" element={
        <ProtectedRoute>
          <ProfilePageWrapper />
        </ProtectedRoute>
      }>
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
        
        {/* 🔥 NEW: Current user's favorites */}
        <Route path="favorites" element={
          <Suspense fallback={<TabLoadingFallback />}>
            <UserFavoritesPage />
          </Suspense>
        } />
        <Route path="following" element={
          <Suspense fallback={<TabLoadingFallback />}>
            <FollowingTab />
          </Suspense>
        } />

        {/* 🔒 OWN PROFILE ROUTES: /profile/{numericId} - Only accessible for own profile */}
        {/* ProfilePageWrapper will redirect /profile/{otherUserNumericId} to /profile/view/{otherUserNumericId} */}
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
          
          {/* 🔥 NEW: User Favorites */}
          <Route path="favorites" element={
            <Suspense fallback={<TabLoadingFallback />}>
              <UserFavoritesPage />
            </Suspense>
          } />
          <Route path="following" element={
            <Suspense fallback={<TabLoadingFallback />}>
              <FollowingTab />
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
