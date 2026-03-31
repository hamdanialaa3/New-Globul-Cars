import { functions } from '../../firebase/firebase-config';
import { httpsCallable } from 'firebase/functions';
import { serviceLogger } from '../logger-service';

export interface GroupedImageCluster {
  clusterId: string;
  confidence: number;
  imageUrls: string[];
}

class ImageGroupingService {
  async groupImages(
    batchId: string,
    imageUrls: string[]
  ): Promise<GroupedImageCluster[]> {
    try {
      const callable = httpsCallable(functions, 'groupBulkImages');
      const response = await callable({ batchId, imageUrls });
      return ((response.data as any)?.clusters || []) as GroupedImageCluster[];
    } catch (error) {
      serviceLogger.warn(
        'groupBulkImages callable unavailable, returning fallback cluster',
        {
          batchId,
          count: imageUrls.length,
        }
      );

      if (!imageUrls.length) {
        return [];
      }

      return [
        {
          clusterId: 'fallback-cluster',
          confidence: 0.2,
          imageUrls,
        },
      ];
    }
  }
}

export const imageGroupingService = new ImageGroupingService();
