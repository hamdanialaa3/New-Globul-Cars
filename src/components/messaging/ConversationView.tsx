// --- Car Title and Header styled-components ---
const CarTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
`;

const CarLogoImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e4e6ea;
`;

const ProjectLogoImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e4e6ea;
`;

const CarTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f1f5f9' : '#1c1e21'};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
`;
const ConversationContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : '#f0f2f5'};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  transition: background-color 0.3s ease;
`;

const ConversationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1e293b' : 'white'};
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e4e6ea'};
  box-shadow: 0 1px 3px rgba(0, 0, 0, ${({ theme }) => theme.mode === 'dark' ? '0.3' : '0.1'});
  transition: all 0.3s ease;
  position: relative;
  z-index: 10;
`;
import React, { useState, useEffect, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthProvider';
import { logger } from '../../services/logger-service';
import { advancedMessagingService } from '../../services/messaging/advanced-messaging-service';
import { useLanguage } from '../../contexts/LanguageContext';
import { ProfileService } from '../../services/profile/ProfileService';
import { InteractiveMessageBubble } from './InteractiveMessageBubble';
import { OfferBubble } from './OfferBubble';
import { PresenceIndicator } from './PresenceIndicator';
import { QuickActionsPanel } from './QuickActionsPanel';
import {
  ModernArrowLeft,
  ModernLightning,
  ModernPhone,
  ModernVideo,
  ModernSend,
  ModernMessageSquare,
  ModernSearch,
  ModernUser,
  ModernCar
} from './icons/ModernIcons';
import type { Message, Conversation } from '@/services/messaging/advanced-messaging-types';
import type { BulgarianUser } from '@/types/user/bulgarian-user.types';
import type { DealershipInfo } from '@/types/dealership/dealership.types';
import type { CompanyInfo } from '@/types/company/company.types';

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.mode === 'dark' ? '#60a5fa' : '#4267B2'};
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(96,165,250,0.1)' : '#f0f2f5'};
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ParticipantName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f1f5f9' : '#1c1e21'};
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: color 0.2s;
  position: relative;
  
  &:hover {
    color: ${({ theme }) => theme.mode === 'dark' ? '#60a5fa' : '#FF8F10'};
  }
`;

const DropdownMenu = styled.div<{ $show: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.98)' 
    : 'rgba(255, 255, 255, 0.98)'};
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};
  border-radius: 12px;
  box-shadow: inset 0px 10px 40px 0px rgba(0, 0, 0, 0.15), 0px 4px 12px 0px rgba(0, 0, 0, 0.15), 0px 4px 20px 0px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  height: 100%;
  min-height: 100px;
  z-index: 9999;
  overflow: hidden;
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transform: ${props => props.$show ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'};
  transition: all 0.2s ease;
  
  &[style*="right"] {
    right: 0;
    left: auto;
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f1f5f9' : '#1c1e21'};
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(96,165,250,0.1)' : 'rgba(255,143,16,0.1)'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#60a5fa' : '#FF8F10'};
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
  }
  
  svg {
    opacity: 0.7;
  }
`;



const HeaderActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#65676b'};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(96,165,250,0.1)' : '#f0f2f5'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#60a5fa' : '#4267B2'};
  }
`;

const QuickActionsButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active 
    ? (props.theme.mode === 'dark' 
      ? 'rgba(29, 78, 216, 0.4)' 
      : 'rgba(230, 126, 0, 0.4)')
    : (props.theme.mode === 'dark' 
      ? 'rgba(37, 99, 235, 0.3)' 
      : 'rgba(255, 143, 16, 0.3)')
  };
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(96, 165, 250, 0.2)' 
    : 'rgba(255, 143, 16, 0.2)'};
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$active 
    ? '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 143, 16, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1), 0 0 10px rgba(255, 143, 16, 0.2)'};
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  max-width: 140px;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: rotate(45deg);
    transition: all 0.5s;
    opacity: 0;
  }

  &:hover::before {
    opacity: 1;
    animation: shine 1.5s infinite;
  }

  @keyframes shine {
    0% {
      left: -50%;
    }
    100% {
      left: 150%;
    }
  }

  &:hover {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(29, 78, 216, 0.5)' 
      : 'rgba(230, 126, 0, 0.5)'};
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), 0 0 25px rgba(255, 143, 16, 0.4);
    border-color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(96, 165, 250, 0.4)' 
      : 'rgba(255, 143, 16, 0.4)'};
  }

  &:active {
    transform: translateY(0);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : '#f0f2f5'};
  transition: background-color 0.3s ease;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.mode === 'dark' ? '#1e293b' : '#e4e6ea'};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark' ? '#475569' : '#bcc0c4'};
    border-radius: 4px;
  }
`;

