# المرحلة 3: قسم Feed في الصفحة الرئيسية
## Smart Feed Section - Third Section After Header

**الموقع:** بلغاريا | **اللغات:** BG + EN | **العملة:** EUR
**الوقت المتوقع:** 1 أسبوع

---

## 3.1 SmartFeedSection Component

### الملف: `src/pages/HomePage/SmartFeedSection.tsx` (280 سطر)

**البنية الكاملة:**

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import feedAlgorithmService from '../../services/social/algorithms/feed-algorithm.service';
import PostCard from '../../components/Posts/PostCard';
import CreatePostModal from '../../components/Posts/CreatePostModal';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

const SmartFeedSection: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Load initial feed
  useEffect(() => {
    loadFeed(1);
  }, [user]);
  
  // Load feed function
  const loadFeed = async (pageNum: number) => {
    if (!hasMore && pageNum > 1) return;
    
    setLoading(true);
    
    try {
      const newPosts = await feedAlgorithmService.getPersonalizedFeed(
        user?.uid || 'anonymous',
        pageNum,
        10 // posts per page
      );
      
      if (newPosts.length < 10) {
        setHasMore(false);
      }
      
      setPosts(prev => pageNum === 1 ? newPosts : [...prev, ...newPosts]);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load more on scroll
  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await loadFeed(nextPage);
  }, [page, hasMore]);
  
  // Infinite scroll hook
  const { sentinelRef, loading: scrollLoading } = useInfiniteScroll(
    loadMore,
    hasMore
  );
  
  // Handle post creation
  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreateModal(false);
  };
  
  // Handle engagement
  const handleEngagement = async (postId: string, type: string) => {
    // تحديث محلي فوري (optimistic update)
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          engagement: {
            ...post.engagement,
            [type]: post.engagement[type] + 1
          }
        };
      }
      return post;
    }));
    
    // تتبع الاهتمام
    await personalizationService.trackInterest(user!.uid, {
      type,
      post: posts.find(p => p.id === postId)!
    });
  };
  
  return (
    <FeedSection>
      <FeedContainer>
        {/* Header */}
        <FeedHeader>
          <FeedTitle>
            {language === 'bg' 
              ? 'Новини от общността' 
              : 'Community Feed'}
          </FeedTitle>
          <FeedSubtitle>
            {language === 'bg'
              ? 'Споделете вашите истории, открийте нови автомобили и се свържете със съмишленици'
              : 'Share your stories, discover new cars, and connect with fellow enthusiasts'}
          </FeedSubtitle>
        </FeedHeader>
        
        {/* Create Post Button */}
        {user && (
          <CreatePostTrigger onClick={() => setShowCreateModal(true)}>
            <UserAvatar src={user.profileImage} />
            <CreatePostPlaceholder>
              {language === 'bg'
                ? 'Какво мислите, ' + user.displayName + '?'
                : 'What\'s on your mind, ' + user.displayName + '?'}
            </CreatePostPlaceholder>
            <CreatePostIconButtons>
              <IconButton icon={Image} label={t('post.addPhoto')} />
              <IconButton icon={Video} label={t('post.addVideo')} />
              <IconButton icon={Car} label={t('post.addCar')} />
            </CreatePostIconButtons>
          </CreatePostTrigger>
        )}
        
        {/* Posts Grid */}
        <PostsGrid>
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onEngagement={handleEngagement}
            />
          ))}
        </PostsGrid>
        
        {/* Loading Indicator */}
        {(loading || scrollLoading) && (
          <LoadingSpinner />
        )}
        
        {/* Infinite Scroll Sentinel */}
        <div ref={sentinelRef} style={{ height: 1 }} />
        
        {/* No more posts */}
        {!hasMore && posts.length > 0 && (
          <EndOfFeed>
            {language === 'bg'
              ? 'Видяхте всички публикации'
              : 'You\'ve seen all posts'}
          </EndOfFeed>
        )}
        
        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <EmptyState>
            <EmptyIcon>
              <Users size={64} />
            </EmptyIcon>
            <EmptyTitle>
              {language === 'bg'
                ? 'Все още няма публикации'
                : 'No posts yet'}
            </EmptyTitle>
            <EmptyDescription>
              {language === 'bg'
                ? 'Бъдете първият, който споделя нещо интересно!'
                : 'Be the first to share something interesting!'}
            </EmptyDescription>
            {user && (
              <CreateFirstPostButton onClick={() => setShowCreateModal(true)}>
                {language === 'bg' ? 'Създай първата публикация' : 'Create First Post'}
              </CreateFirstPostButton>
            )}
          </EmptyState>
        )}
      </FeedContainer>
      
      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </FeedSection>
  );
};

export default SmartFeedSection;
```

---

## 3.2 Integration مع HomePage

### التعديل: `src/pages/HomePage/index.tsx`

```typescript
// Import
const SmartFeedSection = React.lazy(() => import('./SmartFeedSection'));

