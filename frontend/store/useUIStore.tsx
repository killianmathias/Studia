import { create } from "zustand";

interface UiState {
  loading: boolean;
  isRunning: boolean;
  load: () => void;
  stopLoad: () => void;
  run: () => void;
  stopRunning: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  loading: false,
  isRunning: false,
  load: () => set({ loading: true }),
  stopLoad: () => set({ loading: false }),
  run: () => set({ isRunning: true }),
  stopRunning: () => set({ isRunning: false }),
}));
