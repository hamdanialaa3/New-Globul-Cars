// functions/src/trustScore/index.ts
// Trust Score Module Exports

export { calculateTrustScore, getTrustBadge } from './calculateScore';
export { getTrustScore, recalculateTrustScore } from './getTrustScore';
export {
  onReviewStatsUpdated,
  onVerificationUpdated,
  onListingChanged,
  onAnalyticsUpdated,
} from './onScoreUpdate';
