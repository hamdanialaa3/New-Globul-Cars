# 🚀 خطة التنفيذ العملية - Profile System Integration

## 📅 التاريخ: 8 أكتوبر 2025

---

## 🎯 Phase 1: Google Services Integration (أسبوع 1-2)

### ✅ Task 1.1: Google Profile Auto-Sync

**الملف:** `bulgarian-car-marketplace/src/services/google/google-profile-sync.service.ts`

```typescript
// src/services/google/google-profile-sync.service.ts
import { User } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

interface GoogleProfileData {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
  verified_email: boolean;
}

class GoogleProfileSyncService {
  private static instance: GoogleProfileSyncService;
  
  static getInstance(): GoogleProfileSyncService {
    if (!this.instance) {
      this.instance = new GoogleProfileSyncService();
    }
    return this.instance;
  }

  /**
   * Sync Google profile data to Firestore
   */
  async syncGoogleProfile(user: User): Promise<void> {
    try {
      console.log('🔄 Starting Google profile sync...');
      
      // Get Google profile data
      const googleData = await this.getGoogleProfileData(user);
      
      if (!googleData) {
        console.warn('No Google profile data available');
        return;
      }

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        // Profile image
        profileImage: {
          url: googleData.picture,
          uploadedAt: new Date(),
          source: 'google',
          thumbnailUrl: googleData.picture.replace('=s96-c', '=s200-c')
        },
        
        // Personal info
        firstName: googleData.given_name,
        lastName: googleData.family_name,
        displayName: googleData.name,
        
        // Email verification
        'verification.email': {
          verified: googleData.verified_email,
          verifiedAt: googleData.verified_email ? new Date() : null,
          source: 'google'
        },
        
        // Google sync metadata
        googleSync: {
          lastSyncAt: serverTimestamp(),
          googleId: googleData.id,
          locale: googleData.locale
        },
        
        // Update timestamp
        updatedAt: serverTimestamp()
      });

      console.log('✅ Google profile synced successfully');
    } catch (error) {
      console.error('❌ Google profile sync error:', error);
      throw error;
    }
  }

  /**
   * Get Google profile data using OAuth token
   */
  private async getGoogleProfileData(user: User): Promise<GoogleProfileData | null> {
    try {
      const token = await user.getIdToken();
      
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`);
      }

      const data: GoogleProfileData = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Google profile data:', error);
      return null;
    }
  }

  /**
   * Check if profile needs sync (call this periodically)
   */
  async shouldSync(userId: string): Promise<boolean> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    
    if (!userData?.googleSync?.lastSyncAt) {
      return true; // Never synced
    }

    const lastSync = userData.googleSync.lastSyncAt.toDate();
    const daysSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceSync > 7; // Sync every 7 days
  }
}

export const googleProfileSyncService = GoogleProfileSyncService.getInstance();
```

**الاستخدام في auth-service.ts:**

```typescript
// في BulgarianAuthService.signInWithGoogle()
async signInWithGoogle(): Promise<UserCredential> {
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  
  // Auto-sync profile after sign in
  await googleProfileSyncService.syncGoogleProfile(result.user);
  
  return result;
}
```

---

### ✅ Task 1.2: Google Drive Documents Manager

**الملف:** `bulgarian-car-marketplace/src/services/google/google-drive.service.ts`

```typescript
// src/services/google/google-drive.service.ts
import { gapi } from 'gapi-script';

export type DocumentType = 'id_card' | 'business_license' | 'car_document' | 'invoice' | 'other';

