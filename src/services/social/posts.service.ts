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
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase-config';
import { ImageUploadService } from '../image-upload-service';
import { logger } from '../logger-service';

// ==================== TYPES ====================

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
  location?: {
    city: string;
    region: string;
  };
}

export interface Post {
  id: string;
  authorId: string;
  authorNumericId?: number;
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
  location?: any;
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
  
  async createPost(
    userId: string, 
    postData: CreatePostData,
    onUploadProgress?: (fileName: string, progress: number) => void
  ): Promise<string> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) throw new Error('User not found');
      
      const userData = userDoc.data();
      
      let mediaUrls: string[] = [];
      if (postData.content.media && postData.content.media.length > 0) {
        logger.info('Uploading post media files', { count: postData.content.media.length });
        mediaUrls = await this.uploadPostMedia(
          userId, 
          postData.content.media,
          onUploadProgress
        );
        logger.info('All post media files uploaded successfully', { count: mediaUrls.length });
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
      
      logger.info('Post created successfully', { postId: postRef.id, userId });
      return postRef.id;
    } catch (error) {
      logger.error('Failed to create post', error as Error, { userId });
      throw new Error('Failed to create post');
    }
  }
  
  /**
   * Upload post media with compression and optimization
   * رفع وسائط المنشورات مع الضغط والتحسين
   */
  private async uploadPostMedia(
    userId: string, 
    files: File[],
    onProgress?: (fileName: string, progress: number) => void
  ): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const timestamp = Date.now();
      const ext = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${userId}_${timestamp}_${index}.${ext}`;
      const filePath = `posts/${userId}/${fileName}`;
      
      try {
        // Check if it's an image and compress it
        if (file.type.startsWith('image/')) {
          // Compress image with optimal settings for social posts
          const url = await ImageUploadService.uploadSingleImage(
            file,
            filePath,
            {
              maxSizeMB: 2, // 2MB max for posts (higher quality than profile pics)
              maxWidthOrHeight: 2048, // Full HD+ quality
              onProgress: (progress) => {
                if (onProgress) {
                  onProgress(file.name, progress.progress);
                }
              }
            }
          );
          
          logger.debug('Image uploaded successfully', { fileName: file.name, url });
          return url;
        } else {
          // For videos or other files, upload directly with progress
          const storageRef = ref(storage, filePath);
          const uploadTask = uploadBytesResumable(storageRef, file);
          
          return new Promise<string>((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                  onProgress(file.name, progress);
                }
              },
              (error) => {
                logger.error('Upload failed for file', error, { fileName: file.name });
                reject(error);
              },
              async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                logger.debug('File uploaded successfully', { fileName: file.name, url });
                resolve(url);
              }
            );
          });
        }
      } catch (error) {
        logger.error('Error uploading file', error as Error, { fileName: file.name });
        throw new Error(`Failed to upload ${file.name}`);
      }
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
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as Post));
    } catch (error) {
      logger.error('Error getting public posts', error as Error);
      return [];
    }
  }
  
  async getUserPosts(userId: string | null | undefined, limitCount: number = 20): Promise<Post[]> {
    try {
      // ✅ FIX: Guard against null/undefined userId
      if (!userId) {
        logger.warn('getUserPosts called with null/undefined userId');
        return [];
      }

      const q = query(
        collection(db, this.collectionName),
        where('authorId', '==', userId),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({
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

