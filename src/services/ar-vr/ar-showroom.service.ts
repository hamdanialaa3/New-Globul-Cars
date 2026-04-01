// src/services/ar-vr/ar-showroom.service.ts
// Engine 6: AR/VR VIP Showroom — Augmented Reality vehicle preview + 360° interior tours
// WebXR Device API integration for immersive car shopping experience

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase-config';
import { serviceLogger } from '../logger-service';

// ─── Types ───────────────────────────────────────────────────────────

export type ARSessionStatus =
  | 'initializing'
  | 'scanning_surface'
  | 'surface_found'
  | 'model_loading'
  | 'model_placed'
  | 'interactive'
  | 'error'
  | 'ended';

export type TourViewMode =
  | 'exterior_360'
  | 'interior_360'
  | 'walkthrough'
  | 'detail_zoom';

export type ModelQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface ARVehicleModel {
  id: string;
  listingId: string;
  make: string;
  model: string;
  year: number;
  modelUrl: string;
  thumbnailUrl: string;
  dimensions: VehicleDimensions;
  colorOptions: ARColorOption[];
  polyCount: number;
  fileSizeMb: number;
  quality: ModelQuality;
  isOptimizedForMobile: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleDimensions {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  wheelbaseMm: number;
}

export interface ARColorOption {
  name: string;
  nameBg: string;
  hexCode: string;
  metallic: boolean;
  textureUrl?: string;
}

export interface Tour360Config {
  id: string;
  listingId: string;
  viewMode: TourViewMode;
  imageUrls: string[];
  hotspots: TourHotspot[];
  initialViewAngle: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
}

export interface TourHotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  labelBg: string;
  description: string;
  descriptionBg: string;
  type: 'info' | 'feature' | 'damage' | 'upgrade';
  imageUrl?: string;
}

export interface ARSession {
  id: string;
  userId: string;
  listingId: string;
  modelId: string;
  status: ARSessionStatus;
  deviceType: 'ios' | 'android' | 'web';
  startedAt: Date;
  endedAt?: Date;
  interactionEvents: ARInteractionEvent[];
  screenshotsTaken: number;
  shareCount: number;
}

