import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  // Authentication
  authToken: string | null;
  userId: number | null;
  email: string | null;
  
  // Actions
  setAuth: (token: string, userId: number, email: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

const initialState = {
  authToken: null,
  userId: null,
  email: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setAuth: (token, userId, email) => 
        set({ 
          authToken: token, 
          userId, 
          email,
        }),
      
      clearAuth: () => set(initialState),
      
      isAuthenticated: () => {
        const state = get();
        return !!state.authToken && !!state.userId;
      },
    }),
    {
      name: 'wallet-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
