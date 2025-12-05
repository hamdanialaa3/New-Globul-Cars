/**
 * Trust Network Service
 * Manages trust connections between users
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';
import type {
  TrustConnection,
  TrustNetworkStats
} from '../../types/profile-enhancements.types';

export class TrustNetworkService {
  private static instance: TrustNetworkService;
  private readonly collectionName = 'trustConnections';

  private constructor() {}

  public static getInstance(): TrustNetworkService {
    if (!TrustNetworkService.instance) {
      TrustNetworkService.instance = new TrustNetworkService();
    }
    return TrustNetworkService.instance;
  }

  /**
   * Create a trust connection
   */
  async createConnection(
    fromUserId: string,
    toUserId: string,
    type: 'partner' | 'recommended' | 'verified',
    note?: string
  ): Promise<string> {
    try {
      // Check if connection already exists
      const existing = await this.getConnection(fromUserId, toUserId);
      if (existing) {
        throw new Error('Connection already exists');
      }

      const connectionRef = doc(collection(db, this.collectionName));
      const connection: TrustConnection = {
        id: connectionRef.id,
        fromUserId,
        toUserId,
        type,
        status: 'pending',
        note,
        createdAt: serverTimestamp() as any
      };

      await setDoc(connectionRef, connection);
      serviceLogger.info(
        `Trust connection created: ${connectionRef.id} from ${fromUserId} to ${toUserId}`
      );
      return connectionRef.id;
    } catch (error) {
      serviceLogger.error('Error creating trust connection:', error);
      throw error;
    }
  }

  /**
   * Get a specific connection
   */
  async getConnection(
    fromUserId: string,
    toUserId: string
  ): Promise<TrustConnection | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('fromUserId', '==', fromUserId),
        where('toUserId', '==', toUserId),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as TrustConnection;
    } catch (error) {
      serviceLogger.error('Error getting connection:', error);
      throw error;
    }
  }

  /**
   * Get all connections for a user (incoming)
   */
  async getIncomingConnections(
    userId: string,
    status: 'active' | 'pending' | 'rejected' = 'active'
  ): Promise<TrustConnection[]> {
    try {
      // Validate userId
      if (!userId || typeof userId !== 'string') {
        return [];
      }

      const q = query(
        collection(db, this.collectionName),
        where('toUserId', '==', userId),
        where('status', '==', status),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TrustConnection));
    } catch (error) {
      serviceLogger.error('Error getting incoming connections:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  /**
   * Get all connections from a user (outgoing)
   */
  async getOutgoingConnections(
    userId: string,
    status: 'active' | 'pending' | 'rejected' = 'active'
  ): Promise<TrustConnection[]> {
    try {
      // Validate userId
      if (!userId || typeof userId !== 'string') {
        return [];
      }

      const q = query(
        collection(db, this.collectionName),
        where('fromUserId', '==', userId),
        where('status', '==', status),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TrustConnection));
    } catch (error) {
      serviceLogger.error('Error getting outgoing connections:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  /**
   * Update connection status
   */
  async updateConnectionStatus(
    connectionId: string,
    status: 'active' | 'pending' | 'rejected'
  ): Promise<void> {
    try {
      const connectionRef = doc(db, this.collectionName, connectionId);
      await updateDoc(connectionRef, {
        status,
        updatedAt: serverTimestamp()
      });
      serviceLogger.info(`Connection status updated: ${connectionId} to ${status}`);
    } catch (error) {
      serviceLogger.error('Error updating connection status:', error);
      throw error;
    }
  }

  /**
   * Delete a connection
   */
  async deleteConnection(connectionId: string): Promise<void> {
    try {
      const connectionRef = doc(db, this.collectionName, connectionId);
      await deleteDoc(connectionRef);
      serviceLogger.info(`Connection deleted: ${connectionId}`);
    } catch (error) {
      serviceLogger.error('Error deleting connection:', error);
      throw error;
    }
  }

  /**
   * Get trust network statistics
   */
  async getNetworkStats(userId: string): Promise<TrustNetworkStats> {
    try {
      // Validate userId
      if (!userId || typeof userId !== 'string') {
        return {
          partners: 0,
          recommendedBy: 0,
          recommendedTo: 0,
          verifiedConnections: 0
        };
      }

      const incoming = await this.getIncomingConnections(userId, 'active');

      const partners = incoming.filter(c => c.type === 'partner').length;
      const recommendedBy = incoming.filter(c => c.type === 'recommended').length;
      const verifiedConnections = incoming.filter(c => c.type === 'verified').length;

      const outgoing = await this.getOutgoingConnections(userId, 'active');
      const recommendedTo = outgoing.filter(c => c.type === 'recommended').length;

      return {
        partners,
        recommendedBy,
        recommendedTo,
        verifiedConnections
      };
    } catch (error) {
      serviceLogger.error('Error getting network stats:', error);
      return {
        partners: 0,
        recommendedBy: 0,
        recommendedTo: 0,
        verifiedConnections: 0
      };
    }
  }

  /**
   * Accept a pending connection
   */
  async acceptConnection(connectionId: string): Promise<void> {
    await this.updateConnectionStatus(connectionId, 'active');
  }

  /**
   * Reject a pending connection
   */
  async rejectConnection(connectionId: string): Promise<void> {
    await this.updateConnectionStatus(connectionId, 'rejected');
  }
}

export const trustNetworkService = TrustNetworkService.getInstance();

