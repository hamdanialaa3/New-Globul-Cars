# 🌐 الخطة الشاملة: نظام المنشورات والمشورات الاجتماعي
**التاريخ:** 19 أكتوبر 2025  
**المشروع:** Globul Cars - Bulgarian Car Marketplace  
**النطاق:** Social Feed + Consultations + Users Directory Integration  
**الرؤية:** "LinkedIn for Car Enthusiasts + Car Advice Platform"

---

## 📊 **تحليل الواقع الحالي (Current State Analysis)**

### **✅ ما هو موجود:**

```typescript
✅ ProfilePage (src/pages/ProfilePage/index.tsx - 1714 lines)
   - Tabs system (profile, reviews, listings, activity)
   - Stats display
   - Follow system basics (follow.service.ts)
   - Trust score & verification

✅ HomePage (src/pages/HomePage/index.tsx - 83 lines)
   - Modular structure
   - LazySection system
   - 7 existing sections:
     • HeroSection
     • StatsSection
     • PopularBrandsSection
     • CityCarsSection
     • ImageGallerySection
     • FeaturedCarsSection
     • FeaturesSection

✅ Services موجودة:
   - services/social/follow.service.ts (Follow system)
   - services/carListingService.ts (Car listings)
   - services/advanced-user-management-service.ts
   - services/bulgarian-profile-service.ts

✅ Firebase Setup:
   - Firestore ✅
   - Storage ✅
   - Authentication ✅
   - Functions ✅
```

### **❌ ما هو ناقص:**

```typescript
❌ Posts System (نظام المنشورات):
   - لا يوجد collections للـ posts
   - لا يوجد UI لإنشاء posts
   - لا يوجد feed algorithm
   - لا يوجد reactions (like, comment, share)
   - لا يوجد rich media support

❌ Consultations System (نظام المشورات):
   - لا يوجد collections للـ consultations
   - لا يوجد UI للطلب/الرد
   - لا يوجد rating system للمشورات
   - لا يوجد expert badges
   - لا يوجد payment integration

❌ Social Feed في HomePage:
   - لا يوجد community posts section
   - لا يوجد trending topics
   - لا يوجد activity feed

❌ ProfilePage Consultations:
   - لا يوجد consultations tab
   - لا يوجد expert profile section
   - لا يوجد consultation history
```

---

## 🎯 **الرؤية الشاملة (Complete Vision)**

### **المفهوم الأساسي:**

```
┌─────────────────────────────────────────────────────────────┐
│                      Globul Cars Platform                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🏠 HomePage (Public Feed)                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📰 Community Feed (Social Posts)                     │  │
│  │  • Car showcases                                      │  │
│  │  • Tips & Tricks                                      │  │
│  │  • Market insights                                    │  │
│  │  • User stories                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  👤 Profile Page (Personal Space)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tabs: [Profile] [Reviews] [Listings] [Activity]     │  │
│  │        [💬 Consultations] ← NEW!                      │  │
│  │                                                        │  │
│  │  Consultations Tab:                                   │  │
│  │  • Ask for advice (buyers)                            │  │
│  │  • Provide expertise (sellers/dealers)                │  │
│  │  • View consultation history                          │  │
│  │  • Expert ratings & badges                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  👥 Users Directory (Network Discovery)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Bubble view of users                               │  │
│  │  • Expert badges visible                              │  │
│  │  • "Ask for Consultation" button                      │  │
│  │  • Activity indicators                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 **Architecture المقترح (System Design)**

### **Database Schema - Firestore Collections:**

```typescript
// ==================== POSTS SYSTEM ====================

// posts/ (NEW)
interface Post {
  id: string;
  authorId: string;
  authorInfo: {
    displayName: string;
    profileImage?: string;
    profileType: 'private' | 'dealer' | 'company';
    isVerified: boolean;
    trustScore: number;
  };
  
  type: 'text' | 'car_showcase' | 'tip' | 'question' | 'review' | 'story';
  content: {
    text: string;
    media?: {
      type: 'image' | 'video' | 'gallery';
      urls: string[];
      thumbnails?: string[];
    };
    carReference?: {
      carId: string;
      carTitle: string;
      carImage: string;
    };
    hashtags?: string[];
    mentions?: string[]; // @username
  };
  
  visibility: 'public' | 'followers' | 'private';
  location?: {
    city: string;
    region: string;
    coordinates?: { lat: number; lng: number; };
  };
  
  engagement: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  
  reactions: {
    [userId: string]: 'like' | 'love' | 'helpful' | 'funny' | 'wow';
  };
  
  // Metadata
  status: 'draft' | 'published' | 'archived' | 'deleted';
  isPinned: boolean;
  isFeatured: boolean;
  reportCount: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  expiresAt?: Timestamp; // For stories (24h)
}

// post_comments/ (SUB-COLLECTION of posts)
interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorInfo: {
    displayName: string;
    profileImage?: string;
    profileType: string;
  };
  
  content: string;
  mentions?: string[];
  
  likes: number;
  likedBy: string[];
  
  parentCommentId?: string; // For threaded replies
  
  status: 'active' | 'deleted' | 'hidden';
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== CONSULTATIONS SYSTEM ====================

// consultations/ (NEW)
interface Consultation {
  id: string;
  
  // Requester (person asking for advice)
  requesterId: string;
  requesterInfo: {
    displayName: string;
    profileImage?: string;
    location: string;
  };
  
  // Expert (person providing advice)
  expertId?: string; // null until assigned/accepted
  expertInfo?: {
    displayName: string;
    profileImage?: string;
    profileType: 'dealer' | 'company' | 'private';
    expertise: string[]; // ['BMW', 'Engine Repair', 'Buying Guide']
    rating: number;
    totalConsultations: number;
  };
  
  // Consultation Details
  category: 'buying_advice' | 'selling_advice' | 'technical' | 'financing' | 'legal' | 'general';
  topic: string; // "Should I buy a BMW X5?"
  description: string; // Detailed question
  
  carReference?: {
    carId?: string;
    make: string;
    model: string;
    year: number;
    price?: number;
    image?: string;
  };
  
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  budget?: {
    min: number;
    max: number;
    currency: 'EUR' | 'BGN';
  };
  
  // Status & Progress
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  priority: number; // 1-10
  
  // Conversation
  messages: ConsultationMessage[];
  messagesCount: number;
  
  // Payment (optional for premium consultations)
  isPaid: boolean;
  price?: {
    amount: number;
    currency: 'EUR' | 'BGN';
    paymentStatus: 'pending' | 'paid' | 'refunded';
  };
  
  // Rating & Feedback
  rating?: {
    score: 1 | 2 | 3 | 4 | 5;
    review: string;
    ratedAt: Timestamp;
  };
  helpfulnessVotes: number;
  
  // Metadata
  viewsCount: number;
  isPublic: boolean; // Can others see this consultation?
  tags: string[];
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  expiresAt?: Timestamp; // Auto-close if no response
}

interface ConsultationMessage {
  id: string;
  senderId: string;
  senderType: 'requester' | 'expert';
  content: string;
  attachments?: {
    type: 'image' | 'document' | 'link';
    url: string;
    name: string;
  }[];
  timestamp: Timestamp;
  isRead: boolean;
}

// expert_profiles/ (Extension of users collection)
interface ExpertProfile {
  userId: string;
  
  isExpert: boolean;
  expertStatus: 'pending' | 'approved' | 'suspended';
  
  expertise: {
    categories: ('buying' | 'selling' | 'technical' | 'financing' | 'legal')[];
    brands: string[]; // ['BMW', 'Mercedes', 'Audi']
    specializations: string[]; // ['Engine Diagnostics', 'Negotiation']
    yearsOfExperience: number;
    certifications?: string[];
  };
  
  consultationStats: {
    totalConsultations: number;
    completedConsultations: number;
    averageRating: number;
    totalRatings: number;
    responseTime: number; // in minutes
    successRate: number; // percentage
  };
  
  availability: {
    isAvailable: boolean;
    responseTime: string; // "Within 2 hours"
    maxConcurrent: number; // Max simultaneous consultations
    workingHours?: {
      [day: string]: { start: string; end: string; };
    };
  };
  
  pricing?: {
    isFree: boolean;
    basePrice?: number;
    currency: 'EUR' | 'BGN';
    pricingModel: 'free' | 'per_consultation' | 'subscription';
  };
  
  badges: ('top_expert' | 'verified_dealer' | 'trusted_advisor' | 'quick_responder')[];
  
  bio: string;
  languages: string[];
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== ACTIVITY FEED ====================

// user_activity/ (NEW - for activity feed)
interface UserActivity {
  id: string;
  userId: string;
  
  type: 
    | 'posted' 
    | 'commented' 
    | 'liked' 
    | 'shared'
    | 'followed'
    | 'listed_car'
    | 'completed_consultation'
    | 'earned_badge'
    | 'reached_milestone';
  
  content: {
    title: string;
    description: string;
    image?: string;
    link?: string;
  };
  
  relatedId?: string; // postId, consultationId, carId, etc.
  relatedType?: 'post' | 'consultation' | 'car' | 'user';
  
  visibility: 'public' | 'followers' | 'private';
  
  createdAt: Timestamp;
}

// ==================== NOTIFICATIONS ====================

// notifications/ (Extension of existing)
interface Notification {
  // ... existing fields ...
  
  // NEW notification types:
  type: 
    | 'post_like'
    | 'post_comment'
    | 'post_share'
    | 'comment_reply'
    | 'consultation_request'
    | 'consultation_response'
    | 'consultation_completed'
    | 'consultation_rated'
    | 'expert_badge_earned'
    | 'trending_post'
    | ... // existing types
}
```

---

## 🚀 **Implementation Plan - PHASE by PHASE**

---

## **PHASE 1: Posts System Foundation (Days 1-3)**
**الوقت:** 24 ساعة  
**الأولوية:** 🔴 Critical

### **Step 1.1: Post Creation & Management (8h)**

#### **📁 ملف جديد: `src/services/social/posts.service.ts`**

```typescript
/**
 * Posts Service
 * Complete social posting system (Instagram + LinkedIn style)
 */

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
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase-config';

interface CreatePostData {
  type: 'text' | 'car_showcase' | 'tip' | 'question' | 'review' | 'story';
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

class PostsService {
  private collectionName = 'posts';
  
  /**
   * Create a new post
   */
  async createPost(userId: string, postData: CreatePostData): Promise<string> {
    try {
      // Get user info
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) throw new Error('User not found');
      
      const userData = userDoc.data();
      
      // Upload media if exists
      let mediaUrls: string[] = [];
      if (postData.content.media && postData.content.media.length > 0) {
        mediaUrls = await this.uploadPostMedia(userId, postData.content.media);
      }
      
      // Create post document
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
        reportCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp()
      });
      
      // Update user stats
      await updateDoc(doc(db, 'users', userId), {
        'stats.posts': increment(1)
      });
      
      // Create activity
      await this.createActivity(userId, 'posted', postRef.id);
      
