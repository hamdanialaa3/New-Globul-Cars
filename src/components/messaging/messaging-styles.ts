import styled from 'styled-components';

/**
 * الأنماط المشتركة لنظام المراسلة
 * Shared styles for messaging system
 */

// ألوان النظام - System Colors
export const MessagingColors = {
  // رسائل المرسل - Sender messages
  senderBg: '#FF8F10',      // البرتقالي البلغاري
  senderText: '#FFFFFF',
  
  // رسائل المستقبل - Receiver messages
  receiverBg: '#F5F5F5',
  receiverText: '#003366',
  
  // حالات العرض - Offer states
  offerPending: '#FFA500',  // برتقالي
  offerAccepted: '#16a34a', // أخضر
  offerRejected: '#DC2626', // أحمر
  offerExpired: '#9CA3AF',  // رمادي
  offerCountered: '#3B82F6', // أزرق
  
  // حضور المستخدم - User presence
  online: '#10B981',        // أخضر
  offline: '#6B7280',       // رمادي
  away: '#F59E0B',          // برتقالي فاتح
  typing: '#3B82F6',        // أزرق
  
  // حالات التوصيل - Delivery status
  sending: '#9CA3AF',       // رمادي
  sent: '#9CA3AF',          // رمادي
  delivered: '#9CA3AF',     // رمادي
  read: '#3B82F6',          // أزرق
  failed: '#EF4444',        // أحمر
};

// Container مشترك - Shared container
export const MessageContainer = styled.div<{ $isSender?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isSender ? 'flex-end' : 'flex-start'};
  margin-bottom: 12px;
  padding: 0 16px;
  max-width: 100%;
`;

// Bubble مشترك - Shared bubble
export const BubbleBase = styled.div<{ $isSender?: boolean }>`
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 18px;
  word-break: break-word;
  position: relative;
  
  background-color: ${props => 
    props.$isSender ? MessagingColors.senderBg : MessagingColors.receiverBg
  };
  
  color: ${props => 
    props.$isSender ? MessagingColors.senderText : MessagingColors.receiverText
  };
  
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
  /* ذيل الفقاعة - Bubble tail */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    width: 0;
    height: 0;
    border-style: solid;
    
    ${props => props.$isSender ? `
      right: -8px;
      border-width: 0 0 12px 12px;
      border-color: transparent transparent ${MessagingColors.senderBg} transparent;
    ` : `
      left: -8px;
      border-width: 0 12px 12px 0;
      border-color: transparent ${MessagingColors.receiverBg} transparent transparent;
    `}
  }
  
  @media (max-width: 768px) {
    max-width: 85%;
  }
`;

// Timestamp مشترك - Shared timestamp
export const Timestamp = styled.span`
  font-size: 11px;
  color: #6B7280;
  margin-top: 4px;
  display: inline-block;
  user-select: none;
`;

// Delivery status icons
export const DeliveryStatus = styled.span<{ $status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' }>`
  font-size: 14px;
  margin-left: 4px;
  display: inline-block;
  color: ${props => {
    switch (props.$status) {
      case 'sending':
        return MessagingColors.sending;
      case 'sent':
        return MessagingColors.sent;
      case 'delivered':
        return MessagingColors.delivered;
      case 'read':
        return MessagingColors.read;
      case 'failed':
        return MessagingColors.failed;
      default:
        return MessagingColors.sent;
    }
  }};
`;

// Avatar container
export const AvatarContainer = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 8px;
  flex-shrink: 0;
  background-color: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Avatar image
export const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// TimeRow container
export const TimeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 4px;
  gap: 4px;
`;

// Message group container (للرسائل المتتالية من نفس المرسل)
export const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// Typing indicator animation
export const TypingDot = styled.span<{ $delay?: number }>`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${MessagingColors.typing};
  margin: 0 2px;
  animation: typing 1.4s infinite;
  animation-delay: ${props => props.$delay || 0}s;
  
  @keyframes typing {
    0%, 60%, 100% {
      opacity: 0.3;
      transform: translateY(0);
    }
    30% {
      opacity: 1;
      transform: translateY(-8px);
    }
  }
`;

// Online status dot
export const OnlineDot = styled.span<{ $status: 'online' | 'offline' | 'away' }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
  background-color: ${props => {
    switch (props.$status) {
      case 'online':
        return MessagingColors.online;
      case 'away':
        return MessagingColors.away;
      case 'offline':
      default:
        return MessagingColors.offline;
    }
  }};
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
`;

// Card base للعروض والإجراءات
export const CardBase = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 320px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

// Button base
export const ButtonBase = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  background-color: ${props => {
    switch (props.$variant) {
      case 'primary':
        return '#FF8F10';
      case 'secondary':
        return '#F5F5F5';
      case 'danger':
        return '#DC2626';
      default:
        return '#FF8F10';
    }
  }};
  
  color: ${props => props.$variant === 'secondary' ? '#003366' : 'white'};
  
  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Input base
export const InputBase = styled.input`
  padding: 10px 14px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #FF8F10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }
  
  &::placeholder {
    color: #9CA3AF;
  }
  
  &:disabled {
    background-color: #F3F4F6;
    cursor: not-allowed;
  }
`;

// Badge base
export const BadgeBase = styled.span<{ $color?: string }>`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: ${props => props.$color ? `${props.$color}20` : 'rgba(0, 0, 0, 0.05)'};
  color: ${props => props.$color || '#6B7280'};
`;

// Divider
export const Divider = styled.div`
  height: 1px;
  background-color: #E5E7EB;
  margin: 12px 0;
`;

// Loading spinner - LED ring style
export const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      #FF8F10 90deg,
      transparent 100deg,
      transparent 360deg
    );
    animation: led-orbit 1.2s linear infinite;
  }
  
  @keyframes led-orbit {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
