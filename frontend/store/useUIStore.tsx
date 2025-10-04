import { create } from "zustand";

interface UiState {
  loading: boolean;
  load: () => void;
  stopLoad: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  loading: false,
  load: () => set({ loading: true }),
  stopLoad: () => set({ loading: false }),
}));
