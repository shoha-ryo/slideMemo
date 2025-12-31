import { create } from "zustand";

interface UserStore {
  userId: string | null;
  setUserId: (userId: string) => void;
}

export const useUserStore = create<UserStore>()((set) => ({
  userId: null,
  setUserId: (userId) => set({ userId }),
}));
