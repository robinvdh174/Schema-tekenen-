import { create } from 'zustand';
import type { EditorMode, EditorTool, ViewportState } from '@/types/canvas';
import { DEFAULT_GRID_SIZE, MAX_ZOOM, MIN_ZOOM } from '@/types/canvas';
import { clamp } from '@/utils/geometry';

interface EditorState {
  mode: EditorMode;
  tool: EditorTool;
  viewport: ViewportState;
  gridSize: number;
  gridVisible: boolean;
  snapEnabled: boolean;
  cursor: { x: number; y: number } | null;
  selectedIds: string[];

  setMode: (mode: EditorMode) => void;
  setTool: (tool: EditorTool) => void;
  setViewport: (viewport: Partial<ViewportState>) => void;
  zoomAt: (factor: number, center: { x: number; y: number }) => void;
  resetView: () => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  setCursor: (p: { x: number; y: number } | null) => void;
  setSelection: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
}

const initialViewport: ViewportState = { offsetX: 0, offsetY: 0, scale: 1 };

export const useEditorStore = create<EditorState>((set) => ({
  mode: 'eendraad',
  tool: 'select',
  viewport: initialViewport,
  gridSize: DEFAULT_GRID_SIZE,
  gridVisible: true,
  snapEnabled: true,
  cursor: null,
  selectedIds: [],

  setMode: (mode) => set({ mode, selectedIds: [] }),
  setTool: (tool) => set({ tool }),
  setViewport: (viewport) =>
    set((state) => ({ viewport: { ...state.viewport, ...viewport } })),

  zoomAt: (factor, center) =>
    set((state) => {
      const { scale, offsetX, offsetY } = state.viewport;
      const nextScale = clamp(scale * factor, MIN_ZOOM, MAX_ZOOM);
      if (nextScale === scale) return state;
      // world coordinates under the cursor stay fixed
      const worldX = (center.x - offsetX) / scale;
      const worldY = (center.y - offsetY) / scale;
      return {
        viewport: {
          scale: nextScale,
          offsetX: center.x - worldX * nextScale,
          offsetY: center.y - worldY * nextScale,
        },
      };
    }),

  resetView: () => set({ viewport: initialViewport }),
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
  setCursor: (cursor) => set({ cursor }),
  setSelection: (selectedIds) => set({ selectedIds }),
  addToSelection: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id) ? s.selectedIds : [...s.selectedIds, id],
    })),
  removeFromSelection: (id) =>
    set((s) => ({ selectedIds: s.selectedIds.filter((x) => x !== id) })),
  clearSelection: () => set({ selectedIds: [] }),
}));
