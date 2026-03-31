import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { AuctionListing, AuctionBid } from './auction-types';
import { logger } from '../logger-service';

const AUCTIONS_COL = 'auction_listings';

export const auctionService = {
  /**
   * Fetches all currently active local auctions in Bulgaria (B2B/C2B).
   */
  async getActiveAuctions(): Promise<AuctionListing[]> {
    try {
      const q = query(
        collection(db, AUCTIONS_COL),
        where('status', '==', 'active'),
        orderBy('pricing.currentBid', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuctionListing));
    } catch (error) {
      logger.error('Failed to fetch active auctions', error, { service: 'auctionService' });
      // Missing index will cause failure; return empty for UI resilience during dev
      return [];
    }
  },

  /**
   * Real-time listener for a single auction. Very important for "Live Bidding Room".
   * Used to update UI countdown and live price without refreshing.
   */
  subscribeToAuction(auctionId: string, callback: (auction: AuctionListing | null) => void): () => void {
    const docRef = doc(db, AUCTIONS_COL, auctionId);
    
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as AuctionListing);
      } else {
        callback(null);
      }
    }, (error) => {
      logger.error(`Snapshot error for auction ${auctionId}`, error, { service: 'auctionService' });
      callback(null);
    });
  },

  /**
   * Safe transaction to place a bid.
   * Ensures the bid is higher than the current bid at the exact moment of execution on the server.
   * Includes Anti-Sniping logic (extends auction by 1 minute if placed in the last minute).
   */
  async placeBid(auctionId: string, dealerId: string, amount: number): Promise<boolean> {
    const auctionRef = doc(db, AUCTIONS_COL, auctionId);
    const bidsCollection = collection(auctionRef, 'bids');
    const newBidRef = doc(bidsCollection);

    try {
      await runTransaction(db, async (transaction) => {
        const auctionDoc = await transaction.get(auctionRef);
        if (!auctionDoc.exists()) {
          throw new Error('Auction does not exist!');
        }

        const data = auctionDoc.data() as AuctionListing;
        
        // 1. Validate Status
        if (data.status !== 'active') {
          throw new Error('Auction is not active anymore.');
        }

        // 2. Validate Time
        let endTimeMS: number;
        if (typeof data.timing.endTime === 'string') {
          endTimeMS = new Date(data.timing.endTime).getTime();
        } else {
          // Assuming Firestore Timestamp
          endTimeMS = (data.timing.endTime as any).toMillis();
        }

        const nowMS = Date.now();
        if (nowMS >= endTimeMS) {
          throw new Error('Auction has ended.');
        }

        // 3. Validate Amount
        if (amount <= data.pricing.currentBid) {
          throw new Error(`Bid must be greater than current bid: ${data.pricing.currentBid}`);
        }

        // 4. Anti-Sniping Logic
        // If bid is placed when less than 60 seconds are remaining, extend the auction by 60 seconds.
        let newEndTime = data.timing.endTime;
        const timeRemainingMs = endTimeMS - nowMS;
        if (timeRemainingMs < 60000) {
          const extendedTime = new Date(endTimeMS + 60000); // add 60 seconds
          newEndTime = Timestamp.fromDate(extendedTime);
          logger.info(`Anti-Sniping triggered! Extended auction ${auctionId} by 60s.`, { service: 'auctionService' });
        }

        // Update Auction Doc
        transaction.update(auctionRef, {
          'pricing.currentBid': amount,
          'pricing.winningBidderId': dealerId,
          'bidsCount': (data.bidsCount || 0) + 1,
          'timing.endTime': newEndTime,
          'updatedAt': Timestamp.now()
        });

        // Add Bid to Subcollection
        const bidData: Omit<AuctionBid, 'id'> = {
          auctionId,
          bidderId: dealerId,
          amount,
          timestamp: Timestamp.now()
        };
        transaction.set(newBidRef, bidData);
      });

      logger.info(`Successfully placed bid of ${amount} on ${auctionId} by ${dealerId}`, { service: 'auctionService' });
      return true;
    } catch (error: any) {
      logger.error(`Transaction failed for bid on ${auctionId}`, error, { service: 'auctionService' });
      throw error;
    }
  }
};
