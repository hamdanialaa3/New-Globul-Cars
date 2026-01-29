// Sell Workflow State Management Hook
// Hook لإدارة حالة workflow بيع السيارة عبر جميع الخطوات

import { useState, useEffect, useCallback } from 'react';
import { logger } from '../services/logger-service';
import { WorkflowPersistenceService } from '../services/unified-workflow-persistence.service';
import { useAuth } from '../contexts/AuthProvider';
import DraftsService from '../services/drafts-service';
import { SELL_WORKFLOW_STEP_ORDER } from '../constants/sellWorkflowSteps';

export interface SellWorkflowData {
  // Vehicle Type & Seller
  vehicleType?: string;
  sellerType?: string;

  // Basic Info
  make?: string;
  model?: string;
  year?: string;
  mileage?: string;
  condition?: string;
  generation?: string;
  trim?: string;

  // Technical
  fuelType?: string;
  transmission?: string;
  power?: string;
  engineSize?: string;
  driveType?: string;
  emissionClass?: string;
  previousOwners?: string;
  hasAccidentHistory?: boolean;
  hasServiceHistory?: boolean;

  // Equipment (structured + legacy strings)
  safety?: string | string[];
  comfort?: string | string[];
  infotainment?: string | string[];
  extras?: string | string[];
  safetyEquipment?: string[];
  comfortEquipment?: string[];
  infotainmentEquipment?: string[];
  extrasEquipment?: string[];

  // Images
  images?: string;
  imagesCount?: number;
  mainImage?: string;

  // Pricing
  price?: string;
  currency?: string;
  priceType?: string;
  negotiable?: boolean | string;
  financing?: string;
  tradeIn?: string;
  warranty?: string;
  warrantyMonths?: string;
  paymentMethods?: string;
  vatDeductible?: boolean;

  // Contact
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  additionalPhone?: string;
  preferredContact?: string | string[];
  availableHours?: string;

  // Location
  city?: string;
  region?: string;
  location?: string;
  postalCode?: string;

  // Additional
  additionalInfo?: string;
  description?: string;
  notes?: string;

  // Sale Information
  saleType?: string; // 'private' | 'commercial'
  saleTimeline?: string; // 'unknown' | 'soon' | 'months'
  roadworthy?: boolean; // Roadworthy status

  // New fields for Step 2
  firstRegistration?: string;
  bodyType?: string;
  doors?: string;
  seats?: string;
  color?: string; // Internal use
  exteriorColor?: string; // API payload use
  exteriorColorOther?: string; // Custom color input
}

const STEP_INDEX_MAP: Record<string, number> = SELL_WORKFLOW_STEP_ORDER.reduce((map, id, index) => {
  map[id] = index;
  return map;
}, {} as Record<string, number>);

const loadInitialWorkflowData = (): SellWorkflowData => {
  try {
    const savedState = WorkflowPersistenceService.loadState();
    if (savedState?.data) {
      logger.info('Workflow data loaded from WorkflowPersistenceService', {
        currentStep: savedState.currentStep
      });
      return savedState.data as SellWorkflowData;
    }
  } catch (error) {
    logger.error('Error loading workflow data from WorkflowPersistenceService', error as Error);
  }
  return {};
};

