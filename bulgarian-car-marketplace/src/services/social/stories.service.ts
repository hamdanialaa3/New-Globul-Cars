/**
 * Stories Service - 24-hour ephemeral content
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  increment,
  arrayUnion,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase-config';

// ==================== INTERFACES ====================

export interface Story {
  id: string;
  authorId: string;
  authorInfo: {
    displayName: string;
    profileImage?: string;
    profileType: 'private' | 'dealer' | 'company';
    isVerified: boolean;
  };
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number;
  caption?: string;
  backgroundColor?: string;
  textOverlays?: TextOverlay[];
  viewCount: number;
  viewedBy: string[];
  reactions: { [userId: string]: string };
  visibility: 'public' | 'followers' | 'close_friends';
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'deleted';
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  rotation: number;
}

export interface StoryCreateData {
  mediaFile: File;
  caption?: string;
  textOverlays?: TextOverlay[];
  backgroundColor?: string;
  visibility: 'public' | 'followers' | 'close_friends';
}

// ==================== SERVICE CLASS ====================

class StoriesService {
  private readonly collectionName = 'stories';
  private readonly STORY_DURATION = 24 * 60 * 60 * 1000;

  /**
   * Create a new story
   */
  async createStory(userId: string, storyData: StoryCreateData): Promise<string> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) throw new Error('User not found');
      
      const userData = userDoc.data();
      
      const mediaUrl = await this.uploadStoryMedia(userId, storyData.mediaFile);
      
      const mediaType = storyData.mediaFile.type.startsWith('video') ? 'video' : 'image';
      
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.STORY_DURATION);
      
      const storyRef = await addDoc(collection(db, this.collectionName), {
        authorId: userId,
        authorInfo: {
          displayName: userData.displayName || 'Anonymous',
          profileImage: userData.profileImage?.url,
          profileType: userData.profileType || 'private',
          isVerified: userData.isVerified || false
        },
        mediaUrl,
        mediaType,
        duration: mediaType === 'video' ? 15 : 5,
        caption: storyData.caption,
        backgroundColor: storyData.backgroundColor,
        textOverlays: storyData.textOverlays || [],
        viewCount: 0,
        viewedBy: [],
        reactions: {},
        visibility: storyData.visibility,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
        status: 'active'
      });
      
      await updateDoc(doc(db, 'users', userId), {
        'stats.stories': increment(1),
        'lastActivity': serverTimestamp()
      });
      
      return storyRef.id;
    } catch (error) {
      console.error('[SERVICE] Error creating story:', error);
      throw new Error('Failed to create story');
    }
  }

  /**
   * Get active stories from followed users
   */
  async getFollowedUserStories(userId: string): Promise<Story[]> {
    try {
      const followingIds = await this.getFollowingIds(userId);
      followingIds.push(userId);
      
      const now = new Date();
      const storiesSnapshot = await getDocs(
        query(
          collection(db, this.collectionName),
          where('authorId', 'in', followingIds),
          where('status', '==', 'active'),
          where('expiresAt', '>', Timestamp.fromDate(now)),
          orderBy('expiresAt', 'asc'),
          orderBy('createdAt', 'desc')
        )
      );
      
      return storiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        expiresAt: doc.data().expiresAt.toDate()
      } as Story));
    } catch (error) {
      console.error('[SERVICE] Error getting stories:', error);
      throw new Error('Failed to load stories');
    }
  }

  /**
   * Record story view
   */
  async recordView(storyId: string, viewerId: string): Promise<void> {
    try {
      const storyRef = doc(db, this.collectionName, storyId);
      
      await updateDoc(storyRef, {
        viewCount: increment(1),
        viewedBy: arrayUnion(viewerId),
        'analytics.lastViewedAt': serverTimestamp()
      });
      
      await addDoc(collection(db, this.collectionName, storyId, 'views'), {
        viewerId,
        viewedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('[SERVICE] Error recording view:', error);
    }
  }

  /**
   * Add reaction to story
   */
  async addReaction(storyId: string, userId: string, emoji: string): Promise<void> {
    try {
      const storyRef = doc(db, this.collectionName, storyId);
      
      await updateDoc(storyRef, {
        [`reactions.${userId}`]: emoji,
        'analytics.reactionCount': increment(1)
      });
      
      const storyDoc = await getDoc(storyRef);
      
      if (storyDoc.exists()) {
        const authorId = storyDoc.data().authorId;
        
        if (authorId !== userId) {
          await addDoc(collection(db, 'notifications'), {
            userId: authorId,
            type: 'story_reaction',
            fromUserId: userId,
            storyId,
            emoji,
            isRead: false,
            createdAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('[SERVICE] Error adding reaction:', error);
      throw new Error('Failed to add reaction');
    }
  }

  /**
   * Delete a story
   */
  async deleteStory(storyId: string, userId: string): Promise<void> {
    try {
      const storyRef = doc(db, this.collectionName, storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) throw new Error('Story not found');
      
      const story = storyDoc.data();
      
      if (story.authorId !== userId) {
        throw new Error('Unauthorized');
      }
      
      const mediaRef = ref(storage, story.mediaUrl);
      await deleteObject(mediaRef);
      
      await updateDoc(storyRef, {
        status: 'deleted',
        deletedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('[SERVICE] Error deleting story:', error);
      throw new Error('Failed to delete story');
    }
  }

  // ==================== PRIVATE HELPERS ====================

  private async uploadStoryMedia(userId: string, file: File): Promise<string> {
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, `stories/${userId}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  private async getFollowingIds(userId: string): Promise<string[]> {
    const followsSnapshot = await getDocs(
      query(collection(db, 'follows'), where('followerId', '==', userId))
    );
    
    return followsSnapshot.docs.map(doc => doc.data().followingId);
  }
}

export const storiesService = new StoriesService();
