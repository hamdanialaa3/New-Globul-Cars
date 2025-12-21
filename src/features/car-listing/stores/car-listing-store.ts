// Car Listing Zustand Store
// مخزن حالة إعلان السيارة
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { CarListingFormData, carListingSchema, formatZodErrors, Step1Data, Step2Data, Step3Data, Step4Data, Step5Data, Step6Data } from '../schemas/car-listing.schema';

interface CarListingState {
  // Navigation
  currentStep: number;
  completedSteps: Set<number>;
  totalSteps: number;
  direction: 'forward' | 'backward';
  
  // Form Data - Structured by step
  formData: Partial<{
    step1: Step1Data;
    step2: Step2Data;
    step3: Step3Data;
    step4: Step4Data;
    step5: Step5Data;
    step6: Step6Data;
  }>;
  
  // UI State
  isSubmitting: boolean;
  isDraftSaving: boolean;
  errors: Record<string, string>;
  fieldErrors: Record<string, string>;
  
  // Image State
  imageFiles: File[];
  imageUploadProgress: Record<string, number>;
  
  // Actions - Navigation
  setCurrentStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  setDirection: (direction: 'forward' | 'backward') => void;
  
  // Actions - Form Data
  updateStepData: <T extends keyof CarListingState['formData']>(step: T, data: Partial<CarListingState['formData'][T]>) => void;
  validateStep: (step: number) => Promise<boolean>;
  markStepComplete: (step: number) => void;
  
  // Actions - Images
  addImages: (files: File[]) => Promise<void>;
  removeImage: (index: number) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  setMainImage: (index: number) => void;
  
  // Actions - Submission
  submitListing: () => Promise<{ success: boolean; carId?: string; error?: string }>;
  
  // Actions - Reset
  reset: () => void;
  clearDraft: () => void;
  
  // Actions - Legacy compatibility (for migration)
  getWorkflowData: () => any; // Returns data in old format for compatibility
  updateWorkflowData: (updates: any, currentStep?: string) => void; // Legacy method
}

const TOTAL_STEPS = 6;

// Helper to create initial state
const getInitialState = () => ({
  currentStep: 0,
  completedSteps: new Set<number>(),
  totalSteps: TOTAL_STEPS,
  direction: 'forward' as const,
  formData: {} as Partial<{
    step1: Step1Data;
    step2: Step2Data;
    step3: Step3Data;
    step4: Step4Data;
    step5: Step5Data;
    step6: Step6Data;
  }>,
  isSubmitting: false,
  isDraftSaving: false,
  errors: {} as Record<string, string>,
  fieldErrors: {} as Record<string, string>,
  imageFiles: [] as File[],
  imageUploadProgress: {} as Record<string, number>,
});