// في return:
<HomeContainer>
  <LargeSpacer />
  
  {/* 1. Business Banner */}
  <BusinessPromoBanner />
  
  <LargeSpacer />
  
  {/* 2. Hero Section (البحث) */}
  <Suspense fallback={<LoadingFallback>Loading...</LoadingFallback>}>
    <HeroSection />
  </Suspense>
  
  <SectionSpacer />
  
  {/* 3. Smart Feed - القسم الثالث! */}
  <LazySection rootMargin="200px" minHeight="800px">
    <Suspense fallback={<LoadingFallback>Loading feed...</LoadingFallback>}>
      <SmartFeedSection />
    </Suspense>
  </LazySection>
  
  <SectionSpacer />
  
  {/* 4. 3D Carousel */}
  <CarCarousel3D />
  
  {/* ... باقي الأقسام */}
</HomeContainer>
```

---

## 3.3 Styling (Styled Components)

```typescript
const FeedSection = styled.section`
  width: 100%;
  background: linear-gradient(
    135deg,
    rgba(248, 249, 250, 0.98) 0%,
    rgba(255, 255, 255, 0.95) 100%
  );
  padding: 60px 0;
  position: relative;
`;

const FeedContainer = styled.div`
  max-width: 680px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 15px;
  }
`;

const FeedHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const FeedTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const CreatePostTrigger = styled.button`
  width: 100%;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #FF8F10;
    box-shadow: 0 4px 12px rgba(255, 127, 0, 0.1);
  }
`;

const PostsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #e9ecef;
    border-top-color: #FF7900;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
```

---

## 3.4 useInfiniteScroll Hook

### الملف: `src/hooks/useInfiniteScroll.ts` (150 سطر)

```typescript
import { useState, useEffect, useRef } from 'react';

export function useInfiniteScroll(
  loadMore: () => Promise<void>,
  hasMore: boolean
) {
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver>();
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '200px', // تحميل قبل 200px من النهاية
      threshold: 0.1
    };
    
    observerRef.current = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          setLoading(true);
          
          try {
            await loadMore();
          } catch (error) {
            console.error('Failed to load more:', error);
          } finally {
            setLoading(false);
          }
        }
      },
      options
    );
    
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, loading]);
  
  return { sentinelRef, loading };
}
```

---

## 3.5 Real-time Updates

**WebSocket Integration:**

```typescript
// الاستماع للتحديثات الفورية
useEffect(() => {
  if (!user) return;
  
  const unsubscribe = feedRealtimeService.subscribeToUpdates(
    user.uid,
    (update) => {
      if (update.type === 'new_post') {
        // إضافة بوست جديد في الأعلى
        setPosts(prev => [update.post, ...prev]);
        
        // إظهار notification
        showNewPostNotification();
      } else if (update.type === 'post_updated') {
        // تحديث بوست موجود
        setPosts(prev => prev.map(post => 
          post.id === update.post.id ? update.post : post
        ));
      } else if (update.type === 'post_removed') {
        // إزالة بوست
        setPosts(prev => prev.filter(post => post.id !== update.postId));
      }
    }
  );
  
  return () => unsubscribe();
}, [user]);
```

---

## 3.6 الموقع في الصفحة الرئيسية

**الترتيب النهائي:**

```
HomePage Structure:
│
├── 1. Header (الهيدر)
├── 2. Business Banner (البانر الترويجي)
├── 3. Hero Section (قسم البحث)
│
├── 4. Smart Feed Section ← هنا! القسم الثالث
│     ├── Create Post Trigger
│     ├── Posts Grid (10 posts)
│     ├── Infinite Scroll
│     └── Real-time Updates
│
├── 5. 3D Car Carousel (نصائح السلامة)
├── 6. Stats Section (الإحصائيات)
├── 7. Popular Brands (العلامات الشهيرة)
├── 8. City Cars Section (السيارات بالمدن)
├── 9. Image Gallery (معرض الصور)
├── 10. Featured Cars (سيارات مميزة)
├── 11. Features (المميزات)
└── 12. Footer (التذييل)
```

---

## 3.7 Responsive Design

```css
@media (max-width: 1024px) {
  .feed-container {
    max-width: 600px;
  }
  
  .post-card {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .feed-container {
    max-width: 100%;
    padding: 0 12px;
  }
  
  .feed-header h2 {
    font-size: 1.75rem;
  }
  
  .create-post-trigger {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .feed-header h2 {
    font-size: 1.5rem;
  }
  
  .post-card {
    border-radius: 12px;
  }
}
```

---

## 3.8 الملفات المطلوبة - Checklist

```
□ src/pages/HomePage/SmartFeedSection.tsx (280 سطر)
□ src/hooks/useInfiniteScroll.ts (150 سطر)
□ تعديل: src/pages/HomePage/index.tsx
  - إضافة SmartFeedSection import
  - إضافة في المكان الصحيح (بعد Hero)
  - LazySection wrapping
```

---

## 3.9 الاختبار

```
✅ القسم يظهر في المكان الصحيح (الثالث)
✅ البوستات تحمّل بذكاء (مرتبة)
✅ Infinite scroll يعمل بسلاسة
✅ Create post button يعمل
✅ Real-time updates تعمل
✅ Responsive على Mobile
✅ Performance جيد (60 FPS)
```

---

## الخطوة التالية

**اقرأ:** `5 - المرحلة 4 - خوارزميات التعلم الآلي.md`

