import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { postsEngagementService, type PostComment } from '../services/social/posts-engagement.service';
import { db } from '../firebase/firebase-config';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { logger } from '../services/logger-service';
import type { FeedItem } from '../services/social/smart-feed.service';

interface UsePostEngagementResult {
    liked: boolean;
    saved: boolean;
    engagement: FeedItem['engagement'];
    comments: PostComment[];
    isLiking: boolean;
    isCommenting: boolean;
    toggleLike: () => Promise<void>;
    toggleSave: () => Promise<void>;
    sharePost: () => Promise<void>;
    submitComment: (text: string, parentId?: string) => Promise<void>;
    loadComments: () => void;
}

export const usePostEngagement = (item: FeedItem): UsePostEngagementResult => {
    const { user } = useAuth();
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [engagement, setEngagement] = useState(item.engagement);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [isLiking, setIsLiking] = useState(false);
    const [isCommenting, setIsCommenting] = useState(false);
    const [shouldLoadComments, setShouldLoadComments] = useState(false);

    // Real-time updates for engagement stats and like status
    useEffect(() => {
        if (item.type !== 'post' || !item.id) return;

        const postRef = doc(db, 'posts', item.id);
        let isActive = true;
        const unsubscribe = onSnapshot(postRef, (snap) => {
            if (!isActive) return;
            if (snap.exists()) {
                const data = snap.data();
                setEngagement(data.engagement || item.engagement);

                if (user?.uid) {
                    const reactions = data.reactions || {};
                    setLiked(!!reactions[user.uid]);
                }
            }
        });

        return () => { isActive = false; unsubscribe(); };
    }, [item.id, item.type, item.engagement, user?.uid]);

    // Load comments when requested through shouldLoadComments
    useEffect(() => {
        if (!shouldLoadComments || item.type !== 'post' || !item.id) return;

        const commentsQuery = query(
            collection(db, 'posts', item.id, 'comments'),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        let isActive = true;
        const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
            if (!isActive) return;
            const commentsData = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data()
            } as PostComment));
            setComments(commentsData);
        });

        return () => { isActive = false; unsubscribe(); };
    }, [shouldLoadComments, item.id, item.type]);

    // Track view on mount
    useEffect(() => {
        if (item.type === 'post' && item.id) {
            // We use a ref mechanism inside the component usually, but here we can just fire and forget safe for strict mode double counting
            postsEngagementService.incrementViews(item.id).catch(err => logger.error('Failed to increment views', err));
        }
    }, [item.id, item.type]);


    const toggleLike = useCallback(async () => {
        if (!user || item.type !== 'post' || !item.id || isLiking) return;

        setIsLiking(true);
        try {
            const newLiked = await postsEngagementService.toggleLike(item.id, user.uid);
            setLiked(newLiked);
        } catch (error: any) {
            logger.error('Error toggling like:', error);
        } finally {
            setIsLiking(false);
        }
    }, [user, item.id, item.type, isLiking]);

    const toggleSave = useCallback(async () => {
        if (!user || item.type !== 'post' || !item.id) return;

        try {
            await postsEngagementService.savePost(item.id, user.uid);
            setSaved(prev => !prev);
        } catch (error: any) {
            logger.error('Error saving post:', error);
        }
    }, [user, item.id, item.type]);

    const sharePost = useCallback(async () => {
        if (!user || item.type !== 'post' || !item.id) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: item.content.title || item.content.text || 'Check this out!',
                    text: item.content.text,
                    url: `${window.location.origin}/posts/${item.id}`
                });
            } else {
                await navigator.clipboard.writeText(`${window.location.origin}/posts/${item.id}`);
            }
            await postsEngagementService.sharePost(item.id, user.uid);
        } catch (error: any) {
            logger.error('Error sharing:', error);
        }
    }, [user, item.id, item.type, item.content]);

    const submitComment = useCallback(async (text: string, parentId?: string) => {
        if (!user || !text.trim() || item.type !== 'post' || !item.id || isCommenting) return;

        setIsCommenting(true);
        try {
            await postsEngagementService.addComment(
                item.id,
                user.uid,
                text.trim(),
                parentId
            );
            setShouldLoadComments(true); // Ensure comments are loading
        } catch (error: any) {
            logger.error('Error adding comment:', error);
            throw error;
        } finally {
            setIsCommenting(false);
        }
    }, [user, item.id, item.type, isCommenting]);

    const loadComments = useCallback(() => {
        setShouldLoadComments(true);
    }, []);

    return {
        liked,
        saved,
        engagement,
        comments,
        isLiking,
        isCommenting,
        toggleLike,
        toggleSave,
        sharePost,
        submitComment,
        loadComments
    };
};
