import React, { useState } from 'react';
import { format } from 'date-fns';
import bg from 'date-fns/locale/bg';
import { logger } from '@/services/logger-service';
import { useLanguage } from '@/contexts';
import { TestDriveVisuals } from './TestDriveVisuals';
import { TestDriveActions } from './TestDriveActions';

/**
 * Test Drive Request Interface
 * واجهة طلب تجربة القيادة
 */
export interface TestDriveRequest {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  carId: string;
  date: number; // Timestamp
  locationType: 'dealer_location' | 'client_location' | 'neutral_ground';
  location?: string; // Address or meeting point
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

interface TestDriveBubbleProps {
  request: TestDriveRequest;
  canRespond: boolean;
  isReceiver?: boolean;
  onConfirm?: () => Promise<void>;
  onReject?: () => Promise<void>;
  onReschedule?: (newDate: number) => Promise<void>;
  className?: string;
}

/**
 * Test Drive Bubble Component
 * مكون فقاعة تجربة القيادة
 * 
 * Main container that orchestrates the test drive request display and actions
 */
const TestDriveBubble: React.FC<TestDriveBubbleProps> = ({
  request,
  canRespond,
  isReceiver = true,
  onConfirm,
  onReject,
  onReschedule,
  className
}) => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);

  // Convert timestamp to Date
  const appointmentDate = new Date(request.date);

  // Get status color
  const getStatusColor = (status: TestDriveRequest['status']) => {
    switch (status) {
      case 'confirmed':
        return '#16a34a'; // Green
      case 'rejected':
        return '#DC2626'; // Red
      case 'completed':
        return '#3B82F6'; // Blue
      default:
        return '#FFA500'; // Orange/Yellow for pending
    }
  };

  // Get status text
  const getStatusText = (status: TestDriveRequest['status']) => {
    switch (status) {
      case 'pending':
        return language === 'bg' ? 'В очакване' : 'Pending';
      case 'confirmed':
        return language === 'bg' ? 'Потвърдено' : 'Confirmed';
      case 'rejected':
        return language === 'bg' ? 'Отказано' : 'Rejected';
      case 'completed':
        return language === 'bg' ? 'Завършено' : 'Completed';
      default:
        return status;
    }
  };

  // Get location type text
  const getLocationTypeText = (locationType: TestDriveRequest['locationType']) => {
    switch (locationType) {
      case 'dealer_location':
        return language === 'bg' ? 'Локация на дилъра' : 'Dealer Location';
      case 'client_location':
        return language === 'bg' ? 'Локация на клиента' : 'Client Location';
      case 'neutral_ground':
        return language === 'bg' ? 'Неутрална точка' : 'Neutral Ground';
      default:
        return locationType;
    }
  };

  // Handle confirm
  const handleConfirm = async () => {
    if (!onConfirm || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await onConfirm();
      logger.info('Test drive request confirmed', { requestId: request.id });
    } catch (error) {
      logger.error('Failed to confirm test drive', error as Error, { requestId: request.id });
      setError(
        language === 'bg' 
          ? 'Неуспешно потвърждаване. Опитайте отново.' 
          : 'Failed to confirm. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!onReject || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await onReject();
      logger.info('Test drive request rejected', { requestId: request.id });
    } catch (error) {
      logger.error('Failed to reject test drive', error as Error, { requestId: request.id });
      setError(
        language === 'bg' 
          ? 'Неуспешно отхвърляне. Опитайте отново.' 
          : 'Failed to reject. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reschedule
  const handleReschedule = async (newDate: number) => {
    if (!onReschedule || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await onReschedule(newDate);
      setShowReschedule(false);
      logger.info('Test drive rescheduled', { requestId: request.id, newDate });
    } catch (error) {
      logger.error('Failed to reschedule test drive', error as Error, { requestId: request.id });
      setError(
        language === 'bg' 
          ? 'Неуспешно пренареждане. Опитайте отново.' 
          : 'Failed to reschedule. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TestDriveVisuals
      request={request}
      appointmentDate={appointmentDate}
      statusColor={getStatusColor(request.status)}
      statusText={getStatusText(request.status)}
      locationTypeText={getLocationTypeText(request.locationType)}
      isReceiver={isReceiver}
      language={language}
      error={error}
      className={className}
    >
      {canRespond && request.status === 'pending' && (
        <TestDriveActions
          isLoading={isLoading}
          showReschedule={showReschedule}
          onConfirm={handleConfirm}
          onReject={handleReject}
          onReschedule={handleReschedule}
          onToggleReschedule={() => setShowReschedule(!showReschedule)}
          language={language}
        />
      )}

      {!canRespond && request.status === 'pending' && (
        <TestDriveVisuals.ViewOnlyMessage language={language} />
      )}
    </TestDriveVisuals>
  );
};

// Named export
export { TestDriveBubble };

// Default export
export default TestDriveBubble;

