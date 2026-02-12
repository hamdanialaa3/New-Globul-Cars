/**
 * Numeric ID Guard Component
 * مكون حماية الروابط الرقمية
 * 
 * Purpose: Automatically redirect legacy UUID URLs to numeric ID URLs
 * الغرض: إعادة توجيه تلقائية من روابط UUID القديمة إلى روابط الأرقام الجديدة
 * 
 * Usage: Wrap around routes that require numeric IDs
 * الاستخدام: لف حول Routes التي تحتاج أرقام معرفة
 * 
 * Example:
 * <Route path="/car-details/:id" element={
 *   <NumericIdGuard>
 *     <CarDetailsPage />
 *   </NumericIdGuard>
 * } />
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../../services/logger-service';
import { VEHICLE_COLLECTIONS } from '../../services/car/unified-car-types';
import LoadingOverlay from '../LoadingOverlay/LightweightLoadingOverlay';

interface NumericIdGuardProps {
  children: React.ReactNode;
}

interface CarNumericData {
  sellerNumericId?: number;
  carNumericId?: number;
}

/**
 * Smart Guard that redirects legacy URLs to numeric URLs
 * حارس ذكي يعيد توجيه الروابط القديمة للروابط الرقمية
 */
export const NumericIdGuard: React.FC<NumericIdGuardProps> = ({ children }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      // Check if the ID is already numeric (format: only digits)
      const isNumeric = /^\d+$/.test(id);
      
      if (isNumeric) {
        // Already using numeric ID, allow passage
        setLoading(false);
        return;
      }

      // Legacy UUID detected - attempt to find numeric IDs
      serviceLogger.warn('Legacy UUID detected in URL', { id });

      try {
        const carData = await findCarByUuid(id);
        
        if (carData && carData.sellerNumericId && carData.carNumericId) {
          const numericUrl = `/car/${carData.sellerNumericId}/${carData.carNumericId}`;
          serviceLogger.info('Redirecting to numeric URL', { 
            from: `/car-details/${id}`,
            to: numericUrl
          });
          setRedirectUrl(numericUrl);
        } else {
          // Car found but missing numeric IDs - needs migration
          serviceLogger.error('Car found but missing numeric IDs', { id });
          setLoading(false);
          // Allow page to load and show error message
        }
      } catch (error) {
        serviceLogger.error('Error checking car numeric IDs', error as Error, { id });
        setLoading(false);
      }
    };

    checkAndRedirect();
  }, [id]);

  // Show loading while checking
  if (loading) {
    return <LoadingOverlay isVisible={true} />;
  }

  // Redirect if numeric URL found
  if (redirectUrl) {
    return <Navigate to={redirectUrl} replace />;
  }

  // Allow passage
  return <>{children}</>;
};

/**
 * Helper function to find car by UUID across all collections
 * دالة مساعدة للبحث عن السيارة عبر جميع المجموعات
 */
async function findCarByUuid(uuid: string): Promise<CarNumericData | null> {
  // Search all vehicle collections
  for (const collectionName of VEHICLE_COLLECTIONS) {
    try {
      const docRef = doc(db, collectionName, uuid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          sellerNumericId: data.sellerNumericId,
          carNumericId: data.carNumericId
        };
      }
    } catch (error) {
      // Continue searching other collections
      continue;
    }
  }
  
  return null;
}

export default NumericIdGuard;
