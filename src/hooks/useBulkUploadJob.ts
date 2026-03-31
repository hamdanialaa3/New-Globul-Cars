import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from '../services/logger-service';
import type { BulkReviewItem } from '../services/dealer/bulk-upload.service';

export interface BulkUploadJobState {
  id: string;
  status:
    | 'uploading'
    | 'processing'
    | 'review'
    | 'publishing'
    | 'completed'
    | 'failed';
  totalCars: number;
  processedCars: number;
  sourceType: 'csv' | 'zip' | 'smart_images' | 'cloud_sync';
  errors: Array<{ message: string; index?: number }>;
  reviewItems: BulkReviewItem[];
}

export function useBulkUploadJob(jobId?: string) {
  const [job, setJob] = useState<BulkUploadJobState | null>(null);
  const [loading, setLoading] = useState(Boolean(jobId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, 'bulk_upload_jobs', jobId),
      snapshot => {
        if (!snapshot.exists()) {
          setError('Bulk upload job not found');
          setLoading(false);
          return;
        }

        const data = snapshot.data() as Omit<BulkUploadJobState, 'id'>;
        setJob({
          id: snapshot.id,
          ...data,
          reviewItems: data.reviewItems ?? [],
        });
        setLoading(false);
      },
      err => {
        logger.error('Failed to subscribe to bulk upload job', err as Error, {
          jobId,
        });
        setError((err as Error).message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [jobId]);

  return { job, loading, error };
}
