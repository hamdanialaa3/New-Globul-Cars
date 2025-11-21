import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { MapPin, Fuel, Zap, AlertTriangle, CheckCircle, Clock, Gauge, Battery } from 'lucide-react';
import { gloubulConnectService, DigitalTwin } from '@globul-cars/services/gloubul-connect-service';

interface DigitalTwinDashboardProps {
  vin: string;
}

const DashboardContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`;

const StatusCard = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: #f9fafb;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const StatusLabel = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: #6b7280;
  margin: 0;
`;

const StatusValue = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0;
  color: ${props => props.color || 'inherit'};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InfoCard = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const AlertBox = styled.div<{ alertType: 'error' | 'warning' }>`
  background: ${props => props.alertType === 'error' ? '#fee2e2' : '#fef3c7'};
  border: 1px solid ${props => props.alertType === 'error' ? '#fca5a5' : '#fcd34d'};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const LoadingSkeleton = styled.div`
  .skeleton-line {
    height: 1rem;
    background: #e5e7eb;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const MapPlaceholder = styled.div`
  height: 8rem;
  background: #f3f4f6;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const DigitalTwinDashboard: React.FC<DigitalTwinDashboardProps> = ({ vin }) => {
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDigitalTwin = useCallback(async () => {
    try {
      setLoading(true);
      const twin = await gloubulConnectService.getDigitalTwin(vin);
      setDigitalTwin(twin);
      setError(null);
    } catch (err) {
      setError('فشل في تحميل بيانات السيارة');
      console.error('خطأ في تحميل التوأم الرقمي:', err);
    } finally {
      setLoading(false);
    }
  }, [vin]);

  useEffect(() => {
    loadDigitalTwin();
    // (Comment removed - was in Arabic)
    const interval = setInterval(loadDigitalTwin, 30000);
    return () => clearInterval(interval);
  }, [loadDigitalTwin]);

  const getEngineHealthColor = (health: string) => {
    switch (health) {
      case 'good': return '#16a34a';
      case 'warning': return '#ca8a04';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getEngineHealthIcon = (health: string) => {
    switch (health) {
      case 'good': return <CheckCircle size={20} color="#16a34a" />;
      case 'warning': return <Clock size={20} color="#ca8a04" />;
      case 'critical': return <AlertTriangle size={20} color="#dc2626" />;
      default: return <Gauge size={20} color="#6b7280" />;
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <StatusCard>
          <LoadingSkeleton>
            <div className="skeleton-line" style={{ width: '75%' }}></div>
            <div className="skeleton-line" style={{ width: '50%' }}></div>
            <div className="skeleton-line" style={{ width: '66%' }}></div>
          </LoadingSkeleton>
        </StatusCard>
      </DashboardContainer>
    );
  }

  if (error || !digitalTwin) {
    return (
      <DashboardContainer>
        <AlertBox alertType="error">
          <AlertTriangle size={16} />
          {error || 'لم يتم العثور على بيانات السيارة'}
        </AlertBox>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* (Comment removed - was in Arabic) */}
      <StatusCard>
        <CardTitle>
          <Zap size={24} color="#2563eb" />
          سيارتي الحية - {vin}
        </CardTitle>

        <StatusGrid>
          {/* (Comment removed - was in Arabic) */}
          <StatusItem>
            {getEngineHealthIcon(digitalTwin.engineHealth)}
            <div>
              <StatusLabel>حالة المحرك</StatusLabel>
              <StatusValue color={getEngineHealthColor(digitalTwin.engineHealth)}>
                {digitalTwin.engineHealth === 'good' ? 'ممتازة' :
                 digitalTwin.engineHealth === 'warning' ? 'تحتاج انتباه' : 'حرجة'}
              </StatusValue>
            </div>
          </StatusItem>

          {/* (Comment removed - was in Arabic) */}
          <StatusItem>
            <Fuel size={20} color="#2563eb" />
            <div>
              <StatusLabel>مستوى الوقود</StatusLabel>
              <StatusValue>{digitalTwin.fuelLevelPercent}%</StatusValue>
            </div>
          </StatusItem>

          {/* (Comment removed - was in Arabic) */}
          <StatusItem>
            <Battery size={20} color="#16a34a" />
            <div>
              <StatusLabel>بطارية الجهاز</StatusLabel>
              <StatusValue>{digitalTwin.batteryLevel}%</StatusValue>
            </div>
          </StatusItem>

          {/* (Comment removed - was in Arabic) */}
          <StatusItem>
            <Gauge size={20} color="#9333ea" />
            <div>
              <StatusLabel>نقاط القيادة</StatusLabel>
              <StatusValue>{digitalTwin.drivingScore}/100</StatusValue>
            </div>
          </StatusItem>
        </StatusGrid>
      </StatusCard>

      {/* (Comment removed - was in Arabic) */}
      <InfoGrid>
        <InfoCard>
          <CardTitle>
            <MapPin size={20} />
            الموقع الحالي
          </CardTitle>
          <div style={{ marginBottom: '1rem' }}>
            <StatusLabel>
              آخر تحديث: {digitalTwin.lastSeen.toDate().toLocaleString('bg-BG')}
            </StatusLabel>
          </div>
          <StatusLabel>
            إحداثيات: {digitalTwin.lastLocation.latitude.toFixed(4)}, {digitalTwin.lastLocation.longitude.toFixed(4)}
          </StatusLabel>
          <MapPlaceholder>
            <MapPin size={32} />
            خريطة الموقع
          </MapPlaceholder>
        </InfoCard>

        <InfoCard>
          <CardTitle>إحصائيات السيارة</CardTitle>
          <StatsList>
            <StatItem>
              <span>إجمالي المسافة:</span>
              <span style={{ fontWeight: 'bold' }}>{digitalTwin.totalMileage.toLocaleString()} كم</span>
            </StatItem>
            <StatItem>
              <span>متوسط استهلاك الوقود:</span>
              <span style={{ fontWeight: 'bold' }}>{digitalTwin.averageFuelConsumption.toFixed(1)} لتر/100كم</span>
            </StatItem>
            <StatItem>
              <span>الصيانة التالية:</span>
              <span style={{ fontWeight: 'bold' }}>{digitalTwin.nextServiceDueKm.toLocaleString()} كم</span>
            </StatItem>
            <StatItem>
              <span>تاريخ آخر صيانة:</span>
              <span style={{ fontWeight: 'bold' }}>
                {digitalTwin.lastServiceDate.toDate().toLocaleDateString('bg-BG')}
              </span>
            </StatItem>
          </StatsList>
        </InfoCard>
      </InfoGrid>

      {/* (Comment removed - was in Arabic) */}
      {digitalTwin.activeErrorCodes.length > 0 && (
        <StatusCard>
          <CardTitle style={{ color: '#dc2626' }}>
            <AlertTriangle size={20} />
            أكواد أعطال نشطة
          </CardTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {digitalTwin.activeErrorCodes.map((code, index) => (
              <span
                key={index}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem'
                }}
              >
                {code}
              </span>
            ))}
          </div>
          <StatusLabel>
            يُنصح بزيارة مركز صيانة معتمد لفحص هذه الأكواد
          </StatusLabel>
        </StatusCard>
      )}

      {/* (Comment removed - was in Arabic) */}
      {digitalTwin.totalMileage >= digitalTwin.nextServiceDueKm && (
        <AlertBox alertType="warning">
          <Clock size={16} />
          سيارتك وصلت إلى {digitalTwin.totalMileage.toLocaleString()} كم.
          حان وقت الصيانة الدورية التالية!
        </AlertBox>
      )}
    </DashboardContainer>
  );
}