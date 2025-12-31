import { db } from '@/firebase/firebase-config';
import { collection, doc, setDoc, updateDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { logger } from '@/services/logger-service';

/**
 * Offer Status
 */
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';

/**
 * Offer Data Interface
 */
export interface Offer {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  carId: string;
  offerAmount: number;
  currency: string;
  status: OfferStatus;
  message?: string;
  counterAmount?: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

/**
 * OFFER WORKFLOW SERVICE
 * ----------------------
 * إدارة دورة حياة العروض من الإنشاء إلى القبول/الرفض
 * 
 * الميزات:
 * - إنشاء عرض رسمي
 * - قبول/رفض العرض
 * - عرض مضاد (counter-offer)
 * - انتهاء صلاحية العروض تلقائياً
 * - تتبع تاريخ العروض
 * 
 * @architect Senior System Architect
 * @compliance PROJECT_CONSTITUTION.md
 * @date December 29, 2025
 */
class OfferWorkflowService {
  private static instance: OfferWorkflowService;
  private readonly OFFERS_COLLECTION = 'offers';
  private readonly DEFAULT_EXPIRY_DAYS = 7; // 7 days validity

  private constructor() {
    logger.info('[OfferWorkflowService] Initialized');
  }

  static getInstance(): OfferWorkflowService {
    if (!this.instance) {
      this.instance = new OfferWorkflowService();
    }
    return this.instance;
  }

  /**
   * CREATE OFFER
   * إنشاء عرض سعر رسمي
   */
  async createOffer(data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    carId: string;
    offerAmount: number;
    currency?: string;
    message?: string;
    expiryDays?: number;
  }): Promise<Offer> {
    try {
      const {
        conversationId,
        senderId,
        receiverId,
        carId,
        offerAmount,
        currency = 'EUR',
        message,
        expiryDays = this.DEFAULT_EXPIRY_DAYS
      } = data;

      // Validation
      if (offerAmount <= 0) {
        throw new Error('Offer amount must be positive');
      }

      const offerId = `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);

      const offer: Offer = {
        id: offerId,
        conversationId,
        senderId,
        receiverId,
        carId,
        offerAmount,
        currency,
        status: 'pending',
        message,
        createdAt: now,
        updatedAt: now,
        expiresAt
      };

      const offerRef = doc(db, this.OFFERS_COLLECTION, offerId);
      await setDoc(offerRef, offer);

      logger.info('[OfferWorkflowService] Offer created', {
        offerId,
        offerAmount,
        currency
      });

      return offer;
    } catch (error) {
      logger.error('[OfferWorkflowService] Failed to create offer', error as Error);
      throw error;
    }
  }

  /**
   * UPDATE OFFER STATUS
   * تحديث حالة العرض
   */
  async updateOfferStatus(
    offerId: string,
    status: OfferStatus,
    counterAmount?: number
  ): Promise<void> {
    try {
      const offerRef = doc(db, this.OFFERS_COLLECTION, offerId);

      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (counterAmount !== undefined && status === 'countered') {
        if (counterAmount <= 0) {
          throw new Error('Counter amount must be positive');
        }
        updateData.counterAmount = counterAmount;
      }

      await updateDoc(offerRef, updateData);

      logger.info('[OfferWorkflowService] Offer status updated', {
        offerId,
        status,
        counterAmount
      });
    } catch (error) {
      logger.error('[OfferWorkflowService] Failed to update offer', error as Error, {
        offerId
      });
      throw error;
    }
  }

  /**
   * GET OFFER
   * الحصول على عرض محدد
   */
  async getOffer(offerId: string): Promise<Offer | null> {
    try {
      const offerRef = doc(db, this.OFFERS_COLLECTION, offerId);
      const offerSnap = await getDoc(offerRef);

      if (!offerSnap.exists()) {
        logger.warn('[OfferWorkflowService] Offer not found', { offerId });
        return null;
      }

      const offer = offerSnap.data() as Offer;

      // Check if expired
      if (this.isOfferExpired(offer)) {
        // Auto-update to expired
        if (offer.status === 'pending') {
          await this.updateOfferStatus(offerId, 'expired');
          offer.status = 'expired';
        }
      }

      return offer;
    } catch (error) {
      logger.error('[OfferWorkflowService] Failed to get offer', error as Error, { offerId });
      throw error;
    }
  }

  /**
   * GET CONVERSATION OFFERS
   * الحصول على جميع عروض محادثة
   */
  async getConversationOffers(conversationId: string): Promise<Offer[]> {
    try {
      const offersRef = collection(db, this.OFFERS_COLLECTION);
      const q = query(offersRef, where('conversationId', '==', conversationId));
      
      const snapshot = await getDocs(q);
      
      const offers: Offer[] = snapshot.docs.map(doc => doc.data() as Offer);

      // Sort by date (newest first)
      offers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      logger.info('[OfferWorkflowService] Fetched conversation offers', {
        conversationId,
        count: offers.length
      });

      return offers;
    } catch (error) {
      logger.error('[OfferWorkflowService] Failed to get conversation offers', error as Error, {
        conversationId
      });
      throw error;
    }
  }

  /**
   * GET CAR OFFERS
   * الحصول على جميع عروض سيارة معينة
   */
  async getCarOffers(carId: string): Promise<Offer[]> {
    try {
      const offersRef = collection(db, this.OFFERS_COLLECTION);
      const q = query(offersRef, where('carId', '==', carId));
      
      const snapshot = await getDocs(q);
      
      const offers: Offer[] = snapshot.docs.map(doc => doc.data() as Offer);

      // Sort by amount (highest first)
      offers.sort((a, b) => b.offerAmount - a.offerAmount);

      logger.info('[OfferWorkflowService] Fetched car offers', {
        carId,
        count: offers.length
      });

      return offers;
    } catch (error) {
      logger.error('[OfferWorkflowService] Failed to get car offers', error as Error, { carId });
      throw error;
    }
  }

  /**
   * ACCEPT OFFER
   * قبول العرض
   */
  async acceptOffer(offerId: string): Promise<void> {
    try {
      const offer = await this.getOffer(offerId);
      if (!offer) throw new Error('Offer not found');
      if (offer.status !== 'pending') throw new Error(`Cannot accept offer with status: ${offer.status}`);
      if (this.isOfferExpired(offer)) throw new Error('Offer has expired');
      await this.updateOfferStatus(offerId, 'accepted');

      // Trigger car sale workflow: set car as sold in the correct collection
      const carCollections = ['passenger_cars','suvs','vans','motorcycles','trucks','buses'];
      let carUpdated = false;
      for (const col of carCollections) {
        try {
          const carRef = doc(db, col, offer.carId);
          await updateDoc(carRef, { status: 'sold', isActive: false, updatedAt: new Date() });
          carUpdated = true;
          break;
        } catch (err) {
          // Ignore if not found in this collection
        }
      }
      if (!carUpdated) {
        logger.warn('[OfferWorkflowService] Car not found in any collection', { carId: offer.carId });
      }

      // Send notification to buyer
      const notificationRef = doc(db, 'notifications', `offer_accepted_${offerId}`);
      await setDoc(notificationRef, {
        userId: offer.senderId,
        type: 'offer_accepted',
        offerId,
        carId: offer.carId,
        message: 'Your offer was accepted!',
        createdAt: new Date(),
        read: false
      }, { merge: true });

      logger.info('[OfferWorkflowService] Offer accepted', { offerId });
    } catch (error) {
      logger.error('[OfferWorkflowService] Failed to accept offer', error as Error, { offerId });
      throw error;
    }
  }

  /**
   * REJECT OFFER
   * رفض العرض
   */
  async rejectOffer(offerId: string): Promise<void> {
    try {
      const offer = await this.getOffer(offerId);
      if (!offer) throw new Error('Offer not found');
      if (offer.status !== 'pending') throw new Error(`Cannot reject offer with status: ${offer.status}`);
      await this.updateOfferStatus(offerId, 'rejected');

      // Send notification to buyer
      const notificationRef = doc(db, 'notifications', `offer_rejected_${offerId}`);
      await setDoc(notificationRef, {
        userId: offer.senderId,
        type: 'offer_rejected',
        offerId,
        carId: offer.carId,
        message: 'Your offer was rejected.',
        createdAt: new Date(),
        read: false
      }, { merge: true });

      logger.info('[OfferWorkflowService] Offer rejected', { offerId });
    } catch (error) {
      logger.error('[OfferWorkflowService] Failed to reject offer', error as Error, { offerId });
      throw error;
    }
  }

  /**
   * COUNTER OFFER
   * عرض مضاد
   */
  async counterOffer(offerId: string, counterAmount: number): Promise<void> {
    try {
      const offer = await this.getOffer(offerId);
      if (!offer) throw new Error('Offer not found');
      if (offer.status !== 'pending') throw new Error(`Cannot counter offer with status: ${offer.status}`);
      if (this.isOfferExpired(offer)) throw new Error('Offer has expired');
      await this.updateOfferStatus(offerId, 'countered', counterAmount);

      // Send notification to buyer with counter offer
      const notificationRef = doc(db, 'notifications', `offer_countered_${offerId}`);
      await setDoc(notificationRef, {
        userId: offer.senderId,
        type: 'offer_countered',
        offerId,
        carId: offer.carId,
        message: `Seller sent a counter offer: ${counterAmount} ${offer.currency}`,
        createdAt: new Date(),
        read: false
      }, { merge: true });

      logger.info('[OfferWorkflowService] Counter offer sent', { offerId, counterAmount });
    } catch (error) {
      logger.error('[OfferWorkflowService] Failed to send counter offer', error as Error, { offerId });
      throw error;
    }
  }

  /**
   * IS OFFER EXPIRED
   * التحقق من انتهاء صلاحية العرض
   * @private
   */
  private isOfferExpired(offer: Offer): boolean {
    const now = new Date();
    return now > offer.expiresAt;
  }

  /**
   * CLEANUP EXPIRED OFFERS
   * تنظيف العروض المنتهية (يتم تشغيلها دورياً)
   */
  async cleanupExpiredOffers(): Promise<number> {
    try {
      const offersRef = collection(db, this.OFFERS_COLLECTION);
      const q = query(offersRef, where('status', '==', 'pending'));
      
      const snapshot = await getDocs(q);
      
      let expiredCount = 0;
      const now = new Date();

      for (const docSnap of snapshot.docs) {
        const offer = docSnap.data() as Offer;
        
        if (now > offer.expiresAt) {
          await this.updateOfferStatus(offer.id, 'expired');
          expiredCount++;
        }
      }

      logger.info('[OfferWorkflowService] Cleaned up expired offers', { expiredCount });

      return expiredCount;
    } catch (error) {
      logger.error('[OfferWorkflowService] Failed to cleanup expired offers', error as Error);
      throw error;
    }
  }
}

export const offerWorkflowService = OfferWorkflowService.getInstance();
