// Posts Service
// CRUD operations for social/market posts feature
// English/Bulgarian bilingual. No emojis. <300 lines.

import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export interface PostContent {
  title: { bg: string; en: string };
  body: { bg: string; en: string };
}

export interface PostModeration {
  flagged: boolean;
  reason?: string;
  moderatedBy?: string;
  moderatedAt?: Timestamp;
}

export interface PostMetrics {
  views: number;
  likes: number;
  comments: number;
}

export interface Post {
  id: string;
  authorProfileId: string;
  type: 'market' | 'tips' | 'review';
  content: PostContent;
  listingRef?: string;
  tags: string[];
  moderation: PostModeration;
  metrics: PostMetrics;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const COLLECTION = 'posts';

function validatePost(content: PostContent, type: string): string[] {
  const issues: string[] = [];
  if (!content.title.bg || !content.title.en) issues.push('Title required in both languages');
  if (!content.body.bg || !content.body.en) issues.push('Body required in both languages');
  if (content.body.bg.length > 5000) issues.push('Body too long (max 5000 chars)');
  if (!['market', 'tips', 'review'].includes(type)) issues.push('Invalid post type');
  return issues;
}

class PostsService {
  private static instance: PostsService;
  static getInstance(): PostsService {
    if (!this.instance) this.instance = new PostsService();
    return this.instance;
  }

  private col() {
    return collection(db, COLLECTION);
  }

  async list(type?: string, limitCount = 50): Promise<Post[]> {
    let q = query(this.col(), orderBy('createdAt', 'desc'), limit(limitCount));
    if (type) {
      q = query(this.col(), where('type', '==', type), orderBy('createdAt', 'desc'), limit(limitCount));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) }));
  }

  async getByAuthor(authorProfileId: string): Promise<Post[]> {
    const q = query(this.col(), where('authorProfileId', '==', authorProfileId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) }));
  }

  async create(authorProfileId: string, type: 'market' | 'tips' | 'review', content: PostContent, listingRef?: string, tags: string[] = []): Promise<Post> {
    const issues = validatePost(content, type);
    if (issues.length) {
      throw new Error('Validation failed: ' + issues.join(', '));
    }

    const payload: Omit<Post, 'id'> = {
      authorProfileId,
      type,
      content,
      listingRef,
      tags: tags.slice(0, 10), // Max 10 tags
      moderation: { flagged: false },
      metrics: { views: 0, likes: 0, comments: 0 },
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };

    const ref = await addDoc(this.col(), payload);
    return { id: ref.id, ...payload };
  }

  async update(postId: string, content: Partial<PostContent>): Promise<void> {
    const updates: any = { updatedAt: Timestamp.fromDate(new Date()) };
    if (content.title) updates['content.title'] = content.title;
    if (content.body) updates['content.body'] = content.body;
    await updateDoc(doc(db, COLLECTION, postId), updates);
  }

  async delete(postId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, postId));
  }

  async incrementView(postId: string): Promise<void> {
    const ref = doc(db, COLLECTION, postId);
    const current = (await ref.get()).data();
    if (current) {
      await updateDoc(ref, { 'metrics.views': (current.metrics?.views || 0) + 1 });
    }
  }

  async flag(postId: string, reason: string, moderatorId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, postId), {
      'moderation.flagged': true,
      'moderation.reason': reason,
      'moderation.moderatedBy': moderatorId,
      'moderation.moderatedAt': Timestamp.fromDate(new Date())
    });
  }

  async unflag(postId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, postId), {
      'moderation.flagged': false,
      'moderation.reason': null
    });
  }
}

export const postsService = PostsService.getInstance();
