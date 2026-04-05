/**
 * CarModerationPage
 *
 * Real-time car listing moderation for admin/super-admin users.
 * Streams newly submitted listings across all vehicle collections via
 * Firestore onSnapshot listeners so moderators can approve or reject
 * submissions instantly.
 *
 * Safety conventions:
 * - `isActive` flag guards every `setState` call inside async callbacks.
 * - onSnapshot unsubscribers are cleaned up in useEffect return.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, RefreshCw, Car, Eye } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface ModerationCar {
  id: string;
  collection: string;
  make: string;
  model: string;
  year: number;
  price: number;
  city?: string;
  sellerName?: string;
  sellerNumericId?: number;
  numericId?: number;
  status: ModerationStatus;
  createdAt?: { toDate: () => Date } | null;
  images?: string[];
}

// ---------------------------------------------------------------------------
// Collections to monitor (mirrors SellWorkflowCollections.isValidCollection)
// ---------------------------------------------------------------------------

const VEHICLE_COLLECTIONS = [
  'cars',
  'passenger_cars',
  'suvs',
  'vans',
  'motorcycles',
  'trucks',
  'buses',
] as const;

const MODERATION_LIMIT = 30; // Fetch at most 30 pending items per collection

// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------

const Page = styled.div`
  padding: 24px;
  background: var(--admin-bg-primary, #0f172a);
  min-height: 100vh;
  color: var(--admin-text-primary, #f8fafc);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--admin-text-primary, #f8fafc);
  margin: 0;
`;

const Badge = styled.span<{ $count: number }>`
  background: ${p => (p.$count > 0 ? '#ef4444' : '#334155')};
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  min-width: 24px;
  text-align: center;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--admin-border-primary, #1e293b);
  margin: 0 0 24px;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const FilterBtn = styled.button<{ $active: boolean }>`
  padding: 6px 16px;
  border-radius: 8px;
  border: 1px solid ${p => (p.$active ? 'var(--admin-accent, #6366f1)' : 'var(--admin-border-primary, #334155)')};
  background: ${p => (p.$active ? 'rgba(99,102,241,0.15)' : 'transparent')};
  color: ${p => (p.$active ? 'var(--admin-accent, #6366f1)' : 'var(--admin-text-secondary, #94a3b8)')};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
`;

const Card = styled.div`
  background: var(--admin-bg-card, #1e293b);
  border: 1px solid var(--admin-border-primary, #334155);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--admin-accent, #6366f1);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  background: #0f172a;
`;

const CardNoImage = styled.div`
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  color: #475569;
`;

const CardBody = styled.div`
  padding: 14px 16px 16px;
`;

const CarTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--admin-text-primary, #f8fafc);
`;

const CarMeta = styled.p`
  font-size: 0.8rem;
  color: var(--admin-text-secondary, #94a3b8);
  margin: 0 0 12px;
`;

const CollBadge = styled.span`
  display: inline-block;
  font-size: 0.7rem;
  padding: 2px 8px;
  background: rgba(99, 102, 241, 0.12);
  color: #818cf8;
  border-radius: 6px;
  margin-bottom: 12px;
  font-weight: 600;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionBtn = styled.button<{ $variant: 'approve' | 'reject' | 'view' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 0;
  border-radius: 8px;
  border: none;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;

  background: ${p =>
    p.$variant === 'approve'
      ? 'rgba(34,197,94,0.15)'
      : p.$variant === 'reject'
      ? 'rgba(239,68,68,0.15)'
      : 'rgba(100,116,139,0.15)'};
  color: ${p =>
    p.$variant === 'approve'
      ? '#22c55e'
      : p.$variant === 'reject'
      ? '#ef4444'
      : '#94a3b8'};

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Empty = styled.div`
  grid-column: 1/-1;
  text-align: center;
  padding: 60px 0;
  color: var(--admin-text-secondary, #94a3b8);
  font-size: 1rem;
`;

const Spinner = styled.div`
  grid-column: 1/-1;
  text-align: center;
  padding: 60px 0;
  color: var(--admin-text-secondary, #94a3b8);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type FilterType = 'pending' | 'approved' | 'rejected' | 'all';

const CarModerationPage: React.FC = () => {
  const [cars, setCars] = useState<ModerationCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('pending');
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  const isActive = useRef(true);
  const unsubscribers = useRef<Unsubscribe[]>([]);

  // -------------------------------------------------------------------------
  // Subscribe to all vehicle collections for pending cars
  // -------------------------------------------------------------------------
  const subscribeAll = useCallback(() => {
    // Clear previous listeners
    unsubscribers.current.forEach(unsub => unsub());
    unsubscribers.current = [];

    if (isActive.current) setLoading(true);

    // Accumulate snapshots per collection in a Map so we can merge
    const collectionCars = new Map<string, ModerationCar[]>();

    VEHICLE_COLLECTIONS.forEach(coll => {
      const q = query(
        collection(db, coll),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(MODERATION_LIMIT)
      );

      const unsub = onSnapshot(
        q,
        snapshot => {
          if (!isActive.current) return;
          const items: ModerationCar[] = snapshot.docs.map(d => ({
            id: d.id,
            collection: coll,
            make: d.data().make ?? '',
            model: d.data().model ?? '',
            year: d.data().year ?? 0,
            price: d.data().price ?? 0,
            city: d.data().city,
            sellerName: d.data().sellerName,
            sellerNumericId: d.data().sellerNumericId,
            numericId: d.data().numericId,
            status: (d.data().status as ModerationStatus) ?? 'pending',
            createdAt: d.data().createdAt ?? null,
            images: d.data().images ?? [],
          }));

          collectionCars.set(coll, items);

          // Merge all and sort newest first
          const merged = Array.from(collectionCars.values())
            .flat()
            .sort((a, b) => {
              const tA = a.createdAt?.toDate?.()?.getTime() ?? 0;
              const tB = b.createdAt?.toDate?.()?.getTime() ?? 0;
              return tB - tA;
            });

          if (isActive.current) {
            setCars(merged);
            setLoading(false);
          }
        },
        err => {
          logger.error(`CarModeration: onSnapshot error for ${coll}`, err);
          if (isActive.current) setLoading(false);
        }
      );

      unsubscribers.current.push(unsub);
    });
  }, []);

  useEffect(() => {
    isActive.current = true;
    subscribeAll();

    return () => {
      isActive.current = false;
      unsubscribers.current.forEach(unsub => unsub());
    };
  }, [subscribeAll]);

  // -------------------------------------------------------------------------
  // Approve / Reject
  // -------------------------------------------------------------------------
  const moderate = useCallback(
    async (car: ModerationCar, action: 'approved' | 'rejected') => {
      const key = `${car.collection}/${car.id}`;
      setProcessing(prev => new Set(prev).add(key));

      try {
        const docRef = doc(db, car.collection, car.id);
        await updateDoc(docRef, {
          status: action,
          moderatedAt: serverTimestamp(),
        });

        toast.success(`Listing ${action} — ${car.make} ${car.model} ${car.year}`);
        logger.info(`CarModeration: ${action} ${car.collection}/${car.id}`);
      } catch (err) {
        logger.error('CarModeration: update failed', err as Error, { car, action });
        toast.error('Failed to update listing. Please try again.');
      } finally {
        if (isActive.current) {
          setProcessing(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }
      }
    },
    []
  );

  // -------------------------------------------------------------------------
  // Filter displayed cars
  // -------------------------------------------------------------------------
  const displayed = filter === 'all' ? cars : cars.filter(c => c.status === filter);
  const pendingCount = cars.filter(c => c.status === 'pending').length;

  // -------------------------------------------------------------------------
  // View on site
  // -------------------------------------------------------------------------
  const viewCar = (car: ModerationCar) => {
    if (car.sellerNumericId && car.numericId) {
      window.open(`/car/${car.sellerNumericId}/${car.numericId}`, '_blank', 'noopener');
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <Page>
      <Header>
        <Title>
          <Car size={22} />
          Car Moderation
          <Badge $count={pendingCount}>{pendingCount}</Badge>
        </Title>
        <ActionBtn
          $variant="view"
          style={{ flex: 'none', padding: '7px 16px' }}
          onClick={subscribeAll}
        >
          <RefreshCw size={14} />
          Refresh
        </ActionBtn>
      </Header>

      <Divider />

      <FilterRow>
        {(['pending', 'all', 'approved', 'rejected'] as FilterType[]).map(f => (
          <FilterBtn key={f} $active={filter === f} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </FilterBtn>
        ))}
      </FilterRow>

      <Grid>
        {loading ? (
          <Spinner>
            <RefreshCw size={20} />
            Loading pending listings…
          </Spinner>
        ) : displayed.length === 0 ? (
          <Empty>No {filter !== 'all' ? filter : ''} listings found.</Empty>
        ) : (
          displayed.map(car => {
            const key = `${car.collection}/${car.id}`;
            const busy = processing.has(key);
            const thumb = car.images?.[0];

            return (
              <Card key={key}>
                {thumb ? (
                  <CardImage src={thumb} alt={`${car.make} ${car.model}`} loading="lazy" />
                ) : (
                  <CardNoImage>
                    <Car size={36} />
                  </CardNoImage>
                )}
                <CardBody>
                  <CollBadge>{car.collection}</CollBadge>
                  <CarTitle>
                    {car.make} {car.model} {car.year}
                  </CarTitle>
                  <CarMeta>
                    €{car.price.toLocaleString()} · {car.city ?? 'N/A'} ·{' '}
                    {car.sellerName ?? `Seller #${car.sellerNumericId ?? '?'}`}
                  </CarMeta>
                  <ActionRow>
                    <ActionBtn
                      $variant="approve"
                      disabled={busy || car.status === 'approved'}
                      onClick={() => moderate(car, 'approved')}
                    >
                      <CheckCircle size={14} />
                      Approve
                    </ActionBtn>
                    <ActionBtn
                      $variant="reject"
                      disabled={busy || car.status === 'rejected'}
                      onClick={() => moderate(car, 'rejected')}
                    >
                      <XCircle size={14} />
                      Reject
                    </ActionBtn>
                    {car.sellerNumericId && car.numericId ? (
                      <ActionBtn $variant="view" onClick={() => viewCar(car)}>
                        <Eye size={14} />
                      </ActionBtn>
                    ) : null}
                  </ActionRow>
                </CardBody>
              </Card>
            );
          })
        )}
      </Grid>
    </Page>
  );
};

export default CarModerationPage;
