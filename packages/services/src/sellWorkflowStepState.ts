import { SELL_WORKFLOW_STEPS, SELL_WORKFLOW_STEP_ORDER, SellWorkflowStepId } from '@globul-cars/core/constantssellWorkflowSteps';

export type SellWorkflowStepStatus = 'pending' | 'completed';

type StepStatusMap = Record<SellWorkflowStepId, SellWorkflowStepStatus>;

const STORAGE_KEY = 'globul_sell_workflow_step_status';

const createDefaultStatusMap = (): StepStatusMap =>
  SELL_WORKFLOW_STEPS.reduce((acc, step) => {
    acc[step.id] = 'pending';
    return acc;
  }, {} as StepStatusMap);

let stepStatuses: StepStatusMap = loadFromStorage();
const listeners = new Set<(statuses: StepStatusMap) => void>();

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadFromStorage(): StepStatusMap {
  try {
    if (!hasStorage()) {
      return createDefaultStatusMap();
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return createDefaultStatusMap();
    }

    const parsed = JSON.parse(saved) as Partial<StepStatusMap>;
    const defaults = createDefaultStatusMap();
    SELL_WORKFLOW_STEP_ORDER.forEach(stepId => {
      defaults[stepId] = parsed?.[stepId] ?? 'pending';
    });
    return defaults;
  } catch (error) {
    console.warn('[SellWorkflowStepState] Failed to load step statuses', error);
    return createDefaultStatusMap();
  }
}

function persist() {
  if (!hasStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stepStatuses));
}

function snapshotStatuses(): StepStatusMap {
  return { ...stepStatuses };
}

function notify() {
  const snapshot = snapshotStatuses();
  listeners.forEach(listener => listener(snapshot));
}

export const SellWorkflowStepStateService = {
  getStatuses(): StepStatusMap {
    return snapshotStatuses();
  },

  getStatus(stepId: SellWorkflowStepId): SellWorkflowStepStatus {
    return stepStatuses[stepId] ?? 'pending';
  },

  isCompleted(stepId: SellWorkflowStepId): boolean {
    return this.getStatus(stepId) === 'completed';
  },

  setStatus(stepId: SellWorkflowStepId, status: SellWorkflowStepStatus) {
    if (stepStatuses[stepId] === status) return;
    stepStatuses = { ...stepStatuses, [stepId]: status };
    persist();
    notify();
  },

  markCompleted(stepId: SellWorkflowStepId) {
    this.setStatus(stepId, 'completed');
  },

  markPending(stepId: SellWorkflowStepId) {
    this.setStatus(stepId, 'pending');
  },

  reset() {
    stepStatuses = createDefaultStatusMap();
    persist();
    notify();
  },

  subscribe(listener: (statuses: StepStatusMap) => void) {
    listeners.add(listener);
    listener(snapshotStatuses());

    return () => {
      listeners.delete(listener);
    };
  }
};

export default SellWorkflowStepStateService;

