// src/services/social/posts.service.ts
// Posts Service - Core CRUD operations
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  Timestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

// ==================== TYPES ====================

export interface DetailedLocation {
  displayName: string;
  address: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  placeId?: string;
}

export interface CreatePostData {
  type: 'text' | 'car_showcase' | 'tip' | 'question' | 'review';
  content: {
    text: string;
    media?: File[];
    carReference?: {
      carId: string;
      carTitle: string;
      carImage: string;
    };
    hashtags?: string[];
  };
  visibility: 'public' | 'followers' | 'private';
  location?: DetailedLocation;
}

export interface Post {
  id: string;
  authorId: string;
  authorInfo: {
    displayName: string;
    profileImage?: string;
    profileType: 'private' | 'dealer' | 'company';
    isVerified: boolean;
    trustScore: number;
  };
  type: string;
  content: {
    text: string;
    media?: {
      type: 'image' | 'video' | 'gallery';
      urls: string[];
    };
    carReference?: any;
    hashtags?: string[];
  };
  visibility: string;
  location?: DetailedLocation;
  engagement: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  reactions: Record<string, string>;
  status: string;
  isPinned: boolean;
  isFeatured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== SERVICE ====================

class PostsService {
  private collectionName = 'posts';
  
  async createPost(userId: string, postData: CreatePostData): Promise<string> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) throw new Error('User not found');
      
      const userData = userDoc.data();
      
      let mediaUrls: string[] = [];
      if (postData.content.media && postData.content.media.length > 0) {
        mediaUrls = await this.uploadPostMedia(userId, postData.content.media);
      }
      
      const postRef = await addDoc(collection(db, this.collectionName), {
        authorId: userId,
        authorInfo: {
          displayName: userData.displayName || 'Anonymous',
          profileImage: userData.profileImage?.url,
          profileType: userData.profileType || 'private',
          isVerified: userData.verification?.emailVerified || false,
          trustScore: userData.verification?.trustScore || 0
        },
        type: postData.type,
        content: {
          text: postData.content.text,
          media: mediaUrls.length > 0 ? {
            type: 'gallery',
            urls: mediaUrls
          } : undefined,
          carReference: postData.content.carReference,
          hashtags: postData.content.hashtags || []
        },
        visibility: postData.visibility,
        location: postData.location,
        engagement: {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0
        },
        reactions: {},
        status: 'published',
        isPinned: false,
        isFeatured: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'users', userId), {
        'stats.posts': increment(1)
      });
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Post created', { postId: postRef.id });
      }
      return postRef.id;
    } catch (error) {
      logger.error('Error creating post', error as Error, { userId });
      throw new Error('Failed to create post');
    }
  }
  
  private async uploadPostMedia(userId: string, files: File[]): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const fileName = `${userId}_${timestamp}_${index}.${ext}`;
      const storageRef = ref(storage, `posts/${userId}/${fileName}`);
      
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    });
    
    return await Promise.all(uploadPromises);
  }
  
  async getPublicPosts(limitCount: number = 20): Promise<Post[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', 'published'),
        where('visibility', '==', 'public'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
    } catch (error) {
      logger.error('Error getting public posts', error as Error);
      return [];
    }
  }
  
  async getUserPosts(userId: string, limitCount: number = 20): Promise<Post[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('authorId', '==', userId),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
    } catch (error) {
      logger.error('Error getting user posts', error as Error, { userId });
      return [];
    }
  }
  
  async getPost(postId: string): Promise<Post | null> {
    try {
      const postDoc = await getDoc(doc(db, this.collectionName, postId));
      if (!postDoc.exists()) return null;
      
      return {
        id: postDoc.id,
        ...postDoc.data()
      } as Post;
    } catch (error) {
      logger.error('Error getting post', error as Error, { postId });
      return null;
    }
  }
  
  async deletePost(postId: string, userId: string): Promise<boolean> {
    try {
      const postDoc = await getDoc(doc(db, this.collectionName, postId));
      if (!postDoc.exists()) return false;
      
      const postData = postDoc.data();
      if (postData.authorId !== userId) {
        throw new Error('Unauthorized');
      }
      
      await updateDoc(doc(db, this.collectionName, postId), {
        status: 'deleted',
        updatedAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'users', userId), {
        'stats.posts': increment(-1)
      });
      
      return true;
    } catch (error) {
      logger.error('Error deleting post', error as Error, { postId, userId });
      return false;
    }
  }
}

export const postsService = new PostsService();