export interface ARInteractionEvent {
  type:
    | 'rotate'
    | 'zoom'
    | 'color_change'
    | 'open_door'
    | 'screenshot'
    | 'share'
    | 'view_interior';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ARPlacementResult {
  success: boolean;
  surfaceType: 'floor' | 'table' | 'ground' | 'unknown';
  confidence: number;
  lightEstimation: {
    ambientIntensity: number;
    ambientColorTemperature: number;
  };
}

export interface ShowroomAnalytics {
  listingId: string;
  totalARSessions: number;
  total360Tours: number;
  avgSessionDuration: number;
  screenshotsTaken: number;
  sharesGenerated: number;
  conversionToInquiry: number;
  mostViewedAngle: number;
  popularColorChanges: { color: string; count: number }[];
}

// ─── Constants ───────────────────────────────────────────────────────

const COLLECTIONS = {
  AR_MODELS: 'ar_vehicle_models',
  TOURS_360: 'tours_360',
  AR_SESSIONS: 'ar_sessions',
  SHOWROOM_ANALYTICS: 'showroom_analytics',
} as const;

const STORAGE_PATHS = {
  MODELS: 'ar-models',
  TOUR_IMAGES: 'tour-360-images',
  SCREENSHOTS: 'ar-screenshots',
} as const;

const AR_CONFIG = {
  MAX_MODEL_SIZE_MB: 50,
  MOBILE_MAX_MODEL_SIZE_MB: 25,
  SUPPORTED_FORMATS: ['.glb', '.gltf', '.usdz'] as const,
  DEFAULT_SCALE: 1.0,
  MIN_SURFACE_CONFIDENCE: 0.7,
  SESSION_TIMEOUT_MINUTES: 30,
  MAX_SCREENSHOTS_PER_SESSION: 10,
  TOUR_360_MIN_FRAMES: 36,
  TOUR_360_MAX_FRAMES: 72,
  AUTO_ROTATE_SPEED_DPS: 15,
} as const;

const GENERIC_MODELS: Record<
  string,
  { modelPath: string; dimensions: VehicleDimensions }
> = {
  sedan: {
    modelPath: `${STORAGE_PATHS.MODELS}/generic/sedan.glb`,
    dimensions: {
      lengthMm: 4700,
      widthMm: 1800,
      heightMm: 1450,
      wheelbaseMm: 2700,
    },
  },
  suv: {
    modelPath: `${STORAGE_PATHS.MODELS}/generic/suv.glb`,
    dimensions: {
      lengthMm: 4600,
      widthMm: 1900,
      heightMm: 1700,
      wheelbaseMm: 2650,
    },
  },
  hatchback: {
    modelPath: `${STORAGE_PATHS.MODELS}/generic/hatchback.glb`,
    dimensions: {
      lengthMm: 4100,
      widthMm: 1770,
      heightMm: 1450,
      wheelbaseMm: 2550,
    },
  },
  coupe: {
    modelPath: `${STORAGE_PATHS.MODELS}/generic/coupe.glb`,
    dimensions: {
      lengthMm: 4500,
      widthMm: 1850,
      heightMm: 1350,
      wheelbaseMm: 2700,
    },
  },
  wagon: {
    modelPath: `${STORAGE_PATHS.MODELS}/generic/wagon.glb`,
    dimensions: {
      lengthMm: 4800,
      widthMm: 1820,
      heightMm: 1500,
      wheelbaseMm: 2790,
    },
  },
  van: {
    modelPath: `${STORAGE_PATHS.MODELS}/generic/van.glb`,
    dimensions: {
      lengthMm: 5100,
      widthMm: 1950,
      heightMm: 1950,
      wheelbaseMm: 3000,
    },
  },
  pickup: {
    modelPath: `${STORAGE_PATHS.MODELS}/generic/pickup.glb`,
    dimensions: {
      lengthMm: 5300,
      widthMm: 1920,
      heightMm: 1800,
      wheelbaseMm: 3100,
    },
  },
} as const;

// ─── Service ─────────────────────────────────────────────────────────

export const ARShowroomService = {
  // ─── AR Model Management ────────────────────────────────────────

  async getARModel(listingId: string): Promise<ARVehicleModel | null> {
    try {
      const modelsRef = collection(db, COLLECTIONS.AR_MODELS);
      const q = query(modelsRef, where('listingId', '==', listingId), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        serviceLogger.info('AR: No model found for listing', { listingId });
        return null;
      }

      const docData = snapshot.docs[0].data();
      return {
        id: snapshot.docs[0].id,
        ...docData,
        createdAt: docData.createdAt?.toDate?.() ?? new Date(),
        updatedAt: docData.updatedAt?.toDate?.() ?? new Date(),
      } as ARVehicleModel;
    } catch (error) {
      serviceLogger.error('AR: Failed to fetch model', error as Error, {
        listingId,
      });
      return null;
    }
  },

  async getGenericModel(
    bodyType: string
  ): Promise<{ modelUrl: string; dimensions: VehicleDimensions } | null> {
    const normalized = bodyType.toLowerCase().replace(/[\s-]/g, '');
    const match = GENERIC_MODELS[normalized] ?? GENERIC_MODELS['sedan'];

    try {
      const modelRef = ref(storage, match.modelPath);
      const modelUrl = await getDownloadURL(modelRef);
      return { modelUrl, dimensions: match.dimensions };
    } catch (error) {
      serviceLogger.warn('AR: Generic model not available', { bodyType });
      return null;
    }
  },

  // ─── 360° Tour Management ──────────────────────────────────────

  async get360Tour(listingId: string): Promise<Tour360Config | null> {
    try {
      const toursRef = collection(db, COLLECTIONS.TOURS_360);
      const q = query(toursRef, where('listingId', '==', listingId), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      } as Tour360Config;
    } catch (error) {
      serviceLogger.error('AR: Failed to fetch 360 tour', error as Error, {
        listingId,
      });
      return null;
    }
  },

  async generate360TourFromImages(
    listingId: string,
    imageUrls: string[],
    hotspots: TourHotspot[] = []
  ): Promise<Tour360Config | null> {
    if (imageUrls.length < AR_CONFIG.TOUR_360_MIN_FRAMES) {
      serviceLogger.warn('AR: Not enough images for 360 tour', {
        required: AR_CONFIG.TOUR_360_MIN_FRAMES,
        provided: imageUrls.length,
      });
      return null;
    }

    const frames = imageUrls.slice(0, AR_CONFIG.TOUR_360_MAX_FRAMES);

    try {
      const tourConfig: Omit<Tour360Config, 'id'> = {
        listingId,
        viewMode: 'exterior_360',
        imageUrls: frames,
        hotspots,
        initialViewAngle: 0,
        autoRotate: true,
        autoRotateSpeed: AR_CONFIG.AUTO_ROTATE_SPEED_DPS,
      };

      const tourRef = doc(collection(db, COLLECTIONS.TOURS_360));
      await setDoc(tourRef, { ...tourConfig, createdAt: serverTimestamp() });

      serviceLogger.info('AR: 360 tour created', {
        listingId,
        frames: frames.length,
        hotspots: hotspots.length,
      });

      return { id: tourRef.id, ...tourConfig };
    } catch (error) {
      serviceLogger.error('AR: Failed to create 360 tour', error as Error, {
        listingId,
      });
      return null;
    }
  },

  // ─── AR Session Tracking ──────────────────────────────────────

  async startARSession(
    userId: string,
    listingId: string,
    modelId: string,
    deviceType: 'ios' | 'android' | 'web'
  ): Promise<string | null> {
    try {
      const session: Omit<ARSession, 'id'> = {
        userId,
        listingId,
        modelId,
        status: 'initializing',
        deviceType,
        startedAt: new Date(),
        interactionEvents: [],
        screenshotsTaken: 0,
        shareCount: 0,
      };

      const sessionRef = doc(collection(db, COLLECTIONS.AR_SESSIONS));
      await setDoc(sessionRef, { ...session, startedAt: serverTimestamp() });

      serviceLogger.info('AR: Session started', {
        sessionId: sessionRef.id,
        listingId,
        deviceType,
      });

      return sessionRef.id;
    } catch (error) {
      serviceLogger.error('AR: Failed to start session', error as Error, {
        listingId,
      });
      return null;
    }
  },

  async updateSessionStatus(
    sessionId: string,
    status: ARSessionStatus
  ): Promise<void> {
    try {
      const sessionRef = doc(db, COLLECTIONS.AR_SESSIONS, sessionId);
      const updateData: Record<string, unknown> = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (status === 'ended') {
        updateData.endedAt = serverTimestamp();
      }

      await updateDoc(sessionRef, updateData);
    } catch (error) {
      serviceLogger.error('AR: Failed to update session', error as Error, {
        sessionId,
      });
    }
  },

  async recordInteraction(
    sessionId: string,
    event: Omit<ARInteractionEvent, 'timestamp'>
  ): Promise<void> {
    try {
      const sessionRef = doc(db, COLLECTIONS.AR_SESSIONS, sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) return;

      const data = sessionSnap.data();
      const events = data.interactionEvents ?? [];
      events.push({ ...event, timestamp: new Date() });

      const updates: Record<string, unknown> = {
        interactionEvents: events,
        updatedAt: serverTimestamp(),
      };

      if (event.type === 'screenshot') {
        updates.screenshotsTaken = (data.screenshotsTaken ?? 0) + 1;
      }
      if (event.type === 'share') {
        updates.shareCount = (data.shareCount ?? 0) + 1;
      }

      await updateDoc(sessionRef, updates);
    } catch (error) {
      serviceLogger.error('AR: Failed to record interaction', error as Error, {
        sessionId,
      });
    }
  },

  // ─── AR Surface Detection Config ──────────────────────────────

  getARPlacementConfig() {
    return {
      minSurfaceConfidence: AR_CONFIG.MIN_SURFACE_CONFIDENCE,
      defaultScale: AR_CONFIG.DEFAULT_SCALE,
      sessionTimeoutMs: AR_CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000,
      maxScreenshots: AR_CONFIG.MAX_SCREENSHOTS_PER_SESSION,
      supportedFormats: [...AR_CONFIG.SUPPORTED_FORMATS],
    };
  },

  validatePlacement(result: ARPlacementResult): {
    valid: boolean;
    reason?: string;
  } {
    if (!result.success) {
      return { valid: false, reason: 'Surface detection failed' };
    }
    if (result.confidence < AR_CONFIG.MIN_SURFACE_CONFIDENCE) {
      return {
        valid: false,
        reason: `Surface confidence too low (${(result.confidence * 100).toFixed(0)}%). Move to a flat, well-lit area.`,
      };
    }
    if (result.surfaceType === 'unknown') {
      return {
        valid: false,
        reason: 'Unknown surface type. Try a larger flat surface.',
      };
    }
    return { valid: true };
  },

  // ─── Model Quality Selection ──────────────────────────────────

  getOptimalQuality(params: {
    isMobile: boolean;
    connectionType?: string;
    deviceMemoryGb?: number;
  }): ModelQuality {
    const { isMobile, connectionType, deviceMemoryGb } = params;

    if (isMobile) {
      if (deviceMemoryGb && deviceMemoryGb < 3) return 'low';
      if (connectionType === '2g' || connectionType === 'slow-2g') return 'low';
      if (connectionType === '3g') return 'medium';
      return 'medium';
    }

    if (deviceMemoryGb && deviceMemoryGb >= 8) return 'ultra';
    if (deviceMemoryGb && deviceMemoryGb >= 4) return 'high';
    return 'medium';
  },

  getMaxModelSize(quality: ModelQuality, isMobile: boolean): number {
    const baseMax = isMobile
      ? AR_CONFIG.MOBILE_MAX_MODEL_SIZE_MB
      : AR_CONFIG.MAX_MODEL_SIZE_MB;
    const qualityMultiplier: Record<ModelQuality, number> = {
      low: 0.3,
      medium: 0.6,
      high: 0.85,
      ultra: 1.0,
    };
    return baseMax * qualityMultiplier[quality];
  },

  // ─── Analytics ─────────────────────────────────────────────────

  async getShowroomAnalytics(
    listingId: string
  ): Promise<ShowroomAnalytics | null> {
    try {
      const analyticsRef = doc(db, COLLECTIONS.SHOWROOM_ANALYTICS, listingId);
      const snap = await getDoc(analyticsRef);

      if (!snap.exists()) {
        return {
          listingId,
          totalARSessions: 0,
          total360Tours: 0,
          avgSessionDuration: 0,
          screenshotsTaken: 0,
          sharesGenerated: 0,
          conversionToInquiry: 0,
          mostViewedAngle: 0,
          popularColorChanges: [],
        };
      }

      return snap.data() as ShowroomAnalytics;
    } catch (error) {
      serviceLogger.error('AR: Failed to fetch analytics', error as Error, {
        listingId,
      });
      return null;
    }
  },

  async updateAnalyticsFromSession(sessionId: string): Promise<void> {
    try {
      const sessionRef = doc(db, COLLECTIONS.AR_SESSIONS, sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) return;

      const session = sessionSnap.data() as ARSession;
      const analyticsRef = doc(
        db,
        COLLECTIONS.SHOWROOM_ANALYTICS,
        session.listingId
      );
      const analyticsSnap = await getDoc(analyticsRef);

      const durationSec = session.endedAt
        ? (new Date(session.endedAt as unknown as string).getTime() -
            new Date(session.startedAt as unknown as string).getTime()) /
          1000
        : 0;

      if (!analyticsSnap.exists()) {
        await setDoc(analyticsRef, {
          listingId: session.listingId,
          totalARSessions: 1,
          total360Tours: 0,
          avgSessionDuration: durationSec,
          screenshotsTaken: session.screenshotsTaken,
          sharesGenerated: session.shareCount,
          conversionToInquiry: 0,
          mostViewedAngle: 0,
          popularColorChanges: [],
          updatedAt: serverTimestamp(),
        });
      } else {
        const existing = analyticsSnap.data() as ShowroomAnalytics;
        const newTotal = existing.totalARSessions + 1;
        const newAvgDuration =
          (existing.avgSessionDuration * existing.totalARSessions +
            durationSec) /
          newTotal;

        await updateDoc(analyticsRef, {
          totalARSessions: newTotal,
          avgSessionDuration: Math.round(newAvgDuration),
          screenshotsTaken:
            existing.screenshotsTaken + session.screenshotsTaken,
          sharesGenerated: existing.sharesGenerated + session.shareCount,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      serviceLogger.error('AR: Failed to update analytics', error as Error, {
        sessionId,
      });
    }
  },

  // ─── WebXR Support Check ──────────────────────────────────────

  async checkARSupport(): Promise<{
    webxr: boolean;
    arcore: boolean;
    arkit: boolean;
    fallback360: boolean;
  }> {
    const result = {
      webxr: false,
      arcore: false,
      arkit: false,
      fallback360: true,
    };

    if (typeof navigator === 'undefined') return result;

    if ('xr' in navigator) {
      try {
        const xr = (
          navigator as {
            xr: { isSessionSupported: (mode: string) => Promise<boolean> };
          }
        ).xr;
        result.webxr = await xr.isSessionSupported('immersive-ar');
      } catch {
        result.webxr = false;
      }
    }

    const ua = navigator.userAgent.toLowerCase();
    result.arcore = /android/i.test(ua);
    result.arkit = /iphone|ipad|ipod/i.test(ua);

    return result;
  },

  // ─── Listing Image to 360° Tour Helper ────────────────────────

  async getListingImagesFor360(listingId: string): Promise<string[]> {
    try {
      const storageRef = ref(
        storage,
        `${STORAGE_PATHS.TOUR_IMAGES}/${listingId}`
      );
      const result = await listAll(storageRef);

      const urls = await Promise.all(
        result.items.map(item => getDownloadURL(item))
      );

      return urls.sort();
    } catch {
      serviceLogger.warn('AR: No 360 images found', { listingId });
      return [];
    }
  },
};

export default ARShowroomService;
