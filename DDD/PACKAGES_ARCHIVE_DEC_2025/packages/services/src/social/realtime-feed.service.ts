// Real-time Feed Service - Live Updates via Firebase Realtime Database
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import {
  ref,
  onValue,
  off,
  set,
  push,
  serverTimestamp,
  DataSnapshot
} from 'firebase/database';
import { realtimeDb } from '@globul-cars/services/firebase/firebase-config';

// ==================== TYPES ====================

interface FeedUpdate {
  type: 'new_post' | 'update_post' | 'delete_post';
  postId: string;
  timestamp: number;
  userId?: string;
}

interface ReactionUpdate {
  postId: string;
  userId: string;
  type: string;
  action: 'add' | 'remove';
  timestamp: number;
}

interface CommentUpdate {
  postId: string;
  commentId: string;
  userId: string;
  action: 'add' | 'delete';
  timestamp: number;
}

// ==================== SERVICE ====================

class RealtimeFeedService {
  private static instance: RealtimeFeedService;
  private listeners: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): RealtimeFeedService {
    if (!RealtimeFeedService.instance) {
      RealtimeFeedService.instance = new RealtimeFeedService();
    }
    return RealtimeFeedService.instance;
  }

  // Subscribe to new posts in feed
  subscribeToNewPosts(
    callback: (update: FeedUpdate) => void
  ): () => void {
    try {
      const feedRef = ref(realtimeDb, 'feed/updates');
      
      const listener = onValue(feedRef, (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        if (data) {
          const updates = Object.values(data) as FeedUpdate[];
          const latestUpdate = updates[updates.length - 1];
          if (latestUpdate) {
            callback(latestUpdate);
          }
        }
      });

      const listenerId = `new_posts_${Date.now()}`;
      this.listeners.set(listenerId, { ref: feedRef, listener });

      return () => {
        off(feedRef);
        this.listeners.delete(listenerId);
      };
    } catch (error) {
      console.error('Error subscribing to new posts:', error);
      return () => {};
    }
  }

  // Subscribe to reactions on specific post
  subscribeToReactions(
    postId: string,
    callback: (update: ReactionUpdate) => void
  ): () => void {
    try {
      const reactionsRef = ref(realtimeDb, `posts/${postId}/reactions`);
      
      const listener = onValue(reactionsRef, (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        if (data) {
          const reactions = Object.values(data) as ReactionUpdate[];
          const latestReaction = reactions[reactions.length - 1];
          if (latestReaction) {
            callback(latestReaction);
          }
        }
      });

      const listenerId = `reactions_${postId}`;
      this.listeners.set(listenerId, { ref: reactionsRef, listener });

      return () => {
        off(reactionsRef);
        this.listeners.delete(listenerId);
      };
    } catch (error) {
      console.error('Error subscribing to reactions:', error);
      return () => {};
    }
  }

  // Subscribe to comments on specific post
  subscribeToComments(
    postId: string,
    callback: (update: CommentUpdate) => void
  ): () => void {
    try {
      const commentsRef = ref(realtimeDb, `posts/${postId}/comments`);
      
      const listener = onValue(commentsRef, (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        if (data) {
          const comments = Object.values(data) as CommentUpdate[];
          const latestComment = comments[comments.length - 1];
          if (latestComment) {
            callback(latestComment);
          }
        }
      });

      const listenerId = `comments_${postId}`;
      this.listeners.set(listenerId, { ref: commentsRef, listener });

      return () => {
        off(commentsRef);
        this.listeners.delete(listenerId);
      };
    } catch (error) {
      console.error('Error subscribing to comments:', error);
      return () => {};
    }
  }

  // Publish new post update
  async publishPostUpdate(
    type: 'new_post' | 'update_post' | 'delete_post',
    postId: string,
    userId?: string
  ): Promise<void> {
    try {
      const feedRef = ref(realtimeDb, 'feed/updates');
      const newUpdateRef = push(feedRef);
      
      await set(newUpdateRef, {
        type,
        postId,
        userId,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error publishing post update:', error);
      throw error;
    }
  }

  // Publish reaction update
  async publishReactionUpdate(
    postId: string,
    userId: string,
    reactionType: string,
    action: 'add' | 'remove'
  ): Promise<void> {
    try {
      const reactionsRef = ref(realtimeDb, `posts/${postId}/reactions`);
      const newReactionRef = push(reactionsRef);
      
      await set(newReactionRef, {
        postId,
        userId,
        type: reactionType,
        action,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error publishing reaction update:', error);
      throw error;
    }
  }

  // Publish comment update
  async publishCommentUpdate(
    postId: string,
    commentId: string,
    userId: string,
    action: 'add' | 'delete'
  ): Promise<void> {
    try {
      const commentsRef = ref(realtimeDb, `posts/${postId}/comments`);
      const commentRef = push(commentsRef);
      
      await set(commentRef, {
        postId,
        commentId,
        userId,
        action,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error publishing comment update:', error);
      throw error;
    }
  }

  // Get count of new posts since timestamp
  async getNewPostsCount(sinceTimestamp: number): Promise<number> {
    try {
      const feedRef = ref(realtimeDb, 'feed/updates');
      
      return new Promise((resolve) => {
        onValue(feedRef, (snapshot: DataSnapshot) => {
          const data = snapshot.val();
          if (data) {
            const updates = Object.values(data) as FeedUpdate[];
            const newPosts = updates.filter(
              u => u.type === 'new_post' && u.timestamp > sinceTimestamp
            );
            resolve(newPosts.length);
          } else {
            resolve(0);
          }
        }, { onlyOnce: true });
      });
    } catch (error) {
      console.error('Error getting new posts count:', error);
      return 0;
    }
  }

  // Subscribe to new posts count (for banner)
  subscribeToNewPostsCount(
    sinceTimestamp: number,
    callback: (count: number) => void
  ): () => void {
    try {
      const feedRef = ref(realtimeDb, 'feed/updates');
      
      const listener = onValue(feedRef, (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        if (data) {
          const updates = Object.values(data) as FeedUpdate[];
          const newPosts = updates.filter(
            u => u.type === 'new_post' && u.timestamp > sinceTimestamp
          );
          callback(newPosts.length);
        } else {
          callback(0);
        }
      });

      const listenerId = `new_posts_count_${Date.now()}`;
      this.listeners.set(listenerId, { ref: feedRef, listener });

      return () => {
        off(feedRef);
        this.listeners.delete(listenerId);
      };
    } catch (error) {
      console.error('Error subscribing to new posts count:', error);
      return () => {};
    }
  }

  // Cleanup all listeners
  cleanup(): void {
    this.listeners.forEach(({ ref }) => {
      off(ref);
    });
    this.listeners.clear();
  }
}

export const realtimeFeedService = RealtimeFeedService.getInstance();
