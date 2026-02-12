// src/services/google/google-drive.service.ts
// Google Drive Documents Management Service
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { logger } from '../logger-service';

export type DocumentType = 'id_card' | 'driving_license' | 'business_license' | 'car_document' | 'invoice' | 'insurance' | 'other';

export interface UploadedDocument {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  createdTime: string;
  type: DocumentType;
  size: number;
}

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private FOLDER_NAME = 'Globul Cars Documents';
  private folderId: string | null = null;
  private initialized = false;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  private constructor() {}
  
  static getInstance(): GoogleDriveService {
    if (!this.instance) {
      this.instance = new GoogleDriveService();
    }
    return this.instance;
  }

  /**
   * Initialize Google Drive API
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        (window as any).gapi.load('client:auth2', async () => {
          try {
            await (window as any).gapi.client.init({
              apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
              clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
              scope: 'https://www.googleapis.com/auth/drive.file'
            });

            this.initialized = true;
            if (process.env.NODE_ENV === 'development') {
              logger.debug('Google Drive API initialized');
            }
            resolve();
          } catch (error) {
            logger.error('Google Drive init error', error as Error);
            reject(error);
          }
        });
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Upload document to Google Drive
   */
  async uploadDocument(
    file: File,
    type: DocumentType,
    userId: string
  ): Promise<UploadedDocument> {
    await this.initialize();
    
    try {
      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error('Файлът е твърде голям. Максимум 10MB / File too large. Max 10MB');
      }

      // Get or create folder
      const folderId = await this.getOrCreateFolder();

      // Prepare metadata
      const metadata = {
        name: file.name,
        mimeType: file.type,
        parents: [folderId],
        properties: {
          type,
          userId,
          uploadedAt: new Date().toISOString(),
          appName: 'Globul Cars',
          appVersion: '1.0'
        }
      };

      // Create form data
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      // Get token
      const token = (window as any).gapi.auth.getToken()?.access_token;
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة / No auth token');
      }

      // Upload
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime,size',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: form
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Upload failed');
      }

      const data = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Document uploaded', { name: data.name, id: data.id });
      }

      return {
        id: data.id,
        name: data.name,
        mimeType: data.mimeType,
        webViewLink: data.webViewLink,
        createdTime: data.createdTime,
        size: parseInt(data.size),
        type
      };
    } catch (error) {
      logger.error('Upload error', error as Error);
      throw error;
    }
  }

  /**
   * List user documents
   */
  async listDocuments(userId: string, type?: DocumentType): Promise<UploadedDocument[]> {
    await this.initialize();

    try {
      const folderId = await this.getOrCreateFolder();
      
      let query = `'${folderId}' in parents and trashed=false`;
      query += ` and properties has { key='userId' and value='${userId}' }`;
      
      if (type) {
        query += ` and properties has { key='type' and value='${type}' }`;
      }

      const response = await (window as any).gapi.client.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, webViewLink, createdTime, size, properties)',
        orderBy: 'createdTime desc',
        pageSize: 100
      });

      const files = response.result.files || [];
      
      return files.map((file: any) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        webViewLink: file.webViewLink,
        createdTime: file.createdTime,
        size: parseInt(file.size || '0'),
        type: file.properties?.type as DocumentType || 'other'
      }));
    } catch (error) {
      logger.error('List documents error', error as Error);
      return [];
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(fileId: string): Promise<void> {
    await this.initialize();

    try {
      await (window as any).gapi.client.drive.files.delete({
        fileId
      });
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Document deleted', { fileId });
      }
    } catch (error) {
      logger.error('Delete error', error as Error);
      throw error;
    }
  }

  /**
   * Download document
   */
  async downloadDocument(fileId: string): Promise<Blob> {
    await this.initialize();

    try {
      const token = (window as any).gapi.auth.getToken()?.access_token;
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Download failed');
      }

      return await response.blob();
    } catch (error) {
      logger.error('Download error', error as Error);
      throw error;
    }
  }

  /**
   * Get or create app folder
   */
  private async getOrCreateFolder(): Promise<string> {
    if (this.folderId) return this.folderId;

    try {
      // Search for existing folder
      const response = await (window as any).gapi.client.drive.files.list({
        q: `name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.result.files && response.result.files.length > 0) {
        this.folderId = response.result.files[0].id;
        return this.folderId!;
      }

      // Create new folder
      const createResponse = await (window as any).gapi.client.drive.files.create({
        resource: {
          name: this.FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id'
      });

      this.folderId = createResponse.result.id;
      return this.folderId!;
    } catch (error) {
      logger.error('Folder error', error as Error);
      throw error;
    }
  }

  /**
   * Get file icon based on mime type
   */
  getFileIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    return '📎';
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

export const googleDriveService = GoogleDriveService.getInstance();

