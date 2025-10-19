import { create } from "zustand";

interface AdminState {
  isAdmin: boolean;
  setAdmin: (val: boolean) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isAdmin: false,
  setAdmin: (val) => set({ isAdmin: val }),
  logout: () => set({ isAdmin: false }),
}));
