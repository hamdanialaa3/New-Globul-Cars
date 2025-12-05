// Saved Searches Service
// English/Bulgarian bilingual comments kept brief. No emojis.
// Singleton pattern; Firestore CRUD for user saved searches.
// Cloud Function will handle alert executions; here only data ops + local validation.

import { collection, doc, getDocs, addDoc, deleteDoc, query, where, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export interface SavedSearchCriteria {
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  maxPriceEur?: number;
  fuelTypes?: string[];
  transmission?: string;
  regionIds?: string[];
}

export interface SavedSearchNotificationCfg {
  channels: string[]; // ['inapp','push','email']
  enabled: boolean;
  lastTriggeredAt?: Timestamp;
}

export interface SavedSearchDoc {
  id: string;
  userId: string;
  criteria: SavedSearchCriteria;
  notification: SavedSearchNotificationCfg;
  createdAt: Timestamp;
}

const COLLECTION = 'savedSearches';

function validateCriteria(criteria: SavedSearchCriteria): string[] {
  const issues: string[] = [];
  if (criteria.minYear && criteria.maxYear && criteria.minYear > criteria.maxYear) {
    issues.push('minYear cannot exceed maxYear');
  }
  if (criteria.maxPriceEur && criteria.maxPriceEur < 0) {
    issues.push('maxPriceEur must be >= 0');
  }
  if (criteria.fuelTypes && criteria.fuelTypes.length > 10) {
    issues.push('Too many fuelTypes (limit 10)');
  }
  return issues;
}

class SavedSearchesService {
  private static instance: SavedSearchesService;
  static getInstance(): SavedSearchesService {
    if (!this.instance) this.instance = new SavedSearchesService();
    return this.instance;
  }

  private col() {
    return collection(db, COLLECTION);
  }

  async list(userId: string): Promise<SavedSearchDoc[]> {
    const q = query(this.col(), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<SavedSearchDoc, 'id'>) }));
  }

  async create(userId: string, criteria: SavedSearchCriteria, notification: Partial<SavedSearchNotificationCfg> = {}): Promise<SavedSearchDoc> {
    const issues = validateCriteria(criteria);
    if (issues.length) {
      throw new Error('Validation failed: ' + issues.join(', '));
    }
    const payload: Omit<SavedSearchDoc, 'id'> = {
      userId,
      criteria,
      notification: {
        channels: notification.channels || ['inapp'],
        enabled: notification.enabled !== false,
        lastTriggeredAt: undefined
      },
      createdAt: Timestamp.fromDate(new Date())
    };
    const ref = await addDoc(this.col(), payload);
    return { id: ref.id, ...payload };
  }

  async delete(userId: string, id: string): Promise<void> {
    const ref = doc(db, COLLECTION, id);
    // Optionally verify ownership by fetching; skipped for performance (rule enforces)
    await deleteDoc(ref);
  }

  async disable(userId: string, id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { 'notification.enabled': false });
  }

  async enable(userId: string, id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { 'notification.enabled': true });
  }

  async touchTriggered(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { 'notification.lastTriggeredAt': Timestamp.fromDate(new Date()) });
  }

  // Build a Firestore query object based on criteria (simplified; advanced handled in Cloud Function)
  // Returns an object describing query segments (consumer chooses execution path)
  buildQueryPlan(criteria: SavedSearchCriteria): { fields: Record<string, unknown>; range: { year?: [number, number]; priceEurMax?: number } } {
    const fields: Record<string, unknown> = {};
    if (criteria.make) fields.make = criteria.make;
    if (criteria.model) fields.model = criteria.model;
    if (criteria.fuelTypes && criteria.fuelTypes.length === 1) fields.fuelType = criteria.fuelTypes[0];
    const range: { year?: [number, number]; priceEurMax?: number } = {};
    if (criteria.minYear || criteria.maxYear) {
      range.year = [criteria.minYear || 0, criteria.maxYear || new Date().getFullYear()];
    }
    if (criteria.maxPriceEur) range.priceEurMax = criteria.maxPriceEur;
    return { fields, range };
  }
}

export const savedSearchesService = SavedSearchesService.getInstance();
