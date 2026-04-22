import { create } from 'zustand';
import type { PlacedSymbol } from '@/types/symbols';

interface UiState {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  activeCategoryId: string | null;
  toastMessage: string | null;
  clipboard: PlacedSymbol[];

  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setActiveCategory: (id: string | null) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
  setClipboard: (symbols: PlacedSymbol[]) => void;
}

export const useUiStore = create<UiState>((set) => ({
  leftPanelOpen: true,
  rightPanelOpen: true,
  activeCategoryId: 'voeding',
  toastMessage: null,
  clipboard: [],

  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setActiveCategory: (id) => set({ activeCategoryId: id }),
  showToast: (message) => set({ toastMessage: message }),
  dismissToast: () => set({ toastMessage: null }),
  setClipboard: (clipboard) => set({ clipboard }),
}));
