import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    orderBy,
    limit,
    startAfter,
    getDocs,
    where,
    QueryConstraint,
    DocumentData,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from '../services/logger-service';
import type { BulgarianUser } from '../types/user/bulgarian-user.types';

interface UseUsersOptions {
    pageSize?: number;
}

interface UseUsersResult {
    users: (BulgarianUser & { id: string })[];
    loading: boolean;
    error: Error | null;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    searchUsers: (searchTerm: string) => Promise<void>;
    refreshUsers: () => Promise<void>;
}

export const useUsers = ({ pageSize = 10 }: UseUsersOptions = {}): UseUsersResult => {
    const [users, setUsers] = useState<(BulgarianUser & { id: string })[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [currentSearchTerm, setCurrentSearchTerm] = useState('');

    const fetchUsers = useCallback(async (isLoadMore: boolean = false, searchTerm: string = '') => {
        setLoading(true);
        setError(null);
        try {
            const usersRef = collection(db, 'users');
            let constraints: QueryConstraint[] = [];

            // Note: Firestore search is limited. Ideally, use Algolia/Elasticsearch.
            // Here we implement a basic prefix search on displayName if provided.
            if (searchTerm) {
                // Basic prefix search: name >= searchTerm AND name <= searchTerm + '\uf8ff'
                constraints.push(where('displayName', '>=', searchTerm));
                constraints.push(where('displayName', '<=', searchTerm + '\uf8ff'));
                constraints.push(orderBy('displayName'));
            } else {
                constraints.push(orderBy('createdAt', 'desc'));
            }

            constraints.push(limit(pageSize));

            if (isLoadMore && lastDoc && !searchTerm) {
                constraints.push(startAfter(lastDoc));
            }

            const q = query(usersRef, ...constraints);
            const snapshot = await getDocs(q);

            const fetchedUsers = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data()
            } as BulgarianUser & { id: string }));

            if (isLoadMore) {
                setUsers(prev => [...prev, ...fetchedUsers]);
            } else {
                setUsers(fetchedUsers);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setHasMore(snapshot.docs.length === pageSize);

        } catch (err) {
            logger.error('Error fetching users:', err as Error);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [pageSize, lastDoc]);

    // Initial load
    useEffect(() => {
        fetchUsers(false, '');
    }, []); // Run only on mount

    const loadMore = useCallback(async () => {
        if (!loading && hasMore) {
            await fetchUsers(true, currentSearchTerm);
        }
    }, [loading, hasMore, fetchUsers, currentSearchTerm]);

    const searchUsers = useCallback(async (term: string) => {
        setCurrentSearchTerm(term);
        await fetchUsers(false, term);
    }, [fetchUsers]);

    const refreshUsers = useCallback(async () => {
        setLastDoc(null);
        await fetchUsers(false, currentSearchTerm);
    }, [fetchUsers, currentSearchTerm]);

    return {
        users,
        loading,
        error,
        hasMore,
        loadMore,
        searchUsers,
        refreshUsers
    };
};
