// src/services/calls/call-service.ts
// Call Service - خدمة المكالمات الصوتية والمرئية
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@globul-cars/services/firebase/firebase-config';

// ==================== INTERFACES ====================

export interface CallSession {
  id?: string;
  callerId: string;
  receiverId: string;
  type: 'voice' | 'video';
  status: 'ringing' | 'active' | 'ended' | 'missed' | 'declined';
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in seconds
  quality?: number; // 1-5
  agoraChannelId?: string;
  createdAt: Date;
}

export interface CallHistory {
  calls: CallSession[];
  totalCalls: number;
  totalDuration: number; // in seconds
  averageDuration: number;
}

// ==================== SERVICE CLASS ====================

export class CallService {
  private static instance: CallService;
  private readonly APP_ID = process.env.REACT_APP_AGORA_APP_ID || '';

  private constructor() {}

  public static getInstance(): CallService {
    if (!CallService.instance) {
      CallService.instance = new CallService();
    }
    return CallService.instance;
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Initiate a call
   * بدء مكالمة
   */
  async initiateCall(
    callerId: string,
    receiverId: string,
    type: 'voice' | 'video'
  ): Promise<{ success: boolean; callId?: string; error?: string }> {
    try {
      // Create call session
      const callData: Omit<CallSession, 'id'> = {
        callerId,
        receiverId,
        type,
        status: 'ringing',
        agoraChannelId: this.generateChannelId(),
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'calls'), {
        ...callData,
        createdAt: serverTimestamp()
      });

      console.log('✅ Call initiated:', docRef.id);

      return {
        success: true,
        callId: docRef.id
      };

    } catch (error: any) {
      console.error('❌ Initiate call failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Answer a call
   * الرد على مكالمة
   */
  async answerCall(callId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'calls', callId), {
        status: 'active',
        startTime: serverTimestamp()
      });

      console.log('✅ Call answered');
      return true;
    } catch (error) {
      console.error('❌ Answer call failed:', error);
      return false;
    }
  }

  /**
   * End a call
   * إنهاء مكالمة
   */
  async endCall(callId: string, quality?: number): Promise<boolean> {
    try {
      const callDoc = await this.getCall(callId);
      
      if (!callDoc) return false;

      const duration = callDoc.startTime
        ? Math.floor((Date.now() - callDoc.startTime.getTime()) / 1000)
        : 0;

      await updateDoc(doc(db, 'calls', callId), {
        status: 'ended',
        endTime: serverTimestamp(),
        duration,
        quality: quality || null
      });

      console.log('✅ Call ended');
      return true;
    } catch (error) {
      console.error('❌ End call failed:', error);
      return false;
    }
  }

  /**
   * Decline a call
   * رفض مكالمة
   */
  async declineCall(callId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'calls', callId), {
        status: 'declined',
        endTime: serverTimestamp()
      });

      console.log('✅ Call declined');
      return true;
    } catch (error) {
      console.error('❌ Decline call failed:', error);
      return false;
    }
  }

  /**
   * Get call history for user
   * الحصول على سجل المكالمات
   */
  async getCallHistory(userId: string, limitCount: number = 50): Promise<CallHistory> {
    try {
      const q = query(
        collection(db, 'calls'),
        where('participants', 'array-contains', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      
      const calls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        startTime: doc.data().startTime?.toDate(),
        endTime: doc.data().endTime?.toDate()
      } as CallSession));

      const totalCalls = calls.length;
      const totalDuration = calls
        .filter(c => c.duration)
        .reduce((sum, c) => sum + (c.duration || 0), 0);
      
      const averageDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

      return {
        calls,
        totalCalls,
        totalDuration,
        averageDuration: Math.round(averageDuration)
      };

    } catch (error) {
      console.error('❌ Get call history failed:', error);
      return {
        calls: [],
        totalCalls: 0,
        totalDuration: 0,
        averageDuration: 0
      };
    }
  }

  // ==================== HELPERS ====================

  /**
   * Generate unique channel ID for Agora
   * توليد معرف قناة فريد
   */
  private generateChannelId(): string {
    return `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get single call
   * الحصول على مكالمة واحدة
   */
  private async getCall(callId: string): Promise<CallSession | null> {
    try {
      const q = query(
        collection(db, 'calls'),
        where('__name__', '==', callId),
        limit(1)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        startTime: doc.data().startTime?.toDate(),
        endTime: doc.data().endTime?.toDate()
      } as CallSession;

    } catch (error) {
      console.error('❌ Get call failed:', error);
      return null;
    }
  }

  /**
   * Format call duration
   * تنسيق مدة المكالمة
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

// Export singleton
export const callService = CallService.getInstance();