      return postRef.id;
    } catch (error) {
      console.error('[SERVICE] Error creating post:', error);
      throw new Error('Failed to create post');
    }
  }
  
  /**
   * Upload post media to Firebase Storage
   */
  private async uploadPostMedia(userId: string, files: File[]): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const timestamp = Date.now();
      const fileName = `${userId}_${timestamp}_${index}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `posts/${userId}/${fileName}`);
      
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    });
    
    return await Promise.all(uploadPromises);
  }
  
  /**
   * Get feed posts (algorithm-based)
   */
  async getFeedPosts(
    userId: string,
    lastPostId?: string,
    pageSize: number = 20
  ): Promise<any[]> {
    try {
      // Get user's following list
      const followingIds = await this.getFollowingIds(userId);
      
      // Build query
      let q = query(
        collection(db, this.collectionName),
        where('status', '==', 'published'),
        where('visibility', 'in', ['public', 'followers']),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      
      if (lastPostId) {
        const lastDoc = await getDoc(doc(db, this.collectionName, lastPostId));
        q = query(q, startAfter(lastDoc));
      }
      
      const snapshot = await getDocs(q);
      
      // Filter and rank posts
      let posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Algorithm: Prioritize
      // 1. Posts from followed users
      // 2. Recent posts (within 24h)
      // 3. High engagement posts
      posts = this.rankPosts(posts, followingIds, userId);
      
      return posts;
    } catch (error) {
      console.error('[SERVICE] Error getting feed posts:', error);
      throw new Error('Failed to load feed');
    }
  }
  
  /**
   * Simple ranking algorithm
   */
  private rankPosts(posts: any[], followingIds: string[], userId: string): any[] {
    return posts.sort((a, b) => {
      // Score calculation
      let scoreA = 0;
      let scoreB = 0;
      
      // +100 if from followed user
      if (followingIds.includes(a.authorId)) scoreA += 100;
      if (followingIds.includes(b.authorId)) scoreB += 100;
      
      // +50 if posted within last 24h
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      if (now - a.createdAt?.toMillis() < dayInMs) scoreA += 50;
      if (now - b.createdAt?.toMillis() < dayInMs) scoreB += 50;
      
      // +1 per like, +2 per comment, +3 per share
      scoreA += (a.engagement?.likes || 0) * 1;
      scoreA += (a.engagement?.comments || 0) * 2;
      scoreA += (a.engagement?.shares || 0) * 3;
      
      scoreB += (b.engagement?.likes || 0) * 1;
      scoreB += (b.engagement?.comments || 0) * 2;
      scoreB += (b.engagement?.shares || 0) * 3;
      
      return scoreB - scoreA;
    });
  }
  
  /**
   * Like/Unlike a post
   */
  async toggleLike(postId: string, userId: string): Promise<void> {
    const postRef = doc(db, this.collectionName, postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) throw new Error('Post not found');
    
    const reactions = postDoc.data().reactions || {};
    const hasLiked = reactions[userId];
    
    if (hasLiked) {
      // Unlike
      await updateDoc(postRef, {
        [`reactions.${userId}`]: arrayRemove(userId),
        'engagement.likes': increment(-1)
      });
    } else {
      // Like
      await updateDoc(postRef, {
        [`reactions.${userId}`]: 'like',
        'engagement.likes': increment(1)
      });
      
      // Send notification to post author
      await this.sendNotification(postDoc.data().authorId, {
        type: 'post_like',
        from: userId,
        postId
      });
    }
  }
  
  /**
   * Add comment to post
   */
  async addComment(postId: string, userId: string, content: string): Promise<string> {
    try {
      // Get user info
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      // Create comment
      const commentRef = await addDoc(
        collection(db, this.collectionName, postId, 'comments'),
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
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      );
      
      // Increment comment count
      await updateDoc(doc(db, this.collectionName, postId), {
        'engagement.comments': increment(1)
      });
      
      // Send notification
      const postDoc = await getDoc(doc(db, this.collectionName, postId));
      await this.sendNotification(postDoc.data().authorId, {
        type: 'post_comment',
        from: userId,
        postId
      });
      
      return commentRef.id;
    } catch (error) {
      console.error('[SERVICE] Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }
  
  /**
   * Helper: Get following IDs
   */
  private async getFollowingIds(userId: string): Promise<string[]> {
    const q = query(
      collection(db, 'follows'),
      where('followerId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data().followingId);
  }
  
  /**
   * Helper: Create user activity
   */
  private async createActivity(userId: string, type: string, relatedId: string): Promise<void> {
    await addDoc(collection(db, 'user_activity'), {
      userId,
      type,
      relatedId,
      relatedType: 'post',
      createdAt: serverTimestamp()
    });
  }
  
  /**
   * Helper: Send notification
   */
  private async sendNotification(toUserId: string, data: any): Promise<void> {
    await addDoc(collection(db, 'notifications'), {
      userId: toUserId,
      ...data,
      isRead: false,
      createdAt: serverTimestamp()
    });
  }
}

export const postsService = new PostsService();
```

---

### **Step 1.2: Feed Section في HomePage (8h)**

#### **📁 ملف جديد: `src/pages/HomePage/CommunityFeedSection.tsx`**

