// Zustand store for onboarding state - replaces localStorage
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface OnboardingState {
  // Onboarding data cache
  onboardingData: Record<string, any>;
  currentStep: number;
  skippedSteps: string[];
  completedAt: string | null;
  
  // Actions
  setOnboardingData: (userId: string, data: any) => void;
  getOnboardingData: (userId: string) => any;
  setCurrentStep: (step: number) => void;
  addSkippedStep: (step: string) => void;
  setCompletedAt: (timestamp: string) => void;
  clearOnboarding: (userId?: string) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      onboardingData: {},
      currentStep: 0,
      skippedSteps: [],
      completedAt: null,
      
      setOnboardingData: (userId, data) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, [userId]: data }
        })),
      
      getOnboardingData: (userId) => get().onboardingData[userId] || {},
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      addSkippedStep: (step) =>
        set((state) => ({
          skippedSteps: [...new Set([...state.skippedSteps, step])]
        })),
      
      setCompletedAt: (timestamp) => set({ completedAt: timestamp }),
      
      clearOnboarding: (userId) =>
        set((state) => {
          if (userId) {
            const { [userId]: _, ...rest } = state.onboardingData;
            return { onboardingData: rest };
          }
          return {
            onboardingData: {},
            currentStep: 0,
            skippedSteps: [],
            completedAt: null,
          };
        }),
    }),
    {
      name: 'bonimpo-onboarding-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
