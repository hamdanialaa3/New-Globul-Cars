// src/pages/ProfilePage/ProfileRouter.tsx
// Profile Router - Renders ProfilePage with full functionality
// ProfilePage now handles dynamic theming and LED avatars automatically

import React from 'react';
import ProfilePage from './index';

/**
 * Profile Router Component
 * 
 * Simple wrapper that renders the main ProfilePage component.
 * ProfilePage now includes ALL features with dynamic adaptation:
 * 
 * ✅ LED Progress Ring Avatars:
 *    - Private: Orange #FF8F10, circular 120px
 *    - Dealer: Green #16a34a, circular 180px
 *    - Company: Blue #1d4ed8, square 180px with LED border
 * 
 * ✅ Dynamic Theming from ProfileTypeContext
 * ✅ All Original Features:
 *    - Tabs: Profile, My Ads, Analytics, Settings
 *    - Cover Image + Profile Image
 *    - Trust Badge + Profile Completion
 *    - Statistics + Verification Panel
 *    - Photo Gallery + Reviews
 *    - Follow/Unfollow + Google Sync
 *    - Complete Edit Forms
 *    - GarageSection + Analytics Dashboard
 *    - Privacy Settings
 * 
 * ✅ Permissions & Plan-based Access Control
 * ✅ View other users' profiles via ?userId=xxx
 * ✅ Business/Company special fields and layouts
 */
export const ProfileRouter: React.FC = () => {
  return <ProfilePage />;
};

export default ProfileRouter;
