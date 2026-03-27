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

// Static/Official Posts (Always available)
const STATIC_POSTS: BlogPost[] = [
  {
    id: 'ai-valuation-works-static',
    title: {
      bg: 'AI Оценка: Как работи бъдещето на ценообразуването',
      en: 'AI Valuation: How the Future of Pricing Works'
    },
    slug: {
      bg: 'ai-valuation-works',
      en: 'ai-valuation-works'
    },
    excerpt: {
      bg: 'Подробен поглед върху AI модела на Koli One, обучен върху над 200,000 сделки в България.',
      en: 'A deep dive into Koli One’s AI model, trained on 200,000+ transactions in Bulgaria.'
    },
    content: { bg: '', en: '' },
    category: 'market-trends',
    tags: ['AI', 'България', 'Технологии'],
    author: {
      id: 'koli-one',
      name: 'Koli One Team',
      role: 'Official',
      avatar: 'https://koli.one/logo.webp'
    },
    coverImage: 'https://koli.one/blog/images/ai-valuation-cover.jpg',
    images: [],
    status: 'published',
    views: 1540,
    likes: 82,
    shares: 24,
    readingTime: 8,
    commentsCount: 0,
    keywords: ['AI', 'valuation', 'Bulgaria', 'pricing'],
    metaTitle: { bg: 'Как работи AI оценката', en: 'How AI Valuation Works' },
    metaDescription: { bg: 'Подробна информация за модела на Koli One', en: 'Detailed info about Koli One model' },
    createdAt: new Date('2026-02-12'),
    updatedAt: new Date('2026-02-12'),
    publishedAt: new Date('2026-02-12')
  },
  {
    id: 'bulgarian-market-2026-static',
    title: {
      bg: 'Автомобилният пазар в България през 2026: Тенденции и прогнози',
      en: 'The Bulgarian Car Market in 2026: Trends and Predictions'
    },
    slug: {
      bg: 'bulgarian-market-2026',
      en: 'bulgarian-market-2026'
    },
    excerpt: {
      bg: 'Подробен анализ на пазара: от възхода на електрическите автомобили до доминацията на SUV сегмента.',
      en: 'Detailed market analysis: from the rise of EVs to the dominance of the SUV segment.'
    },
    content: { bg: '', en: '' },
    category: 'market-trends',
    tags: ['Market Analysis', 'Trends', 'Bulgaria', '2026'],
    author: {
      id: 'koli-one-research',
      name: 'Koli One Research',
      role: 'Official',
      avatar: 'https://koli.one/logo.webp'
    },
    coverImage: 'https://koli.one/blog/images/market-2026-cover.jpg',
    images: [],
    status: 'published',
    views: 980,
    likes: 45,
    shares: 12,
    readingTime: 10,
    commentsCount: 0,
    keywords: ['market', 'trends', 'Bulgaria', '2026', 'SUV', 'EV'],
    metaTitle: { bg: 'Пазарът на коли в България 2026', en: 'Bulgarian Car Market 2026' },
    metaDescription: { bg: 'Тенденции وпрогнози за автомобилния пазар', en: 'Trends and predictions for the car market' },
    createdAt: new Date('2026-02-12'),
    updatedAt: new Date('2026-02-12'),
    publishedAt: new Date('2026-02-12')
  },
  {
    id: 'marketplace-comparison-static',
    title: {
      bg: 'Koli One срещу Mobile.bg и Auto.bg: Сравнение 2026',
      en: 'Koli One vs Mobile.bg vs Auto.bg: 2026 Comparison'
    },
    slug: {
      bg: 'marketplace-comparison',
      en: 'marketplace-comparison'
    },
    excerpt: {
      bg: 'Обективно сравнение на водещите автомобилни платформи в България: технологии, цени и функции.',
      en: 'An objective comparison of Bulgaria’s leading car platforms: tech, pricing, and features.'
    },
    content: { bg: '', en: '' },
    category: 'market-trends',
    tags: ['Comparison', 'Koli One', 'Marketplace', 'Technology'],
    author: {
      id: 'koli-one-insights',
      name: 'Koli One Insights',
      role: 'Official',
      avatar: 'https://koli.one/logo.webp'
    },
    coverImage: 'https://koli.one/blog/images/comparison-2026-cover.jpg',
    images: [],
    status: 'published',
    views: 1250,
    likes: 67,
    shares: 18,
    readingTime: 12,
    commentsCount: 0,
    keywords: ['comparison', 'Mobile.bg', 'Auto.bg', 'Koli One', 'Bulgaria'],
    metaTitle: { bg: 'Koli One vs Mobile.bg vs Auto.bg', en: 'Platform Comparison 2026' },
    metaDescription: { bg: 'Коя е най-добрата платформа за продажба на коли?', en: 'Which is the best platform for car selling?' },
    createdAt: new Date('2026-02-12'),
    updatedAt: new Date('2026-02-12'),
    publishedAt: new Date('2026-02-12')
  },
  {
    id: 'technical-deep-dive-static',
    title: {
      bg: 'Хибридно търсене в Koli One: Интеграция на Algolia + Firestore',
      en: 'Building Hybrid Search: Algolia + Firestore Integration'
    },
    slug: {
      bg: 'technical-deep-dive',
      en: 'technical-deep-dive'
    },
    excerpt: {
      bg: 'Технически поглед върху архитектурата на Koli One: баланс между бързина, точност и консистентност.',
      en: 'A technical deep-dive into Koli One’s architecture: balancing speed, accuracy, and consistency.'
    },
    content: { bg: '', en: '' },
    category: 'engineering',
    tags: ['Engineering', 'Architecture', 'Firebase', 'Algolia'],
    author: {
      id: 'koli-one-engineering',
      name: 'Koli One Engineering',
      role: 'Official',
      avatar: 'https://koli.one/logo.webp'
    },
    coverImage: 'https://koli.one/blog/images/hybrid-search-cover.jpg',
    images: [],
    status: 'published',
    views: 1850,
    likes: 92,
    shares: 34,
    readingTime: 15,
    commentsCount: 0,
    keywords: ['architecture', 'Algolia', 'Firestore', 'hybrid search', 'cloud functions'],
    metaTitle: { bg: 'Техническа архитектура на търсенето', en: 'Search Architecture Deep Dive' },
    metaDescription: { bg: 'Как работи хибридното търсене в Koli One?', en: 'How does hybrid search work in Koli One?' },
    createdAt: new Date('2026-02-12'),
    updatedAt: new Date('2026-02-12'),
    publishedAt: new Date('2026-02-12')
  },
  {
    id: 'neural-pricing-static',
    title: {
      bg: 'Neural Pricing System: Как AI нормализира цените в Европа',
      en: 'Neural Pricing System: How AI Normalizes Car Prices Across Europe'
    },
    slug: {
      bg: 'neural-pricing',
      en: 'neural-pricing'
    },
    excerpt: {
      bg: 'Вижте как нашият AI робот проследява цените в 7 държави, за да намери "справедливата стойност".',
      en: 'See how our AI bot tracks prices across 7 countries to find the "fair value".'
    },
    content: { bg: '', en: '' },
    category: 'engineering',
    tags: ['AI', 'Pricing', 'Web Scraping', 'Big Data'],
    author: {
      id: 'koli-one-research',
      name: 'Koli One Research',
      role: 'Official',
      avatar: 'https://koli.one/logo.webp'
    },
    coverImage: 'https://koli.one/blog/images/neural-pricing-cover.jpg',
    images: [],
    status: 'published',
    views: 1120,
    likes: 56,
    shares: 22,
    readingTime: 12,
    commentsCount: 0,
    keywords: ['pricing', 'AI', 'scraper', 'Europe', 'arbitrage'],
    metaTitle: { bg: 'Neural Pricing System', en: 'Neural Pricing System' },
    metaDescription: { bg: 'Как работи AI ценообразуването?', en: 'How does AI pricing work?' },
    createdAt: new Date('2026-02-12'),
    updatedAt: new Date('2026-02-12'),
    publishedAt: new Date('2026-02-12')
  },
  {
    id: 'constitutional-coding-static',
    title: {
      bg: 'Constitutional Coding: Защо нашият код следва закона',
      en: 'Constitutional Coding: Why Our Code Obeys The Law'
    },
    slug: {
      bg: 'constitutional-coding',
      en: 'constitutional-coding'
    },
    excerpt: {
      bg: 'Как вградихме правните изисквания (DAC7, GDPR) директно в нашите TypeScript интерфейси.',
      en: 'How we embedded legal requirements (DAC7, GDPR) directly into our TypeScript interfaces.'
    },
    content: { bg: '', en: '' },
    category: 'engineering',
    tags: ['Compliance', 'Philosophy', 'Architecture', 'Legal'],
    author: {
      id: 'koli-one-engineering',
      name: 'Koli One Engineering',
      role: 'Official',
      avatar: 'https://koli.one/logo.webp'
    },
    coverImage: 'https://koli.one/blog/images/constitution-cover.jpg',
    images: [],
    status: 'published',
    views: 890,
    likes: 42,
    shares: 15,
    readingTime: 10,
    commentsCount: 0,
    keywords: ['compliance', 'DAC7', 'coding standards', 'philosophy'],
    metaTitle: { bg: 'Constitutional Coding', en: 'Constitutional Coding' },
    metaDescription: { bg: 'Философия на програмиране в Koli One', en: 'Coding philosophy at Koli One' },
    createdAt: new Date('2026-02-12'),
    updatedAt: new Date('2026-02-12'),
    publishedAt: new Date('2026-02-12')
  }
];

