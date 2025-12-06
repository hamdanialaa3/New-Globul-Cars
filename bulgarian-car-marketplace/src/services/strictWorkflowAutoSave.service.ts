/**
 * Strict Workflow Auto-Save Service
 * خدمة الحفظ التلقائي الصارمة لسير عمل البيع
 * 
 * CRITICAL RULES - قواعد صارمة:
 * 1. Auto-save EVERYTHING the user touches - حفظ كل شيء يلمسه المستخدم
 * 2. 500 seconds (8.33 minutes) timeout - مؤقت 500 ثانية بالضبط
 * 3. Auto-clear after timeout if NOT published - حذف تلقائي بعد المؤقت إذا لم يُنشر
 * 4. Zero tolerance for data loss - صفر تسامح مع فقدان البيانات
 * 5. Millisecond precision - دقة بالميلي ثانية
 */

import { serviceLogger } from './logger-wrapper';
import SellWorkflowStepStateService from './sellWorkflowStepState';

// ============================================================
// CONSTANTS - الثوابت
// ============================================================

const STORAGE_KEY = 'globul_strict_workflow_autosave';
const TIMER_KEY = 'globul_strict_workflow_timer';
const PUBLISHED_FLAG_KEY = 'globul_strict_workflow_published';

// CRITICAL: Exactly 500 seconds = 500000 milliseconds
const AUTO_DELETE_TIMEOUT = 500 * 1000; // 500 ثانية بالضبط

// Check interval: every 5 seconds
const CHECK_INTERVAL = 5 * 1000;

// ============================================================
// INTERFACES - الواجهات
// ============================================================

export interface StrictWorkflowData {
  // Page 1: Vehicle Selection
  vehicleType?: string;
  
  // Page 2: Vehicle Data
  make?: string;
  model?: string;
  year?: string;
  firstRegistration?: string;
  mileage?: string;
  fuelType?: string;
  fuelTypeOther?: string;
  transmission?: string;
  power?: string;
  color?: string;
  colorOther?: string;
  doors?: string;
  roadworthy?: boolean;
  saleType?: string;
  saleTimeline?: string;
  saleProvince?: string;
  saleCity?: string;
  salePostalCode?: string;
  
  // Page 3: Equipment
  equipment?: {
    safety?: string[];
    comfort?: string[];
    infotainment?: string[];
    extras?: string[];
  };
  
  // Page 4: Images
  images?: string[]; // base64 encoded
  imageDescriptions?: Record<string, string>;
  
  // Page 5: Pricing
  price?: string;
  priceNegotiable?: boolean;
  vatDeductible?: boolean;
  
  // Page 6: Contact (if needed)
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  
  // Metadata
  lastModified: number;
  createdAt: number;
  currentPage: string;
  touchedFields: string[];
}

export interface StrictTimerState {
  startTime: number;
  expiryTime: number;
  remainingSeconds: number;
  isActive: boolean;
}

// ============================================================
// TIMER MANAGEMENT - إدارة المؤقت
// ============================================================

let timerInterval: NodeJS.Timeout | null = null;
let listeners: Set<(state: StrictTimerState) => void> = new Set();

/**
 * Start the strict 500-second timer
 * بدء المؤقت الصارم لـ 500 ثانية
 */
function startTimer(): void {
  const now = Date.now();
  const expiryTime = now + AUTO_DELETE_TIMEOUT;
  
  const timerState: StrictTimerState = {
    startTime: now,
    expiryTime,
    remainingSeconds: 500,
    isActive: true
  };
  
  localStorage.setItem(TIMER_KEY, JSON.stringify(timerState));
  serviceLogger.info('[StrictAutoSave] Timer started', {
    startTime: new Date(now).toISOString(),
    expiryTime: new Date(expiryTime).toISOString(),
    timeout: AUTO_DELETE_TIMEOUT
  });
  
  notifyListeners();
}

/**
 * Reset timer (restart from 500 seconds)
 * إعادة تعيين المؤقت (إعادة البدء من 500 ثانية)
 */
