/**
 * Groups Service
 * Manages user groups and memberships
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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';
import type { UserGroup, GroupMembership } from '@/types/profile-enhancements.types';

export class GroupsService {
  private static instance: GroupsService;
  private readonly groupsCollection = 'userGroups';
  private readonly membershipsCollection = 'groupMemberships';

  private constructor() {}

  public static getInstance(): GroupsService {
    if (!GroupsService.instance) {
      GroupsService.instance = new GroupsService();
    }
    return GroupsService.instance;
  }

  /**
   * Create a new group
   */
  async createGroup(
    groupData: Omit<UserGroup, 'id' | 'memberCount' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const groupRef = doc(collection(db, this.groupsCollection));
      const group: UserGroup = {
        id: groupRef.id,
        ...groupData,
        memberCount: 0,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      };

      await setDoc(groupRef, group);
      serviceLogger.info(`Group created: ${groupRef.id}`);
      return groupRef.id;
    } catch (error) {
      serviceLogger.error('Error creating group:', error);
      throw error;
    }
  }

  /**
   * Get group by ID
   */
  async getGroup(groupId: string): Promise<UserGroup | null> {
    try {
      if (!groupId) return null;

      const groupRef = doc(db, this.groupsCollection, groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        return null;
      }

      return {
        id: groupSnap.id,
        ...groupSnap.data()
      } as UserGroup;
    } catch (error) {
      serviceLogger.error('Error getting group:', error);
      return null;
    }
  }

  /**
   * Get groups by category
   */
  async getGroupsByCategory(
    category: UserGroup['category'],
    limitCount: number = 20
  ): Promise<UserGroup[]> {
    try {
      const q = query(
        collection(db, this.groupsCollection),
        where('category', '==', category),
        where('isPublic', '==', true),
        orderBy('memberCount', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserGroup));
    } catch (error) {
      serviceLogger.error('Error getting groups by category:', error);
      return [];
    }
  }

  /**
   * Get popular groups
   */
  async getPopularGroups(limitCount: number = 10): Promise<UserGroup[]> {
    try {
      const q = query(
        collection(db, this.groupsCollection),
        where('isPublic', '==', true),
        orderBy('memberCount', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserGroup));
    } catch (error) {
      serviceLogger.error('Error getting popular groups:', error);
      return [];
    }
  }

  /**
   * Join a group
   */
  async joinGroup(userId: string, groupId: string): Promise<string> {
    try {
      if (!userId || !groupId) {
        throw new Error('Invalid userId or groupId');
      }

      // Check if already a member
      const existing = await this.getMembership(userId, groupId);
      if (existing) {
        if (existing.status === 'banned') {
          throw new Error('User is banned from this group');
        }
        return existing.id;
      }

      const membershipRef = doc(collection(db, this.membershipsCollection));
      const membership: GroupMembership = {
        id: membershipRef.id,
        userId,
        groupId,
        role: 'member',
        status: 'active',
        joinedAt: serverTimestamp() as any
      };

      await setDoc(membershipRef, membership);

      // Update group member count
      await this.incrementMemberCount(groupId, 1);

      serviceLogger.info(`User ${userId} joined group ${groupId}`);
      return membershipRef.id;
    } catch (error) {
      serviceLogger.error('Error joining group:', error);
      throw error;
    }
  }

  /**
   * Leave a group
   */
  async leaveGroup(userId: string, groupId: string): Promise<void> {
    try {
      if (!userId || !groupId) return;

      const membership = await this.getMembership(userId, groupId);
      if (!membership) {
        return;
      }

      const membershipRef = doc(db, this.membershipsCollection, membership.id);
      await deleteDoc(membershipRef);

      // Update group member count
      await this.incrementMemberCount(groupId, -1);

      serviceLogger.info(`User ${userId} left group ${groupId}`);
    } catch (error) {
      serviceLogger.error('Error leaving group:', error);
      throw error;
    }
  }

  /**
   * Get user's group memberships
   */
  async getUserMemberships(userId: string): Promise<GroupMembership[]> {
    try {
      if (!userId) return [];

      const q = query(
        collection(db, this.membershipsCollection),
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('joinedAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as GroupMembership));
    } catch (error) {
      serviceLogger.error('Error getting user memberships:', error);
      return [];
    }
  }

  /**
   * Get user's groups
   */
  async getUserGroups(userId: string): Promise<UserGroup[]> {
    try {
      const memberships = await this.getUserMemberships(userId);
      const groupIds = memberships.map(m => m.groupId);

      if (groupIds.length === 0) {
        return [];
      }

      const groups: UserGroup[] = [];
      for (const groupId of groupIds) {
        const group = await this.getGroup(groupId);
        if (group) {
          groups.push(group);
        }
      }

      return groups;
    } catch (error) {
      serviceLogger.error('Error getting user groups:', error);
      return [];
    }
  }

  /**
   * Get membership
   */
  async getMembership(userId: string, groupId: string): Promise<GroupMembership | null> {
    try {
      if (!userId || !groupId) return null;

      const q = query(
        collection(db, this.membershipsCollection),
        where('userId', '==', userId),
        where('groupId', '==', groupId),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as GroupMembership;
    } catch (error) {
      serviceLogger.error('Error getting membership:', error);
      return null;
    }
  }

  /**
   * Increment member count
   */
  private async incrementMemberCount(groupId: string, delta: number): Promise<void> {
    try {
      const groupRef = doc(db, this.groupsCollection, groupId);
      const groupSnap = await getDoc(groupRef);
      
      if (groupSnap.exists()) {
        const currentCount = groupSnap.data().memberCount || 0;
        await updateDoc(groupRef, {
          memberCount: Math.max(0, currentCount + delta),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      serviceLogger.error('Error incrementing member count:', error);
    }
  }
}

export const groupsService = GroupsService.getInstance();

