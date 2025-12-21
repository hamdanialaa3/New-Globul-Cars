import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { useAuth } from './useAuth';
import { logger } from '../services/logger-service';

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    data?: any;
}

export const useFirestoreNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            // FIX: Removed orderBy to prevent "Missing Index" crash
            // orderBy('createdAt', 'desc'), 
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            })) as Notification[];

            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.read).length);
            setLoading(false);
        }, (error) => {
            logger.error("Error fetching notifications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const markAsRead = async (notificationId: string) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'notifications', notificationId), {
                read: true
            });
        } catch (error) {
            logger.error('Error marking as read:', error as Error);
        }
    };

    const markAllAsRead = async () => {
        if (!user || user.uid === 'guest') return; // Basic guard

        // Get all unread notifications from current list to avoid too many writes if list is huge
        // Ideally we should do a batch update on the backend but client-side batch is okay for small numbers
        const unread = notifications.filter(n => !n.read);

        if (unread.length === 0) return;

        try {
            const batch = writeBatch(db);
            unread.forEach(n => {
                const ref = doc(db, 'notifications', n.id);
                batch.update(ref, { read: true });
            });
            await batch.commit();
        } catch (error) {
            logger.error('Error marking all as read:', error as Error);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead
    };
};