function resetTimer(): void {
  stopTimer();
  startTimer();
  serviceLogger.info('[StrictAutoSave] Timer reset to 500 seconds');
}

/**
 * Stop timer
 * إيقاف المؤقت
 */
function stopTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  const timerState: StrictTimerState = {
    startTime: 0,
    expiryTime: 0,
    remainingSeconds: 0,
    isActive: false
  };
  
  localStorage.setItem(TIMER_KEY, JSON.stringify(timerState));
  notifyListeners();
}

/**
 * Get current timer state
 * الحصول على حالة المؤقت الحالية
 */
function getTimerState(): StrictTimerState {
  try {
    const saved = localStorage.getItem(TIMER_KEY);
    if (!saved) {
      return {
        startTime: 0,
        expiryTime: 0,
        remainingSeconds: 0,
        isActive: false
      };
    }
    
    const state: StrictTimerState = JSON.parse(saved);
    
    if (!state.isActive) {
      return state;
    }
    
    const now = Date.now();
    const remaining = Math.max(0, state.expiryTime - now);
    
    return {
      ...state,
      remainingSeconds: Math.ceil(remaining / 1000)
    };
  } catch (error) {
    serviceLogger.error('[StrictAutoSave] Error getting timer state', error as Error);
    return {
      startTime: 0,
      expiryTime: 0,
      remainingSeconds: 0,
      isActive: false
    };
  }
}

/**
 * Check if timer expired and auto-delete if needed
 * التحقق من انتهاء المؤقت والحذف التلقائي إذا لزم الأمر
 */
function checkTimerExpiry(): void {
  const state = getTimerState();
  
  if (!state.isActive) {
    return;
  }
  
  const now = Date.now();
  
  if (now >= state.expiryTime) {
    // Timer expired!
    const isPublished = isDataPublished();
    
    if (!isPublished) {
      // CRITICAL: Auto-delete everything
      serviceLogger.warn('[StrictAutoSave] Timer expired! Auto-deleting all data', {
        expiryTime: new Date(state.expiryTime).toISOString(),
        currentTime: new Date(now).toISOString()
      });
      
      clearAllData();
    } else {
      serviceLogger.info('[StrictAutoSave] Timer expired but data is published, keeping data');
      stopTimer();
    }
  }
  
  notifyListeners();
}

/**
 * Subscribe to timer updates
 */
function subscribeToTimer(listener: (state: StrictTimerState) => void): () => void {
  listeners.add(listener);
  listener(getTimerState()); // Initial call
  
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Notify all listeners of timer state change
 */
function notifyListeners(): void {
  const state = getTimerState();
  listeners.forEach(listener => {
    try {
      listener(state);
    } catch (error) {
      serviceLogger.error('[StrictAutoSave] Error notifying listener', error as Error);
    }
  });
}

// ============================================================
// DATA MANAGEMENT - إدارة البيانات
// ============================================================

/**
 * Save data with STRICT rules
 * حفظ البيانات بقواعد صارمة
 */
function saveData(data: Partial<StrictWorkflowData>, currentPage: string): void {
  try {
    const existing = loadData();
    const now = Date.now();
    
    const merged: StrictWorkflowData = {
      ...existing,
      ...data,
      lastModified: now,
      createdAt: existing?.createdAt || now,
      currentPage,
      touchedFields: Array.from(new Set([
        ...(existing?.touchedFields || []),
        ...Object.keys(data)
      ]))
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    
    // Start or reset timer on first save or any update
    const timerState = getTimerState();
    if (!timerState.isActive) {
      startTimer();
    }
    
    serviceLogger.info('[StrictAutoSave] Data saved', {
      currentPage,
      fieldsCount: Object.keys(data).length,
      totalFields: merged.touchedFields.length,
      timerRemaining: getTimerState().remainingSeconds
    });
  } catch (error) {
    serviceLogger.error('[StrictAutoSave] CRITICAL: Failed to save data', error as Error, {
      currentPage,
      dataKeys: Object.keys(data)
    });
    throw error; // Re-throw to ensure caller knows about failure
  }
}

/**
 * Load saved data
 * تحميل البيانات المحفوظة
 */
function loadData(): StrictWorkflowData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return null;
    }
    
    const data: StrictWorkflowData = JSON.parse(saved);
    
    serviceLogger.info('[StrictAutoSave] Data loaded', {
      currentPage: data.currentPage,
      fieldsCount: data.touchedFields?.length || 0,
      lastModified: new Date(data.lastModified).toISOString()
    });
    
    return data;
  } catch (error) {
    serviceLogger.error('[StrictAutoSave] Error loading data', error as Error);
    return null;
  }
}

