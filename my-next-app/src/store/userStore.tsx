// store/userStore.ts
import { create } from 'zustand';

interface UserState {
  user: any | null;
  isSynced: boolean; // ★DBとの同期が終わったかどうか
  setUser: (user: any) => void;
  setSynced: (isSynced: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isSynced: false,
  setUser: (user) => set({ user }),
  setSynced: (isSynced) => set({ isSynced }),
  clearUser: () => set({ user: null, isSynced: false }),
}));