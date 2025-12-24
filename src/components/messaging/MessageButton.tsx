import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { advancedMessagingService } from '../../services/messaging/advanced-messaging-service';
import { logger } from '../../services/logger-service';

// Styled Components
const MessageButtonContainer = styled.div`
  position: relative;
`;

const MessageButton = styled.button`
  background: linear-gradient(135deg, #00D4FF, #0099CC);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
    box-shadow: none;

    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SuccessMessage = styled.div`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 255, 136, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  z-index: 10;
  animation: fadeInOut 2s ease-in-out;

  @keyframes fadeInOut {
    0%, 100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
    20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 68, 68, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3);
  z-index: 10;
  animation: fadeInOut 3s ease-in-out;

  @keyframes fadeInOut {
    0%, 100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
    20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;

interface MessageButtonProps {
  carId: string;
  sellerId: string;
  carTitle: string;
  sellerName: string;
  className?: string;
}

const MessageButtonComponent: React.FC<MessageButtonProps> = ({
  carId,
  sellerId,
  carTitle,
  sellerName,
  className
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSendMessage = async () => {
    if (!user) {
      setError(t('messaging.loginRequired', 'Please login to send messages'));
      return;
    }

    if (user.uid === sellerId) {
      setError(t('messaging.cannotMessageSelf', 'You cannot message yourself'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // 1. Find or create conversation
      // We rely on the service to find an existing one for this car
      let conversationId = await advancedMessagingService.findConversation(user.uid, sellerId, carId);

      let isNew = false;
      if (!conversationId) {
        isNew = true;
        conversationId = await advancedMessagingService.createConversation(
          [user.uid, sellerId],
          {
            carId,
            carTitle,
            otherParticipant: {
              id: sellerId,
              name: sellerName
            }
          }
        );
      }

      // ✅ CRITICAL FIX: Get numeric IDs for strict URL format
      const { BulgarianProfileService } = await import('../../services/bulgarian-profile-service');
      const { numericMessagingSystemService } = await import('../../services/numeric-messaging-system.service');
      
      // Get numeric IDs for both users
      const currentUserProfile = await BulgarianProfileService.getUserProfile(user.uid);
      const sellerProfile = await BulgarianProfileService.getUserProfile(sellerId);
      
      if (!currentUserProfile?.numericId || !sellerProfile?.numericId) {
        throw new Error('Cannot find numeric IDs for users');
      }

      // 2. If new or forced, send the car link as context
      // We check if we should send the initial car link
      // For simplicity, we send it if it's a new conversation OR if we want to ensure context.
      // To avoid spam, we could check if the last message was the car link, but for now, 
      // if it's new, we definitely send it.
      if (isNew) {
        // ✅ CRITICAL FIX: Use numeric car URL if available
        let carLink = `${window.location.origin}/car/${carId}`;
        try {
          const { unifiedCarService } = await import('../../services/car');
          const carData = await unifiedCarService.getCarById(carId);
          if (carData && (carData as any).sellerNumericId && (carData as any).carNumericId) {
            carLink = `${window.location.origin}/car/${(carData as any).sellerNumericId}/${(carData as any).carNumericId}`;
          }
        } catch (error) {
          // Fallback to legacy URL
        }
        
        const messageContent = `🚗 ${carTitle}\n${carLink}`;
        await advancedMessagingService.sendSystemMessage(
          conversationId,
          user.uid,
          sellerId,
          messageContent,
          { carId }
        );
      }

      // ✅ CRITICAL FIX: Navigate to numeric messaging URL
      // Format: /messages/:senderNumericId/:recipientNumericId
      const senderNumericId = currentUserProfile.numericId;
      const recipientNumericId = sellerProfile.numericId;
      navigate(`/messages/${senderNumericId}/${recipientNumericId}`);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      logger.error('Error sending message:', err);
      setError(t('messaging.sendError', 'Failed to send message'));
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !user || user.uid === sellerId || loading;

  return (
    <MessageButtonContainer className={className}>
      <MessageButton
        onClick={handleSendMessage}
        disabled={isDisabled}
      >
        {loading ? (
          <LoadingSpinner />
        ) : (
          '💬'
        )}
        {loading ? t('messaging.sending') : t('messaging.sendMessage')}
      </MessageButton>

      {success && (
        <SuccessMessage>
          {t('messaging.messageSent')}
        </SuccessMessage>
      )}

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
    </MessageButtonContainer>
  );
};

export default MessageButtonComponent;


