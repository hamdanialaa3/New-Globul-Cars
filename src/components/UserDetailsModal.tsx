import { logger } from '../services/logger-service';
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  X,
  User,
  Car,
  MessageSquare,
  Activity,
  TrendingUp
} from 'lucide-react';
import { advancedUserManagementService } from '../services/advanced-user-management-service';
import { CarListing } from '../types/CarListing';

interface UserData {
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  location?: { city?: string; country?: string };
  isOnline?: boolean;
  isVerified?: boolean;
  lastLogin?: Date | string;
  loginCount?: number;
  device?: string;
  browser?: string;
  lastActivity?: Date | string;
  createdAt?: Date | string;
  stats?: {
    carsListed?: number;
    carsSold?: number;
    totalViews?: number;
    totalMessages?: number;
    rating?: number;
    totalRatings?: number;
  };
}

interface UserMessage {
  content?: string;
  createdAt?: Date | string;
  [key: string]: unknown;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userData: UserData | null;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid #ffd700;
  border-radius: 15px;
  padding: 30px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  color: #ffd700;
  box-shadow: 0 20px 40px rgba(255, 215, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ffd700;
`;

const ModalTitle = styled.h2`
  color: #ffd700;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  border: 2px solid #ff6b6b;
  border-radius: 8px;
  color: white;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #ee5a52 0%, #ff6b6b 100%);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
  }
`;

const UserInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 2px solid #ffd700;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
`;

const InfoTitle = styled.h3`
  color: #ffd700;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #ffd700;
  font-size: 0.85rem;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #ffed4e;
  min-width: 120px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  color: #ffd700;
  font-size: 0.9rem;
  font-weight: 500;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #000000;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  opacity: 0.8;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #ffd700;
  font-size: 18px;
`;

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userData
}) => {
  const [userCars, setUserCars] = useState<Array<CarListing & { id: string; brand?: string; status?: string }>>([]);
  const [userMessages, setUserMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUserDetails = useCallback(async () => {
    if (!userId) {
      return;
    }
    setLoading(true);
    try {
      const [cars, messages] = await Promise.all([
        advancedUserManagementService.getUserCars(userId),
        advancedUserManagementService.getUserMessages(userId)
      ]);

      setUserCars(cars);
      setUserMessages(messages);
    } catch (error) {
      logger.error('Error loading user details:', error as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      loadUserDetails();
    }
  }, [isOpen, loadUserDetails]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <User size={24} />
            User Details: {userData?.displayName || 'Unknown User'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={16} />
          </CloseButton>
        </ModalHeader>

        {loading ? (
          <LoadingSpinner>Loading user details...</LoadingSpinner>
        ) : (
          <>
            <UserInfoGrid>
              <InfoCard>
                <InfoTitle>
                  <User size={18} />
                  Personal Information
                </InfoTitle>
                <InfoItem>
                  <InfoLabel>Name:</InfoLabel>
                  <InfoValue>{userData?.displayName || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Email:</InfoLabel>
                  <InfoValue>{userData?.email || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Phone:</InfoLabel>
                  <InfoValue>{userData?.phoneNumber || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Location:</InfoLabel>
                  <InfoValue>
                    {userData?.location?.city || 'Unknown'}, {userData?.location?.country || 'Bulgaria'}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Status:</InfoLabel>
                  <InfoValue>
                    {userData?.isOnline ? '🟢 Online' : '🔴 Offline'}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Verified:</InfoLabel>
                  <InfoValue>
                    {userData?.isVerified ? '✅ Yes' : '❌ No'}
                  </InfoValue>
                </InfoItem>
              </InfoCard>

              <InfoCard>
                <InfoTitle>
                  <Activity size={18} />
                  Activity Information
                </InfoTitle>
                <InfoItem>
                  <InfoLabel>Last Login:</InfoLabel>
                  <InfoValue>
                    {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'N/A'}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Login Count:</InfoLabel>
                  <InfoValue>{userData?.loginCount || 0}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Device:</InfoLabel>
                  <InfoValue>{userData?.device || 'Unknown'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Browser:</InfoLabel>
                  <InfoValue>{userData?.browser || 'Unknown'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Last Activity:</InfoLabel>
                  <InfoValue>
                    {userData?.lastActivity ? new Date(userData.lastActivity).toLocaleString() : 'N/A'}
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Member Since:</InfoLabel>
                  <InfoValue>
                    {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                  </InfoValue>
                </InfoItem>
              </InfoCard>
            </UserInfoGrid>

            <InfoCard>
              <InfoTitle>
                <TrendingUp size={18} />
                User Statistics
              </InfoTitle>
              <StatsGrid>
                <StatCard>
                  <StatValue>{userData?.stats?.carsListed || 0}</StatValue>
                  <StatLabel>Cars Listed</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{userData?.stats?.carsSold || 0}</StatValue>
                  <StatLabel>Cars Sold</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{userData?.stats?.totalViews || 0}</StatValue>
                  <StatLabel>Total Views</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{userData?.stats?.totalMessages || 0}</StatValue>
                  <StatLabel>Messages</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{userData?.stats?.rating || 0}</StatValue>
                  <StatLabel>Rating</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{userData?.stats?.totalRatings || 0}</StatValue>
                  <StatLabel>Reviews</StatLabel>
                </StatCard>
              </StatsGrid>
            </InfoCard>

            <InfoCard>
              <InfoTitle>
                <Car size={18} />
                User's Cars ({userCars.length})
              </InfoTitle>
              {userCars.length > 0 ? (
                userCars.map((car, index) => (
                  <InfoItem key={index}>
                    <InfoLabel>Car {index + 1}:</InfoLabel>
                    <InfoValue>
                      {car.brand} {car.model} - {car.year} ({car.status})
                    </InfoValue>
                  </InfoItem>
                ))
              ) : (
                <InfoValue>No cars listed</InfoValue>
              )}
            </InfoCard>

            <InfoCard>
              <InfoTitle>
                <MessageSquare size={18} />
                Recent Messages ({userMessages.length})
              </InfoTitle>
              {userMessages.length > 0 ? (
                userMessages.slice(0, 5).map((message, index) => (
                  <InfoItem key={index}>
                    <InfoLabel>Message {index + 1}:</InfoLabel>
                    <InfoValue>
                      {message.content?.substring(0, 50)}... ({message.createdAt ? new Date(message.createdAt as any).toLocaleDateString() : 'N/A'})
                    </InfoValue>
                  </InfoItem>
                ))
              ) : (
                <InfoValue>No messages found</InfoValue>
              )}
            </InfoCard>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default UserDetailsModal;
