// Zustand store for auth-related state - replaces sessionStorage/localStorage
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  // Guest mode state
  guestMode: boolean;
  appMode: string | null;
  returnPath: string | null;
  pendingAction: string | null;
  guestBannerDismissed: boolean;
  
  // Login tracking
  loginTracked: Record<string, boolean>;
  redirected: Record<string, boolean>;
  hasSeenWelcome: boolean;
  
  // Actions
  setGuestMode: (isGuest: boolean) => void;
  setAppMode: (mode: string | null) => void;
  setReturnPath: (path: string | null) => void;
  setPendingAction: (action: string | null) => void;
  setGuestBannerDismissed: (dismissed: boolean) => void;
  setLoginTracked: (userId: string, tracked: boolean) => void;
  setRedirected: (userId: string, redirected: boolean) => void;
  setHasSeenWelcome: (seen: boolean) => void;
  clearGuestState: () => void;
  clearUserState: (userId: string) => void;
  clearAllAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      guestMode: false,
      appMode: null,
      returnPath: null,
      pendingAction: null,
      guestBannerDismissed: false,
      loginTracked: {},
      redirected: {},
      hasSeenWelcome: false,
      
      // Actions
      setGuestMode: (isGuest) => set({ guestMode: isGuest }),
      
      setAppMode: (mode) => set({ appMode: mode }),
      
      setReturnPath: (path) => set({ returnPath: path }),
      
      setPendingAction: (action) => set({ pendingAction: action }),
      
      setGuestBannerDismissed: (dismissed) => set({ guestBannerDismissed: dismissed }),
      
      setLoginTracked: (userId, tracked) => 
        set((state) => ({
          loginTracked: { ...state.loginTracked, [userId]: tracked }
        })),
      
      setRedirected: (userId, redirected) =>
        set((state) => ({
          redirected: { ...state.redirected, [userId]: redirected }
        })),
      
      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),
      
      clearGuestState: () => set({
        guestMode: false,
        appMode: null,
        returnPath: null,
        pendingAction: null,
        guestBannerDismissed: false,
        hasSeenWelcome: false,
      }),
      
      clearUserState: (userId) =>
        set((state) => {
          const { [userId]: _, ...restLoginTracked } = state.loginTracked;
          const { [userId]: __, ...restRedirected } = state.redirected;
          return {
            loginTracked: restLoginTracked,
            redirected: restRedirected,
          };
        }),
      
      clearAllAuth: () => set({
        guestMode: false,
        appMode: null,
        returnPath: null,
        pendingAction: null,
        guestBannerDismissed: false,
        loginTracked: {},
        redirected: {},
        hasSeenWelcome: false,
      }),
    }),
    {
      name: 'bonimpo-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        guestMode: state.guestMode,
        appMode: state.appMode,
        returnPath: state.returnPath,
        pendingAction: state.pendingAction,
        guestBannerDismissed: state.guestBannerDismissed,
        loginTracked: state.loginTracked,
        redirected: state.redirected,
        hasSeenWelcome: state.hasSeenWelcome,
      }),
    }
  )
);

// Helper hooks for easier access
export const useGuestModeStore = () => {
  const guestMode = useAuthStore((state) => state.guestMode);
  const appMode = useAuthStore((state) => state.appMode);
  const setGuestMode = useAuthStore((state) => state.setGuestMode);
  const setAppMode = useAuthStore((state) => state.setAppMode);
  const clearGuestState = useAuthStore((state) => state.clearGuestState);
  
  return { guestMode, appMode, setGuestMode, setAppMode, clearGuestState };
};

export const useReturnPathStore = () => {
  const returnPath = useAuthStore((state) => state.returnPath);
  const pendingAction = useAuthStore((state) => state.pendingAction);
  const setReturnPath = useAuthStore((state) => state.setReturnPath);
  const setPendingAction = useAuthStore((state) => state.setPendingAction);
  
  return { returnPath, pendingAction, setReturnPath, setPendingAction };
};
