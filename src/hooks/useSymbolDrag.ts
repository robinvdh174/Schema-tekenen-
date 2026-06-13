import { create } from 'zustand';
import type { SymbolDefinition } from '@/types/symbols';

interface DragState {
  definition: SymbolDefinition | null;
  screen: { x: number; y: number } | null;
  startDrag: (definition: SymbolDefinition, screen: { x: number; y: number }) => void;
  updateDrag: (screen: { x: number; y: number }) => void;
  endDrag: () => void;
}

/**
 * Global drag state shared between the palette (origin) and the canvas (drop target).
 * The ghost preview is rendered via portal using these coordinates.
 */
export const useSymbolDrag = create<DragState>((set) => ({
  definition: null,
  screen: null,
  startDrag: (definition, screen) => set({ definition, screen }),
  updateDrag: (screen) => set({ screen }),
  endDrag: () => set({ definition: null, screen: null }),
}));