/**
 * Mark data as published (prevents auto-delete)
 * وضع علامة على البيانات كمنشورة (يمنع الحذف التلقائي)
 */
function markAsPublished(): void {
  try {
    localStorage.setItem(PUBLISHED_FLAG_KEY, JSON.stringify({
      publishedAt: Date.now(),
      publishedDate: new Date().toISOString()
    }));
    
    stopTimer();
    
    serviceLogger.info('[StrictAutoSave] Data marked as PUBLISHED - auto-delete disabled');
  } catch (error) {
    serviceLogger.error('[StrictAutoSave] Error marking as published', error as Error);
  }
}

/**
 * Check if data is published
 * التحقق من نشر البيانات
 */
function isDataPublished(): boolean {
  try {
    const flag = localStorage.getItem(PUBLISHED_FLAG_KEY);
    return !!flag;
  } catch (error) {
    return false;
  }
}

/**
 * Clear all data (STRICT)
 * حذف جميع البيانات (صارم)
 */
function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMER_KEY);
    localStorage.removeItem(PUBLISHED_FLAG_KEY);
    
    stopTimer();
    SellWorkflowStepStateService.reset();
    
    serviceLogger.warn('[StrictAutoSave] ALL DATA CLEARED');
  } catch (error) {
    serviceLogger.error('[StrictAutoSave] Error clearing data', error as Error);
  }
}

/**
 * Get storage statistics
 * إحصائيات التخزين
 */
function getStorageStats(): {
  hasData: boolean;
  fieldsCount: number;
  lastModified: string;
  timerRemaining: number;
  isPublished: boolean;
  storageSize: number;
} {
  const data = loadData();
  const timer = getTimerState();
  const published = isDataPublished();
  
  let storageSize = 0;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      storageSize = new Blob([saved]).size;
    }
  } catch (e) {
    // ignore
  }
  
  return {
    hasData: !!data,
    fieldsCount: data?.touchedFields?.length || 0,
    lastModified: data ? new Date(data.lastModified).toISOString() : '',
    timerRemaining: timer.remainingSeconds,
    isPublished: published,
    storageSize
  };
}

// ============================================================
// INITIALIZATION - التهيئة
// ============================================================

/**
 * Initialize the service and start monitoring
 * تهيئة الخدمة وبدء المراقبة
 */
function initialize(): void {
  // Check timer on load
  checkTimerExpiry();
  
  // Set up interval to check every 5 seconds
  if (!timerInterval) {
    timerInterval = setInterval(() => {
      checkTimerExpiry();
    }, CHECK_INTERVAL);
    
    serviceLogger.info('[StrictAutoSave] Service initialized', {
      checkInterval: CHECK_INTERVAL,
      autoDeleteTimeout: AUTO_DELETE_TIMEOUT
    });
  }
}

/**
 * Cleanup on unmount
 */
function cleanup(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  listeners.clear();
  serviceLogger.info('[StrictAutoSave] Service cleaned up');
}

// ============================================================
// EXPORTS - الصادرات
// ============================================================

export const StrictWorkflowAutoSaveService = {
  // Data operations
  saveData,
  loadData,
  clearAllData,
  
  // Publishing
  markAsPublished,
  isDataPublished,
  
  // Timer
  getTimerState,
  resetTimer,
  subscribeToTimer,
  
  // Stats
  getStorageStats,
  
  // Lifecycle
  initialize,
  cleanup
};

// Auto-initialize on import
if (typeof window !== 'undefined') {
  initialize();
}

export default StrictWorkflowAutoSaveService;
