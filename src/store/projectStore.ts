import { create } from 'zustand';
import type { EditorMode, Point } from '@/types/canvas';
import type { Project } from '@/types/project';
import type { PlacedSymbol, PropertyValue } from '@/types/symbols';
import type { Wire } from '@/types/wire';
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

  /** Hernoem een kring overal: alle symbolen met kring `from` krijgen kring `to`. */
  renameCircuit: (mode: EditorMode, from: string, to: string) => void;
  /** Ken een kring toe aan een set symbolen. */
  assignCircuit: (mode: EditorMode, ids: string[], kring: string) => void;

  addWire: (mode: EditorMode, wire: Wire) => void;
  updateWire: (mode: EditorMode, id: string, updates: Partial<Wire>) => void;
  removeWires: (mode: EditorMode, ids: string[]) => void;
  removeWiresTouching: (mode: EditorMode, symbolIds: string[]) => void;
  getWires: (mode: EditorMode) => Wire[];
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

  renameCircuit: (mode, from, to) =>
    set((state) => {
      const trimmedTo = to.trim();
      if (from === trimmedTo) return state;
      const key = modeKey(mode);
      const section = state.project[key];
      let changed = false;
      const symbols = section.symbols.map((s) => {
        const prop = s.properties.kring;
        if (!prop || String(prop.value) !== from) return s;
        changed = true;
        return {
          ...s,
          properties: { ...s.properties, kring: { ...prop, value: trimmedTo } },
        };
      });
      if (!changed) return state;
      return {
        project: bumpTimestamp({ ...state.project, [key]: { ...section, symbols } }),
        dirty: true,
      };
    }),

  assignCircuit: (mode, ids, kring) =>
    set((state) => {
      if (ids.length === 0) return state;
      const key = modeKey(mode);
      const section = state.project[key];
      const idSet = new Set(ids);
      let changed = false;
      const symbols = section.symbols.map((s) => {
        if (!idSet.has(s.id)) return s;
        const prop = s.properties.kring;
        if (!prop) return s;
        changed = true;
        return {
          ...s,
          properties: { ...s.properties, kring: { ...prop, value: kring } },
        };
      });
      if (!changed) return state;
      return {
        project: bumpTimestamp({ ...state.project, [key]: { ...section, symbols } }),
        dirty: true,
      };
    }),

  getSymbols: (mode) => get().project[modeKey(mode)].symbols,

  addWire: (mode, wire) =>
    set((state) => {
      if (mode !== 'eendraad') return state;
      const section = state.project.eendraad;
      return {
        project: bumpTimestamp({
          ...state.project,
          eendraad: { ...section, wires: [...section.wires, wire] },
        }),
        dirty: true,
      };
    }),

  updateWire: (mode, id, updates) =>
    set((state) => {
      if (mode !== 'eendraad') return state;
      const section = state.project.eendraad;
      return {
        project: bumpTimestamp({
          ...state.project,
          eendraad: {
            ...section,
            wires: section.wires.map((w) => (w.id === id ? { ...w, ...updates } : w)),
          },
        }),
        dirty: true,
      };
    }),

  removeWires: (mode, ids) =>
    set((state) => {
      if (mode !== 'eendraad' || ids.length === 0) return state;
      const section = state.project.eendraad;
      const idSet = new Set(ids);
      return {
        project: bumpTimestamp({
          ...state.project,
          eendraad: { ...section, wires: section.wires.filter((w) => !idSet.has(w.id)) },
        }),
        dirty: true,
      };
    }),

  removeWiresTouching: (mode, symbolIds) =>
    set((state) => {
      if (mode !== 'eendraad' || symbolIds.length === 0) return state;
      const section = state.project.eendraad;
      const idSet = new Set(symbolIds);
      const wires = section.wires.filter(
        (w) => !idSet.has(w.from.symbolId) && !idSet.has(w.to.symbolId)
      );
      if (wires.length === section.wires.length) return state;
      return {
        project: bumpTimestamp({
          ...state.project,
          eendraad: { ...section, wires },
        }),
        dirty: true,
      };
    }),

  getWires: (mode) => (mode === 'eendraad' ? get().project.eendraad.wires : []),
}));
