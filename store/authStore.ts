import { create } from 'zustand';
import { User } from '../types'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  user: User | null; 
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, jwtToken: string) => void;
  logout: () => void;
  setUserProfile: (profileData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, jwtToken) => {
        set({
          user: userData,
          token: jwtToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUserProfile: (profileData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...profileData } : null,
        }));
      },
    }),
    {
      name: 'teaxis-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);