const MessageInputContainer = styled.div`
  padding: 12px 16px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1e293b' : 'white'};
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e4e6ea'};
  transition: all 0.3s ease;
`;

const MessageInputForm = styled.form`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  background: ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : '#f0f2f5'};
  border: none;
  border-radius: 20px;
  padding: 10px 16px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f1f5f9' : '#1c1e21'};
  font-size: 14px;
  resize: none;
  min-height: 40px;
  max-height: 100px;
  font-family: inherit;
  outline: none;
  line-height: 1.4;
  transition: all 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#65676b'};
  }

  &:focus {
    background: ${({ theme }) => theme.mode === 'dark' ? '#1e293b' : 'white'};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.mode === 'dark' ? '#2563eb' : '#4267B2'};
  }
`;

const SendButton = styled.button<{ $disabled: boolean }>`
  background: ${props => props.$disabled 
    ? (props.theme.mode === 'dark' ? 'rgba(51, 65, 85, 0.3)' : 'rgba(228, 230, 234, 0.3)')
    : (props.theme.mode === 'dark' ? 'rgba(37, 99, 235, 0.4)' : 'rgba(255, 143, 16, 0.4)')};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${props => props.$disabled
    ? (props.theme.mode === 'dark' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(188, 192, 196, 0.2)')
    : (props.theme.mode === 'dark' ? 'rgba(96, 165, 250, 0.3)' : 'rgba(255, 143, 16, 0.3)')};
  color: ${props => props.$disabled 
    ? (props.theme.mode === 'dark' ? '#64748b' : '#bcc0c4') 
    : 'white'};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.$disabled 
    ? 'none' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'};

  &:hover:not(:disabled) {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(29, 78, 216, 0.5)' : 'rgba(230, 126, 0, 0.5)'};
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.theme.mode === 'dark' ? 'rgba(96, 165, 250, 0.5)' : 'rgba(255, 143, 16, 0.5)'};
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#65676b'};
  text-align: center;
  padding: 40px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f1f5f9' : '#1c1e21'};
`;

const EmptyDescription = styled.p`
  font-size: 15px;
  margin: 0;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#65676b'};
`;

