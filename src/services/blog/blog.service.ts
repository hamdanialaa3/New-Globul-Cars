/**
 * Blog Service
 * Manages blog posts, comments, and Bulgarian content
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  increment,
  writeBatch,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import type {
  BlogPost,
  BlogComment,
  BlogFilters,
  BlogStats,
  BlogCategory,
  BlogStatus
} from '@/types/blog.types';

class BlogService {
  private static instance: BlogService;
  private readonly COLLECTION = 'blog_posts';
  private readonly COMMENTS_COLLECTION = 'blog_comments';

  private constructor() {}

  static getInstance(): BlogService {
    if (!BlogService.instance) {
      BlogService.instance = new BlogService();
    }
    return BlogService.instance;
  }

  /**
   * Create new blog post
   */
  async createPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'shares' | 'commentsCount'>): Promise<string> {
    try {
      const newPost = {
        ...post,
        views: 0,
        likes: 0,
        shares: 0,
        commentsCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        publishedAt: post.status === 'published' ? Timestamp.now() : null
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), newPost);
      serviceLogger.info('Blog post created:', docRef.id);
      return docRef.id;
    } catch (error) {
      serviceLogger.error('Error creating blog post:', error);
      throw new Error('Failed to create blog post');
    }
  }

  /**
   * Get blog post by ID
   */
  async getPost(postId: string): Promise<BlogPost | null> {
    try {
      const docRef = doc(db, this.COLLECTION, postId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        publishedAt: data.publishedAt?.toDate()
      } as BlogPost;
    } catch (error) {
      serviceLogger.error('Error fetching blog post:', error);
      throw new Error('Failed to fetch blog post');
    }
  }

  /**
   * Get blog post by slug
   */
  async getPostBySlug(slug: string, language: 'bg' | 'en' = 'bg'): Promise<BlogPost | null> {
    try {
      const field = language === 'bg' ? 'slug.bg' : 'slug.en';
      const q = query(
        collection(db, this.COLLECTION),
        where(field, '==', slug),
        where('status', '==', 'published'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        publishedAt: data.publishedAt?.toDate()
      } as BlogPost;
    } catch (error) {
      serviceLogger.error('Error fetching post by slug:', error);
      throw new Error('Failed to fetch post');
    }
  }

  /**
   * Get all posts with filters and pagination
   */
  async getPosts(
    filters: BlogFilters = {},
    limitCount: number = 20,
    lastDoc?: DocumentSnapshot
  ): Promise<{ posts: BlogPost[]; lastDoc: DocumentSnapshot | null }> {
    try {
      let q = query(collection(db, this.COLLECTION));

      // Apply filters
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      } else {
        // Default: only published posts
        q = query(q, where('status', '==', 'published'));
      }
      if (filters.author) {
        q = query(q, where('author.id', '==', filters.author));
      }
      if (filters.tags && filters.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', filters.tags));
      }

      // Order by published date (newest first)
      q = query(q, orderBy('publishedAt', 'desc'));

      // Pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      q = query(q, limit(limitCount));

      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          publishedAt: data.publishedAt?.toDate()
        } as BlogPost;
      });

      const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

      return { posts, lastDoc: newLastDoc };
    } catch (error) {
      serviceLogger.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }
  }

  /**
   * Update blog post
   */
  async updatePost(postId: string, updates: Partial<BlogPost>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, postId);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      // If publishing, set publishedAt
      if (updates.status === 'published' && !updates.publishedAt) {
        updateData.publishedAt = Timestamp.now();
      }

      await updateDoc(docRef, updateData);
      serviceLogger.info('Blog post updated:', postId);
    } catch (error) {
      serviceLogger.error('Error updating blog post:', error);
      throw new Error('Failed to update blog post');
    }
  }

  /**
   * Delete blog post
   */
  async deletePost(postId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION, postId));
      serviceLogger.info('Blog post deleted:', postId);
    } catch (error) {
      serviceLogger.error('Error deleting blog post:', error);
      throw new Error('Failed to delete blog post');
    }
  }

  /**
   * Increment post views
   */
  async incrementViews(postId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, postId);
      await updateDoc(docRef, {
        views: increment(1)
      });
    } catch (error) {
      serviceLogger.error('Error incrementing views:', error);
    }
  }

  /**
   * Like/unlike post
   */
  async toggleLike(postId: string, userId: string): Promise<boolean> {
    try {
      // TODO: Track user likes in separate collection
      const docRef = doc(db, this.COLLECTION, postId);
      await updateDoc(docRef, {
        likes: increment(1)
      });
      return true;
    } catch (error) {
      serviceLogger.error('Error toggling like:', error);
      return false;
    }
  }

  /**
   * Get posts by category
   */
  async getPostsByCategory(category: BlogCategory, limitCount: number = 10): Promise<BlogPost[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('category', '==', category),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          publishedAt: data.publishedAt?.toDate()
        } as BlogPost;
      });
    } catch (error) {
      serviceLogger.error('Error fetching posts by category:', error);
      throw new Error('Failed to fetch posts');
    }
  }

  /**
   * Get popular posts
   */
  async getPopularPosts(limitCount: number = 5): Promise<BlogPost[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('status', '==', 'published'),
        orderBy('views', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          publishedAt: data.publishedAt?.toDate()
        } as BlogPost;
      });
    } catch (error) {
      serviceLogger.error('Error fetching popular posts:', error);
      return [];
    }
  }

  /**
   * Get recent posts
   */
  async getRecentPosts(limitCount: number = 5): Promise<BlogPost[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          publishedAt: data.publishedAt?.toDate()
        } as BlogPost;
      });
    } catch (error) {
      serviceLogger.error('Error fetching recent posts:', error);
      return [];
    }
  }

  /**
   * Search posts
   */
  async searchPosts(searchQuery: string, limitCount: number = 20): Promise<BlogPost[]> {
    try {
      // Simple client-side search (for better results, use Algolia)
      const { posts } = await this.getPosts({}, limitCount);
      
      const lowerQuery = searchQuery.toLowerCase();
      return posts.filter(post => 
        post.title.bg.toLowerCase().includes(lowerQuery) ||
        post.title.en.toLowerCase().includes(lowerQuery) ||
        post.excerpt.bg.toLowerCase().includes(lowerQuery) ||
        post.excerpt.en.toLowerCase().includes(lowerQuery) ||
        post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      serviceLogger.error('Error searching posts:', error);
      return [];
    }
  }

  /**
   * Get blog statistics
   */
  async getStats(): Promise<BlogStats> {
    try {
      const allPosts = await getDocs(collection(db, this.COLLECTION));
      
      let totalViews = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let totalReadingTime = 0;
      const categoryCounts: Record<BlogCategory, number> = {
        'buying-tips': 0,
        'selling-tips': 0,
        'market-trends': 0,
        'car-reviews': 0,
        'maintenance': 0,
        'legal': 0,
        'news': 0
      };

      const publishedPosts: Array<{ id: string; title: string; views: number }> = [];
      let draftCount = 0;

      allPosts.docs.forEach(doc => {
        const data = doc.data();
        totalViews += data.views || 0;
        totalLikes += data.likes || 0;
        totalComments += data.commentsCount || 0;
        totalReadingTime += data.readingTime || 0;

        if (data.category) {
          categoryCounts[data.category as BlogCategory]++;
        }

        if (data.status === 'published') {
          publishedPosts.push({
            id: doc.id,
            title: data.title?.bg || data.title?.en || 'Untitled',
            views: data.views || 0
          });
        } else if (data.status === 'draft') {
          draftCount++;
        }
      });

      // Sort top posts by views
      publishedPosts.sort((a, b) => b.views - a.views);

      // Top categories
      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category: category as BlogCategory, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalPosts: allPosts.size,
        publishedPosts: publishedPosts.length,
        draftPosts: draftCount,
        totalViews,
        totalLikes,
        totalComments,
        avgReadingTime: allPosts.size > 0 ? Math.round(totalReadingTime / allPosts.size) : 0,
        topCategories,
        topPosts: publishedPosts.slice(0, 10)
      };
    } catch (error) {
      serviceLogger.error('Error fetching blog stats:', error);
      throw new Error('Failed to fetch blog statistics');
    }
  }
}

export const blogService = BlogService.getInstance();
