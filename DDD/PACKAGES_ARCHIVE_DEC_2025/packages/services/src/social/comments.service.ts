// Comments Service - Post Comments Management
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
import { db } from '@globul-cars/services/firebase/firebase-config';

// ==================== TYPES ====================

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorInfo: {
    displayName: string;
    profileImage?: string;
    isVerified: boolean;
    trustScore: number;
  };
  content: string;
  likes: number;
  likedBy: string[];
  parentCommentId?: string; // For replies
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isEdited: boolean;
  isDeleted: boolean;
}

export interface CreateCommentData {
  postId: string;
  content: string;
  parentCommentId?: string;
}

// ==================== SERVICE ====================

class CommentsService {
  private collectionName = 'comments';

  // Create new comment
  async createComment(
    userId: string,
    data: CreateCommentData
  ): Promise<string> {
    try {
      // Get user info
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) throw new Error('User not found');
      
      const userData = userDoc.data();
      
      // Create comment
      const commentData = {
        postId: data.postId,
        authorId: userId,
        authorInfo: {
          displayName: userData.displayName || 'Anonymous',
          profileImage: userData.profileImage,
          isVerified: userData.isVerified || false,
          trustScore: userData.trustScore || 0
        },
        content: data.content,
        likes: 0,
        likedBy: [],
        parentCommentId: data.parentCommentId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isEdited: false,
        isDeleted: false
      };

      const docRef = await addDoc(
        collection(db, this.collectionName),
        commentData
      );

      // Update post comments count
      await updateDoc(doc(db, 'posts', data.postId), {
        'engagement.comments': increment(1),
        updatedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      throw error;
    }
  }

  // Get comments for post
  async getComments(
    postId: string,
    limitCount: number = 20,
    lastCommentId?: string
  ): Promise<Comment[]> {
    try {
      let q = query(
        collection(db, this.collectionName),
        where('postId', '==', postId),
        where('isDeleted', '==', false),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
    } catch (error) {
      return [];
    }
  }

  // Get replies for comment
  async getReplies(
    commentId: string,
    limitCount: number = 10
  ): Promise<Comment[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('parentCommentId', '==', commentId),
        where('isDeleted', '==', false),
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
    } catch (error) {
      return [];
    }
  }

  // Update comment
  async updateComment(
    commentId: string,
    userId: string,
    content: string
  ): Promise<void> {
    try {
      const commentDoc = await getDoc(
        doc(db, this.collectionName, commentId)
      );
      
      if (!commentDoc.exists()) {
        throw new Error('Comment not found');
      }

      const commentData = commentDoc.data();
      
      if (commentData.authorId !== userId) {
        throw new Error('Unauthorized');
      }

      await updateDoc(doc(db, this.collectionName, commentId), {
        content,
        updatedAt: serverTimestamp(),
        isEdited: true
      });
    } catch (error) {
      throw error;
    }
  }

  // Delete comment (soft delete)
  async deleteComment(
    commentId: string,
    userId: string
  ): Promise<void> {
    try {
      const commentDoc = await getDoc(
        doc(db, this.collectionName, commentId)
      );
      
      if (!commentDoc.exists()) {
        throw new Error('Comment not found');
      }

      const commentData = commentDoc.data();
      
      if (commentData.authorId !== userId) {
        throw new Error('Unauthorized');
      }

      // Soft delete
      await updateDoc(doc(db, this.collectionName, commentId), {
        isDeleted: true,
        content: '[Deleted]',
        updatedAt: serverTimestamp()
      });

      // Update post comments count
      await updateDoc(doc(db, 'posts', commentData.postId), {
        'engagement.comments': increment(-1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw error;
    }
  }

  // Like comment
  async likeComment(
    commentId: string,
    userId: string
  ): Promise<void> {
    try {
      const commentDoc = await getDoc(
        doc(db, this.collectionName, commentId)
      );
      
      if (!commentDoc.exists()) {
        throw new Error('Comment not found');
      }

      const commentData = commentDoc.data();
      const likedBy = commentData.likedBy || [];

      if (likedBy.includes(userId)) {
        // Unlike
        await updateDoc(doc(db, this.collectionName, commentId), {
          likes: increment(-1),
          likedBy: likedBy.filter((id: string) => id !== userId),
          updatedAt: serverTimestamp()
        });
      } else {
        // Like
        await updateDoc(doc(db, this.collectionName, commentId), {
          likes: increment(1),
          likedBy: [...likedBy, userId],
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // Get comment count for post
  async getCommentCount(postId: string): Promise<number> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('postId', '==', postId),
        where('isDeleted', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      return 0;
    }
  }
}

export const commentsService = new CommentsService();
