import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface ReviewItem {
  numericId: number;
  make: string;
  model: string;
  year: number;
  reviewStatus: 'pending' | 'approved' | 'rejected';
}

/**
 * processBulkUpload — called by the client after initial upload to transition
 * a job into review status and optionally activate approved items.
 *
 * data.jobId    — required
 * data.publish  — optional boolean: if true, activates all pending/approved items
 */
export const processBulkUpload = functions.https.onCall(
  async (data, context) => {
    if (!context.auth?.uid) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication required'
      );
    }

    const jobId = String(data?.jobId || '').trim();
    if (!jobId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'jobId is required'
      );
    }

    const jobRef = db.collection('bulk_upload_jobs').doc(jobId);
    const snapshot = await jobRef.get();

    if (!snapshot.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Bulk upload job not found'
      );
    }

    const jobData = snapshot.data()!;

    // Only the owner can process the job
    if (jobData.userId !== context.auth.uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Not authorized'
      );
    }

    const shouldPublish = Boolean(data?.publish);

    if (!shouldPublish) {
      // Just transition to review
      await jobRef.update({
        status: 'review',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { ok: true, jobId, status: 'review' };
    }

    // Publish flow: activate all pending/approved review items
    await jobRef.update({ status: 'publishing' });

    const reviewItems: ReviewItem[] = jobData.reviewItems ?? [];
    const toPublish = reviewItems.filter(
      i => i.reviewStatus === 'approved' || i.reviewStatus === 'pending'
    );

    if (!toPublish.length) {
      await jobRef.update({
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { ok: true, jobId, status: 'completed', published: 0 };
    }

    const publishedIds = toPublish.map(i => i.numericId);
    let published = 0;

    // Batch-activate cars_basic_info documents in chunks of 10 (in operator limit)
    const CHUNK = 10;
    for (let offset = 0; offset < publishedIds.length; offset += CHUNK) {
      const chunk = publishedIds.slice(offset, offset + CHUNK);
      const snaps = await db
        .collection('cars_basic_info')
        .where('numericId', 'in', chunk)
        .get();

      const batch = db.batch();
      snaps.forEach(d => {
        batch.update(d.ref, {
          isActive: true,
          status: 'active',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
      published += snaps.size;
    }

    const updatedItems = reviewItems.map(item =>
      publishedIds.includes(item.numericId)
        ? { ...item, reviewStatus: 'approved' }
        : item
    );

    await jobRef.update({
      status: 'completed',
      reviewItems: updatedItems,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info('[processBulkUpload] Publish complete', {
      jobId,
      published,
    });

    return { ok: true, jobId, status: 'completed', published };
  }
);
