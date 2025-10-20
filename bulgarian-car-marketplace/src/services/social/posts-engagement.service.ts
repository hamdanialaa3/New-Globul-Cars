// src/services/social/posts-engagement.service.ts
// Posts Engagement Service - Like, Comment, Share
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  deleteField
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

// ==================== TYPES ====================

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorInfo: {
    displayName: string;
    profileImage?: string;
    profileType: string;
  };
  content: string;
  likes: number;
  likedBy: string[];
  parentCommentId?: string;
  status: 'active' | 'deleted';
  createdAt: any;
}

// ==================== SERVICE ====================

class PostsEngagementService {
  
  async toggleLike(postId: string, userId: string): Promise<boolean> {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) throw new Error('Post not found');
      
      const reactions = postDoc.data().reactions || {};
      const hasLiked = reactions[userId];
      
      if (hasLiked) {
        await updateDoc(postRef, {
          [`reactions.${userId}`]: deleteField(),
          'engagement.likes': increment(-1)
        });
        return false;
      } else {
        await updateDoc(postRef, {
          [`reactions.${userId}`]: 'like',
          'engagement.likes': increment(1)
        });
        
        await this.sendNotification(postDoc.data().authorId, {
          type: 'post_like',
          from: userId,
          postId
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }
  
  async addComment(
    postId: string, 
    userId: string, 
    content: string,
    parentCommentId?: string
  ): Promise<string> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      const commentRef = await addDoc(
        collection(db, 'posts', postId, 'comments'),
        {
          postId,
          authorId: userId,
          authorInfo: {
            displayName: userData?.displayName || 'Anonymous',
            profileImage: userData?.profileImage?.url,
            profileType: userData?.profileType || 'private'
          },
          content,
          likes: 0,
          likedBy: [],
          parentCommentId: parentCommentId || null,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      );
      
      await updateDoc(doc(db, 'posts', postId), {
        'engagement.comments': increment(1)
      });
      
      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (postDoc.exists()) {
        await this.sendNotification(postDoc.data().authorId, {
          type: 'post_comment',
          from: userId,
          postId
        });
      }
      
      return commentRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }
  
  async getComments(postId: string, limitCount: number = 20): Promise<PostComment[]> {
    try {
      const q = query(
        collection(db, 'posts', postId, 'comments'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PostComment));
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }
  
  async incrementViews(postId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        'engagement.views': increment(1)
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }
  
  async sharePost(postId: string, userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        'engagement.shares': increment(1)
      });
      
      await addDoc(collection(db, 'user_activity'), {
        userId,
        type: 'shared',
        relatedId: postId,
        relatedType: 'post',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  }
  
  async savePost(postId: string, userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        'engagement.saves': increment(1)
      });
      
      await addDoc(collection(db, 'users', userId, 'saved_posts'), {
        postId,
        savedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving post:', error);
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
      console.error('Error sending notification:', error);
    }
  }
}

export const postsEngagementService = new PostsEngagementService();

