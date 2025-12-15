// src/routes/NumericProfileRouter.tsx
// 🔢 Numeric ID Profile Router - World-class URL structure inspired by mobile.de & AutoScout24
// 
// URL Structure:
// ✅ /profile/1              → User 1 profile (clean, SEO-friendly)
// ✅ /profile/1/1            → User 1's Car #1 (hierarchical)
// ✅ /profile/1/2            → User 1's Car #2
// ✅ /profile/2/1            → User 2's Car #1
// ✅ /profile/hamid          → Username-based (future: @hamid)
// 
// Backward Compatibility:
// ✅ /profile/{firebaseUID}  → Auto-redirect to /profile/{numericId}
// ✅ /car/{carId}            → Auto-redirect to /profile/{seller}/{carNumber}
//
// Permission Model:
// ✅ Owner: Full access (view, edit, delete, manage)
// ✅ Viewer: Limited access based on privacy settings
// ✅ None: Redirect to 404 or login
//
// Inspired by: mobile.de, AutoScout24, Autoscout24.ch, AutoTrader

import React, { useEffect, useState } from 'react';
import { Routes, Route, useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfilePermissions, useCarPermissions } from '../hooks/useProfilePermissions';
import { 
  getUserByNumericId, 
  getCarByNumericIds,
  getNumericIdByFirebaseUid 
} from '../services/numeric-id-lookup.service';
import ProfilePageWrapper from '../pages/03_user-pages/profile/ProfilePage/ProfilePageWrapper';
import { ProfileOverview } from '../pages/03_user-pages/profile/ProfilePage/tabs/ProfileOverview';
import ProfileMyAds from '../pages/03_user-pages/profile/ProfilePage/ProfileMyAds';
import ProfileCampaigns from '../pages/03_user-pages/profile/ProfilePage/ProfileCampaigns';
import ProfileAnalytics from '../pages/03_user-pages/profile/ProfilePage/ProfileAnalytics';
import ProfileConsultations from '../pages/03_user-pages/profile/ProfilePage/ProfileConsultations';
import SettingsPage from '../pages/03_user-pages/profile/ProfilePage/SettingsPage';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFoundPage from '../components/NotFoundPage';
import { logger } from '../services/logger-service';

const EditCarPage = React.lazy(() => import('../pages/04_car-selling/EditCarPage'));
const CarDetailsPage = React.lazy(() => import('../pages/01_main-pages/CarDetailsPage'));

/**
 * Legacy to Numeric ID Redirector
 * Handles old Firebase UID-based URLs and redirects to new numeric ID URLs
 * 
 * Example:
 * /profile/abc123xyz → /profile/5 (if user with UID abc123xyz has numericId 5)
 */
const LegacyProfileRedirect: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToNumericUrl = async () => {
      if (!userId) {
        navigate('/404', { replace: true });
        return;
      }

      try {
        // Check if it's already a numeric ID (1, 2, 3...)
        if (/^\d+$/.test(userId)) {
          // Already numeric, no redirect needed
          setLoading(false);
          return;
        }

        // Check if it's a username/slug (alphanumeric, no special chars except -, _)
        if (/^[a-zA-Z0-9_-]+$/.test(userId) && userId.length > 8) {
          // Might be a Firebase UID - try to look up numeric ID
          logger.info('🔍 Looking up numeric ID for Firebase UID', { userId });
          
          const numericId = await getNumericIdByFirebaseUid(userId);
          
          if (numericId) {
            logger.info('✅ Found numeric ID, redirecting', { userId, numericId });
            navigate(`/profile/${numericId}`, { replace: true });
            return;
          }
        }

        // Could be a username slug - let it fall through to profile lookup
        logger.info('🔍 Treating as username slug', { userId });
        setLoading(false);
        
      } catch (error) {
        logger.error('❌ Error redirecting legacy profile URL', error, { userId });
        navigate('/404', { replace: true });
      }
    };

    redirectToNumericUrl();
  }, [userId, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // If not redirected, let the ProfileView component handle it
  return null;
};

/**
 * Profile View Wrapper
 * Handles permission checks and profile data loading
 * 
 * Supports:
 * - Numeric ID: /profile/1
 * - Username slug: /profile/hamid (future)
 */
const ProfileView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Parse numeric ID
  const numericId = userId && /^\d+$/.test(userId) ? parseInt(userId, 10) : null;

  // Get profile and permissions
  const { 
    profile, 
    permissions, 
    loading, 
    error 
  } = useProfilePermissions(numericId);

  useEffect(() => {
    if (!loading && error) {
      logger.error('❌ Error loading profile', error, { userId, numericId });
      navigate('/404', { replace: true });
    }
  }, [loading, error, navigate, userId, numericId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return <Navigate to="/404" replace />;
  }

  // Check view permission
  if (!permissions.canView) {
    logger.warn('⛔ User does not have view permission', { 
      userId, 
      numericId, 
      currentUserId: currentUser?.uid,
      permissionLevel: permissions.permissionLevel 
    });
    
    // Redirect to login if not authenticated, otherwise 404
    if (!currentUser) {
      return <Navigate to="/login" state={{ from: `/profile/${numericId}` }} replace />;
    }
    
    return <Navigate to="/404" replace />;
  }

  // Pass profile and permissions to ProfileOverview
  return <ProfileOverview userProfile={profile} permissions={permissions} />;
};

