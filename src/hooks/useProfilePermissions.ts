/**
 * Profile Permission Guard
 * Controls access to profile pages based on ownership and privacy settings
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { 
  getUserByNumericId, 
  verifyProfileOwnership,
  verifyCarOwnership 
} from '../services/numeric-id-lookup.service';
import { logger } from '../services/logger-service';

export type ProfilePermission = 'owner' | 'viewer' | 'none';

export interface ProfilePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAddCars: boolean;
  canManageSettings: boolean;
  permissionLevel: ProfilePermission;
}

/**
 * Hook to check profile permissions
 */
export const useProfilePermissions = (profileNumericId: number | null): {
  permissions: ProfilePermissions;
  loading: boolean;
  profileData: any;
} => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<ProfilePermissions>({
    canView: false,
    canEdit: false,
    canDelete: false,
    canAddCars: false,
    canManageSettings: false,
    permissionLevel: 'none'
  });
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!profileNumericId) {
        setLoading(false);
        return;
      }

      try {
        // Get profile data
        const profile = await getUserByNumericId(profileNumericId);
        
        if (!profile) {
          logger.warn('Profile not found', { profileNumericId });
          setLoading(false);
          return;
        }

        setProfileData(profile);

        // Check if current user owns this profile
        const isOwner = user && profile.id === user.uid;

        if (isOwner) {
          // Owner has full permissions
          setPermissions({
            canView: true,
            canEdit: true,
            canDelete: true,
            canAddCars: true,
            canManageSettings: true,
            permissionLevel: 'owner'
          });
          logger.debug('Profile owner access granted', { profileNumericId });
        } else {
          // Viewer permissions (based on privacy settings)
          const privacySettings = profile.privacySettings || {};
          
          setPermissions({
            canView: privacySettings.profileVisible !== false, // Default to visible
            canEdit: false,
            canDelete: false,
            canAddCars: false,
            canManageSettings: false,
            permissionLevel: 'viewer'
          });
          logger.debug('Profile viewer access granted', { profileNumericId });
        }
      } catch (error) {
        logger.error('Failed to check profile permissions', error as Error, { profileNumericId });
        setPermissions({
          canView: false,
          canEdit: false,
          canDelete: false,
          canAddCars: false,
          canManageSettings: false,
          permissionLevel: 'none'
        });
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [profileNumericId, user]);

  return { permissions, loading, profileData };
};

/**
 * Hook to check car permissions
 */
export const useCarPermissions = (
  sellerNumericId: number | null,
  carNumericId: number | null
): {
  permissions: ProfilePermissions;
  loading: boolean;
} => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<ProfilePermissions>({
    canView: false,
    canEdit: false,
    canDelete: false,
    canAddCars: false,
    canManageSettings: false,
    permissionLevel: 'none'
  });

  useEffect(() => {
    const checkPermissions = async () => {
      if (!sellerNumericId || !carNumericId) {
        setLoading(false);
        return;
      }

      try {
        // Check if current user owns this car
        const isOwner = user && await verifyCarOwnership(
          sellerNumericId, 
          carNumericId, 
          user.uid
        );

        if (isOwner) {
          // Owner has full permissions
          setPermissions({
            canView: true,
            canEdit: true,
            canDelete: true,
            canAddCars: false,
            canManageSettings: false,
            permissionLevel: 'owner'
          });
        } else {
          // Viewer permissions (can only view active cars)
          setPermissions({
            canView: true, // Public cars are visible
            canEdit: false,
            canDelete: false,
            canAddCars: false,
            canManageSettings: false,
            permissionLevel: 'viewer'
          });
        }
      } catch (error) {
        logger.error('Failed to check car permissions', error as Error, {
          sellerNumericId,
          carNumericId
        });
        setPermissions({
          canView: false,
          canEdit: false,
          canDelete: false,
          canAddCars: false,
          canManageSettings: false,
          permissionLevel: 'none'
        });
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [sellerNumericId, carNumericId, user]);

  return { permissions, loading };
};
