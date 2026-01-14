/**
 * 🔴 CRITICAL: Block User Button Component
 * مكون زر حظر المستخدم
 * 
 * @description Button component for blocking/unblocking users
 * مكون زر لحظر وإلغاء حظر المستخدمين
 * 
 * @constitution
 * - Follows PROJECT_CONSTITUTION.md rules
 * - Uses PascalCase for component name (CONSTITUTION Section 2.2)
 * - Proper error handling and logging (CONSTITUTION Section 4.4)
 * - Uses logger service instead of console.log (CONSTITUTION Section 4.4)
 * 
 * @author CTO & Lead Architect
 * @date January 2026
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Ban, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { blockUserService, BlockRelationship } from '@/services/messaging/block-user.service';
import { logger } from '@/services/logger-service';
import { getNumericIdByFirebaseUid } from '@/services/numeric-id-lookup.service';
import { useToast } from '@/components/Toast';
import { monitoring } from '@/services/monitoring-service';

// ==================== INTERFACES ====================

interface BlockUserButtonProps {
  /**
   * Firebase UID of user to block/unblock
   */
  targetUserFirebaseId: string;
  
  /**
   * Numeric ID of user to block/unblock (optional, will be resolved if not provided)
   */
  targetUserNumericId?: number;
  
  /**
   * Display name of user (for confirmation dialog)
   */
  targetUserName?: string;
  
  /**
   * Callback when block/unblock is successful
   */
  onBlockChanged?: (isBlocked: boolean) => void;
  
  /**
   * Size variant
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'danger';
}

// ==================== STYLED COMPONENTS ====================

const Button = styled.button<{ $variant: string; $size: string; $isBlocked: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: ${props => {
    switch (props.$size) {
      case 'small': return '6px 12px';
      case 'large': return '12px 24px';
      default: return '8px 16px';
    }
  }};
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '0.875rem';
      case 'large': return '1rem';
      default: return '0.9375rem';
    }
  }};
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  ${props => {
    if (props.$isBlocked) {
      return `
        background: ${props.theme.colors.success || '#10B981'};
        color: white;
        
        &:hover {
          background: ${props.theme.colors.successDark || '#059669'};
        }
      `;
    }
    
    switch (props.$variant) {
      case 'danger':
        return `
          background: ${props.theme.colors.error || '#EF4444'};
          color: white;
          
          &:hover {
            background: ${props.theme.colors.errorDark || '#DC2626'};
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          }
        `;
      case 'primary':
        return `
          background: ${props.theme.colors.primary || '#FF8F10'};
          color: white;
          
          &:hover {
            background: ${props.theme.colors.primaryDark || '#FF7A00'};
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
          }
        `;
      default:
        return `
          background: ${props.theme.colors.background || '#F9FAFB'};
          color: ${props.theme.colors.text || '#1F2937'};
          border: 1px solid ${props.theme.colors.border || '#E5E7EB'};
          
          &:hover {
            background: ${props.theme.colors.backgroundHover || '#F3F4F6'};
            border-color: ${props.theme.colors.borderHover || '#D1D5DB'};
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  svg {
    width: ${props => {
      switch (props.$size) {
        case 'small': return '16px';
        case 'large': return '20px';
        default: return '18px';
      }
    }};
    height: ${props => {
      switch (props.$size) {
        case 'small': return '16px';
        case 'large': return '20px';
        default: return '18px';
      }
    }};
  }
`;

const LoadingSpinner = styled(Loader2)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// ==================== COMPONENT ====================

/**
 * Block User Button Component
 * مكون زر حظر المستخدم
 */
