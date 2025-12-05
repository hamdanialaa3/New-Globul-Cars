/**
 * Intro Video Service
 * Manages user introduction videos
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-wrapper';
import type { IntroVideo } from '../../types/profile-enhancements.types';

export class IntroVideoService {
  private static instance: IntroVideoService;
  private readonly collectionName = 'introVideos';
  private readonly storagePath = 'intro-videos';

  private constructor() {}

  public static getInstance(): IntroVideoService {
    if (!IntroVideoService.instance) {
      IntroVideoService.instance = new IntroVideoService();
    }
    return IntroVideoService.instance;
  }

  /**
   * Get user's intro video
   */
  async getVideo(userId: string): Promise<IntroVideo | null> {
    try {
      if (!userId) return null;

      const videoRef = doc(db, this.collectionName, userId);
      const videoSnap = await getDoc(videoRef);

      if (!videoSnap.exists()) {
        return null;
      }

      return videoSnap.data() as IntroVideo;
    } catch (error) {
      serviceLogger.error('Error getting intro video:', error);
      return null;
    }
  }

  /**
   * Upload intro video
   */
  async uploadVideo(
    userId: string,
    videoFile: File,
    thumbnailFile?: File
  ): Promise<{ videoUrl: string; thumbnailUrl?: string }> {
    try {
      if (!userId || !videoFile) {
        throw new Error('Invalid userId or videoFile');
      }

      // Upload video
      const videoRef = ref(storage, `${this.storagePath}/${userId}/${Date.now()}_${videoFile.name}`);
      await uploadBytes(videoRef, videoFile);
      const videoUrl = await getDownloadURL(videoRef);

      // Upload thumbnail if provided
      let thumbnailUrl: string | undefined;
      if (thumbnailFile) {
        const thumbnailRef = ref(storage, `${this.storagePath}/${userId}/thumbnails/${Date.now()}_${thumbnailFile.name}`);
        await uploadBytes(thumbnailRef, thumbnailFile);
        thumbnailUrl = await getDownloadURL(thumbnailRef);
      }

      return { videoUrl, thumbnailUrl };
    } catch (error) {
      serviceLogger.error('Error uploading video:', error);
      throw error;
    }
  }

  /**
   * Save intro video metadata
   */
  async saveVideo(
    userId: string,
    videoData: {
      videoUrl: string;
      thumbnailUrl?: string;
      duration?: number;
      isPublic?: boolean;
    }
  ): Promise<void> {
    try {
      if (!userId) {
        throw new Error('Invalid userId');
      }

      const videoRef = doc(db, this.collectionName, userId);
      const existing = await this.getVideo(userId);

      const video: IntroVideo = {
        userId,
        videoUrl: videoData.videoUrl,
        thumbnailUrl: videoData.thumbnailUrl,
        duration: videoData.duration,
        isPublic: videoData.isPublic ?? true,
        views: existing?.views || 0,
        uploadedAt: existing?.uploadedAt || (serverTimestamp() as any),
        updatedAt: serverTimestamp() as any
      };

      await setDoc(videoRef, video, { merge: true });
      serviceLogger.info(`Intro video saved for user: ${userId}`);
    } catch (error) {
      serviceLogger.error('Error saving video:', error);
      throw error;
    }
  }

  /**
   * Delete intro video
   */
  async deleteVideo(userId: string): Promise<void> {
    try {
      if (!userId) return;

      const video = await this.getVideo(userId);
      if (!video) {
        return;
      }

      // Delete from Storage
      try {
        const videoRef = ref(storage, video.videoUrl);
        await deleteObject(videoRef);

        if (video.thumbnailUrl) {
          const thumbnailRef = ref(storage, video.thumbnailUrl);
          await deleteObject(thumbnailRef);
        }
      } catch (storageError) {
        serviceLogger.warn('Error deleting video from storage:', storageError);
      }

      // Delete from Firestore
      const videoRef = doc(db, this.collectionName, userId);
      await deleteDoc(videoRef);

      serviceLogger.info(`Intro video deleted for user: ${userId}`);
    } catch (error) {
      serviceLogger.error('Error deleting video:', error);
      throw error;
    }
  }

  /**
   * Increment video views
   */
  async incrementViews(userId: string): Promise<void> {
    try {
      if (!userId) return;

      const videoRef = doc(db, this.collectionName, userId);
      await updateDoc(videoRef, {
        views: increment(1)
      });
    } catch (error) {
      serviceLogger.error('Error incrementing views:', error);
    }
  }

  /**
   * Update video visibility
   */
  async updateVisibility(userId: string, isPublic: boolean): Promise<void> {
    try {
      if (!userId) return;

      const videoRef = doc(db, this.collectionName, userId);
      await updateDoc(videoRef, {
        isPublic,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      serviceLogger.error('Error updating visibility:', error);
      throw error;
    }
  }
}

export const introVideoService = IntroVideoService.getInstance();