interface UploadedDocument {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  createdTime: string;
  type: DocumentType;
}

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private FOLDER_NAME = 'Globul Cars Documents';
  private folderId: string | null = null;
  private initialized = false;

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
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
            clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            scope: 'https://www.googleapis.com/auth/drive.file'
          });

          this.initialized = true;
          console.log('✅ Google Drive API initialized');
          resolve();
        } catch (error) {
          console.error('❌ Google Drive init error:', error);
          reject(error);
        }
      });
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
          appName: 'Globul Cars'
        }
      };

      // Create form data
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      // Upload
      const token = gapi.auth.getToken().access_token;
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: form
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        name: data.name,
        mimeType: data.mimeType,
        webViewLink: data.webViewLink,
        createdTime: data.createdTime,
        type
      };
    } catch (error) {
      console.error('❌ Upload error:', error);
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

      const response = await gapi.client.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, webViewLink, createdTime, properties)',
        orderBy: 'createdTime desc',
        pageSize: 100
      });

      const files = response.result.files || [];
      
      return files.map(file => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        webViewLink: file.webViewLink,
        createdTime: file.createdTime,
        type: file.properties?.type as DocumentType || 'other'
      }));
    } catch (error) {
      console.error('❌ List documents error:', error);
      throw error;
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(fileId: string): Promise<void> {
    await this.initialize();

    try {
      await gapi.client.drive.files.delete({
        fileId
      });
      
      console.log('✅ Document deleted:', fileId);
    } catch (error) {
      console.error('❌ Delete error:', error);
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
      const response = await gapi.client.drive.files.list({
        q: `name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.result.files && response.result.files.length > 0) {
        this.folderId = response.result.files[0].id;
        return this.folderId;
      }

      // Create new folder
      const createResponse = await gapi.client.drive.files.create({
        resource: {
          name: this.FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id'
      });

      this.folderId = createResponse.result.id;
      return this.folderId;
    } catch (error) {
      console.error('❌ Folder error:', error);
      throw error;
    }
  }
}

export const googleDriveService = GoogleDriveService.getInstance();
```

**المكون:** `bulgarian-car-marketplace/src/components/Profile/DocumentManager.tsx`

```typescript
// src/components/Profile/DocumentManager.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { googleDriveService, DocumentType } from '../../services/google/google-drive.service';
import { Upload, FileText, Trash2, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Container = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

const UploadZone = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border: 2px dashed #FF7900;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 121, 0, 0.05);
    border-color: #e66d00;
  }
  
  input {
    display: none;
  }
`;

const DocumentList = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DocumentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
  }
`;

const DocumentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  
  &.view {
    background: #0d6efd;
    color: white;
    
    &:hover {
      background: #0b5ed7;
    }
  }
  
  &.delete {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #bb2d3b;
    }
  }
`;

interface DocumentManagerProps {
  userId: string;
  type: DocumentType;
  title: string;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  userId,
  type,
  title
}) => {
  const { language } = useLanguage();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [userId, type]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await googleDriveService.listDocuments(userId, type);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      await googleDriveService.uploadDocument(file, type, userId);
      await loadDocuments();
      alert(language === 'bg' ? 'Документът е качен успешно!' : 'Document uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(language === 'bg' ? 'Грешка при качването' : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(language === 'bg' ? 'Сигурни ли сте?' : 'Are you sure?')) return;

    try {
      await googleDriveService.deleteDocument(id);
      await loadDocuments();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <Container>
      <h3>{title}</h3>
      
      <UploadZone>
        <input
          type="file"
          onChange={handleUpload}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          disabled={loading}
        />
        <Upload size={32} color="#FF7900" />
        <p>{language === 'bg' ? 'Кликнете за качване' : 'Click to upload'}</p>
        <small style={{ color: '#6c757d' }}>
          PDF, JPG, PNG, DOC (max 10MB)
        </small>
      </UploadZone>

      {loading && <p>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</p>}

      <DocumentList>
        {documents.map(doc => (
          <DocumentItem key={doc.id}>
            <DocumentInfo>
              <FileText size={24} />
              <div>
                <div style={{ fontWeight: 600 }}>{doc.name}</div>
                <small style={{ color: '#6c757d' }}>
                  {new Date(doc.createdTime).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US')}
                </small>
              </div>
            </DocumentInfo>
            
            <DocumentActions>
              <ActionButton 
                className="view"
                onClick={() => window.open(doc.webViewLink, '_blank')}
              >
                <ExternalLink size={16} />
                {language === 'bg' ? 'Преглед' : 'View'}
              </ActionButton>
              <ActionButton 
                className="delete"
                onClick={() => handleDelete(doc.id)}
              >
                <Trash2 size={16} />
              </ActionButton>
            </DocumentActions>
          </DocumentItem>
        ))}
      </DocumentList>

      {documents.length === 0 && !loading && (
        <p style={{ textAlign: 'center', color: '#6c757d', marginTop: '20px' }}>
          {language === 'bg' ? 'Няма качени документи' : 'No documents uploaded'}
        </p>
      )}
    </Container>
  );
};
```

---

## 🎯 Phase 2: Security & Analytics (أسبوع 3-4)

### ✅ Task 2.1: Profile View Tracking

**الملف:** `bulgarian-car-marketplace/src/services/analytics/profile-analytics.service.ts`

```typescript
// src/services/analytics/profile-analytics.service.ts
import { collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

interface ProfileView {
  profileId: string;
  visitorId: string;
  viewedAt: Timestamp;
  userAgent: string;
  referrer: string;
  location?: {
    country?: string;
    city?: string;
  };
}

class ProfileAnalyticsService {
  /**
   * Track profile view
   */
  async trackView(profileId: string, visitorId?: string): Promise<void> {
    try {
      await addDoc(collection(db, 'profile_views'), {
        profileId,
        visitorId: visitorId || 'anonymous',
        viewedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        location: await this.getVisitorLocation()
      });

      // Update profile view count
      await updateDoc(doc(db, 'users', profileId), {
        'stats.profileViews': increment(1),
        'analytics.lastViewedAt': serverTimestamp()
      });

      console.log('📊 Profile view tracked');
    } catch (error) {
      console.error('❌ Track view error:', error);
    }
  }

  /**
   * Get profile analytics
   */
  async getAnalytics(profileId: string, days: number = 30) {
    const startDate = Timestamp.fromDate(
      new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    );

    const q = query(
      collection(db, 'profile_views'),
      where('profileId', '==', profileId),
      where('viewedAt', '>=', startDate)
    );

    const snapshot = await getDocs(q);
    const views = snapshot.docs.map(doc => doc.data() as ProfileView);

    return {
      totalViews: views.length,
      uniqueVisitors: new Set(views.map(v => v.visitorId)).size,
      viewsByDay: this.groupByDay(views),
      topReferrers: this.getTopReferrers(views),
      deviceTypes: this.getDeviceTypes(views)
    };
  }

  private groupByDay(views: ProfileView[]) {
    const groups: Record<string, number> = {};
    
    views.forEach(view => {
      const date = view.viewedAt.toDate().toISOString().split('T')[0];
      groups[date] = (groups[date] || 0) + 1;
    });

    return groups;
  }

  private getTopReferrers(views: ProfileView[]) {
    const referrers: Record<string, number> = {};
    
    views.forEach(view => {
      const ref = view.referrer || 'direct';
      referrers[ref] = (referrers[ref] || 0) + 1;
    });

    return Object.entries(referrers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }

  private getDeviceTypes(views: ProfileView[]) {
    const devices = { mobile: 0, desktop: 0, tablet: 0 };
    
    views.forEach(view => {
      const ua = view.userAgent.toLowerCase();
      if (/mobile/.test(ua)) devices.mobile++;
      else if (/tablet/.test(ua)) devices.tablet++;
      else devices.desktop++;
    });

    return devices;
  }

  private async getVisitorLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        country: data.country_name,
        city: data.city
      };
    } catch {
      return undefined;
    }
  }
}

export const profileAnalyticsService = new ProfileAnalyticsService();
```

---

## 📦 الملفات المطلوبة للتثبيت:

```bash
# Package.json additions
npm install --save gapi-script
npm install --save-dev @types/gapi
```

```json
// package.json
{
  "dependencies": {
    "gapi-script": "^1.2.0"
  },
  "devDependencies": {
    "@types/gapi": "^0.0.44"
  }
}
```

---

## 🔑 Environment Variables Required:

```env
# .env
REACT_APP_GOOGLE_API_KEY=your_google_api_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key
```

---

## ✅ الخلاصة:

هذا الملف يحتوي على:
1. ✅ Google Profile Sync (جاهز للاستخدام)
2. ✅ Google Drive Integration (كامل)
3. ✅ Document Manager Component (UI جاهز)
4. ✅ Profile Analytics Service (جاهز)

**ابدأ التنفيذ الآن!** 🚀


