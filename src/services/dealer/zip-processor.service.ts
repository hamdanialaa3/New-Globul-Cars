import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';
import type { ParsedCarData } from './csv-parser.service';

export interface ZipProcessingResult {
  rows: ParsedCarData[];
  imageMap: Record<string, File[]>;
  warnings: string[];
}

export interface ZipUploadResult {
  accepted: boolean;
  storageUrl?: string;
  warning?: string;
}

/**
 * ZIP processor for enterprise bulk uploads.
 * Supports folder uploads (immediate image mapping) and ZIP staging
 * (upload to Firebase Storage for background processing).
 */
class ZipProcessorService {
  async processFolderUpload(
    csvRows: ParsedCarData[],
    files: FileList | File[]
  ): Promise<ZipProcessingResult> {
    const allFiles = Array.from(files || []);
    const imageFiles = allFiles.filter(f => f.type.startsWith('image/'));
    const imageMap: Record<string, File[]> = {};

    for (const row of csvRows) {
      const key =
        row.folderName || row.vin || `${row.make}-${row.model}-${row.year}`;
      if (!key) continue;

      const normalized = key.toLowerCase();
      imageMap[key] = imageFiles.filter(file => {
        const path =
          `${(file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name}`.toLowerCase();
        return path.includes(normalized);
      });
    }

    return {
      rows: csvRows,
      imageMap,
      warnings: [],
    };
  }

  /**
   * Upload ZIP to Firebase Storage so the Cloud Function can process it.
   * Returns the download URL once complete.
   */
  async stageZipForBackgroundProcessing(
    zipFile: File,
    userId: string,
    jobId: string,
    onProgress?: (pct: number) => void
  ): Promise<ZipUploadResult> {
    const storagePath = `bulk_uploads/${userId}/${jobId}/${zipFile.name}`;
    const storageRef = ref(storage, storagePath);

    return new Promise<ZipUploadResult>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, zipFile);

      uploadTask.on(
        'state_changed',
        snapshot => {
          const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(pct);
        },
        error => {
          serviceLogger.error('ZIP storage upload failed', error as Error, {
            path: storagePath,
          });
          reject(error);
        },
        async () => {
          try {
            const storageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            serviceLogger.info('ZIP staged in Firebase Storage', {
              path: storagePath,
              storageUrl,
            });
            resolve({
              accepted: true,
              storageUrl,
            });
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }
}

export const zipProcessorService = new ZipProcessorService();