const BlockUserButton: React.FC<BlockUserButtonProps> = ({
  targetUserFirebaseId,
  targetUserNumericId,
  targetUserName = 'User',
  onBlockChanged,
  size = 'medium',
  variant = 'secondary',
}) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const toast = useToast();
  const isBg = language === 'bg';

  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check block status on mount
  useEffect(() => {
    const checkBlockStatus = async () => {
      if (!currentUser?.uid || !targetUserFirebaseId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get numeric IDs
        const [currentNumericId, targetNumericId] = await Promise.all([
          getNumericIdByFirebaseUid(currentUser.uid),
          targetUserNumericId 
            ? Promise.resolve(targetUserNumericId)
            : getNumericIdByFirebaseUid(targetUserFirebaseId),
        ]);

        if (!currentNumericId || !targetNumericId) {
          logger.warn('Could not resolve numeric IDs for block check', {
            currentUserUid: currentUser.uid,
            targetUserFirebaseId,
          });
          setIsBlocked(false);
          return;
        }

        // Check if blocked
        const blocked = await blockUserService.isBlocked(currentNumericId, targetNumericId);
        setIsBlocked(blocked);
        
        // Track analytics
        monitoring.trackEvent('block_status_checked', {
          targetUserId: targetUserFirebaseId,
          isBlocked: blocked,
        }, currentUser.uid);
      } catch (error) {
        logger.error('Failed to check block status', error as Error, {
          currentUserUid: currentUser.uid,
          targetUserFirebaseId,
        });
        setIsBlocked(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkBlockStatus();
  }, [currentUser?.uid, targetUserFirebaseId, targetUserNumericId]);

  // Handle block/unblock - memoized for performance
  const handleToggleBlock = useCallback(async () => {
    if (!currentUser?.uid || isProcessing) {
      return;
    }

    const startTime = Date.now();

    try {
      setIsProcessing(true);

      if (isBlocked) {
        // Unblock
        const result = await blockUserService.unblockUser(
          currentUser.uid,
          targetUserFirebaseId
        );

        if (result.success) {
          setIsBlocked(false);
          
          // Track analytics
          monitoring.trackEvent('user_unblocked', {
            targetUserId: targetUserFirebaseId,
            targetUserNumericId,
            duration: Date.now() - startTime,
          }, currentUser.uid);
          
          toast.success(
            isBg
              ? `✅ ${targetUserName} е разблокиран`
              : `✅ ${targetUserName} has been unblocked`,
            { duration: 3000 }
          );
          onBlockChanged?.(false);
        } else if (!result.notBlocked) {
          // Track failed unblock
          monitoring.trackEvent('user_unblock_failed', {
            targetUserId: targetUserFirebaseId,
            error: result.error || 'Unknown error',
          }, currentUser.uid);
          
          toast.error(
            isBg
              ? `❌ Грешка при разблокирането: ${result.error || 'Unknown error'}`
              : `❌ Error unblocking: ${result.error || 'Unknown error'}`,
            { duration: 5000 }
          );
        }
      } else {
        // Block - show confirmation
        const confirmed = window.confirm(
          isBg
            ? `Сигурни ли сте, че искате да блокирате ${targetUserName}? Това ще спре всички съобщения от този потребител.`
            : `Are you sure you want to block ${targetUserName}? This will stop all messages from this user.`
        );

        if (!confirmed) {
          setIsProcessing(false);
          // Track cancellation
          monitoring.trackEvent('user_block_cancelled', {
            targetUserId: targetUserFirebaseId,
          }, currentUser.uid);
          return;
        }

        const result = await blockUserService.blockUser(
          currentUser.uid,
          targetUserFirebaseId,
          'User requested block'
        );

        if (result.success) {
          setIsBlocked(true);
          
          // Track analytics
          monitoring.trackEvent('user_blocked', {
            targetUserId: targetUserFirebaseId,
            targetUserNumericId,
            targetUserName,
            duration: Date.now() - startTime,
          }, currentUser.uid);
          
          toast.success(
            isBg
              ? `✅ ${targetUserName} е блокиран`
              : `✅ ${targetUserName} has been blocked`,
            { duration: 3000 }
          );
          onBlockChanged?.(true);
        } else if (!result.alreadyBlocked) {
          // Track failed block
          monitoring.trackEvent('user_block_failed', {
            targetUserId: targetUserFirebaseId,
            error: result.error || 'Unknown error',
          }, currentUser.uid);
          
          toast.error(
            isBg
              ? `❌ Грешка при блокирането: ${result.error || 'Unknown error'}`
              : `❌ Error blocking: ${result.error || 'Unknown error'}`,
            { duration: 5000 }
          );
        }
      }
    } catch (error) {
      logger.error('Failed to toggle block', error as Error, {
        currentUserUid: currentUser.uid,
        targetUserFirebaseId,
        isBlocked,
      });
      
      // Track error
      monitoring.trackEvent('user_block_error', {
        targetUserId: targetUserFirebaseId,
        action: isBlocked ? 'unblock' : 'block',
        error: (error as Error).message,
      }, currentUser.uid);
      
      toast.error(
        isBg
          ? '❌ Грешка при обработката'
          : '❌ Processing error',
        { duration: 5000 }
      );
    } finally {
      setIsProcessing(false);
    }
  }, [currentUser?.uid, targetUserFirebaseId, targetUserNumericId, targetUserName, isBlocked, isProcessing, isBg, onBlockChanged, toast]);

  // Button text based on language and state - memoized for performance
  const buttonText = useMemo(() => {
    return isBlocked
      ? isBg
        ? 'Разблокирай'
        : 'Unblock'
      : isBg
        ? 'Блокирай'
        : 'Block';
  }, [isBlocked, isBg]);

  // Don't show button if checking status or no current user
  if (isLoading || !currentUser?.uid) {
    return null;
  }

  // Don't show button if trying to block yourself
  if (currentUser.uid === targetUserFirebaseId) {
    return null;
  }

  return (
    <Button
      onClick={handleToggleBlock}
      disabled={isProcessing}
      $variant={variant}
      $size={size}
      $isBlocked={isBlocked}
      aria-label={isBlocked ? 'Unblock user' : 'Block user'}
    >
      {isProcessing ? (
        <>
          <LoadingSpinner />
          {isBg ? 'Обработване...' : 'Processing...'}
        </>
      ) : isBlocked ? (
        <>
          <Check size={18} />
          {buttonText}
        </>
      ) : (
        <>
          <Ban size={18} />
          {buttonText}
        </>
      )}
    </Button>
  );
};

export default BlockUserButton;