export const useCarListingStore = create<CarListingState>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...getInitialState(),
        
        // Navigation Actions
        setCurrentStep: (step) => set((state) => {
          if (step >= 0 && step < TOTAL_STEPS) {
            state.currentStep = step;
          }
        }),
        
        goToNextStep: () => set((state) => {
          if (state.currentStep < TOTAL_STEPS - 1) {
            state.direction = 'forward';
            state.currentStep += 1;
          }
        }),
        
        goToPreviousStep: () => set((state) => {
          if (state.currentStep > 0) {
            state.direction = 'backward';
            state.currentStep -= 1;
          }
        }),
        
        goToStep: (step) => {
          const { setCurrentStep, completedSteps } = get();
          // Allow going to completed steps or next step
          if (completedSteps.has(step) || step === get().currentStep + 1) {
            setCurrentStep(step);
          }
        },
        
        setDirection: (direction) => set((state) => {
          state.direction = direction;
        }),
        
        // Form Data Actions
        updateStepData: (step, data) => set((state) => {
          if (!state.formData[step]) {
            state.formData[step] = {} as any;
          }
          Object.assign(state.formData[step], data);
          state.isDraftSaving = true;
          
          // Auto-save draft after 500ms debounce
          setTimeout(() => {
            set((state) => {
              state.isDraftSaving = false;
            });
          }, 500);
        }),
        
        // Validation
        validateStep: async (step) => {
          const { formData } = get();
          const stepSchemas = {
            0: carListingSchema.shape.step1,
            1: carListingSchema.shape.step2,
            2: carListingSchema.shape.step3,
            3: carListingSchema.shape.step4,
            4: carListingSchema.shape.step5,
            5: carListingSchema.shape.step6,
          };
          
          const schema = stepSchemas[step as keyof typeof stepSchemas];
          if (!schema) return false;
          
          const stepKey = `step${step + 1}` as keyof typeof formData;
          const stepData = formData[stepKey];
          
          if (!stepData) {
            set((state) => {
              state.errors[`step${step}`] = 'Step data is missing';
            });
            return false;
          }
          
          const result = schema.safeParse(stepData);
          
          if (!result.success) {
            const errors = formatZodErrors(result.error);
            
            set((state) => {
              state.errors[`step${step}`] = 'Validation failed';
              state.fieldErrors = errors;
            });
            return false;
          }
          
          set((state) => {
            state.errors[`step${step}`] = '';
            state.fieldErrors = {};
          });
          
          return true;
        },
        
        markStepComplete: (step) => set((state) => {
          state.completedSteps.add(step);
        }),
        
        // Image Actions
        addImages: async (files) => {
          const { imageFiles, updateStepData } = get();
          const newFiles = [...imageFiles, ...files].slice(0, 20); // Max 20 images
          
          set((state) => {
            state.imageFiles = newFiles;
          });
          
          // Update form data
          updateStepData('step4', {
            images: newFiles,
            mainImageIndex: 0,
          } as Partial<Step4Data>);
        },
        
        removeImage: (index) => set((state) => {
          state.imageFiles = state.imageFiles.filter((_, i) => i !== index);
          const { updateStepData } = get();
          if (state.imageFiles.length > 0) {
            updateStepData('step4', {
              images: state.imageFiles,
              mainImageIndex: Math.min(index, state.imageFiles.length - 1),
            } as Partial<Step4Data>);
          }
        }),
        
        reorderImages: (fromIndex, toIndex) => set((state) => {
          const newFiles = [...state.imageFiles];
          const [removed] = newFiles.splice(fromIndex, 1);
          newFiles.splice(toIndex, 0, removed);
          state.imageFiles = newFiles;
          
          const { updateStepData } = get();
          updateStepData('step4', {
            images: newFiles,
          } as Partial<Step4Data>);
        }),
        
        setMainImage: (index) => {
          const { updateStepData } = get();
          updateStepData('step4', {
            mainImageIndex: index,
          } as Partial<Step4Data>);
        },
        
        // Submission
        submitListing: async () => {
          const { formData, imageFiles, validateStep } = get();
          
          set((state) => {
            state.isSubmitting = true;
            state.errors = {};
          });
          
          try {
            // Validate all steps
            for (let i = 0; i < TOTAL_STEPS; i++) {
              const isValid = await validateStep(i);
              if (!isValid) {
                set((state) => {
                  state.isSubmitting = false;
                  state.errors.submission = `Step ${i + 1} validation failed`;
                });
                return { success: false, error: `Step ${i + 1} validation failed` };
              }
            }
            
            // TODO: Call actual API service
            // const response = await carListingService.createListing(payload);
            
            set((state) => {
              state.isSubmitting = false;
            });
            
            return { success: true, carId: 'mock-id' };
          } catch (error: any) {
            set((state) => {
              state.isSubmitting = false;
              state.errors.submission = error.message || 'Submission failed';
            });
            return { success: false, error: error.message || 'Submission failed' };
          }
        },
        
        // Reset
        reset: () => set((state) => {
          const initialState = getInitialState();
          Object.assign(state, initialState);
        }),
        
        clearDraft: () => {
          get().reset();
          localStorage.removeItem('car-listing-storage');
        },
        
        // Legacy compatibility methods (for gradual migration)
        getWorkflowData: () => {
          const { formData } = get();
          // Convert new structure to old structure for compatibility
          return {
            vehicleType: formData.step1?.vehicleType,
            make: formData.step2?.make,
            model: formData.step2?.model,
            year: formData.step2?.year?.toString(),
            mileage: formData.step2?.mileage?.toString(),
            fuelType: formData.step2?.fuelType,
            transmission: formData.step2?.transmission,
            bodyType: formData.step2?.bodyType,
            doors: formData.step2?.doors?.toString(),
            seats: formData.step2?.seats?.toString(),
            color: formData.step2?.color,
            power: formData.step2?.power?.toString(),
            condition: formData.step2?.condition,
            hasAccidentHistory: formData.step2?.hasAccidentHistory,
            hasServiceHistory: formData.step2?.hasServiceHistory,
            safetyEquipment: formData.step3?.safetyEquipment,
            comfortEquipment: formData.step3?.comfortEquipment,
            infotainmentEquipment: formData.step3?.infotainmentEquipment,
            extrasEquipment: formData.step3?.extrasEquipment,
            price: formData.step5?.price?.toString(),
            currency: formData.step5?.currency,
            negotiable: formData.step5?.negotiable,
            sellerName: formData.step6?.sellerName,
            sellerEmail: formData.step6?.sellerEmail,
            sellerPhone: formData.step6?.sellerPhone,
            city: formData.step6?.city,
            region: formData.step6?.region,
            description: formData.step6?.description,
          };
        },
        
        updateWorkflowData: (updates, currentStep = 'vehicle-data') => {
          const { updateStepData } = get();
          const { currentStep: step } = get();
          
          // Map old structure to new structure
          const stepMapping: Record<string, number> = {
            'vehicle-selection': 0,
            'vehicle-data': 1,
            'equipment': 2,
            'images': 3,
            'pricing': 4,
            'contact': 5,
          };
          
          const targetStep = stepMapping[currentStep] ?? step;
          
          // Convert updates to step-specific data
          if (targetStep === 0) {
            updateStepData('step1', { vehicleType: updates.vehicleType } as Step1Data);
          } else if (targetStep === 1) {
            updateStepData('step2', {
              make: updates.make,
              model: updates.model,
              year: updates.year ? parseInt(updates.year) : undefined,
              mileage: updates.mileage ? parseInt(updates.mileage) : undefined,
              fuelType: updates.fuelType,
              transmission: updates.transmission,
              bodyType: updates.bodyType,
              doors: updates.doors ? parseInt(updates.doors) : undefined,
              seats: updates.seats ? parseInt(updates.seats) : undefined,
              color: updates.color,
              power: updates.power ? parseInt(updates.power) : undefined,
              condition: updates.condition,
              hasAccidentHistory: updates.hasAccidentHistory,
              hasServiceHistory: updates.hasServiceHistory,
            } as Partial<Step2Data>);
          } else if (targetStep === 2) {
            updateStepData('step3', {
              safetyEquipment: updates.safetyEquipment || [],
              comfortEquipment: updates.comfortEquipment || [],
              infotainmentEquipment: updates.infotainmentEquipment || [],
              extrasEquipment: updates.extrasEquipment || [],
            } as Partial<Step3Data>);
          } else if (targetStep === 4) {
            updateStepData('step5', {
              price: updates.price ? parseInt(updates.price) : undefined,
              currency: updates.currency,
              negotiable: updates.negotiable,
            } as Partial<Step5Data>);
          } else if (targetStep === 5) {
            updateStepData('step6', {
              sellerName: updates.sellerName,
              sellerEmail: updates.sellerEmail,
              sellerPhone: updates.sellerPhone,
              city: updates.city,
              region: updates.region,
              description: updates.description,
            } as Partial<Step6Data>);
          }
        },
      })),
      {
        name: 'car-listing-storage',
        partialize: (state) => ({
          formData: state.formData,
          currentStep: state.currentStep,
          completedSteps: Array.from(state.completedSteps),
          // Don't persist files, only metadata
        }),
      }
    ),
    { name: 'CarListingStore' }
  )
);

// Selectors for performance optimization
export const useCarListingFormData = () => useCarListingStore((state) => state.formData);
export const useCarListingCurrentStep = () => useCarListingStore((state) => state.currentStep);
export const useCarListingIsSubmitting = () => useCarListingStore((state) => state.isSubmitting);
export const useCarListingDirection = () => useCarListingStore((state) => state.direction);

