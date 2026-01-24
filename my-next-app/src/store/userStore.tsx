// store/userStore.ts
import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string;
}
interface UserState {
  user: User | null;
  isSynced: boolean; // ★DBとの同期が終わったかどうか
  setUser: (user: User) => void;
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
