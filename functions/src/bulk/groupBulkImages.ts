import * as functions from 'firebase-functions/v1';

export const groupBulkImages = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  const imageUrls = Array.isArray(data?.imageUrls) ? data.imageUrls : [];
  const batchId = String(data?.batchId || 'unknown');

  if (!imageUrls.length) {
    return {
      batchId,
      clusters: [],
    };
  }

  // Initial production-safe fallback: single cluster.
  // Vision-based clustering can be added incrementally without breaking API shape.
  return {
    batchId,
    clusters: [
      {
        clusterId: `${batchId}-cluster-1`,
        confidence: 0.25,
        imageUrls,
      },
    ],
  };
});
