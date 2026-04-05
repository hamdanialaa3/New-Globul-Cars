// PostService - basic CRUD for posts collection (future expansion: moderation queue, caching)
// Keep under 300 lines. No emojis.

import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

export interface PostContentLang {
  title: { bg: string; en: string };
  body: { bg: string; en: string };
}

export interface PostDoc {
  id: string;
  authorProfileId: string;
  type: 'market' | 'tips' | 'review';
  content: PostContentLang;
  listingRef?: string;
  tags: string[];
  moderation: { flagged: boolean; reason?: string };
  metrics: { views: number; likes: number; comments: number };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const POSTS = 'posts';

class PostServiceClass {
  static instance: PostServiceClass;
  static getInstance(): PostServiceClass {
    return this.instance || (this.instance = new PostServiceClass());
  }
  private col() {
    return collection(db, POSTS);
  }

  async create(
    authorProfileId: string,
    type: PostDoc['type'],
    content: PostContentLang,
    opts: { listingRef?: string; tags?: string[] } = {}
  ): Promise<PostDoc> {
    const data: Omit<PostDoc, 'id'> = {
      authorProfileId,
      type,
      content,
      listingRef: opts.listingRef,
      tags: opts.tags || [],
      moderation: { flagged: false },
      metrics: { views: 0, likes: 0, comments: 0 },
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };
    const ref = await addDoc(this.col(), data);
    return { id: ref.id, ...data };
  }

  async get(id: string): Promise<PostDoc | null> {
    const snapshot = await getDoc(doc(db, POSTS, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...(snapshot.data() as Omit<PostDoc, 'id'>) };
  }

  async listRecent(type?: PostDoc['type']): Promise<PostDoc[]> {
    let q = query(this.col(), orderBy('createdAt', 'desc'), limit(25));
    if (type)
      q = query(
        this.col(),
        where('type', '==', type),
        orderBy('createdAt', 'desc'),
        limit(25)
      );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<PostDoc, 'id'>),
    }));
  }

  async flag(id: string, reason: string): Promise<void> {
    await updateDoc(doc(db, POSTS, id), {
      'moderation.flagged': true,
      'moderation.reason': reason,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  async like(id: string): Promise<void> {
    const ref = doc(db, POSTS, id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;
    const metrics = snapshot.data().metrics || { likes: 0 };
    metrics.likes = (metrics.likes || 0) + 1;
    await updateDoc(ref, {
      metrics,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  async incrementViews(id: string): Promise<void> {
    const ref = doc(db, POSTS, id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;
    const metrics = snapshot.data().metrics || { views: 0 };
    metrics.views = (metrics.views || 0) + 1;
    await updateDoc(ref, {
      metrics,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  async remove(id: string): Promise<void> {
    const ref = doc(db, POSTS, id);
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      await addDoc(collection(db, 'posts_archive'), {
        originalPostId: id,
        ...snapshot.data(),
        archivedAt: Timestamp.fromDate(new Date()),
      });
    }

    await deleteDoc(ref);
  }
}

export const postService = PostServiceClass.getInstance();
export default postService;
