// Unified Query Orchestrator
// يختار بين Algolia و Firestore حسب نوع الاستعلام
// Decision matrix:
//  - If free text present OR complex equipment arrays -> prefer Algolia (fast full text + facets)
//  - Else use Firestore (exact matches + recent listings ordering)
//  - Future: hybrid union + ranking merge

import algoliaSearchService from '@globul-cars/services/algoliaSearchService';
import { buildFirestoreQuery } from './firestoreQueryBuilder';
import { getDocs } from 'firebase/firestore';
import { logger } from '@globul-cars/services';
import { SearchData } from '@globul-cars/cars/types';

export interface OrchestratorResult {
  cars: any[];
  total: number;
  source: 'algolia' | 'firestore';
  processingMs: number;
}

export interface OrchestratorOptions {
  page?: number;
  hitsPerPage?: number;
}

function shouldUseAlgolia(filters: Partial<SearchData>): boolean {
  if (filters.searchDescription) return true;
  const arrayFields = [
    'safetyEquipment','comfortEquipment','infotainmentEquipment','extras','parkingSensors'
  ] as const;
  return arrayFields.some(f => Array.isArray((filters as any)[f]) && (filters as any)[f].length > 0);
}

export async function runUnifiedQuery(filters: Partial<SearchData>, options: OrchestratorOptions = {}): Promise<OrchestratorResult> {
  const start = performance.now();
  try {
    if (shouldUseAlgolia(filters)) {
      // Preferred: Algolia
      const res = await algoliaSearchService.searchCars(filters as SearchData, { page: (options.page||0), hitsPerPage: options.hitsPerPage || 40 });
      if (res.totalResults && res.totalResults > 0) {
        return { cars: res.cars, total: res.totalResults, source: 'algolia', processingMs: res.processingTime };
      }
      // Fallback to Firestore if Algolia has 0 results
      const qFb = buildFirestoreQuery(filters, { maxResults: 100 });
      const snapFb = await getDocs(qFb);
      const carsFb: any[] = [];
      snapFb.forEach(doc => carsFb.push({ id: doc.id, ...doc.data() }));
      return { cars: carsFb, total: carsFb.length, source: 'firestore', processingMs: performance.now() - start };
    }
    // Preferred: Firestore
    const q = buildFirestoreQuery(filters, { maxResults: 100 });
    const snap = await getDocs(q);
    const cars: any[] = [];
    snap.forEach(doc => cars.push({ id: doc.id, ...doc.data() }));
    if (cars.length > 0) {
      return { cars, total: cars.length, source: 'firestore', processingMs: performance.now() - start };
    }
    // Fallback to Algolia if no Firestore results and text/arrays might help
    const res = await algoliaSearchService.searchCars(filters as SearchData, { page: (options.page||0), hitsPerPage: options.hitsPerPage || 40 });
    if (res.totalResults && res.totalResults > 0) {
      return { cars: res.cars, total: res.totalResults, source: 'algolia', processingMs: res.processingTime };
    }
    // Final fallback: Firestore including inactive if dataset lacks status field
    const qAll = buildFirestoreQuery(filters, { maxResults: 100, includeInactive: true });
    const snapAll = await getDocs(qAll);
    const carsAll: any[] = [];
    snapAll.forEach(doc => carsAll.push({ id: doc.id, ...doc.data() }));
    return { cars: carsAll, total: carsAll.length, source: 'firestore', processingMs: performance.now() - start };
  } catch (err) {
    logger.error('Unified query failed', err as Error, { filters });
    throw err;
  }
}