class BlogService {
  private static instance: BlogService;
  private readonly COLLECTION = 'blog_posts';
  private readonly COMMENTS_COLLECTION = 'blog_comments';

  private constructor() { }

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
      serviceLogger.info('Blog post created:', { id: docRef.id });
      return docRef.id;
    } catch (error) {
      serviceLogger.error('Error creating blog post:', { error });
      throw new Error('Failed to create blog post');
    }
  }

  /**
   * Get blog post by ID
   */
  async getPost(postId: string): Promise<BlogPost | null> {
    try {
      // Check static posts first (for hardcoded high-value content)
      const staticPost = STATIC_POSTS.find(p => p.id === postId || p.slug.bg === postId || p.slug.en === postId);
      if (staticPost) {
        return staticPost;
      }

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
      serviceLogger.error('Error fetching blog post:', { error });
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
      // 1. Use Global Static Posts
      const staticPosts = STATIC_POSTS;

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

      // Merge with static posts if this is the first page
      let combinedPosts = [...posts];

      if (!lastDoc) {
        // Filter static posts based on requested filters
        const filteredStatics = staticPosts.filter(sp => {
          // 1. Filter by Category
          if (filters.category && sp.category !== filters.category) return false;
          // 2. Filter by Status (Default to published)
          if (filters.status && sp.status !== filters.status) return false;
          // 3. Filter by Tag
          if (filters.tags && filters.tags.length > 0) {
            const hasTag = sp.tags.some(t => filters.tags?.includes(t));
            if (!hasTag) return false;
          }
          return true;
        });

        // Prepend static posts to Firestore results
        combinedPosts = [...filteredStatics, ...posts];
      }

      return { posts: combinedPosts, lastDoc: newLastDoc };
    } catch (error) {
      serviceLogger.error('Error fetching posts:', { error });
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
      serviceLogger.info('Blog post updated:', { postId });
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
      serviceLogger.info('Blog post deleted:', { postId });
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
        'engineering': 0,
        'news': 0
      };

      const publishedPosts: Array<{ postId: string; title: string; views: number }> = [];
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
            postId: doc.id,
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
