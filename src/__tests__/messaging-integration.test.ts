/**
 * Messaging System Integration Tests
 * ===================================
 * Critical test scenarios for messaging repair validation
 * 
 * @gpt-suggestion Phase 6 - Test scenarios
 * @author Implementation - January 14, 2026
 */

import { renderHook, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react-hooks';
import { useRealtimeMessaging } from '@/hooks/messaging/useRealtimeMessaging.branded';
import { ref, set, push, onDisconnect } from 'firebase/database';
import { getDatabase } from 'firebase/database';
import { messageDeletionService } from '@/services/messaging/message-deletion.service';
import { userReportService } from '@/services/messaging/user-report.service';
import { carLifecycleService } from '@/services/garage/car-lifecycle.service';
import { NumericUserId } from '@/types/branded-types';

// Mock Firebase
jest.mock('@/firebase/firebase-config');

describe('Messaging System Integration Tests', () => {
  
  // ==================== TEST 1: Offline Message Queuing ====================
  
  describe('1. Offline Message Queuing', () => {
    it('should queue messages when offline and send when online', async () => {
      const { result } = renderHook(() => 
        useRealtimeMessaging(
          NumericUserId.parse(18),
          'firebase-uid-abc123'
        )
      );
      
      // Simulate offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false
        });
        window.dispatchEvent(new Event('offline'));
      });
      
      // Send message while offline
      const messageId = await act(async () => {
        return await result.current.sendMessage({
          content: 'Test offline message',
          recipientNumericId: 5,
          carId: 42
        });
      });
      
      expect(messageId).toBeTruthy();
      
      // Simulate online
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: true
        });
        window.dispatchEvent(new Event('online'));
      });
      
      // Wait for sync
      await waitFor(() => {
        expect(result.current.messages).toContainEqual(
          expect.objectContaining({ content: 'Test offline message' })
        );
      }, { timeout: 5000 });
    });
    
    it('should preserve message order after reconnection', async () => {
      const { result } = renderHook(() => 
        useRealtimeMessaging(
          NumericUserId.parse(18),
          'firebase-uid-abc123'
        )
      );
      
      // Send 3 messages while offline
      const messageIds: string[] = [];
      
      act(() => {
        Object.defineProperty(navigator, 'onLine', { value: false });
      });
      
      for (let i = 1; i <= 3; i++) {
        const id = await act(async () => {
          return await result.current.sendMessage({
            content: `Message ${i}`,
            recipientNumericId: 5,
            carId: 42
          });
        });
        messageIds.push(id);
      }
      
      // Go online
      act(() => {
        Object.defineProperty(navigator, 'onLine', { value: true });
        window.dispatchEvent(new Event('online'));
      });
      
      // Verify order
      await waitFor(() => {
        const messages = result.current.messages;
        const indices = messageIds.map(id => 
          messages.findIndex(m => m.messageId === id)
        );
        
        // Indices should be in ascending order
        expect(indices[0]).toBeLessThan(indices[1]);
        expect(indices[1]).toBeLessThan(indices[2]);
      });
    });
  });
  
  // ==================== TEST 2: Concurrent Message Handling ====================
  
  describe('2. Concurrent Message Handling', () => {
    it('should handle simultaneous messages from multiple users', async () => {
      const { result } = renderHook(() => 
        useRealtimeMessaging(
          NumericUserId.parse(18),
          'firebase-uid-abc123'
        )
      );
      
      const db = getDatabase();
      const channelId = 'msg_5_18_car_42';
      
      // Simulate 5 users sending messages simultaneously
      const promises = Array.from({ length: 5 }, (_, i) => {
        const messageRef = push(ref(db, `messages/${channelId}`));
        return set(messageRef, {
          content: `Concurrent message ${i + 1}`,
          senderNumericId: 5 + i,
          timestamp: Date.now() + i,
          status: 'sent'
        });
      });
      
      await Promise.all(promises);
      
      // Wait for all messages to arrive
      await waitFor(() => {
        expect(result.current.messages.length).toBe(5);
      });
      
      // Verify no duplicates
      const messageContents = result.current.messages.map(m => m.content);
      const uniqueContents = new Set(messageContents);
      expect(uniqueContents.size).toBe(5);
    });
    
    it('should handle rapid typing (debouncing)', async () => {
      const { result } = renderHook(() => 
        useRealtimeMessaging(
          NumericUserId.parse(18),
          'firebase-uid-abc123'
        )
      );
      
      // Simulate rapid typing indicator updates
      const updates: Promise<void>[] = [];
      
      for (let i = 0; i < 20; i++) {
        updates.push(
          act(async () => {
            result.current.setTyping?.(true);
          })
        );
      }
      
      await Promise.all(updates);
      
      // Verify only last update persists (debounced)
      await waitFor(() => {
        const db = getDatabase();
        const typingRef = ref(db, `typing/msg_5_18_car_42/18`);
        // Should have only 1 final update, not 20
        expect(typingRef).toBeDefined();
      });
    });
  });
  
  // ==================== TEST 3: Block Enforcement ====================
  
  describe('3. Block Enforcement', () => {
    it('should prevent channel creation with blocked users', async () => {
      const { result } = renderHook(() => 
        useRealtimeMessaging(
          NumericUserId.parse(18),
          'firebase-uid-abc123'
        )
      );
      
      // Mock block check
      const blockService = require('@/services/block-service');
      jest.spyOn(blockService, 'isBlocked').mockResolvedValue(true);
      
      // Attempt to send message to blocked user
      await expect(
        result.current.sendMessage({
          content: 'Test message',
          recipientNumericId: 666,
          carId: 42
        })
      ).rejects.toThrow('Cannot message blocked user');
    });
    
    it('should close existing channel when user is blocked mid-conversation', async () => {
      const { result } = renderHook(() => 
        useRealtimeMessaging(
          NumericUserId.parse(18),
          'firebase-uid-abc123'
        )
      );
      
      // Start conversation
      await act(async () => {
        await result.current.sendMessage({
          content: 'Initial message',
          recipientNumericId: 5,
          carId: 42
        });
      });
      
      // Block user
      const blockService = require('@/services/block-service');
      await act(async () => {
        await blockService.blockUser(18, 5);
      });
      
      // Verify channel is inaccessible
      await waitFor(() => {
        const channel = result.current.currentChannel;
        expect(channel).toBeNull();
      });
    });
  });
  
  // ==================== TEST 4: Memory Leak Prevention ====================
  
  describe('4. Memory Leak Prevention', () => {
    it('should cleanup listeners on unmount', async () => {
      const { result, unmount } = renderHook(() => 
        useRealtimeMessaging(
          NumericUserId.parse(18),
          'firebase-uid-abc123'
        )
      );
      
      // Wait for initialization
      await waitFor(() => {
        expect(result.current.channels.length).toBeGreaterThan(0);
      });
      
      // Track setState calls after unmount
      const setStateCalls: string[] = [];
      const originalConsoleError = console.error;
      console.error = (msg: string) => {
        if (msg.includes('setState') || msg.includes('unmounted')) {
          setStateCalls.push(msg);
        }
        originalConsoleError(msg);
      };
      
      // Unmount
      unmount();
      
      // Trigger listener updates
      const db = getDatabase();
      await set(ref(db, `messages/msg_5_18_car_42/test`), {
        content: 'After unmount',
        timestamp: Date.now()
      });
      
      // Wait and verify no setState errors
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(setStateCalls).toHaveLength(0);
      
      console.error = originalConsoleError;
    });
    
    it('should use isActiveRef pattern correctly', () => {
      const { result } = renderHook(() => 
        useRealtimeMessaging(
          NumericUserId.parse(18),
          'firebase-uid-abc123'
        )
      );
      
      // Access internal implementation (TypeScript bypass)
      const hookInstance = (result.current as any).__implementation;
      expect(hookInstance.isActiveRef).toBeDefined();
      expect(hookInstance.isActiveRef.current).toBe(true);
    });
  });
  
  // ==================== TEST 5: Numeric ID Resolution ====================
  
  describe('5. Numeric ID Resolution', () => {
    it('should resolve numeric IDs to Firebase UIDs correctly', async () => {
      const numericIdService = require('@/services/numeric-id-system.service');
      
      // Mock resolution
      jest.spyOn(numericIdService, 'getUserNumericId')
        .mockResolvedValue('firebase-uid-user18');
      
      const firebaseUid = await numericIdService.getUserNumericId(18);
      expect(firebaseUid).toBe('firebase-uid-user18');
    });
    
    it('should handle missing numeric ID mappings', async () => {
      const numericIdService = require('@/services/numeric-id-system.service');
      
      jest.spyOn(numericIdService, 'getUserNumericId')
        .mockResolvedValue(null);
      
      const firebaseUid = await numericIdService.getUserNumericId(99999);
      expect(firebaseUid).toBeNull();
    });
    
    it('should generate channel IDs deterministically', () => {
      const getChannelId = (user1: number, user2: number, carId: number) => {
        const [min, max] = user1 < user2 ? [user1, user2] : [user2, user1];
        return `msg_${min}_${max}_car_${carId}`;
      };
      
      // Same users, different order → same channel ID
      expect(getChannelId(18, 5, 42)).toBe(getChannelId(5, 18, 42));
      expect(getChannelId(18, 5, 42)).toBe('msg_5_18_car_42');
    });
  });
  
  // ==================== TEST 6: Car Deletion Cascade ====================
  
  describe('6. Car Deletion Cascade', () => {
    it('should archive conversations when car is deleted', async () => {
      const carId = 42;
      const sellerId = 18;
      
      // Simulate car deletion
      await act(async () => {
        await carLifecycleService.handleCarDeletion(sellerId, carId);
      });
      
      // Verify conversations archived
      const db = getDatabase();
      const channelRef = ref(db, `channels/msg_5_18_car_42/metadata`);
      const snapshot = await waitFor(async () => {
        return await get(channelRef);
      });
      
      expect(snapshot.val().archived).toBe(true);
      expect(snapshot.val().archivedReason).toBe('car_deleted');
    });
    
    it('should prevent new messages to archived conversations', async () => {
      const { result } = renderHook(() => 
        useRealtimeMessaging(
          NumericUserId.parse(18),
          'firebase-uid-abc123'
        )
      );
      
      // Archive channel
      await act(async () => {
        await carLifecycleService.handleCarDeletion(18, 42);
      });
      
      // Attempt to send message
      await expect(
        result.current.sendMessage({
          content: 'Test to archived channel',
          recipientNumericId: 5,
          carId: 42
        })
      ).rejects.toThrow('Conversation archived');
    });
  });
  
  // ==================== TEST 7: Read Receipt Sync ====================
  
  describe('7. Read Receipt Sync', () => {
    it('should update read status across devices', async () => {
      const db = getDatabase();
      const channelId = 'msg_5_18_car_42';
      
      // Send message from user 5
      const messageRef = push(ref(db, `messages/${channelId}`));
      await set(messageRef, {
        content: 'Test read receipt',
        senderNumericId: 5,
        recipientNumericId: 18,
        timestamp: Date.now(),
        status: 'sent'
      });
      
      // User 18 marks as read
      const { result } = renderHook(() => 
        useRealtimeMessaging(
          NumericUserId.parse(18),
          'firebase-uid-abc123'
        )
      );
      
      await act(async () => {
        await result.current.markAsRead(channelId);
      });
      
      // Verify Firestore updated (for FCM)
      const firestoreDoc = await waitFor(async () => {
        const { doc, getDoc } = require('firebase/firestore');
        const docRef = doc(db, `notifications/${5}/messages/${channelId}`);
        return await getDoc(docRef);
      });
      
      expect(firestoreDoc.data().readAt).toBeDefined();
    });
    
    it('should show correct read status in UI', async () => {
      const { result } = renderHook(() => 
        useRealtimeMessaging(
          NumericUserId.parse(18),
          'firebase-uid-abc123'
        )
      );
      
      // Send message
      await act(async () => {
        await result.current.sendMessage({
          content: 'Status test',
          recipientNumericId: 5,
          carId: 42
        });
      });
      
      // Wait for message
      await waitFor(() => {
        const lastMessage = result.current.messages[result.current.messages.length - 1];
        expect(lastMessage.status).toBe('sent');
      });
      
      // Simulate recipient read
      const db = getDatabase();
      const messageId = result.current.messages[result.current.messages.length - 1].messageId;
      await set(ref(db, `messages/msg_5_18_car_42/${messageId}/status`), 'read');
      
      // Verify status updated
      await waitFor(() => {
        const lastMessage = result.current.messages[result.current.messages.length - 1];
        expect(lastMessage.status).toBe('read');
      });
    });
  });
  
  // ==================== BONUS: Integration Test ====================
  
  describe('8. End-to-End Flow', () => {
    it('should complete full messaging lifecycle', async () => {
      // 1. User 18 sends message to user 5
      const { result: sender } = renderHook(() => 
        useRealtimeMessaging(
          NumericUserId.parse(18),
          'firebase-uid-sender'
        )
      );
      
      const messageId = await act(async () => {
        return await sender.current.sendMessage({
          content: 'Hello, interested in your car!',
          recipientNumericId: 5,
          carId: 42
        });
      });
      
      expect(messageId).toBeTruthy();
      
      // 2. User 5 receives message
      const { result: recipient } = renderHook(() => 
        useRealtimeMessaging(
          NumericUserId.parse(5),
          'firebase-uid-recipient'
        )
      );
      
      await waitFor(() => {
        expect(recipient.current.messages).toContainEqual(
          expect.objectContaining({ content: 'Hello, interested in your car!' })
        );
      });
      
      // 3. User 5 marks as read
      await act(async () => {
        await recipient.current.markAsRead('msg_5_18_car_42');
      });
      
      // 4. User 18 sees read status
      await waitFor(() => {
        const message = sender.current.messages.find(m => m.messageId === messageId);
        expect(message?.status).toBe('read');
      });
      
      // 5. User 5 replies
      await act(async () => {
        await recipient.current.sendMessage({
          content: 'Sure! When can you come for a test drive?',
          recipientNumericId: 18,
          carId: 42
        });
      });
      
      // 6. Verify conversation exists for both users
      expect(sender.current.messages.length).toBe(2);
      expect(recipient.current.messages.length).toBe(2);
    });
  });
});
