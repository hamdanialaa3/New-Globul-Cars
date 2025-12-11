/**
 * Sell Workflow Navigation Helper
 * 
 * Provides centralized navigation utilities for the sell workflow.
 * Ensures consistent routing and URL building across all workflow pages.
 * 
 * Usage:
 *   const { getNextStepPath, getPreviousStepPath, buildStepPath } = useSellWorkflowNavigation();
 *   navigate(getNextStepPath('vehicle-data', 'car'));
 */

import { SELL_WORKFLOW_STEP_ORDER } from '../constants/sellWorkflowSteps';

export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'van' | 'bus' | 'parts';

export interface WorkflowNavigationParams {
  vehicleType: VehicleType;
  searchParams?: URLSearchParams | Record<string, string>;
}

/**
 * Step route mapping
 * Maps step IDs to their route paths
 */
const STEP_ROUTE_MAP: Record<string, string> = {
  'vehicle-selection': '/sell/auto',
  'vehicle-data': '/sell/inserat/:vehicleType/data',
  'equipment': '/sell/inserat/:vehicleType/equipment',
  'images': '/sell/inserat/:vehicleType/images',
  'pricing': '/sell/inserat/:vehicleType/pricing',
  'contact': '/sell/inserat/:vehicleType/contact',
  'preview': '/sell/inserat/:vehicleType/preview',
  'publish': '/sell/inserat/:vehicleType/submission'
};

/**
 * Build path for a specific workflow step
 * 
 * @param stepId - The workflow step ID
 * @param params - Navigation parameters (vehicleType, searchParams)
 * @returns Complete path string with search params
 */
export function buildStepPath(
  stepId: string,
  params: WorkflowNavigationParams
): string {
  const routeTemplate = STEP_ROUTE_MAP[stepId];
  
  if (!routeTemplate) {
    console.warn(`Unknown step ID: ${stepId}`);
    return '/sell/auto';
  }

  // Replace :vehicleType placeholder
  let path = routeTemplate.replace(':vehicleType', params.vehicleType || 'car');

  // Add search params if provided
  if (params.searchParams) {
    const searchParams = params.searchParams instanceof URLSearchParams
      ? params.searchParams
      : new URLSearchParams(params.searchParams);
    
    const searchString = searchParams.toString();
    if (searchString) {
      path += `?${searchString}`;
    }
  }

  return path;
}

/**
 * Get the next step path
 * 
 * @param currentStepId - Current step ID
 * @param params - Navigation parameters
 * @returns Path to next step, or null if already at last step
 */
export function getNextStepPath(
  currentStepId: string,
  params: WorkflowNavigationParams
): string | null {
  const currentIndex = SELL_WORKFLOW_STEP_ORDER.indexOf(currentStepId as any);
  
  if (currentIndex === -1 || currentIndex === SELL_WORKFLOW_STEP_ORDER.length - 1) {
    return null; // Already at last step or invalid step
  }

  const nextStepId = SELL_WORKFLOW_STEP_ORDER[currentIndex + 1];
  return buildStepPath(nextStepId, params);
}

/**
 * Get the previous step path
 * 
 * @param currentStepId - Current step ID
 * @param params - Navigation parameters
 * @returns Path to previous step, or null if already at first step
 */
export function getPreviousStepPath(
  currentStepId: string,
  params: WorkflowNavigationParams
): string | null {
  const currentIndex = SELL_WORKFLOW_STEP_ORDER.indexOf(currentStepId as any);
  
  if (currentIndex <= 0) {
    return null; // Already at first step or invalid step
  }

  const previousStepId = SELL_WORKFLOW_STEP_ORDER[currentIndex - 1];
  return buildStepPath(previousStepId, params);
}

/**
 * Get step index (0-based)
 * 
 * @param stepId - Step ID
 * @returns Step index, or -1 if not found
 */
export function getStepIndex(stepId: string): number {
  return SELL_WORKFLOW_STEP_ORDER.indexOf(stepId as any);
}

/**
 * Get total number of steps
 */
export function getTotalSteps(): number {
  return SELL_WORKFLOW_STEP_ORDER.length;
}

/**
 * Check if step is the first step
 */
export function isFirstStep(stepId: string): boolean {
  return SELL_WORKFLOW_STEP_ORDER[0] === stepId;
}

/**
 * Check if step is the last step
 */
export function isLastStep(stepId: string): boolean {
  const lastIndex = SELL_WORKFLOW_STEP_ORDER.length - 1;
  return SELL_WORKFLOW_STEP_ORDER[lastIndex] === stepId;
}

/**
 * React Hook for workflow navigation
 * 
 * Usage in components:
 *   const navigate = useNavigate();
 *   const { params } = useParams();
 *   const [searchParams] = useSearchParams();
 *   
 *   const nav = useSellWorkflowNavigation({
 *     vehicleType: params.vehicleType as VehicleType,
 *     searchParams
 *   });
 *   
 *   const handleNext = () => {
 *     const nextPath = nav.getNextStepPath('vehicle-data');
 *     if (nextPath) navigate(nextPath);
 *   };
 */
export function useSellWorkflowNavigation(params: WorkflowNavigationParams) {
  return {
    buildStepPath: (stepId: string) => buildStepPath(stepId, params),
    getNextStepPath: (currentStepId: string) => getNextStepPath(currentStepId, params),
    getPreviousStepPath: (currentStepId: string) => getPreviousStepPath(currentStepId, params),
    getStepIndex,
    getTotalSteps,
    isFirstStep,
    isLastStep
  };
}
