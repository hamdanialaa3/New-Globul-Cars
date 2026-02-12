/**
 * Blog System Types
 * Bulgarian content management for SEO and user engagement
 */

export type BlogCategory =
  | 'buying-tips' // Съвети за покупка
  | 'selling-tips' // Съвети за продажба
  | 'market-trends' // Пазарни тенденции
  | 'car-reviews' // Ревюта на коли
  | 'maintenance' // Подدръжка
  | 'legal' // Правна информация
  | 'engineering' // Инженерни технологии
  | 'news'; // Новини

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogAuthor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: string; // Editor, Admin, etc.
}

export interface BlogPost {
  id: string;
  title: {
    bg: string;
    en: string;
  };
  slug: {
    bg: string;
    en: string;
  };
  excerpt: {
    bg: string;
    en: string;
  };
  content: {
    bg: string;
    en: string;
  };
  category: BlogCategory;
  tags: string[];
  author: BlogAuthor;
  coverImage: string;
  images: string[];
  status: BlogStatus;
  views: number;
  likes: number;
  shares: number;

  // SEO
  metaTitle?: {
    bg: string;
    en: string;
  };
  metaDescription?: {
    bg: string;
    en: string;
  };
  keywords: string[];

  // Engagement
  readingTime: number; // minutes
  commentsCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;

  // Related content
  relatedPosts?: string[]; // IDs of related posts
  relatedCars?: string[]; // IDs of related cars
}

export interface BlogComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  replies: BlogComment[];
  createdAt: Date;
  updatedAt: Date;
  isApproved: boolean;
}

export interface BlogFilters {
  category?: BlogCategory;
  tags?: string[];
  author?: string;
  status?: BlogStatus;
  searchQuery?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgReadingTime: number;
  topCategories: Array<{
    category: BlogCategory;
    count: number;
  }>;
  topPosts: Array<{
    postId: string;
    title: string;
    views: number;
  }>;
}
