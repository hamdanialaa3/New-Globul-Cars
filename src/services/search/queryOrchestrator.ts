// Unified Query Orchestrator
// يختار بين Algolia و Firestore حسب نوع الاستعلام
// Decision matrix:
//  - If free text present OR complex equipment arrays -> prefer Algolia (fast full text + facets)
//  - Else use Firestore (exact matches + recent listings ordering)
//  - ✅ CRITICAL FIX: Search across ALL vehicle type collections

import algoliaSearchService from '../../services/algoliaSearchService';
import { buildMultiCollectionQueries } from './firestoreQueryBuilder';
import { getDocs } from 'firebase/firestore';
import { logger } from '../../services/logger-service';
import { SearchData } from '../../pages/05_search-browse/advanced-search/AdvancedSearchPage/types';

export interface OrchestratorResult {
  cars: unknown[];
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
      logger.info('Algolia returned 0 results, falling back to Firestore multi-collection search');
    }
    
    // ✅ CRITICAL FIX: Search across ALL vehicle collections in parallel
    logger.debug('Executing multi-collection Firestore search', { filters });
    const queries = buildMultiCollectionQueries(filters, { maxResults: 100 });
    const snapshots = await Promise.all(queries.map(q => getDocs(q)));
    
    const cars: unknown[] = [];
    snapshots.forEach(snap => {
      snap.forEach(doc => cars.push({ id: doc.id, ...doc.data() }));
    });
    
    logger.info(`Multi-collection search found ${cars.length} cars across all collections`);
    
    if (cars.length > 0) {
      return { cars, total: cars.length, source: 'firestore', processingMs: performance.now() - start };
    }
    
    // Last resort: Try Algolia even if no text search
    logger.info('No Firestore results, trying Algolia as last resort');
    const res = await algoliaSearchService.searchCars(filters as SearchData, { page: (options.page||0), hitsPerPage: options.hitsPerPage || 40 });
    if (res.totalResults && res.totalResults > 0) {
      return { cars: res.cars, total: res.totalResults, source: 'algolia', processingMs: res.processingTime };
    }
    
    // Final fallback: Firestore with inactive included
    logger.warn('No results found, trying with inactive listings included');
    const queriesAll = buildMultiCollectionQueries(filters, { maxResults: 100, includeInactive: true });
    const snapshotsAll = await Promise.all(queriesAll.map(q => getDocs(q)));
    const carsAll: unknown[] = [];
    snapshotsAll.forEach(snap => {
      snap.forEach(doc => carsAll.push({ id: doc.id, ...doc.data() }));
    });
    
    return { cars: carsAll, total: carsAll.length, source: 'firestore', processingMs: performance.now() - start };
  } catch (err) {
    logger.error('Unified query failed', err as Error, { filters });
    throw err;
  }
}
