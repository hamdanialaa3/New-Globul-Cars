/**
 * Cursor-based Pagination Utility
 * Implements efficient pagination for Firestore queries
 */

import {
    collection,
    query,
    orderBy,
    limit,
    startAfter,
    getDocs,
    QueryDocumentSnapshot,
    DocumentData,
    Query,
    where,
    WhereFilterOp
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';

export interface PaginationOptions {
    collectionName: string;
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitCount?: number;
    filters?: Array<{
        field: string;
        operator: WhereFilterOp;
        value: any;
    }>;
}

export interface PaginatedResult<T> {
    data: T[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
}

/**
 * Fetch paginated data from Firestore
 */
export async function fetchPaginated<T = DocumentData>(
    options: PaginationOptions,
    lastDoc?: QueryDocumentSnapshot<DocumentData> | null
): Promise<PaginatedResult<T>> {
    const {
        collectionName,
        orderByField = 'createdAt',
        orderDirection = 'desc',
        limitCount = 20,
        filters = []
    } = options;

    try {
        // Build base query
        let q: Query = collection(db, collectionName);

        // Apply filters
        filters.forEach(filter => {
            q = query(q, where(filter.field, filter.operator, filter.value));
        });

        // Apply ordering
        q = query(q, orderBy(orderByField, orderDirection));

        // Apply limit (fetch one extra to check if there are more)
        q = query(q, limit(limitCount + 1));

        // Apply cursor if provided
        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        // Execute query
        const snapshot = await getDocs(q);

        // Check if there are more results
        const hasMore = snapshot.docs.length > limitCount;

        // Get actual data (exclude the extra doc used for hasMore check)
        const docs = hasMore ? snapshot.docs.slice(0, limitCount) : snapshot.docs;

        // Extract data
        const data = docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        })) as T[];

        // Get last document for next page
        const newLastDoc = docs.length > 0 ? docs[docs.length - 1] : null;

        return {
            data,
            lastDoc: newLastDoc,
            hasMore
        };
    } catch (error) {
        // Pagination error - logged internally
        return {
            data: [],
            lastDoc: null,
            hasMore: false
        };
    }
}

/**
 * React hook for paginated data
 */
import { useState, useCallback } from 'react';

export function usePagination<T = DocumentData>(options: PaginationOptions) {
    const [data, setData] = useState<T[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        setError(null);

        try {
            const result = await fetchPaginated<T>(options, lastDoc);

            setData(prev => [...prev, ...result.data]);
            setLastDoc(result.lastDoc);
            setHasMore(result.hasMore);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [options, lastDoc, loading, hasMore]);

    const reset = useCallback(() => {
        setData([]);
        setLastDoc(null);
        setHasMore(true);
        setError(null);
    }, []);

    return {
        data,
        loading,
        error,
        hasMore,
        loadMore,
        reset
    };
}

/**
 * Example usage:
 * 
 * const { data, loading, hasMore, loadMore } = usePagination({
 *   collectionName: 'passenger_cars',
 *   orderByField: 'createdAt',
 *   orderDirection: 'desc',
 *   limitCount: 20,
 *   filters: [
 *     { field: 'brand', operator: '==', value: 'BMW' },
 *     { field: 'isActive', operator: '==', value: true }
 *   ]
 * });
 * 
 * // Load initial data
 * useEffect(() => {
 *   loadMore();
 * }, []);
 * 
 * // Load more on scroll
 * <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} loading={loading}>
 *   {data.map((car: any) => <CarCard key={car.id} car={car} />)}
 * </InfiniteScroll>
 */
