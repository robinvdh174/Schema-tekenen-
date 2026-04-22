import { create } from 'zustand';
import type { EditorMode, Point } from '@/types/canvas';
import type { Project } from '@/types/project';
import type { PlacedSymbol, PropertyValue } from '@/types/symbols';
import { createId } from '@/utils/id';

const createEmptyProject = (): Project => {
  const now = Date.now();
  return {
    id: createId('proj'),
    createdAt: now,
    updatedAt: now,
    metadata: { name: 'Nieuw project' },
    eendraad: { symbols: [], wires: [], circuits: [] },
    situatie: { walls: [], rooms: [], symbols: [], scale: 50 },
  };
};

type SymbolMutator = (symbol: PlacedSymbol) => PlacedSymbol;

interface ProjectState {
  project: Project;
  dirty: boolean;

  loadProject: (project: Project) => void;
  newProject: () => void;
  updateMetadata: (updates: Partial<Project['metadata']>) => void;
  markSaved: () => void;

  addSymbol: (mode: EditorMode, symbol: PlacedSymbol) => void;
  moveSymbol: (mode: EditorMode, id: string, position: Point) => void;
  updateSymbol: (mode: EditorMode, id: string, mutator: SymbolMutator) => void;
  updateSymbolProperty: (
    mode: EditorMode,
    id: string,
    propertyKey: string,
    value: PropertyValue['value']
  ) => void;
  rotateSymbol: (mode: EditorMode, id: string, delta: number) => void;
  removeSymbols: (mode: EditorMode, ids: string[]) => void;
  getSymbols: (mode: EditorMode) => PlacedSymbol[];
}

const modeKey = (mode: EditorMode): 'eendraad' | 'situatie' =>
  mode === 'eendraad' ? 'eendraad' : 'situatie';

const bumpTimestamp = (project: Project): Project => ({
  ...project,
  updatedAt: Date.now(),
});

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: createEmptyProject(),
  dirty: false,

  loadProject: (project) => set({ project, dirty: false }),
  newProject: () => set({ project: createEmptyProject(), dirty: false }),
  updateMetadata: (updates) =>
    set((state) => ({
      project: bumpTimestamp({
        ...state.project,
        metadata: { ...state.project.metadata, ...updates },
      }),
      dirty: true,
    })),
  markSaved: () => set({ dirty: false }),

  addSymbol: (mode, symbol) =>
    set((state) => {
      const key = modeKey(mode);
      const section = state.project[key];
      return {
        project: bumpTimestamp({
          ...state.project,
          [key]: { ...section, symbols: [...section.symbols, symbol] },
        }),
        dirty: true,
      };
    }),

  moveSymbol: (mode, id, position) =>
    set((state) => {
      const key = modeKey(mode);
      const section = state.project[key];
      return {
        project: bumpTimestamp({
          ...state.project,
          [key]: {
            ...section,
            symbols: section.symbols.map((s) => (s.id === id ? { ...s, position } : s)),
          },
        }),
        dirty: true,
      };
    }),

  updateSymbol: (mode, id, mutator) =>
    set((state) => {
      const key = modeKey(mode);
      const section = state.project[key];
      return {
        project: bumpTimestamp({
          ...state.project,
          [key]: {
            ...section,
            symbols: section.symbols.map((s) => (s.id === id ? mutator(s) : s)),
          },
        }),
        dirty: true,
      };
    }),

  updateSymbolProperty: (mode, id, propertyKey, value) =>
    set((state) => {
      const key = modeKey(mode);
      const section = state.project[key];
      return {
        project: bumpTimestamp({
          ...state.project,
          [key]: {
            ...section,
            symbols: section.symbols.map((s) => {
              if (s.id !== id) return s;
              const prop = s.properties[propertyKey];
              if (!prop) return s;
              return {
                ...s,
                properties: {
                  ...s.properties,
                  [propertyKey]: { ...prop, value },
                },
              };
            }),
          },
        }),
        dirty: true,
      };
    }),

  rotateSymbol: (mode, id, delta) =>
    set((state) => {
      const key = modeKey(mode);
      const section = state.project[key];
      return {
        project: bumpTimestamp({
          ...state.project,
          [key]: {
            ...section,
            symbols: section.symbols.map((s) =>
              s.id === id ? { ...s, rotation: (((s.rotation + delta) % 360) + 360) % 360 } : s
            ),
          },
        }),
        dirty: true,
      };
    }),

  removeSymbols: (mode, ids) =>
    set((state) => {
      if (ids.length === 0) return state;
      const key = modeKey(mode);
      const section = state.project[key];
      const idSet = new Set(ids);
      return {
        project: bumpTimestamp({
          ...state.project,
          [key]: {
            ...section,
            symbols: section.symbols.filter((s) => !idSet.has(s.id)),
          },
        }),
        dirty: true,
      };
    }),

  getSymbols: (mode) => get().project[modeKey(mode)].symbols,
}));
