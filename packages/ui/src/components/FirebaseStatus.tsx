// Firebase Status Component
// لعرض حالة الاتصال مع Firebase

import React, { useEffect, useState } from 'react';
import { useAuth } from '@globul-cars/core/contextsAuthProvider';
import { FirebaseHealthCheck } from '@globul-cars/core/utilsfirebase-health-check';
import { logger } from '@globul-cars/services';

interface FirebaseStatusProps {
  showDetails?: boolean;
}

export const FirebaseStatus: React.FC<FirebaseStatusProps> = ({ showDetails = false }) => {
  const { currentUser, loading } = useAuth();
  const [healthStatus, setHealthStatus] = useState<{
    auth: boolean;
    firestore: boolean;
  } | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const status = await FirebaseHealthCheck.runFullCheck();
        setHealthStatus(status);
      } catch (error) {
        logger.error('Health check failed', error as Error);
        setHealthStatus({ auth: false, firestore: false });
      }
    };

    checkHealth();
  }, []);

  if (!showDetails && healthStatus?.auth && healthStatus?.firestore) {
    return null; // Don't show anything if everything is working
  }

  const getStatusColor = (isHealthy: boolean) => isHealthy ? '#28a745' : '#dc3545';
  const getStatusText = (isHealthy: boolean) => isHealthy ? '✅ متصل' : '❌ غير متصل';

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      padding: '8px 12px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        Firebase Status
      </div>
      
      {loading ? (
        <div>🔄 جاري التحميل...</div>
      ) : (
        <>
          <div style={{ color: getStatusColor(!!currentUser) }}>
            المصادقة: {currentUser ? `✅ ${currentUser.email}` : '❌ غير مسجل'}
          </div>
          
          {healthStatus && (
            <>
              <div style={{ color: getStatusColor(healthStatus.auth) }}>
                Auth: {getStatusText(healthStatus.auth)}
              </div>
              <div style={{ color: getStatusColor(healthStatus.firestore) }}>
                Firestore: {getStatusText(healthStatus.firestore)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FirebaseStatus;