interface ConversationViewProps {
  conversation: Conversation | null;
  onBack: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversation, onBack }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState<BulgarianUser | null>(null);
  const [otherUserDealership, setOtherUserDealership] = useState<DealershipInfo | null>(null);
  const [otherUserCompany, setOtherUserCompany] = useState<CompanyInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load other user profile information
  useEffect(() => {
    if (!conversation || !conversation.otherParticipant || !conversation.otherParticipant.id) return;

    const loadOtherUserProfile = async () => {
      try {
        const profileData = await ProfileService.getCompleteProfile(conversation.otherParticipant.id);
        setOtherUserProfile(profileData.user);
        setOtherUserDealership(profileData.dealership ?? null);
        setOtherUserCompany(profileData.company ?? null);
      } catch (error) {
        logger.error('Failed to load other user profile', error as Error);
      }
    };

    loadOtherUserProfile();
  }, [conversation?.otherParticipant?.id]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversation || !user?.uid) return;

    setLoading(true);
    
    // Subscribe to real-time messages
    const unsubscribe = advancedMessagingService.subscribeToMessages(
      conversation.id,
      (conversationMessages) => {
        setMessages(conversationMessages);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversation, user?.uid]);

  // Mark messages as read
  useEffect(() => {
    if (conversation && user?.uid) {
      advancedMessagingService.markMessagesAsRead(conversation.id, user.uid);
    }
  }, [conversation, user?.uid]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newMessage]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversation || !user?.uid || sending) return;

    try {
      setSending(true);
      await advancedMessagingService.sendMessage(
        user.uid,
        conversation.otherParticipant?.id || '',
        conversation.carId || '',
        newMessage.trim()
      );
      setNewMessage('');
      
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      logger.error('Error sending message', error as Error, { conversationId: conversation.id });
    } finally {
      setSending(false);
    }
  };

  // Handle Quick Actions
  // const handleSendOffer = async (offerData: object) => {
  //   try {
  //     await advancedMessagingService.sendOfferMessage(
  //       conversation?.id ?? '',
  //       user?.uid ?? '',
  //       offerData
  //     );
  //     logger.info('Offer sent successfully', { offerData });
  //     setShowQuickActions(false);
  //   } catch (error) {
  //     logger.error('Failed to send offer', error as Error);
  //   }
  // };

  // const handleBookAppointment = async (appointmentData: object) => {
  //   try {
  //     await advancedMessagingService.sendAppointmentMessage(
  //       conversation?.id ?? '',
  //       user?.uid ?? '',
  //       appointmentData
  //     );
  //     logger.info('Appointment request sent', { appointmentData });
  //     setShowQuickActions(false);
  //   } catch (error) {
  //     logger.error('Failed to send appointment', error as Error);
  //   }
  // };

  // const handleShareLocation = async (location: { latitude: number; longitude: number; address: string }) => {
  //   try {
  //     await advancedMessagingService.sendLocationMessage(
  //       conversation?.id ?? '',
  //       user?.uid ?? '',
  //       location
  //     );
  //     logger.info('Location shared', { location });
  //     setShowQuickActions(false);
  //   } catch (error) {
  //     logger.error('Failed to share location', error as Error);
  //   }
  // };

  // const handleRequestInspection = async (inspectionData: object) => {
  //   try {
  //     await advancedMessagingService.sendInspectionRequest(
  //       conversation?.id ?? '',
  //       user?.uid ?? '',
  //       inspectionData
  //     );
  //     logger.info('Inspection request sent', { inspectionData });
  //     setShowQuickActions(false);
  //   } catch (error) {
  //     logger.error('Failed to send inspection request', error as Error);
  //   }
  // };

  // Render message based on type
  const renderMessage = (message: Message) => {
    const isOwn = message.senderId === user?.uid;

    // Offers are stored as type 'system' with metadata.actionType === 'offer'
    if (
      message.type === 'system' &&
      message.metadata && message.metadata.actionType === 'offer' && message.metadata.offer
    ) {
      const canRespond = message.receiverId === user?.uid && message.metadata.offer.status === 'pending';
      return (
        <OfferBubble
          key={message.id}
          offer={message.metadata.offer}
          canRespond={canRespond}
          isReceiver={message.receiverId === user?.uid}
          onAccept={async () => {
            if (conversation) {
              await advancedMessagingService.updateOfferStatus(
                conversation.id,
                message.id,
                'accepted'
              );
            }
          }}
          onReject={async () => {
            if (conversation) {
              await advancedMessagingService.updateOfferStatus(
                conversation.id,
                message.id,
                'rejected'
              );
            }
          }}
          onCounter={async (newAmount) => {
            if (conversation && user) {
              await advancedMessagingService.sendOfferMessage(
                conversation.id,
                user.uid,
                { ...message.metadata.offer, offerAmount: newAmount, isCounter: true }
              );
            }
          }}
        />
      );
    }

    // Otherwise use InteractiveMessageBubble
    // Map type to allowed values for InteractiveMessageBubble
    let bubbleType: 'text' | 'offer' | 'action' | 'voice' | 'system' = 'text';
    if (['text', 'system', 'action', 'offer', 'voice'].includes(message.type)) {
      bubbleType = message.type as typeof bubbleType;
    } else {
      bubbleType = 'text';
    }
    const bubbleMessage = {
      ...message,
      content: message.text || '',
      type: bubbleType,
      deliveryStatus: message.status,
    };
    return (
      <InteractiveMessageBubble
        key={message.id}
        message={bubbleMessage}
        isSender={isOwn}
        showAvatar={false}
      />
    );
  };



  // Get display name based on profile type
  const getDisplayName = (): string => {
    if (!otherUserProfile) {
      return conversation?.otherParticipant?.name || t('common.user', 'User');
    }

    if (otherUserProfile.profileType === 'dealer' && otherUserDealership?.dealershipNameBG) {
      return otherUserDealership.dealershipNameBG;
    }

    if (otherUserProfile.profileType === 'company' && otherUserCompany?.companyNameBG) {
      return otherUserCompany.companyNameBG;
    }

    return otherUserProfile.displayName || otherUserProfile.firstName || conversation?.otherParticipant?.name || t('common.user', 'User');
  };

  // Get numeric ID for navigation (CONSTITUTION: /profile/{numericId})
  // Must return number only - never Firebase UID
  const getOtherUserNumericId = (): number | null => {
    // First priority: from loaded profile (most reliable)
    if (otherUserProfile?.numericId && typeof otherUserProfile.numericId === 'number') {
      return otherUserProfile.numericId;
    }
    
    // Second priority: from conversation.otherParticipant
    if (conversation?.otherParticipant?.numericId && typeof conversation.otherParticipant.numericId === 'number') {
      return conversation.otherParticipant.numericId;
    }
    
    // Third priority: from conversation.sellerNumericId (if this is the seller)
    // This is valid because sellerNumericId is the numeric ID of the other participant (the seller)
    if (conversation?.sellerNumericId && typeof conversation.sellerNumericId === 'number') {
      return conversation.sellerNumericId;
    }
    
    // Return null if no numericId found (don't use Firebase UID - violates constitution)
    return null;
  };

  // Get numeric ID with fallback for UI display (shows items even if loading)
  const getOtherUserNumericIdForUI = (): number | null => {
    const numericId = getOtherUserNumericId();
    // If we have sellerNumericId, use it as fallback (the other participant is likely the seller)
    if (!numericId && conversation?.sellerNumericId && typeof conversation.sellerNumericId === 'number') {
      return conversation.sellerNumericId;
    }
    return numericId;
  };

  // Get my-ads label based on profile type
  const getMyAdsLabel = (): string => {
    if (!otherUserProfile) {
      return language === 'bg' ? 'Обяви' : 'Listings';
    }

    if (otherUserProfile.profileType === 'dealer') {
      return language === 'bg' 
        ? `معرض ${otherUserDealership?.dealershipNameBG || getDisplayName()}`
        : `Dealership ${otherUserDealership?.dealershipNameBG || getDisplayName()}`;
    }

    if (otherUserProfile.profileType === 'company') {
      return language === 'bg' 
        ? `معرض الشركة ${otherUserCompany?.companyNameBG || getDisplayName()}`
        : `Company Dealership ${otherUserCompany?.companyNameBG || getDisplayName()}`;
    }

    return language === 'bg' 
      ? `مرأب ${getDisplayName()}`
      : `Garage ${getDisplayName()}`;
  };

  if (!conversation) {
    return (
      <ConversationContainer>
        <EmptyState>
          <EmptyIcon>
            <ModernMessageSquare size={48} color={theme.mode === 'dark' ? '#94a3b8' : '#65676b'} />
          </EmptyIcon>
          <EmptyTitle>{t('messaging.selectConversation')}</EmptyTitle>
          <EmptyDescription>{t('messaging.chooseFromList')}</EmptyDescription>
        </EmptyState>
      </ConversationContainer>
    );
  }

  return (
    <ConversationContainer>
      {/* Header with Presence Indicator */}
      <ConversationHeader>
        <BackButton onClick={onBack}>
          <ModernArrowLeft size={20} />
        </BackButton>
        
        <PresenceIndicator
          userId={conversation.otherParticipant?.id || ''}
          userName={conversation.otherParticipant?.name || ''}
          conversationId={conversation.id}
        />
        
        <HeaderInfo ref={userMenuRef}>
          <ParticipantName onClick={() => setShowUserMenu(!showUserMenu)}>
            {getDisplayName()}
          </ParticipantName>
          <DropdownMenu $show={showUserMenu}>
            {(() => {
              const numericId = getOtherUserNumericIdForUI();
              if (!numericId) return null;
              
              return (
                <>
                  <DropdownItem onClick={() => {
                    navigate(`/profile/${numericId}`);
                    setShowUserMenu(false);
                  }}>
                    <ModernUser size={16} />
                    {language === 'bg' ? 'Профил' : 'Profile'}
                  </DropdownItem>
                  <DropdownItem onClick={() => {
                    navigate(`/profile/${numericId}/my-ads`);
                    setShowUserMenu(false);
                  }}>
                    <ModernCar size={16} />
                    {getMyAdsLabel()}
                  </DropdownItem>
                </>
              );
            })()}
            {conversation.sellerNumericId && conversation.carNumericId && (
              <DropdownItem onClick={() => {
                navigate(`/car/${conversation.sellerNumericId}/${conversation.carNumericId}`);
                setShowUserMenu(false);
              }}>
                <ModernSearch size={16} />
                {language === 'bg' ? 'Преглед на колата' : 'View Car'}
              </DropdownItem>
            )}
          </DropdownMenu>
          <CarTitleWrapper>
            {conversation.carLogoUrl ? (
              <CarLogoImage src={conversation.carLogoUrl} alt={conversation.carMake || 'Car'} />
            ) : conversation.carImageUrl ? (
              <CarLogoImage src={conversation.carImageUrl} alt={conversation.carTitle || 'Car'} />
            ) : (
              <ProjectLogoImage src="/logo192.png" alt="Logo" />
            )}
            <CarTitle>{conversation.carTitle}</CarTitle>
          </CarTitleWrapper>
        </HeaderInfo>
        
        <HeaderActions>
          <HeaderActionButton title={t('messaging.videoCall')}>
            <ModernVideo size={20} />
          </HeaderActionButton>
          <HeaderActionButton title={t('messaging.callUser')}>
            <ModernPhone size={20} />
          </HeaderActionButton>
          <QuickActionsButton 
            $active={showQuickActions}
            onClick={() => setShowQuickActions(!showQuickActions)}
          >
            <ModernLightning size={16} />
            {language === 'bg' ? 'Бързи действия' : 'Quick Actions'}
          </QuickActionsButton>
        </HeaderActions>
      </ConversationHeader>

      {/* Messages Area */}
      <MessagesContainer>
        {loading ? (
          <EmptyState>
            <EmptyIcon>⏳</EmptyIcon>
            <EmptyTitle>{t('common.loading')}</EmptyTitle>
          </EmptyState>
        ) : messages.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <ModernMessageSquare size={48} color={theme.mode === 'dark' ? '#94a3b8' : '#65676b'} />
            </EmptyIcon>
            <EmptyTitle>{t('messaging.noMessages', language === 'bg' ? 'Все още няма съобщения' : 'No messages yet')}</EmptyTitle>
            <EmptyDescription>{t('messaging.startConversation', language === 'bg' ? 'Започнете разговор, като напишете съобщение' : 'Start a conversation by typing a message')}</EmptyDescription>
          </EmptyState>
        ) : (
          messages.slice().reverse().map(message => renderMessage(message))
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* Message Input */}
      <MessageInputContainer>
        <MessageInputForm onSubmit={handleSendMessage}>
          <MessageInput
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('messaging.typeMessage')}
            rows={1}
            disabled={sending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <SendButton
            type="submit"
            $disabled={!newMessage.trim() || sending}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? '⏳' : <ModernSend size={20} />}
          </SendButton>
        </MessageInputForm>
      </MessageInputContainer>

      {/* Quick Actions Panel (Overlay) */}
      {showQuickActions && (
        <QuickActionsPanel
          conversationId={conversation.id}
          carId={conversation.carId || ''}
          receiverId={conversation.otherParticipant?.id || ''}
          onActionComplete={() => setShowQuickActions(false)}
        />
      )}
    </ConversationContainer>
  );
};

export { ConversationView };
export default ConversationView;