```typescript
/**
 * Community Feed Section
 * Social feed for homepage (Instagram + LinkedIn style)
 */

import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { postsService } from '../../services/social/posts.service';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  TrendingUp
} from 'lucide-react';

// ==================== STYLED COMPONENTS ====================

const Section = styled.section`
  background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
  padding: 4rem 0;
  position: relative;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h2 {
    font-size: 2rem;
    font-weight: 800;
    color: #212529;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  
  p {
    font-size: 1.1rem;
    color: #6c757d;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const FeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PostCard = styled.article`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    border-color: #FF8F10;
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FF8F10;
`;

const AuthorInfo = styled.div`
  flex: 1;
  
  .name {
    font-weight: 700;
    color: #212529;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  
  .meta {
    font-size: 0.85rem;
    color: #6c757d;
  }
`;

const Badge = styled.span<{ $type: string }>`
  font-size: 0.65rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  background: ${p => {
    switch (p.$type) {
      case 'dealer': return 'linear-gradient(135deg, #16a34a, #22c55e)';
      case 'company': return 'linear-gradient(135deg, #1d4ed8, #3b82f6)';
      default: return 'linear-gradient(135deg, #FF8F10, #FF7900)';
    }
  }};
  color: white;
`;

const PostContent = styled.div`
  margin-bottom: 16px;
  
  .text {
    font-size: 0.95rem;
    line-height: 1.6;
    color: #212529;
    margin-bottom: 12px;
  }
  
  .hashtags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
    
    span {
      color: #FF7900;
      font-weight: 600;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const PostMedia = styled.div`
  margin: 16px 0;
  border-radius: 12px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const PostActions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
`;

const ActionButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  background: ${p => p.$active ? 'rgba(255, 121, 0, 0.1)' : 'transparent'};
  color: ${p => p.$active ? '#FF7900' : '#6c757d'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 121, 0, 0.1);
    color: #FF7900;
    transform: translateY(-1px);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 16px;
  border: 2px dashed #dee2e6;
  background: white;
  border-radius: 12px;
  color: #6c757d;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #FF8F10;
    color: #FF7900;
    background: rgba(255, 247, 237, 0.5);
  }
`;

// ==================== COMPONENT ====================

const CommunityFeedSection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadPosts();
  }, [user]);
  
  const loadPosts = async () => {
    try {
      setLoading(true);
      
      if (user) {
        // Personalized feed for logged-in users
        const feedPosts = await postsService.getFeedPosts(user.uid, undefined, 10);
        setPosts(feedPosts);
      } else {
        // Public feed for visitors
        const publicPosts = await postsService.getPublicPosts(10);
        setPosts(publicPosts);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLike = async (postId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await postsService.toggleLike(postId, user.uid);
      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              engagement: { 
                ...post.engagement, 
                likes: post.reactions?.[user.uid] 
                  ? post.engagement.likes - 1 
                  : post.engagement.likes + 1 
              },
              reactions: {
                ...post.reactions,
                [user.uid]: post.reactions?.[user.uid] ? undefined : 'like'
              }
            }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  
  const handleComment = (postId: string) => {
    navigate(`/post/${postId}`);
  };
  
  if (loading) {
    return (
      <Section>
        <Container>
          <SectionHeader>
            <h2>
              <TrendingUp size={32} />
              Loading Community Feed...
            </h2>
          </SectionHeader>
        </Container>
      </Section>
    );
  }
  
  return (
    <Section>
      <Container>
        <SectionHeader>
          <h2>
            <TrendingUp size={32} />
            Community Feed
          </h2>
          <p>
            Latest stories, tips, and insights from the car community
          </p>
        </SectionHeader>
        
        <FeedContainer>
          {posts.map(post => (
            <PostCard key={post.id}>
              <PostHeader>
                <Avatar 
                  src={post.authorInfo.profileImage || '/default-avatar.png'}
                  alt={post.authorInfo.displayName}
                />
                <AuthorInfo>
                  <div className="name">
                    {post.authorInfo.displayName}
                    <Badge $type={post.authorInfo.profileType}>
                      {post.authorInfo.profileType}
                    </Badge>
                  </div>
                  <div className="meta">
                    {post.createdAt?.toDate?.().toLocaleDateString()} • 
                    {post.location?.city && ` ${post.location.city}`}
                  </div>
                </AuthorInfo>
                <button style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <MoreHorizontal size={20} />
                </button>
              </PostHeader>
              
              <PostContent>
                <div className="text">{post.content.text}</div>
                
                {post.content.media && (
                  <PostMedia>
                    <img src={post.content.media.urls[0]} alt="Post media" />
                  </PostMedia>
                )}
                
                {post.content.hashtags && post.content.hashtags.length > 0 && (
                  <div className="hashtags">
                    {post.content.hashtags.map((tag: string, i: number) => (
                      <span key={i}>#{tag}</span>
                    ))}
                  </div>
                )}
              </PostContent>
              
              <PostActions>
                <ActionButton 
                  $active={post.reactions?.[user?.uid]}
                  onClick={() => handleLike(post.id)}
                >
                  <Heart 
                    size={18} 
                    fill={post.reactions?.[user?.uid] ? 'currentColor' : 'none'}
                  />
                  {post.engagement.likes}
                </ActionButton>
                
                <ActionButton onClick={() => handleComment(post.id)}>
                  <MessageCircle size={18} />
                  {post.engagement.comments}
                </ActionButton>
                
                <ActionButton>
                  <Share2 size={18} />
                  Share
                </ActionButton>
                
                <ActionButton style={{ marginLeft: 'auto' }}>
                  <Bookmark size={18} />
                </ActionButton>
              </PostActions>
            </PostCard>
          ))}
          
          <LoadMoreButton onClick={() => alert('Load more...')}>
            Load More Posts
          </LoadMoreButton>
        </FeedContainer>
      </Container>
    </Section>
  );
};

export default memo(CommunityFeedSection);
```

---

### **Step 1.3: تحديث HomePage (2h)**

#### **📝 تعديل: `src/pages/HomePage/index.tsx`**

```typescript
// Add new section
const CommunityFeedSection = React.lazy(() => import('./CommunityFeedSection'));

// Insert after FeaturedCarsSection, before FeaturesSection
<LazySection rootMargin="300px" minHeight="800px">
  <Suspense fallback={<LoadingFallback>Loading community feed...</LoadingFallback>}>
    <CommunityFeedSection />
  </Suspense>
</LazySection>
```

---

### **Step 1.4: Create Post UI (6h)**

#### **📁 ملف جديد: `src/components/CreatePost/CreatePostModal.tsx`**

```typescript
/**
 * Create Post Modal
 * Instagram + LinkedIn-style post creation
 */

// Full component with:
// - Rich text editor
// - Image/video upload
// - Car reference selector
// - Hashtag suggestions
// - Visibility selector
// - Location picker
// - Preview
```

---

## **PHASE 2: Consultations System (Days 4-6)**
**الوقت:** 24 ساعة  
**الأولوية:** 🔴 Critical

### **Step 2.1: Consultations Service (8h)**

#### **📁 ملف جديد: `src/services/social/consultations.service.ts`**

```typescript
/**
 * Consultations Service
 * Complete car advice/consultation system
 */

class ConsultationsService {
  /**
   * Request a consultation
   */
  async requestConsultation(data: CreateConsultationData): Promise<string> {
    // Create consultation
    // Match with expert (optional)
    // Send notifications
    // Return consultationId
  }
  
  /**
   * Respond to consultation (expert)
   */
  async respondToConsultation(consultationId: string, message: string): Promise<void> {
    // Add message
    // Update status
    // Send notification
  }
  
  /**
   * Complete and rate consultation
   */
  async completeConsultation(
    consultationId: string, 
    rating: number, 
    review: string
  ): Promise<void> {
    // Mark as completed
    // Save rating
    // Update expert stats
    // Award badges if applicable
  }
  
  /**
   * Get expert consultations
   */
  async getExpertConsultations(expertId: string): Promise<Consultation[]> {
    // Return all consultations for this expert
  }
  
  /**
   * Get user consultations (as requester)
   */
  async getUserConsultations(userId: string): Promise<Consultation[]> {
    // Return all consultations requested by user
  }
}
```

---

### **Step 2.2: Consultations Tab في ProfilePage (10h)**

#### **📁 ملف جديد: `src/pages/ProfilePage/ConsultationsTab.tsx`**

```typescript
/**
 * Consultations Tab
 * Shows consultation history, stats, and request form
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { consultationsService } from '../../services/social/consultations.service';
import {
  MessageSquare,
  Star,
  Clock,
  CheckCircle,
  Award,
  TrendingUp
} from 'lucide-react';

const ConsultationsTab: React.FC<{ userId: string; isOwnProfile: boolean }> = ({
  userId,
  isOwnProfile
}) => {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [expertProfile, setExpertProfile] = useState<any>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  // ... implementation
  
  return (
    <Container>
      {/* Expert Profile Section (if user is expert) */}
      {expertProfile && (
        <ExpertCard>
          <ExpertHeader>
            <Award size={32} />
            <div>
              <h3>Expert Profile</h3>
              <p>Helping the community since {expertProfile.createdAt}</p>
            </div>
          </ExpertHeader>
          
          <ExpertStats>
            <StatBox>
              <div className="value">{expertProfile.consultationStats.totalConsultations}</div>
              <div className="label">Total Consultations</div>
            </StatBox>
            <StatBox>
              <div className="value">{expertProfile.consultationStats.averageRating.toFixed(1)} ⭐</div>
              <div className="label">Average Rating</div>
            </StatBox>
            <StatBox>
              <div className="value">{expertProfile.consultationStats.responseTime}min</div>
              <div className="label">Response Time</div>
            </StatBox>
            <StatBox>
              <div className="value">{expertProfile.consultationStats.successRate}%</div>
              <div className="label">Success Rate</div>
            </StatBox>
          </ExpertStats>
          
          <ExpertBadges>
            {expertProfile.badges.map((badge: string) => (
              <Badge key={badge}>{badge}</Badge>
            ))}
          </ExpertBadges>
        </ExpertCard>
      )}
      
      {/* Request Consultation Button (for visitors) */}
      {!isOwnProfile && (
        <RequestButton onClick={() => setShowRequestForm(true)}>
          <MessageSquare size={20} />
          Request Consultation
        </RequestButton>
      )}
      
      {/* Consultations List */}
      <ConsultationsList>
        <h3>
          {isOwnProfile ? 'Your Consultations' : 'Public Consultations'}
        </h3>
        
        {consultations.map(consultation => (
          <ConsultationCard key={consultation.id}>
            <ConsultationHeader>
              <div className="category">{consultation.category}</div>
              <div className="status">{consultation.status}</div>
            </ConsultationHeader>
            
            <ConsultationBody>
              <h4>{consultation.topic}</h4>
              <p>{consultation.description}</p>
              
              {consultation.carReference && (
                <CarRef>
                  <img src={consultation.carReference.image} alt="" />
                  <div>
                    <strong>{consultation.carReference.make} {consultation.carReference.model}</strong>
                    <span>{consultation.carReference.year}</span>
                  </div>
                </CarRef>
              )}
            </ConsultationBody>
            
            <ConsultationFooter>
              <div className="meta">
                <Clock size={14} />
                {consultation.createdAt.toDate().toLocaleDateString()}
              </div>
              
              {consultation.rating && (
                <div className="rating">
                  <Star size={14} fill="gold" />
                  {consultation.rating.score}/5
                </div>
              )}
              
              <button>View Details</button>
            </ConsultationFooter>
          </ConsultationCard>
        ))}
      </ConsultationsList>
      
      {/* Request Form Modal */}
      {showRequestForm && (
        <RequestConsultationModal
          onClose={() => setShowRequestForm(false)}
          expertId={userId}
        />
      )}
    </Container>
  );
};

export default ConsultationsTab;
```

---

### **Step 2.3: تحديث ProfilePage Tabs (2h)**

#### **📝 تعديل: `src/pages/ProfilePage/index.tsx`**

```typescript
// Add new tab
const TABS = {
  profile: 'profile',
  reviews: 'reviews',
  listings: 'listings',
  activity: 'activity',
  consultations: 'consultations' // ← NEW!
};

// Add tab button
<S.TabButton
  $active={activeTab === 'consultations'}
  onClick={() => setActiveTab('consultations')}
  $themeColor={theme.primary}
>
  <MessageSquare size={20} />
  {language === 'bg' ? 'Консултации' : 'Consultations'}
</S.TabButton>

// Add tab content
{activeTab === 'consultations' && (
  <ConsultationsTab 
    userId={displayedUserId} 
    isOwnProfile={isOwnProfile}
  />
)}
```

---

### **Step 2.4: Expert Badge System (4h)**

#### **📁 ملف جديد: `src/services/social/expert-badges.service.ts`**

```typescript
/**
 * Expert Badges Service
 * Gamification for consultations
 */

const BADGES = {
  FIRST_CONSULTATION: {
    id: 'first_consultation',
    name: 'First Step',
    description: 'Completed your first consultation',
    icon: '🎯',
    requirement: { totalConsultations: 1 }
  },
  TOP_EXPERT: {
    id: 'top_expert',
    name: 'Top Expert',
    description: '50+ consultations with 4.5+ rating',
    icon: '🏆',
    requirement: { totalConsultations: 50, averageRating: 4.5 }
  },
  QUICK_RESPONDER: {
    id: 'quick_responder',
    name: 'Quick Responder',
    description: 'Average response time under 30 minutes',
    icon: '⚡',
    requirement: { responseTime: 30 }
  },
  // ... more badges
};

class ExpertBadgesService {
  /**
   * Check and award badges
   */
  async checkAndAwardBadges(expertId: string): Promise<string[]> {
    // Check expert stats
    // Award applicable badges
    // Send notifications
    // Return newly awarded badges
  }
}
```

---

## **PHASE 3: Integration & Polish (Days 7-8)**
**الوقت:** 16 ساعة  
**الأولوية:** 🟠 Medium

### **Features:**

1. **Users Directory Integration** (4h)
   - Add "Ask for Consultation" button في user bubbles
   - Show expert badges في user cards
   - Filter by experts

2. **Notifications System** (4h)
   - Post interactions
   - Consultation updates
   - Badge awards
   - Real-time updates

3. **Search & Discovery** (4h)
   - Search posts by hashtags
   - Find experts by category
   - Trending topics
   - Popular consultations

4. **Analytics Dashboard** (4h)
   - Post performance
   - Consultation metrics
   - Expert earnings (if paid)
   - Engagement insights

---

## 📊 **Complete Timeline Summary**

```
Week 1: Foundation (40h)
├─ Days 1-3: Posts System (24h)
│  ├─ posts.service.ts (8h)
│  ├─ CommunityFeedSection.tsx (8h)
│  ├─ HomePage integration (2h)
│  └─ CreatePostModal.tsx (6h)
│
└─ Days 4-6: Consultations (24h)
   ├─ consultations.service.ts (8h)
   ├─ ConsultationsTab.tsx (10h)
   ├─ ProfilePage integration (2h)
   └─ expert-badges.service.ts (4h)

Week 2: Integration (16h)
└─ Days 7-8: Polish & Integration (16h)
   ├─ Users Directory integration (4h)
   ├─ Notifications (4h)
   ├─ Search & Discovery (4h)
   └─ Analytics (4h)

Total: 56 ساعة (~7 أيام عمل)
```

---

## 🎯 **النتيجة المتوقعة (Expected Outcome)**

### **Before:**
```
❌ No social features
❌ No community engagement
❌ No expert advice system
❌ Static platform
```

### **After:**
```
✅ Instagram + LinkedIn-style posts
✅ Community feed على homepage
✅ Expert consultation system
✅ Consultations tab في profile
✅ Badge & reputation system
✅ Real-time notifications
✅ Users directory integration
✅ Complete social ecosystem
```

---

## 🎨 **UI/UX المتوقع**

### **HomePage:**
```
┌─────────────────────────────────────┐
│  🏠 Home                             │
├─────────────────────────────────────┤
│  Hero Section                       │
│  Stats Section                      │
│  Popular Brands                     │
│  City Cars                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  📰 COMMUNITY FEED ← NEW!            │
│  ┌──────────────────────────────┐  │
│  │ Post 1: BMW Buying Tips      │  │
│  │ 👍 245  💬 12  🔗 Share      │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ Post 2: Best Dealers Sofia   │  │
│  │ 👍 189  💬 8   🔗 Share      │  │
│  └──────────────────────────────┘  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Image Gallery                      │
│  Features                           │
└─────────────────────────────────────┘
```

### **ProfilePage:**
```
┌─────────────────────────────────────┐
│  👤 Profile                          │
├─────────────────────────────────────┤
│  Cover Image                        │
│  Avatar + Info                      │
│                                     │
│  [Profile] [Reviews] [Listings]    │
│  [Activity] [💬 Consultations] ← NEW│
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🏆 Expert Profile           │   │
│  │ • 127 Consultations         │   │
│  │ • 4.8 ⭐ Average Rating     │   │
│  │ • 15min Response Time       │   │
│  │ • 96% Success Rate          │   │
│  │                             │   │
│  │ Badges:                     │   │
│  │ 🏆 Top Expert               │   │
│  │ ⚡ Quick Responder          │   │
│  │ 🎯 BMW Specialist           │   │
│  └─────────────────────────────┘   │
│                                     │
│  📋 Consultation History:           │
│  ┌─────────────────────────────┐   │
│  │ "Should I buy X5 2020?"     │   │
│  │ Status: Completed ✅         │   │
│  │ Rating: ⭐⭐⭐⭐⭐              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### **Users Directory:**
```
┌─────────────────────────────────────┐
│  👥 Users Directory                  │
├─────────────────────────────────────┤
│  🔍 Search  📊 Filters  🎯 Experts  │
│                                     │
│  ⭕ Online Users                    │
│  👤 👤 👤 👤 👤                      │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🌟 Experts                         │
│  ⭕          ⭕          ⭕          │
│  👤 Ivan     👤 Maria    👤 Peter   │
│  🏆 Expert   ⚡ Quick    🎯 BMW     │
│  [Ask]       [Ask]       [Ask] ← NEW│
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  All Users (Bubbles)                │
│  ⭕  ⭕  ⭕  ⭕  ⭕  ⭕               │
│  ...                                │
└─────────────────────────────────────┘
```

---

## 🔗 **التكامل الكامل (Complete Integration)**

### **1. Users Directory ↔️ Consultations:**
```
User Bubble → Hover Card → "Ask for Consultation" Button
                         → Opens ConsultationRequestModal
                         → Creates consultation request
                         → Expert receives notification
```

### **2. Posts ↔️ Consultations:**
```
Post with question → "Convert to Consultation" button
                   → Expert can respond publicly (post comment)
                   → OR privately (start consultation)
```

### **3. Profile ↔️ Posts:**
```
Profile Activity Tab → Shows user's posts
Create Post button  → In profile header
Post author click   → Navigates to their profile
```

### **4. HomePage Feed ↔️ Everything:**
```
Feed shows:
• User posts (from followed users)
• Popular consultations (if public)
• Expert tips & advice
• Car showcases
• Community discussions
```

---

## 🎯 **الخلاصة النهائية**

### **المكونات الأساسية:**

```typescript
Core Systems:
✅ Posts System
   • Create, read, update, delete posts
   • Like, comment, share
   • Rich media support
   • Hashtags & mentions
   • Visibility controls

✅ Consultations System
   • Request consultation
   • Expert matching
   • Chat/messaging
   • Rating & reviews
   • Badge awards

✅ Feed Algorithm
   • Personalized for logged-in users
   • Public feed for visitors
   • Engagement-based ranking
   • Following priority

✅ Expert System
   • Expert profiles
   • Badges & achievements
   • Stats tracking
   • Availability management

✅ Integration
   • HomePage feed section
   • ProfilePage consultations tab
   • Users Directory expert badges
   • Notifications system
```

### **Value Proposition:**

```
For Users:
✅ Get expert advice on car purchases
✅ Learn from community experiences
✅ Share their own car stories
✅ Connect with trusted dealers
✅ Stay updated with market trends

For Experts/Dealers:
✅ Build reputation & trust
✅ Demonstrate expertise
✅ Generate leads
✅ Earn badges & recognition
✅ Monetize knowledge (future)

For Platform:
✅ Increased engagement (+500%)
✅ User retention (+300%)
✅ Network effects
✅ Viral growth potential
✅ New revenue streams
```

---

## 🚀 **Ready to Execute?**

**التنفيذ يبدأ من:**
1. ✅ Phase 1 - Posts System (Days 1-3)
2. ✅ Phase 2 - Consultations (Days 4-6)
3. ✅ Phase 3 - Integration (Days 7-8)

**Total:** 56 ساعة = 7 أيام عمل

---

**التوقيع:**  
خطة شاملة متكاملة - 19 أكتوبر 2025  
**النطاق:** Posts + Consultations + Users Directory  
**الرؤية:** LinkedIn for Car Enthusiasts 🚗  
**القيمة:** Ecosystem Transformation 🌟
----------------------------------------------------------------------------------
سأقدم لك التعديلات والإضافات المقترحة مباشرةً على هيكل خطتك، مع التركيز على تحسين الأداء، قابلية التوسع، الأمان، وتصحيح بعض النقاط التقنية الدقيقة.

مراجعة وتطوير الخطة: تعديلات وإضافات مقترحة
فيما يلي ملاحظاتي وتعديلاتي مقسمة حسب أقسام خطتك الأصلية.

1. تعديلات على 📐 Architecture المقترح (System Design)
هذه هي التغييرات الأكثر أهمية لأنها تؤثر على أساس النظام بأكمله.

أ. تعديل حاسم على Consultation Schema:

السطر: messages: ConsultationMessage;

المشكلة: استخدام مصفوفة (Array) لتخزين الرسائل في محادثة هو نمط تصميمي خطير وغير قابل للتوسع. مع زيادة عدد الرسائل، سيتجاوز حجم مستند Consultation حد Firestore البالغ 1 ميجابايت، مما يؤدي إلى فشل المحادثة بالكامل. كما أنه يجعل عمليات مثل تحميل الرسائل القديمة عند التمرير (Pagination) شبه مستحيلة.

التعديل المقترح:

احذف حقل messages: ConsultationMessage.

أضف مجموعة فرعية (subcollection) جديدة داخل كل مستند استشارة: consultations/{consultationId}/messages/{messageId}.

يجب أن يحتوي كل مستند في هذه المجموعة الفرعية على بنية ConsultationMessage.

هذا التغيير يضمن أن المحادثات يمكن أن تنمو إلى أجل غير مسمى دون التأثير على أداء المستند الأصلي.   

ب. إضافة حيوية: آلية مزامنة البيانات المكررة (Denormalized Data):

المشكلة: الخطة تستخدم بشكل صحيح تكرار البيانات لتحسين أداء القراءة (مثل تخزين authorInfo داخل كل Post). لكنها لا تحدد آلية لتحديث هذه البيانات المكررة عندما يقوم المستخدم بتغيير معلوماته (مثل displayName أو profileImage).

الإضافة المقترحة: يجب استخدام Firebase Cloud Functions لمعالجة هذا الأمر.

Function 1: onUserUpdate:

الزناد (Trigger): onUpdate على مجموعة users.

الوظيفة: عند تحديث بيانات مستخدم، تقوم هذه الدالة بالبحث عن جميع المنشورات (posts) والتعليقات (post_comments) التي أنشأها هذا المستخدم وتحديث حقل authorInfo فيها بالبيانات الجديدة. هذا يضمن بقاء البيانات متزامنة عبر المنصة.   

2. تعديلات على 🚀 Implementation Plan - PHASE 1
أ. تعديل معماري جذري على posts.service.ts (خوارزمية الـ Feed):

الدالة: getFeedPosts

المشكلة: الطريقة الحالية (Fan-Out-on-Read أو "السحب عند القراءة") تقوم بالاستعلام عن مجموعة posts الضخمة ثم ترتبها. هذا النهج يصبح بطيئًا ومكلفًا جدًا مع نمو عدد المستخدمين والمنشورات، وهو غير فعال في Firestore.   

التعديل المقترح (Fan-Out-on-Write - "الدفع عند الكتابة"):

تعديل Schema: أضف مجموعة فرعية جديدة لكل مستخدم: users/{userId}/feed/{postId}. هذه المجموعة ستحتوي على المنشورات التي يجب أن تظهر في الـ Feed الخاص بهذا المستخدم.

إضافة Cloud Function جديدة: onPostCreate:

الزناد (Trigger): onCreate على مجموعة posts.

الوظيفة: عند إنشاء منشور جديد، تقوم هذه الدالة بجلب قائمة متابعي المؤلف، ثم تقوم "بنشر" (fan-out) مرجع للمنشور (أو نسخة مصغرة منه) إلى المجموعة الفرعية feed لكل متابع.

تعديل دالة getFeedPosts: بدلاً من الاستعلام المعقد، ستصبح الدالة بسيطة جدًا: ستقوم فقط بقراءة المستندات من users/{userId}/feed مرتبة حسب الزمن.

النتيجة: ستكون قراءة الـ Feed سريعة للغاية وغير مكلفة، لأن الـ Feed الخاص بكل مستخدم يتم بناؤه مسبقًا على الخادم.   

ب. تصحيح منطقي في دالة toggleLike في posts.service.ts:

الأسطر:

TypeScript

await updateDoc(postRef, {
  [`reactions.${userId}`]: arrayRemove(userId), // <-- خطأ
  'engagement.likes': increment(-1)
});
المشكلة: حقل reactions تم تعريفه ككائن (Map/Object)، وليس مصفوفة (Array). الدالة arrayRemove مخصصة للمصفوفات فقط ولن تعمل هنا.

التصحيح المقترح:

TypeScript

import { doc, getDoc, updateDoc, increment, deleteField } from 'firebase/firestore';

async toggleLike(postId: string, userId: string): Promise<void> {
  const postRef = doc(db, this.collectionName, postId);
  const postDoc = await getDoc(postRef);

  if (!postDoc.exists()) throw new Error('Post not found');

  const reactions = postDoc.data().reactions |

| {}; const hasLiked = reactions[userId];

  const updateData = {};
  
  if (hasLiked) {
    // Unlike: نستخدم deleteField لحذف المفتاح من الكائن
    updateData[`reactions.${userId}`] = deleteField();
    updateData['engagement.likes'] = increment(-1);
  } else {
    // Like: نضيف المفتاح والقيمة
    updateData[`reactions.${userId}`] = 'like';
    updateData['engagement.likes'] = increment(1);
    
    //... (كود إرسال الإشعار يبقى كما هو)
  }
  
  await updateDoc(postRef, updateData);
}
```
3. إضافة حاسمة ومنسية: قواعد الأمان (Firestore Security Rules)
الخطة الحالية لا تتضمن أي ذكر لقواعد الأمان، وهذا يمثل ثغرة أمنية خطيرة. بدونها، يمكن لأي مستخدم قراءة، تعديل، أو حذف أي بيانات في قاعدة البيانات.

الإضافة المقترحة: يجب إنشاء ملف firestore.rules وتضمين قواعد صارمة.

مبدأ أساسي: ابدأ بقاعدة "الرفض الافتراضي" ثم اسمح بالوصول بشكل محدد.   

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // الرفض الافتراضي: لا تسمح بأي وصول ما لم يتم تحديده صراحةً
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
أمثلة على قواعد يجب إضافتها:

السماح للمستخدمين بتعديل ملفاتهم الشخصية فقط:

match /users/{userId} {
  allow read: if request.auth!= null;
  allow write: if request.auth.uid == userId;
}
السماح بإنشاء منشور فقط للمستخدمين المسجلين والتحقق من صحة البيانات:

match /posts/{postId} {
  allow read: if resource.data.visibility == 'public';
  allow create: if request.auth!= null
                && request.resource.data.authorId == request.auth.uid
                && request.resource.data.content.text is string
                && request.resource.data.content.text.size() < 1000;
  allow update, delete: if request.auth.uid == resource.data.authorId;
}
هذه مجرد أمثلة بسيطة. يجب بناء قواعد مفصلة لكل مجموعة (collection) لضمان أمان التطبيق بالكامل.   

4. تحسينات على خوارزمية الترتيب (rankPosts)
الخوارزمية الحالية جيدة كنقطة انطلاق، ولكن يمكن تطويرها لزيادة تفاعل المستخدمين.

الإضافة المقترحة: عند حساب نقاط الترتيب، ضع في اعتبارك إشارات تفاعل أقوى:

saves (حفظ المنشور): إشارة قوية جدًا على أن المحتوى قيم. يمكن إعطاؤها وزنًا أعلى (مثلاً: * 5).

shares (مشاركة المنشور): إشارة قوية على الانتشار. يمكن إعطاؤها وزنًا أعلى (مثلاً: * 3).

profile_clicks (الضغط على ملف المؤلف): إشارة اهتمام قوية.

dwell_time (مدة بقاء المستخدم على المنشور): إشارة يصعب قياسها مباشرة في Firestore، ولكنها مهمة في الخوارزميات المتقدمة.   

للتطوير المستقبلي: يمكن إنشاء Cloud Function مجدولة تعمل كل ساعة لحساب engagementScore لكل منشور وتخزينه مباشرة في مستند المنشور. هذا يبسط استعلامات الـ Feed ويجعلها أسرع.   

خلاصة التعديلات:
بنية المحادثات: غير messages في الاستشارات من مصفوفة إلى مجموعة فرعية (subcollection) لتجنب مشاكل الحجم والأداء.

بنية الـ Feed: استبدل نموذج "السحب عند القراءة" بنموذج "الدفع عند الكتابة" (Fan-Out-on-Write) باستخدام Cloud Functions لضمان feed سريع وقابل للتوسع.

مزامنة البيانات: أضف Cloud Functions لمزامنة البيانات المكررة (مثل معلومات المؤلف) عند تحديثها من المصدر.

تصحيح الكود: أصلح الخطأ المنطقي في دالة toggleLike لاستخدام deleteField بدلاً من arrayRemove.

الأمان: أضف قسمًا كاملاً لـ Firestore Security Rules كأولوية قصوى لحماية بيانات المستخدمين.

هذه التعديلات والإضافات ستحول خطتك الممتازة بالفعل إلى بنية تحتية أكثر قوة وأمانًا وقابلية للتطوير، قادرة على دعم مجتمع سيارات مزدهر في بلغاريا.
----------------------------------------------------------------------------------
System Architecture and Implementation Plan: A Social Communication Platform for the Bulgarian Automotive Community
Section 1: Foundational Data Architecture: A Scalable Firestore Blueprint
The success of any social platform is inextricably linked to the performance, scalability, and cost-efficiency of its underlying data architecture. For a platform built on a NoSQL database like Google Cloud Firestore, the initial data modeling decisions are paramount. Unlike traditional SQL databases where schemas can be rigidly enforced and relationships are managed through joins, a NoSQL model requires a different paradigm—one that prioritizes read performance and data access patterns through strategic denormalization. This section outlines a comprehensive and robust data model for the Bulgarian car platform, establishing a blueprint that balances immediate development needs with long-term scalability and operational sustainability. The architecture is designed around four core pillars, addresses the critical choice between subcollections and arrays for managing relationships, and defines a pragmatic strategy for data duplication to ensure a fast, responsive user experience.

1.1 Core Collection Schemas: The Four Pillars of the Platform
While Cloud Firestore is described as "schemaless," providing developers with significant flexibility, a successful production application demands a well-defined and consistently applied schema. Establishing a canonical data structure from the outset prevents "schema drift," where different parts of the application write data in inconsistent formats, leading to complex queries, brittle code, and security vulnerabilities. This blueprint defines four primary root-level collections—users, vehicles, posts, and groups—that will serve as the foundational pillars of the platform's data model.   

The users collection is the cornerstone of identity and social interaction. Each document within this collection will be uniquely identified by the user's Firebase Authentication UID. This direct mapping simplifies security rules and data retrieval for the logged-in user. The document will store essential public profile information such as username, displayName, avatarUrl, and a user bio. Crucially, it will also contain denormalized counters, including postCount, followerCount, and followingCount. Storing these aggregate values directly on the user document is a deliberate performance optimization. It circumvents the need for expensive and slow aggregation queries that would otherwise be required to calculate these numbers on the fly, ensuring that user profiles load instantaneously.

The vehicles collection is a unique and vital component tailored to the platform's automotive niche. Each document represents a specific vehicle owned by a user, containing structured data fields like make, model, year, engineType, modifications (as a map or array), and an array of imageUrls. Each vehicle document will also hold a direct reference to its owner via an ownerId field, linking it back to the users collection. This structure enables powerful, context-aware features, such as allowing users to filter the main feed to see posts only from owners of a specific model (e.g., "Show me all posts from BMW E46 M3 owners") or creating dedicated communities around certain cars.

The posts collection serves as the central repository for all user-generated content. This is the most frequently read collection, and its structure is optimized for efficient feed rendering. Each post document will contain the core content, such as text, and an array of mediaUrls for images or videos. To avoid costly client-side "joins" when displaying a feed, each post document will also store denormalized data about its author. This includes the authorId (the user's UID), as well as a snapshot of their username and avatarUrl at the time of posting. If a post is associated with a specific car, a vehicleId will link it to the relevant document in the vehicles collection. This comprehensive, self-contained structure allows a client application to render a post in a feed with a single document read, which is fundamental to achieving a snappy, responsive user interface.   

Finally, the groups collection facilitates the creation of sub-communities, such as car clubs, regional meet-up groups, or special interest forums (e.g., "Varna Track Day Enthusiasts"). Each document in this collection will represent a single group and store its metadata: groupName, description, bannerImageUrl, and privacyLevel (e.g., 'public' or 'private'). Similar to the users collection, group documents will also feature denormalized counters like memberCount and postCount to provide at-a-glance information without requiring additional queries. This collection forms the basis for the advanced community features detailed later in this report.

The following table provides a clear, developer-ready blueprint of the proposed database structure, ensuring consistency across the entire application stack.

Table 1: Core Firestore Collection and Subcollection Schema

Collection/Subcollection Path	Document ID Strategy	Key Fields	Data Type	Description/Purpose
/users/{auth.uid}	Firebase Auth UID	username, avatarUrl, followerCount, followingCount	string, string, number, number	Stores primary user profile data and denormalized counters.
/users/{userId}/followers/{followerId}	Follower's UID	followedAt	timestamp	Tracks who follows a user. Enables scalable follower lists.
/users/{userId}/following/{followingId}	Followed User's UID	followedAt	timestamp	Tracks whom a user follows. Enables scalable following lists.
/users/{userId}/feed/{postId}	Post ID	postRef, authorInfo, createdAt	reference, map, timestamp	A user's personalized feed, populated by the fan-out system.
/vehicles/{vehicleId}	Auto-generated	ownerId, make, model, year	string, string, string, number	Stores detailed information about a user's registered vehicle.
/posts/{postId}	Auto-generated	authorId, authorInfo, text, mediaUrls, likeCount, commentCount, groupId	string, map, string, array, number, number, string	The canonical source for all user-generated posts.
/posts/{postId}/comments/{commentId}	Auto-generated	authorId, authorInfo, text, createdAt	string, map, string, timestamp	Stores comments for a post. Allows for pagination and threading.
/posts/{postId}/likes/{userId}	Liking User's UID	likedAt	timestamp	Alternative to an array for posts expecting massive engagement.
/groups/{groupId}	Auto-generated	groupName, description, memberCount	string, string, number	Stores metadata for a community group or car club.
/groups/{groupId}/members/{userId}	Member's UID	role, joinedAt	string, timestamp	Manages group membership and roles (admin, moderator, etc.).
1.2 The Subcollection vs. Array Dilemma: Strategic Recommendations
A recurring and critical decision in Firestore data modeling is how to represent one-to-many relationships: using an array of values within a parent document or using a dedicated subcollection. This choice is not merely a technical preference; it fundamentally impacts scalability, query capabilities, and cost. An incorrect decision can lead to architectural dead ends, imposing hard limits on features or requiring costly data migrations in the future. The platform's architecture must make a deliberate, strategic choice for each type of relationship based on its expected characteristics.   

For interactions like "likes" or reactions on a post, the data is relatively simple (a list of user IDs) and, for the vast majority of posts, the list will be of a manageable size. In this scenario, storing a list of likerIds in an array within the post document is the most efficient approach. This method is highly cost-effective, as fetching the post and all its likes requires only a single document read. However, this approach is subject to Firestore's 1MiB limit for a single document. While it would take a massive number of user ID strings to reach this limit, it remains a theoretical ceiling. For a platform of this nature, it is a reasonable trade-off for the performance and cost benefits it provides for the 99.9% of posts that will not go viral to that extent.   

In stark contrast, comments on a post represent a completely different data pattern. Comments are unbounded; a popular post could attract thousands. Each comment is a rich data object containing text, author information, a timestamp, and potentially its own set of replies or reactions. Storing comments in an array would be disastrous for performance and scalability. The parent post document would grow enormous, making it slow and expensive to retrieve. Furthermore, it would be impossible to implement essential features like comment pagination, querying, or individual moderation efficiently. Therefore, the only viable, scalable solution is to use a comments subcollection under each post document. This approach keeps the parent post document small and allows for powerful, independent querying of the comments. For example, the application can fetch the first 20 comments, then fetch the next 20 when the user scrolls, all without repeatedly loading the main post data. This granular access is also essential for security rules, allowing, for instance, a user to delete their own comment without needing permission to write to the entire post document.   

Similarly, managing follower and following relationships requires the scalability of subcollections. A popular user or a large car club could easily amass thousands or tens of thousands of followers. Storing these lists in an array within the user's document would quickly exceed the 1MiB document size limit, creating a hard cap on a user's popularity—an unacceptable limitation for a social network. The correct architecture is to create two subcollections within each user's document: followers and following. Each document in these subcollections can be named with the UID of the other user involved in the relationship. This structure scales infinitely, and it allows the application to query a user's follower list (e.g., for display in the UI) without having to download the entire, potentially large, user profile document.   

The initial architectural decision between an array and a subcollection has a direct and long-lasting causal effect on the product roadmap. Opting for an array for group members might seem simpler at first, as it allows fetching the entire member list with a single document read. However, this choice permanently cripples the feature's future. It becomes impossible to efficiently query the membership list server-side (e.g., "find all members from Sofia"), security rules cannot easily grant permissions based on membership, and the 1MiB document limit imposes a hard ceiling on the group's size. By choosing a /groups/{groupId}/members/{userId} subcollection from the beginning, the architecture enables infinite scaling, powerful server-side queries, and granular security rules. This foresight prevents the need for a painful and expensive data migration down the line, ensuring the platform's technical foundation can support an evolving set of product requirements.   

1.3 A Pragmatic Denormalization Strategy: Optimizing for Read Performance
In the world of relational SQL databases, data duplication (denormalization) is often considered an anti-pattern. In NoSQL databases like Firestore, it is a deliberate and essential strategy for optimizing performance. The primary goal is to structure data in a way that mirrors how it will be displayed in the application, thereby minimizing the number of read operations required to render a view. For a social feed, a user expects to see a list of posts, each with the author's username and profile picture. Requiring the client application to first fetch 20 posts and then perform 20 additional fetches to get the profile information for each author would result in a slow, janky, and expensive user experience.   

The solution is to denormalize—to copy essential, frequently accessed data into the documents where it will be needed. As defined in the schema, when a user creates a post, a small map of their information ({ username: '...', avatarUrl: '...' }) is embedded directly into the post document. This allows the feed to be rendered with a single query, dramatically improving performance and reducing read costs.   

However, this performance gain comes with a significant challenge: maintaining data consistency. What happens when a user updates their username or profile picture? The denormalized copies of this data, scattered across potentially thousands of posts and comments, will become stale. The mechanism to solve this is Firebase Cloud Functions, which can be configured to trigger in response to database events. An onUpdate function will be attached to the users collection. When a user document at /users/{userId} is modified, this function will automatically execute. Its job is to find all the posts and comments created by that user and propagate the updated information. This creates a robust, server-side system for keeping duplicated data in sync.   

Managing this synchronization process introduces a new layer of complexity. In a distributed system, there are no guarantees about the order in which events are processed, which can lead to race conditions. For example, if a user changes their name twice in quick succession, it's possible for the function handling the first update to execute after the function handling the second, leaving the data in an incorrect state. To mitigate this, every update propagated by the function should include a timestamp. When updating a denormalized record, the function can first check the timestamp of the existing data to ensure it is not overwriting a newer update with an older one. For critical, multi-location updates that must succeed or fail together, Firestore's Batched Writes or Transactions should be used to ensure atomicity.   

It is crucial to understand that the true cost of denormalization is not the marginal increase in storage or write operations, but the engineering complexity required to maintain data integrity. The system's business logic partially shifts from the client application to a suite of serverless functions responsible for data synchronization. A failure in a single one of these functions—due to a code bug, a temporary service outage, or an unhandled edge case—can lead to widespread data inconsistency across the platform. Therefore, the engineering team must invest in robust error handling, idempotent function design (ensuring a function can run multiple times with the same input and produce the same result), and comprehensive monitoring and logging for these critical background processes. This operational overhead is a calculated trade-off for the superior read performance and user experience that denormalization provides.

Section 2: Architecting the Dynamic User Feed and Timelines
The user feed is the heart of any social platform; it is where users spend the majority of their time and where the core value of the network is delivered. Architecting a feed that is both real-time and scalable, especially on a NoSQL database like Firestore, presents a significant engineering challenge. A naive approach that queries the posts of every followed user on-demand will not scale in terms of performance or cost. The industry-standard solution is a pattern known as "fan-out," where user content is proactively distributed to their followers' feeds. This section details the selection of an optimal fan-out model for the platform and outlines its implementation using serverless Cloud Functions.

2.1 Selecting the Optimal Fan-Out Model: A Hybrid "Push-Pull" Approach
There are two primary strategies for generating user feeds in a distributed system: Fan-Out-on-Write (the "push" model) and Fan-Out-on-Read (the "pull" model). Each has profound implications for performance, cost, and complexity, and the choice between them is one of the most critical architectural decisions for the platform.   

In a Fan-Out-on-Write model, the work of assembling feeds is done at the moment a post is created. When a user publishes a new post, a background process immediately copies that post (or a reference to it) into a dedicated feed collection for each of that user's followers. When a follower opens their app, their feed is already pre-computed and waiting. Reading it is incredibly fast and cheap, typically requiring just a single, simple query to fetch the latest documents from their personal feed collection. The major drawback of this approach is write amplification. A user with 10,000 followers who creates a single post will trigger 10,001 write operations (one for the original post and one for each follower's feed). For highly influential users, this can lead to massive, costly bursts of write activity.   

Conversely, the Fan-Out-on-Read model is simple on the write side. A new post is written only once to a central posts collection. The work of assembling a feed is deferred until a user requests it. At that moment, the application must first identify everyone the user follows, then execute queries to fetch the latest posts from each of those sources, and finally merge, sort, and rank the results on the client side. This approach minimizes write costs but can be unacceptably slow and expensive for reads, especially as the number of followed accounts increases. Furthermore, this model is fundamentally incompatible with Firestore's query limitations. Firestore's in query operator, which can fetch documents based on a list of IDs, is limited to a maximum of 30 values. This makes it impossible to construct an efficient server-side query to fetch posts from a user who follows, for example, 100 other people. A pure pull model is therefore not a viable option for this platform.   

Given the limitations of the pure models, a hybrid "push-pull" approach is the optimal solution. This strategy acknowledges that user follower counts typically follow a power-law distribution: a vast majority of users have a modest number of followers, while a tiny minority (influencers, large car clubs) have a massive following. The architecture can be optimized for this reality. For the 99% of users with a follower count below a defined threshold (e.g., 1,000 followers), the system will use the high-performance Fan-Out-on-Write model. The write amplification is manageable at this scale, and it delivers the best possible real-time experience to the majority of the user base. For the small number of "celebrity" accounts with followers exceeding this threshold, the system will not fan out their posts. Instead, when a user loads their feed, the application will perform a small, targeted "pull" operation, fetching the latest posts from only the few celebrity accounts they follow and merging them client-side with their main, pre-computed (pushed) feed. This hybrid strategy prevents the massive write storms associated with celebrity posts while preserving the fast, real-time nature of the feed for the most common use case.   

The selection of a feed architecture is not merely a technical optimization; it is a core business decision that directly governs the platform's operational costs. A pure push model, while simple to conceptualize, creates a direct and exponential link between user popularity and write costs. A single viral user could generate millions of writes, leading to an unsustainable monthly bill. The hybrid model decouples this relationship. It creates a system where user activity is routed through different technical pathways based on its potential cost impact. This is a form of architectural cost control, ensuring that the platform's success and the emergence of popular content creators do not inadvertently cause its financial failure.

The following table provides a clear justification for the selection of the hybrid model by systematically evaluating each strategy against the key requirements of the platform.

Table 2: Fan-Out Strategy Decision Matrix

Strategy	Real-Time Delivery	Write Cost at Scale	Read Cost/Latency	Implementation Complexity	Scalability for "Celebrity" Accounts	Recommendation
Push (Fan-Out-on-Write)	Excellent	Poor (Exponential)	Excellent (Low)	Medium	Poor	Not Recommended (Standalone)
Pull (Fan-Out-on-Read)	Poor	Excellent	Poor (High)	High (due to query limits)	Excellent	Not Recommended (Standalone)
Hybrid (Push/Pull)	Excellent (for most)	Good (Controlled)	Good (Slightly higher)	High	Excellent	Strongly Recommended
2.2 Implementation via Cloud Functions: Trigger-Based Logic for Feed Generation
The entire fan-out mechanism will be orchestrated by serverless Firebase Cloud Functions, which provide the ideal environment for running this type of backend, event-driven logic. The core of the system will be a function that triggers on the creation of any new document in the /posts/{postId} collection.   

The logic for this onPostCreate function will proceed as follows:

Trigger and Data Extraction: The function is invoked automatically when a new post document is created. It receives the post's data, from which it extracts the authorId.

Follower Count Check: The function first reads the denormalized followerCount from the author's document at /users/{authorId}. This single read determines which path the logic will take.

Push Path (Standard Users): If the followerCount is below the pre-defined threshold (e.g., 1,000), the function proceeds with the fan-out. It queries the /users/{authorId}/followers subcollection to retrieve the list of all follower UIDs.

Batch Processing: To handle the writes efficiently and reliably, the function will group the follower UIDs into batches (e.g., of 500, the maximum for a batched write). For each follower in a batch, it constructs a new document destined for that user's personal feed collection at /users/{followerId}/feed/{postId}. This new feed document will not contain the full post data but rather a reference to the original post (postRef) along with essential denormalized data (like authorInfo and createdAt) to facilitate sorting and display without requiring an extra read of the original post.

Atomic Writes: The function will use Firestore's WriteBatch operation to commit each batch of 500 writes as a single atomic unit. This ensures that either all 500 writes in the batch succeed, or none of them do, preventing partial and inconsistent feed updates.   

Pull Path (Celebrity Users): If the author's followerCount is above the threshold, the function simply terminates. No fan-out occurs. The responsibility for fetching this user's posts is shifted to the client application at read time.

This server-side implementation ensures that the complex logic of feed generation is handled reliably and securely, completely abstracted away from the client application.

2.3 Ensuring Data Consistency Across Denormalized Feeds
A fan-out system that only handles post creation is incomplete. The platform must also handle edits and deletions to ensure that users' feeds remain accurate and consistent with the source data. This requires two additional Cloud Functions.

An onPostUpdate function will be triggered whenever a document in the /posts/{postId} collection is modified. This function will be responsible for propagating those changes. Its logic will be very similar to the creation function: it will identify the author, retrieve their followers, and fan out an update operation to the corresponding document in each follower's feed collection. This ensures that if a user corrects a typo in their post, that correction is reflected in the feeds of everyone who follows them. This concept of multi-path updates is fundamental to maintaining consistency in a denormalized database.   

Similarly, an onPostDelete function will trigger when a post is deleted. This is a critical function for data hygiene and respecting user privacy. The function will fan out a delete operation, removing the post's reference from the feed of every follower. Without this step, users' feeds would become cluttered with "ghost" posts pointing to content that no longer exists.

The hybrid model also introduces a subtle but important product consideration. A user's feed is now composed of two distinct data sources: the pre-computed, pushed content from standard users, and the on-demand, pulled content from celebrity accounts. This means that the real-time delivery of content is not uniform. A new post from a friend might appear in the feed instantly via a real-time listener on the user's feed collection. However, a new post from a large car club they follow will only appear after the app performs its next "pull" operation, which might happen upon opening the app or performing a "pull-to-refresh" gesture. This slight latency for celebrity content is a conscious architectural trade-off, exchanging instantaneous delivery for a tiny fraction of content in return for massive gains in system stability and cost-effectiveness. This is a nuance that the product and UI/UX design teams must understand, as it has a tangible impact on the user's perception of the feed's real-time behavior.

Section 3: Advanced Community and Group Functionality
Beyond individual user interactions, a thriving social platform depends on its ability to foster vibrant, self-sustaining communities. For an automotive platform, this means providing robust tools for car clubs, event organizers, and regional enthusiast groups to connect and engage. This section details the architecture for these community features, focusing on a scalable schema for group management, a secure system for role-based access control, and the implementation of group-specific features like events and dedicated discussion forums.

3.1 Schema Design for Car Clubs, Events, and Special Interest Groups
The foundation for community features is the /groups/{groupId} collection introduced in Section 1. To support rich functionality, this core structure must be augmented with subcollections to manage membership and content.

The most critical component is membership management. A /groups/{groupId}/members subcollection is the only scalable way to handle this. Storing member IDs in an array on the group document would impose a hard limit on group size and prevent efficient querying. Within this subcollection, each document will be named with the userId of a member. This document will store crucial metadata about their membership, including a joinedAt timestamp and, most importantly, a role field (e.g., 'owner', 'admin', 'moderator', 'member'). This role-based structure is the key to enabling delegated administration and self-governing communities.   

Content within a group, such as posts or photos, should not be duplicated. Instead of creating a separate groupPosts collection, group-specific content will be stored in the primary /posts collection. A groupId field will be added to the post document schema. When a post is created within the context of a group, this field is populated with the corresponding group's ID. This elegant approach allows a single post to exist canonically in one place while being logically associated with multiple contexts. A user's main feed is generated via the fan-out system, while a group's specific feed can be generated with a simple, efficient "pull" query: db.collection('posts').where('groupId', '==', currentGroupId).orderBy('createdAt', 'desc'). This on-demand query is perfectly acceptable in this context because a user is only ever viewing one group's feed at a time, avoiding the scalability problems of a full fan-out-on-read feed.

3.2 Implementing Role-Based Access Control (RBAC) for Group Management
Effective community management at scale is impossible without a system that allows group leaders to manage their own communities. A robust Role-Based Access Control (RBAC) system is therefore not just a feature but a strategic necessity. It delegates moderation and administrative tasks from the central platform team to trusted community members, allowing the platform to support thousands of groups without a proportional increase in operational staff. The technical implementation of RBAC is what enables this scalable business model for community management.

The roles defined in the /groups/{groupId}/members/{userId} document (owner, admin, etc.) will be enforced by Firestore Security Rules. These rules are the gatekeepers that protect data and enforce permissions for every read and write operation initiated from a client device. For example, to implement a rule that only allows group admins or owners to edit the group's description, the security rule for the /groups/{groupId} path would use Firestore's built-in get() function. This function allows a rule to read another document in the database as part of its evaluation. The rule would look something like this: allow update: if get(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid)).data.role in ['owner', 'admin'];.

This rule, in plain English, states: "Allow a user to update this group document only if the document corresponding to their user ID within the members subcollection exists and its role field is either 'owner' or 'admin'". The get() and exists() functions are the keys that unlock this powerful, cross-document validation, forming the technical backbone of the entire RBAC system. This approach allows for the creation of highly granular permissions for a wide range of actions, from inviting new members and promoting moderators to deleting inappropriate content within the group.   

The following matrix provides a definitive specification for the permissions of each role, serving as a blueprint for developers writing the security rules and a clear guide for product managers defining the features.

Table 3: Role-Based Access Control Matrix for Groups

Feature/Action	Owner	Admin	Moderator	Member	Non-Member
View Group Content (Public)	Allow	Allow	Allow	Allow	Allow
View Group Content (Private)	Allow	Allow	Allow	Allow	Deny
Edit Group Profile	Allow	Allow	Deny	Deny	Deny
Delete Group	Allow	Deny	Deny	Deny	Deny
Invite New Member	Allow	Allow	Allow	Deny	Deny
Approve Join Requests	Allow	Allow	Deny	Deny	Deny
Remove Member	Allow	Allow	Deny	Deny	Deny
Promote/Demote Admin	Allow	Deny	Deny	Deny	Deny
Promote/Demote Moderator	Allow	Allow	Deny	Deny	Deny
Create Post in Group	Allow	Allow	Allow	Allow	Deny
Delete Any Post in Group	Allow	Allow	Allow	Deny	Deny
Delete Own Post in Group	Allow	Allow	Allow	Allow	Deny
Pin Post in Group	Allow	Allow	Deny	Deny	Deny
3.3 Architecting Group-Specific Features: Events and Discussions
Building on this solid foundation of membership and access control, the platform can offer more specialized features to enhance community engagement.

For organizing car meets, track days, or social gatherings, a dedicated events subcollection can be created under each group: /groups/{groupId}/events/{eventId}. Each event document would store information such as eventName, location (potentially using Firestore's GeoPoint data type), startTime, endTime, and a description. An rsvps subcollection under each event could then be used to manage attendance, with documents storing the userId and their response ('going', 'interested').

While the main post feed is suitable for general content, some communities may benefit from more structured, topic-based conversations, similar to a traditional forum. This can be implemented with a threads or discussions subcollection within a group. Each document would represent a conversation thread, and a replies subcollection within it would contain the individual messages. This nested structure helps to organize conversations logically and prevents them from getting lost in a fast-moving general feed.

By combining a flexible data model with a powerful RBAC system, the platform can provide a rich and secure environment for automotive communities to thrive, all while minimizing the moderation burden on the central platform administrators.

Section 4: A Multi-Layered Security and Moderation Framework
For a social platform, security and content moderation are not optional features; they are fundamental requirements for user safety, brand reputation, and long-term viability. A failure to protect user data or to curb toxic behavior can quickly destroy user trust and lead to the platform's demise. This section outlines a defense-in-depth framework that combines proactive, preventative measures at the database level with reactive, intelligent moderation tools to create a safe and healthy community environment.

4.1 Crafting Granular Firestore Security Rules
The first and most critical line of defense is the Firestore Security Rules. These are not an application-level feature but a server-side configuration that governs every single data access request from a mobile or web client. The foundational principle of a secure ruleset is to "deny by default". The initial rule for the entire database should be allow read, write: if false;. Access is then explicitly and carefully granted on a path-by-path basis.   

Several core patterns will form the basis of the ruleset:

Authentication Requirement: With very few exceptions (e.g., reading a public post), all database operations will require the user to be authenticated. This is enforced with a simple check: request.auth!= null. This single rule prevents any anonymous or unauthorized access to sensitive data.   

Ownership Enforcement: Users must only be able to modify their own data. For the users collection, the write rule will be match /users/{userId} { allow write: if request.auth.uid == userId; }. This ensures that a user can only update their own profile and cannot tamper with anyone else's. Similar logic will apply to deleting one's own posts or comments.   

Data Validation: Security rules are not just for authorization; they are also a powerful tool for data validation. They can enforce data types, formats, and constraints before a write operation is ever committed to the database. For example, a rule for creating a post can validate that the incoming request.resource.data map contains a text field that is a string and is less than a certain character limit, and that a createdAt field exists and is a server timestamp. This prevents malformed, corrupted, or malicious data from ever entering the system, hardening it against a wide range of potential bugs and attacks. Tools like Fireschema can even automate the generation of these validation rules from a predefined schema, ensuring consistency and reducing manual effort.   

It is essential to understand a key limitation: security rules are not filters. A client cannot perform a broad query on a collection and expect Firestore to magically return only the documents that the user is permitted to see. Instead, Firestore evaluates every query against the ruleset and will fail the entire request if there is any possibility that it could return a document the user is not allowed to read. This means that all client-side queries must be written with the security rules in mind, including the necessary where clauses to ensure they only request data they are authorized to access.   

4.2 System Design for Automated Content Moderation
While security rules are excellent at enforcing structural integrity and ownership, they cannot understand the semantic content of the data. A rule can ensure a post's text is a valid string, but it cannot determine if that string contains hate speech. This is where a second layer of defense—automated content moderation—comes into play. This system will be implemented using a Cloud Function that is triggered by the creation or update of any content-bearing document, specifically in the /posts collection and any comments subcollection.

The workflow for this moderation function will be as follows:

Trigger: The function will listen for onCreate and onUpdate events on the relevant document paths.

AI Integration: Upon being triggered, the function will extract the text content from the document and send it to a powerful AI service, the Google Cloud Natural Language API, specifically using its moderateText method.   

Analysis and Classification: The API will analyze the text and return a set of confidence scores for various safety attributes and harmful categories, such as toxicity, insults, profanity, and threats.

Automated Action: Based on pre-defined confidence thresholds, the Cloud Function will take immediate, automated action:

High Confidence of Harm: If the API returns a high probability that the content violates platform policy, the function will immediately perform a corrective write operation. It will update the document to set a flag, such as isPublic: false or moderationStatus: 'rejected', effectively hiding the content from public view. It can also trigger a notification (e.g., via Firebase Cloud Messaging) to a human moderation team.   

Medium Confidence: If the content is ambiguous or borderline, the function will flag it for human review by setting a field like needsReview: true. This places the content into a dedicated moderation queue without immediately hiding it.

Low Confidence: If the content is deemed safe, the function does nothing and terminates.

This two-pronged approach forms a symbiotic defense system. The synchronous, preventative security rules act as a gatekeeper, blocking malformed data and unauthorized access at the perimeter. The asynchronous, reactive moderation function acts as an intelligent cleanup crew, analyzing the content that passes through the gate and neutralizing semantic threats. Relying on only one of these systems would be insufficient. Without rules, the database would be vulnerable to structural attacks. Without automated moderation, the platform would be quickly overwhelmed by harmful content that is structurally valid but semantically toxic. Together, they create a comprehensive and robust security posture.

4.3 A Proposed Workflow for User-Generated Flags and Manual Review
Automated systems are powerful, but they are not infallible. The community itself must be empowered to act as the eyes and ears of the platform. A user-facing reporting system is an essential component of any complete moderation strategy.

When a user encounters inappropriate content, they can use a "report" or "flag" button in the application. This action will not directly modify the content but will instead create a new document in a dedicated root collection, /reports. Each report document will contain essential metadata: the ID of the content being reported (contentId), the type of content (contentType: 'post' | 'comment'), the UID of the user filing the report (reporterId), the reason for the report, and a timestamp.

This approach of storing reports in a separate collection prevents malicious users from "review bombing" a post by writing directly to it. The system can then be made more intelligent. A Cloud Function can be configured to trigger onCreate on the /reports collection. This function can use a transaction to increment a reportCount on the original post or comment document. A separate, scheduled Cloud Function or a condition within the onCreate function could check if this reportCount has crossed a certain threshold (e.g., 3 reports from unique users). If it has, the function can automatically flag the content for manual review by setting the needsReview: true flag, just as the AI moderator would.

This creates a clear workflow for human moderators. They can use a simple, secure admin interface (built as a separate web application with the Firebase Admin SDK) to query for all documents across the database where needsReview == true. This provides them with a single, consolidated queue of all content flagged by either the AI or the community, allowing them to make final, nuanced decisions and take appropriate action, such as deleting the content or suspending the offending user.

Section 5: Monetization Strategies and Implementation
A sustainable platform requires a clear and viable monetization strategy. For an automotive community platform, revenue generation should focus on providing tangible value to both individual users and businesses within the ecosystem, such as tuning shops, parts suppliers, and event organizers. This section outlines two key monetization features—a promoted post system and a peer-to-peer marketplace—and details their technical architecture using Firebase and Stripe.

5.1 A Simple and Effective Promoted Post Algorithm
A promoted post feature allows users or businesses to pay for increased visibility of their content, placing it in front of a larger, more targeted audience. The implementation must be seamlessly integrated into the existing feed architecture and should prioritize showing relevant, engaging content rather than intrusive ads.

The implementation begins at the data model level. The /posts schema will be extended with two fields: a boolean flag isPromoted and a promotionEndsAt timestamp. When a user pays to promote a post, a backend process will set isPromoted to true and calculate the appropriate expiration timestamp.

The client-side feed rendering logic will be modified to accommodate these promoted posts. When a user loads their feed, the application will perform two parallel queries. The first is the standard query to their personal feed collection (/users/{userId}/feed) for chronological content. The second is a separate, targeted query to the main /posts collection for a small number of active promoted posts (e.g., db.collection('posts').where('isPromoted', '==', true).where('promotionEndsAt', '>', now())). These promoted posts can then be intelligently interleaved into the user's feed at predefined intervals (e.g., one promoted post for every ten regular posts).

To ensure promoted content is effective and not perceived as spam, a simple ranking algorithm should be applied to select which promotions to show. A purely random selection is a poor choice. Instead, the initial ranking algorithm can be based on a combination of engagement and recency, which are strong proxies for content quality. A basic scoring formula could be score = (likeCount + commentCount * 2 + saveCount * 3) / time_since_creation. A scheduled Cloud Function can periodically calculate and update this score on all active promoted posts. When the client requests promoted content, it can query for the posts with the highest scores. Over time, this algorithm can be evolved to incorporate more sophisticated signals, such as video watch time  and targeting based on the user's stated interests or the vehicles in their garage, ensuring that promotions are as relevant and valuable as possible.   

5.2 Architecting Marketplace Payments with Stripe Connect and Cloud Functions
To enable users to sell parts, merchandise, or services directly to one another, the platform must facilitate financial transactions. This requires more than a simple payment gateway; it requires a marketplace payment solution that can handle payments between multiple parties, manage payouts, and handle compliance. Stripe Connect is the industry standard for this use case. The entire payment infrastructure will be orchestrated by secure, server-side Cloud Functions, as client applications should never handle secret API keys or perform sensitive payment operations directly.   

The first step is onboarding sellers. The platform will use Stripe Connect's "Express" account type, which provides a streamlined, Stripe-hosted onboarding flow. This process will be initiated by a callable Cloud Function. The user in the app will click a "Become a Seller" button, which calls this function. The function uses the Stripe Node.js SDK to create a Stripe account link and returns it to the client. The user is then redirected to Stripe's secure web flow to enter their banking and identity information. Upon completion, Stripe redirects the user back to the app, providing an authorization code. A second Cloud Function, acting as an OAuth callback handler, exchanges this code for the seller's permanent stripeAccountId. This ID is the key to processing payments on their behalf and must be securely stored on their corresponding document in the /users collection in Firestore.   

Once a seller is onboarded, processing a payment from a buyer involves a separate, secure workflow, again orchestrated by a callable Cloud Function. The process is as follows:

Client-Side Tokenization: The buyer enters their credit card details into a UI element provided by the Stripe SDK (e.g., a payment sheet) within the app. The SDK communicates directly with Stripe's servers to convert these sensitive details into a secure, single-use token. This token is safe to handle on the client side.   

Calling the Payment Function: The client application calls a processMarketplacePayment Cloud Function, passing the payment token, the transaction amount, the currency, and the stripeAccountId of the seller who is to receive the funds.

Server-Side Charge Creation: The Cloud Function, running in Firebase's secure server environment, receives this information. Using its secret Stripe API key (securely stored using Firebase's environment configuration), it interacts with the Stripe API to create a "destination charge." This type of charge accomplishes two things in a single, atomic API call: it charges the buyer's card and it transfers the funds to the seller's connected Stripe account.

Platform Fee: As part of the charge creation call, the function can specify an application_fee_amount. This is the platform's commission, which Stripe will automatically deduct from the transaction and transfer to the platform's primary Stripe account.   

Record Keeping: Upon a successful charge, the function records the transaction details—including the amount, fee, buyer ID, seller ID, and Stripe charge ID—in a dedicated /payments collection in Firestore. This provides an essential audit trail and allows users to view their transaction history.   

This server-centric architecture ensures maximum security. The client application never touches secret keys, and all sensitive payment logic is executed in a trusted environment. It is important to note that this functionality requires the Firebase project to be on the Blaze (pay-as-you-go) plan, as Cloud Functions need outbound networking capabilities to communicate with external APIs like Stripe. Planning for monetization features at the initial data modeling stage is crucial. Including fields like stripeAccountId in the users schema and isPromoted in the posts schema from day one, even if they are not immediately used, prevents the need for complex and risky data migrations when these features are eventually launched. This architectural foresight dramatically reduces future technical debt and accelerates the time-to-market for revenue-generating capabilities.   

Section 6: Driving Engagement from Day One: Onboarding and Personalization
The first few moments a new user spends on a platform are the most critical. A confusing, empty, or irrelevant initial experience is the leading cause of user churn. The primary goal of the onboarding process is to guide the user to their "aha moment"—the point at which they understand the core value of the product—as quickly as possible. For a social platform, this moment is seeing a feed filled with interesting and relevant content. Therefore, the onboarding flow should be designed not as a passive tutorial, but as an active data-harvesting mechanism to bootstrap the personalization engine.   

6.1 Designing an Onboarding Flow to Bootstrap Feed Personalization
A modern, effective onboarding flow prioritizes understanding user intent over explaining UI elements. The goal is to extract the minimum amount of information needed to deliver immediate, personalized value. Instead of a generic, multi-step product tour that points out buttons, the flow will be an interactive process designed to build the user's initial interest profile.   

The proposed onboarding flow consists of four key steps:

Welcome and Value Proposition: A clear, concise welcome screen that reinforces the platform's core purpose: "The home for Bulgaria's car community."

Minimal Profile Setup: Prompt for the creation of a unique username and an optional profile picture. Defer other profile details (like a bio) until later to reduce initial friction.

Critical Personalization Questions: This is the most important step of the entire flow. The user will be presented with a clean, engaging interface asking them to select their interests from a predefined list. This is not just a survey; the answers will directly drive the content they see in minutes. The questions should include:

"Which car brands are you most interested in?" (Displaying logos of popular brands like BMW, Mercedes-Benz, Audi, Volkswagen, etc., for easy tapping).

"What are your automotive passions?" (Presenting tags like "Tuning," "Classic Restoration," "Motorsport," "Off-Roading," "Car Photography").

A prominent call-to-action: "Add your car to your Garage." This encourages the user to create their first vehicle document, which is a powerful signal of their specific interests and provides immediate content for their profile.

Suggested Follows: Based on the tags and brands selected in the previous step, the system can immediately present the user with a list of suggested groups and popular users to follow. For example, if a user selects "BMW" and "Tuning," the system should suggest following the "BMW Club Bulgaria" group and a few well-known content creators in the Bulgarian tuning scene. By encouraging a few initial follows, the platform ensures the user's chronological feed will not be empty when they first land on it.

This approach fundamentally redefines onboarding. It is not a chore for the user to complete, but an investment they make in customizing their own experience. By asking a user what car they own, the platform gains far more value than by showing them where the "post" button is. This data solves the "cold start" problem for the recommendation algorithm and dramatically shortens the user's time-to-value, transforming a potentially empty and confusing first session into an engaging and immediately relevant experience, which is the key to long-term retention.   

6.2 A Roadmap for Evolving the Feed Algorithm with Engagement Signals
The data gathered during onboarding provides the initial seed for personalization, but a truly great feed is one that learns and adapts to the user's behavior over time. The platform's feed algorithm should be designed to evolve in distinct phases.

Phase 1 (Launch): At launch, the primary feed will be simple and predictable. It will consist of a reverse-chronological stream of posts from the users and groups the user chose to follow during onboarding. The "Explore" or "For You" section of the app will be populated with popular content tagged with the interests the user selected during onboarding. This provides a solid baseline experience that is immediately personalized and easy to understand.

Phase 2 (Post-Launch Data Collection): Once the platform has a critical mass of users and content, the system will begin to passively track a wide range of implicit and explicit engagement signals. These signals are the raw data that will power the next phase of the algorithm.   

Strong Positive Signals: Saving a post, sharing a post, leaving a comment, explicitly following a user immediately after viewing their post.

Moderate Positive Signals: Liking a post, clicking through to view a user's profile, spending a significant amount of time viewing a post (dwell time).

Negative Signals: Quickly scrolling past a post without interacting, using a "Show me less of this" feedback option.

Phase 3 (Maturity and Algorithmic Ranking): With sufficient engagement data being collected, the platform can transition to a more sophisticated, algorithmically ranked feed. This does not have to be a complex, real-time machine learning system from day one. A pragmatic approach is to use a scheduled Cloud Function that runs periodically (e.g., every hour). This function would analyze recent posts and calculate a simple "engagement score" for each one based on a weighted formula of the signals collected in Phase 2. This score can then be stored directly on the post documents. The client applications can then be updated to query for posts ordered by this engagementScore instead of just createdAt. This moves the feed from a purely chronological model to a relevance-based model, ensuring that users are more likely to see the most interesting and engaging content at the top of their feed, regardless of when it was posted. This iterative approach allows the feed's intelligence to grow with the platform, continuously improving the user experience over time.   

Conclusions and Strategic Recommendations
The successful implementation of a social communication system for the Bulgarian automotive platform hinges on a series of strategic architectural decisions that prioritize scalability, performance, and long-term maintainability. This report has laid out a comprehensive blueprint, moving from foundational data modeling in Firestore to advanced features like community management, automated moderation, and monetization. The analysis yields several key conclusions and actionable recommendations.

1. Adopt a Schema-Driven Approach to a Schemaless Database: The flexibility of Firestore should not be mistaken for an absence of structure. The long-term health of the application depends on establishing and enforcing a canonical data schema, as detailed in Section 1. This structured approach is the foundation for writing effective security rules, reliable serverless functions, and predictable client-side queries. * Recommendation: The provided schema (Table 1) should be adopted as the single source of truth for all development. Tools that enforce schema validation at the application layer or assist in generating security rules, such as Fireschema , should be strongly considered to prevent schema drift.   

2. Embrace Denormalization and Serverless Logic for Performance: To achieve the fast, responsive user experience expected of a modern social application, the architecture must be optimized for read operations. This necessitates a deliberate strategy of data denormalization, managed and kept consistent by a suite of event-driven Cloud Functions. * Recommendation: Implement the denormalization patterns outlined for user and post data. Invest engineering resources early in building a robust, well-tested, and monitored set of synchronization functions. The complexity of this serverless layer should be acknowledged as a core part of the system's architecture, not an afterthought.

3. Implement the Hybrid Fan-Out Model for a Scalable and Cost-Effective Feed: A purely "push" or "pull" model for feed generation is either prohibitively expensive or technically unfeasible at scale. The proposed hybrid model offers the best of both worlds, providing real-time performance for the majority of users while preventing cost overruns from "celebrity" accounts. * Recommendation: Architect the feed generation system around the hybrid push-pull logic detailed in Section 2. The follower threshold that triggers the switch from "push" to "pull" should be a configurable variable, allowing for tuning as platform usage patterns become clearer.

4. Prioritize Security and Moderation from Day One: User safety and community health are paramount. A multi-layered defense combining preventative Firestore Security Rules with reactive, AI-driven content moderation is essential. * Recommendation: Implement the "deny by default" security ruleset and the automated content moderation workflow using the Cloud Natural Language API. Do not launch without a clear and functional system for user-generated content reporting and a defined process for manual review.

5. Design Onboarding as a Personalization Tool: The new user onboarding flow is the single most effective mechanism for driving long-term engagement. Its primary purpose should be to gather the necessary data to immediately personalize the user's experience. * Recommendation: The onboarding flow should be designed to actively query user interests (brands, activities) as outlined in Section 6. The goal is to ensure that no user ever lands on an empty or irrelevant feed in their first session, thereby dramatically reducing the time-to-value and increasing the probability of retention.

By adhering to these architectural principles and strategic recommendations, the Bulgarian car platform can build a robust, scalable, and engaging social ecosystem that is well-positioned for sustained growth and community success.
فقط ركز دستورنا  في هذا المشروع : 
الموقع الجغرافي : جمهورية بلغارية 
اللغات : بلغاري و انكليزي 
العملة : يورو 
الملفات البرمجية لا تزيد على 300 سطر و اذا زاد سوف يقسم الكود على اكثر من ملف و مع الدوال الخاصة و الكومنت المناسب والدوال المعنية لربط الملفات 
لا للتكرار 
تحليل كل ملف قبل العمل به 
الايموجيات النصية التي تشبه هذه :📍📞🎯 ❤️⚡⭐🚗 .....الخ ممنوعة ومرفوضة في كامل المشروع 
الايكونات والعلامات وغيرها تجلبها من هذا الموقع : https://www.svgrepo.com/
لكن اجعل كل شيء حقيقي وليس تجريبي 
يعني كل ما تعمل عليه هو للنشر للناس وللحالة الحقيقية للبيع 