export const useSellWorkflow = () => {
  const [workflowData, setWorkflowData] = useState<SellWorkflowData>(() => loadInitialWorkflowData());
  const { currentUser } = useAuth();
  const [remoteDraftId, setRemoteDraftId] = useState<string | null>(null);
  const [remoteSyncAllowed, setRemoteSyncAllowed] = useState(true);

  const resolveStepIndex = useCallback(
    (step: string | number | undefined) => {
      if (typeof step === 'number' && !Number.isNaN(step)) {
        return step;
      }
      if (!step) return 0;
      return STEP_INDEX_MAP[step] ?? 0;
    },
    []
  );

  /**
   * تحديث بيانات workflow مع حفظ فوري في WorkflowPersistenceService
   */
  const updateWorkflowData = useCallback(
    (updates: Partial<SellWorkflowData>, currentStep: string = 'vehicle-data') => {
      setWorkflowData(prev => {
        const merged = { ...prev, ...updates };
        WorkflowPersistenceService.saveState(merged, currentStep);
        return merged;
      });

      const criticalFields = ['price', 'make', 'model', 'year', 'mileage', 'mainImage'];
      const needsImmediateSave = Object.keys(updates).some(key => criticalFields.includes(key));

      if (needsImmediateSave && currentUser && remoteSyncAllowed) {
        void DraftsService.autoSaveDraft(
          currentUser.uid,
          remoteDraftId,
          { ...workflowData, ...updates },
          resolveStepIndex(currentStep)
        )
          .then(savedId => {
            if (savedId && savedId !== remoteDraftId) {
              setRemoteDraftId(savedId);
            }
          })
          .catch(error => {
            logger.warn('Immediate draft save failed', error as Error, { currentStep });
          });
      }
    },
    [currentUser, remoteDraftId, remoteSyncAllowed, resolveStepIndex, workflowData]
  );

  const clearWorkflowData = useCallback(() => {
    setWorkflowData({});
    WorkflowPersistenceService.clearState();
    setRemoteDraftId(null);
  }, []);

  const getWorkflowData = useCallback(() => workflowData, [workflowData]);

  const isStepComplete = useCallback(
    (step: string): boolean => {
      switch (step) {
        case 'vehicle-selection':
          return !!workflowData.vehicleType;
        case 'vehicle-data':
          return !!(workflowData.make && workflowData.year);
        case 'equipment':
          return !!(
            (Array.isArray(workflowData.safetyEquipment) && workflowData.safetyEquipment.length) ||
            (Array.isArray(workflowData.comfortEquipment) && workflowData.comfortEquipment.length) ||
            (Array.isArray(workflowData.infotainmentEquipment) && workflowData.infotainmentEquipment.length) ||
            (Array.isArray(workflowData.extrasEquipment) && workflowData.extrasEquipment.length)
          );
        case 'images':
          return (workflowData.imagesCount || 0) > 0;
        case 'pricing':
          return !!workflowData.price;
        case 'contact':
          return !!workflowData.sellerName;
        case 'preview':
        case 'publish':
          return false;
        default:
          return false;
      }
    },
    [workflowData]
  );

  const getCompletionPercentage = useCallback(
    (): number => WorkflowPersistenceService.getProgress(),
    []
  );

  // Initial remote sync
  useEffect(() => {
    if (!currentUser || !remoteSyncAllowed) return;

    let isMounted = true;

    const syncFromRemote = async () => {
      try {
        const drafts = await DraftsService.getUserDrafts(currentUser.uid);
        if (!isMounted || drafts.length === 0) return;

        const latest = drafts[0];
        setRemoteDraftId(latest.id);

        const remoteUpdated =
          (latest.updatedAt && 'toDate' in latest.updatedAt
            ? latest.updatedAt.toDate().getTime()
            : 0) || 0;

        const localState = WorkflowPersistenceService.loadState();
        const localUpdated = localState?.lastUpdated ?? 0;

        if (remoteUpdated > localUpdated && latest.workflowData) {
          setWorkflowData(latest.workflowData);
          WorkflowPersistenceService.saveState(
            latest.workflowData,
            localState?.currentStep || 'unknown'
          );
          logger.info('Workflow data synced from remote draft', { draftId: latest.id });
        } else if (
          localUpdated > remoteUpdated &&
          localState?.data &&
          Object.keys(localState.data).length > 0
        ) {
          const savedId = await DraftsService.autoSaveDraft(
            currentUser.uid,
            latest.id,
            localState.data as SellWorkflowData,
            resolveStepIndex(localState.currentStep)
          );
          if (savedId && isMounted) {
            setRemoteDraftId(savedId);
          }
        }
      } catch (error) {
        if ((error as any)?.code === 'permission-denied') {
          logger.warn('Remote draft sync disabled due to permission error', error as Error);
          setRemoteSyncAllowed(false);
        } else {
          logger.warn('Failed to sync workflow data from remote drafts', error as Error);
        }
      }
    };

    syncFromRemote();

    return () => {
      isMounted = false;
    };
  }, [currentUser, resolveStepIndex, remoteSyncAllowed]);

  // Push local changes to remote
  useEffect(() => {
    if (!currentUser || !remoteSyncAllowed || Object.keys(workflowData).length === 0) return;

    const timeout = setTimeout(async () => {
      try {
        const localState = WorkflowPersistenceService.loadState();
        const savedId = await DraftsService.autoSaveDraft(
          currentUser.uid,
          remoteDraftId,
          workflowData,
          resolveStepIndex(localState?.currentStep)
        );

        if (savedId && savedId !== remoteDraftId) {
          setRemoteDraftId(savedId);
        }
      } catch (error) {
        if ((error as any)?.code === 'permission-denied') {
          logger.warn('Remote draft sync disabled due to permission error', error as Error);
          setRemoteSyncAllowed(false);
        } else {
          logger.warn('Failed to sync workflow data to remote draft', error as Error);
        }
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [workflowData, currentUser, remoteDraftId, resolveStepIndex, remoteSyncAllowed]);

  // Force-save on tab close to prevent data loss
  useEffect(() => {
    if (!currentUser || !remoteSyncAllowed) return;

    const handleBeforeUnload = () => {
      if (Object.keys(workflowData).length === 0) return;
      void DraftsService.autoSaveDraft(
        currentUser.uid,
        remoteDraftId,
        workflowData,
        resolveStepIndex('publish')
      ).catch(error => logger.warn('beforeunload draft save failed', error as Error));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser, remoteDraftId, remoteSyncAllowed, resolveStepIndex, workflowData]);

  return {
    workflowData,
    updateWorkflowData,
    clearWorkflowData,
    getWorkflowData,
    isStepComplete,
    getCompletionPercentage,
    remoteDraftId,
    remoteSyncAllowed
  };
};

export default useSellWorkflow;