/**
 * Car View Wrapper
 * Handles car-specific permission checks
 * 
 * URL: /profile/1/2 → Seller #1, Car #2
 */
const CarView: React.FC = () => {
  const { userId, carNumber } = useParams<{ userId: string; carNumber: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Parse IDs
  const sellerNumericId = userId && /^\d+$/.test(userId) ? parseInt(userId, 10) : null;
  const carNumericId = carNumber && /^\d+$/.test(carNumber) ? parseInt(carNumber, 10) : null;

  // Get car and permissions
  const { 
    car, 
    permissions, 
    loading, 
    error 
  } = useCarPermissions(sellerNumericId, carNumericId);

  useEffect(() => {
    if (!loading && error) {
      logger.error('❌ Error loading car', error, { userId, carNumber, sellerNumericId, carNumericId });
      navigate('/404', { replace: true });
    }
  }, [loading, error, navigate, userId, carNumber, sellerNumericId, carNumericId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!car) {
    return <Navigate to="/404" replace />;
  }

  // Check view permission
  if (!permissions.canView) {
    logger.warn('⛔ User does not have view permission for car', { 
      userId, 
      carNumber,
      sellerNumericId, 
      carNumericId,
      currentUserId: currentUser?.uid,
      permissionLevel: permissions.permissionLevel 
    });
    
    // Redirect to login if not authenticated, otherwise 404
    if (!currentUser) {
      return <Navigate to="/login" state={{ from: `/profile/${sellerNumericId}/${carNumericId}` }} replace />;
    }
    
    return <Navigate to="/404" replace />;
  }

  // Pass car data to CarDetailsPage
  return <CarDetailsPage carData={car} permissions={permissions} />;
};

/**
 * Car Edit Wrapper
 * Only accessible to car owner
 * 
 * URL: /profile/1/2/edit → Edit Seller #1's Car #2
 */
const CarEdit: React.FC = () => {
  const { userId, carNumber } = useParams<{ userId: string; carNumber: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Parse IDs
  const sellerNumericId = userId && /^\d+$/.test(userId) ? parseInt(userId, 10) : null;
  const carNumericId = carNumber && /^\d+$/.test(carNumber) ? parseInt(carNumber, 10) : null;

  // Get car and permissions
  const { 
    car, 
    permissions, 
    loading, 
    error 
  } = useCarPermissions(sellerNumericId, carNumericId);

  useEffect(() => {
    if (!loading && error) {
      logger.error('❌ Error loading car for edit', error, { userId, carNumber, sellerNumericId, carNumericId });
      navigate('/404', { replace: true });
    }
  }, [loading, error, navigate, userId, carNumber, sellerNumericId, carNumericId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!car) {
    return <Navigate to="/404" replace />;
  }

  // Check edit permission (owner only)
  if (!permissions.canEdit) {
    logger.warn('⛔ User does not have edit permission for car', { 
      userId, 
      carNumber,
      sellerNumericId, 
      carNumericId,
      currentUserId: currentUser?.uid,
      permissionLevel: permissions.permissionLevel 
    });
    
    // Redirect to car view page
    return <Navigate to={`/profile/${sellerNumericId}/${carNumericId}`} replace />;
  }

  // Pass car data to EditCarPage
  return <EditCarPage carData={car} permissions={permissions} />;
};

/**
 * Numeric Profile Router
 * 
 * Routes:
 * ✅ /profile/:userId                     → Profile view (numeric ID or username)
 * ✅ /profile/:userId/:carNumber          → Car view (numeric IDs)
 * ✅ /profile/:userId/:carNumber/edit     → Car edit (owner only)
 * ✅ /profile/:userId/my-ads              → My Ads tab (owner only)
 * ✅ /profile/:userId/campaigns           → Campaigns tab (owner only)
 * ✅ /profile/:userId/analytics           → Analytics tab (owner only)
 * ✅ /profile/:userId/settings            → Settings tab (owner only)
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
        {/* Default: Overview */}
        <Route index element={<ProfileOverview />} />

        {/* Numeric ID Profile Routes */}
        <Route path=":userId" element={<ProfileView />} />
        
        {/* Profile Tabs (Owner Only) */}
        <Route path=":userId/my-ads" element={<ProfileMyAds />} />
        <Route path=":userId/campaigns" element={<ProfileCampaigns />} />
        <Route path=":userId/analytics" element={<ProfileAnalytics />} />
        <Route path=":userId/settings" element={<SettingsPage />} />
        <Route path=":userId/consultations" element={<ProfileConsultations />} />

        {/* Car Routes (Hierarchical: seller/car) */}
        <Route path=":userId/:carNumber" element={<CarView />} />
        <Route path=":userId/:carNumber/edit" element={<CarEdit />} />

        {/* Legacy Redirector (handles Firebase UIDs) */}
        <Route path="*" element={<LegacyProfileRedirect />} />
      </Route>
    </Routes>
  );
};

export default NumericProfileRouter;
