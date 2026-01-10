/**
 * ⌨️ useTypingIndicator Hook
 * خطاف مؤشر الكتابة
 * 
 * @description React hook for real-time typing indicators
 * خطاف React لمؤشرات الكتابة في الوقت الحقيقي
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import { typingIndicatorService } from '../../services/messaging/realtime';

// ==================== INTERFACES ====================

interface TypingUser {
  userId: number;
  userName?: string;
}

interface UseTypingIndicatorReturn {
  // State
  typingUsers: TypingUser[];
  isAnyoneTyping: boolean;
  typingText: string;
  
  // Actions
  startTyping: () => void;
  stopTyping: () => void;
  
  // For input binding
  onInputChange: () => void;
}

// ==================== HOOK ====================

export function useTypingIndicator(
  channelId: string | null,
  currentUserNumericId: number | null,
  currentUserName?: string,
  locale: 'bg' | 'en' = 'bg'
): UseTypingIndicatorReturn {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const isActiveRef = useRef(true);

  // ==================== CLEANUP ====================

  useEffect(() => {
    isActiveRef.current = true;
    
    return () => {
      isActiveRef.current = false;
      
      // Stop typing on unmount
      if (channelId && currentUserNumericId) {
        typingIndicatorService.stopTyping(channelId, currentUserNumericId);
      }
    };
  }, [channelId, currentUserNumericId]);

  // ==================== SUBSCRIBE TO TYPING ====================

  useEffect(() => {
    if (!channelId || !currentUserNumericId) {
      setTypingUsers([]);
      return;
    }

    const unsubscribe = typingIndicatorService.subscribeToTyping(
      channelId,
      currentUserNumericId,
      (users) => {
        if (isActiveRef.current) {
          setTypingUsers(users);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [channelId, currentUserNumericId]);

  // ==================== ACTIONS ====================

  const startTyping = useCallback(() => {
    if (!channelId || !currentUserNumericId) return;
    typingIndicatorService.setTyping(channelId, currentUserNumericId, currentUserName);
  }, [channelId, currentUserNumericId, currentUserName]);

  const stopTyping = useCallback(() => {
    if (!channelId || !currentUserNumericId) return;
    typingIndicatorService.stopTyping(channelId, currentUserNumericId);
  }, [channelId, currentUserNumericId]);

  // Convenience method for binding to input onChange
  const onInputChange = useCallback(() => {
    startTyping();
  }, [startTyping]);

  // ==================== COMPUTED VALUES ====================

  const isAnyoneTyping = typingUsers.length > 0;
  const typingText = typingIndicatorService.formatTypingText(typingUsers, locale);

  // ==================== RETURN ====================

  return {
    typingUsers,
    isAnyoneTyping,
    typingText,
    startTyping,
    stopTyping,
    onInputChange,
  };
}

export default useTypingIndicator;
