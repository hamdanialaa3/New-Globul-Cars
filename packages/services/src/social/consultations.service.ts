// src/services/social/consultations.service.ts
// Consultations Service - Expert advice system
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';

// ==================== TYPES ====================

export interface CreateConsultationData {
  category: 'buying_advice' | 'selling_advice' | 'technical' | 'financing' | 'legal' | 'general';
  topic: string;
  description: string;
  carReference?: {
    carId?: string;
    make: string;
    model: string;
    year: number;
    price?: number;
    image?: string;
  };
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  expertId?: string;
}

export interface Consultation {
  id: string;
  requesterId: string;
  requesterInfo: {
    displayName: string;
    profileImage?: string;
    location: string;
  };
  expertId?: string;
  expertInfo?: {
    displayName: string;
    profileImage?: string;
    profileType: string;
    rating: number;
  };
  category: string;
  topic: string;
  description: string;
  carReference?: any;
  urgency: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  messagesCount: number;
  rating?: {
    score: number;
    review: string;
    ratedAt: Timestamp;
  };
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ConsultationMessage {
  id: string;
  senderId: string;
  senderType: 'requester' | 'expert';
  content: string;
  attachments?: {
    type: 'image' | 'document';
    url: string;
    name: string;
  }[];
  timestamp: Timestamp;
  isRead: boolean;
}

// ==================== SERVICE ====================

class ConsultationsService {
  
  async requestConsultation(
    requesterId: string, 
    data: CreateConsultationData
  ): Promise<string> {
    try {
      const requesterDoc = await getDoc(doc(db, 'users', requesterId));
      if (!requesterDoc.exists()) throw new Error('User not found');
      
      const requesterData = requesterDoc.data();
      
      const consultationRef = await addDoc(collection(db, 'consultations'), {
        requesterId,
        requesterInfo: {
          displayName: requesterData.displayName || 'Anonymous',
          profileImage: requesterData.profileImage?.url,
          location: requesterData.location?.city || 'Unknown'
        },
        expertId: data.expertId || null,
        expertInfo: data.expertId ? await this.getExpertInfo(data.expertId) : null,
        category: data.category,
        topic: data.topic,
        description: data.description,
        carReference: data.carReference,
        urgency: data.urgency,
        status: data.expertId ? 'assigned' : 'open',
        messagesCount: 0,
        isPublic: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      if (data.expertId) {
        await this.sendNotification(data.expertId, {
          type: 'consultation_request',
          from: requesterId,
          consultationId: consultationRef.id
        });
      }
      
      return consultationRef.id;
    } catch (error) {
      serviceLogger.error('Error requesting consultation', error as Error, { requesterId, category: data.category });
      throw new Error('Failed to create consultation');
    }
  }
  
  async sendMessage(
    consultationId: string,
    senderId: string,
    content: string,
    senderType: 'requester' | 'expert'
  ): Promise<string> {
    try {
      const messageRef = await addDoc(
        collection(db, 'consultations', consultationId, 'messages'),
        {
          senderId,
          senderType,
          content,
          timestamp: serverTimestamp(),
          isRead: false
        }
      );
      
      await updateDoc(doc(db, 'consultations', consultationId), {
        messagesCount: increment(1),
        status: 'in_progress',
        updatedAt: serverTimestamp()
      });
      
      const consultationDoc = await getDoc(doc(db, 'consultations', consultationId));
      const consultationData = consultationDoc.data();
      
      const recipientId = senderType === 'requester' 
        ? consultationData?.expertId 
        : consultationData?.requesterId;
      
      if (recipientId) {
        await this.sendNotification(recipientId, {
          type: 'consultation_response',
          from: senderId,
          consultationId
        });
      }
      
      return messageRef.id;
    } catch (error) {
      serviceLogger.error('Error sending message', error as Error, { consultationId, senderId });
      throw new Error('Failed to send message');
    }
  }
  
  async getMessages(consultationId: string, limitCount: number = 50): Promise<ConsultationMessage[]> {
    try {
      const q = query(
        collection(db, 'consultations', consultationId, 'messages'),
        orderBy('timestamp', 'asc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ConsultationMessage));
    } catch (error) {
      serviceLogger.error('Error getting messages', error as Error, { consultationId, limitCount });
      return [];
    }
  }
  
  async getUserConsultations(userId: string): Promise<Consultation[]> {
    try {
      // ✅ CRITICAL FIX: Guard against null/undefined userId
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        serviceLogger.warn('getUserConsultations called with invalid userId', { userId });
        return [];
      }

      const q = query(
        collection(db, 'consultations'),
        where('requesterId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Consultation));
    } catch (error) {
      serviceLogger.error('Error getting user consultations', error as Error, { userId });
      return [];
    }
  }
  
  async getExpertConsultations(expertId: string): Promise<Consultation[]> {
    try {
      // ✅ CRITICAL FIX: Guard against null/undefined expertId
      if (!expertId || typeof expertId !== 'string' || expertId.trim() === '') {
        serviceLogger.warn('getExpertConsultations called with invalid expertId', { expertId });
        return [];
      }

      const q = query(
        collection(db, 'consultations'),
        where('expertId', '==', expertId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Consultation));
    } catch (error) {
      serviceLogger.error('Error getting expert consultations', error as Error, { expertId });
      return [];
    }
  }
  
  async completeConsultation(
    consultationId: string,
    rating: number,
    review: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'consultations', consultationId), {
        status: 'completed',
        rating: {
          score: rating,
          review,
          ratedAt: serverTimestamp()
        },
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      const consultationDoc = await getDoc(doc(db, 'consultations', consultationId));
      const expertId = consultationDoc.data()?.expertId;
      
      if (expertId) {
        await this.updateExpertStats(expertId, rating);
      }
    } catch (error) {
      serviceLogger.error('Error completing consultation', error as Error, { consultationId, rating });
      throw new Error('Failed to complete consultation');
    }
  }
  
  private async getExpertInfo(expertId: string): Promise<any> {
    const expertDoc = await getDoc(doc(db, 'users', expertId));
    const expertData = expertDoc.data();
    
    return {
      displayName: expertData?.displayName || 'Expert',
      profileImage: expertData?.profileImage?.url,
      profileType: expertData?.profileType || 'private',
      rating: expertData?.expertProfile?.rating || 0
    };
  }
  
  private async updateExpertStats(expertId: string, rating: number): Promise<void> {
    const expertDoc = await getDoc(doc(db, 'expert_profiles', expertId));
    
    if (expertDoc.exists()) {
      const currentStats = expertDoc.data().consultationStats || {};
      const total = currentStats.totalRatings || 0;
      const currentAvg = currentStats.averageRating || 0;
      const newAvg = ((currentAvg * total) + rating) / (total + 1);
      
      await updateDoc(doc(db, 'expert_profiles', expertId), {
        'consultationStats.totalConsultations': increment(1),
        'consultationStats.completedConsultations': increment(1),
        'consultationStats.totalRatings': increment(1),
        'consultationStats.averageRating': newAvg
      });
    }
  }
  
  private async sendNotification(toUserId: string, data: any): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: toUserId,
        ...data,
        isRead: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      serviceLogger.error('Error sending notification', error as Error, { toUserId, type: data.type });
    }
  }
}

export const consultationsService = new ConsultationsService();

