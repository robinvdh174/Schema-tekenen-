import { create } from 'zustand';
import type { Project } from '@/types/project';
import { useProjectStore } from './projectStore';

const MAX_HISTORY = 50;

interface HistoryState {
  past: Project[];
  future: Project[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

/**
 * Snapshot-based undo/redo. Subscribes to projectStore and records a snapshot
 * of the previous project every time it changes, except while restoring.
 */

let isRestoring = false;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    const current = useProjectStore.getState().project;

    isRestoring = true;
    useProjectStore.setState({ project: previous, dirty: true });
    previousProjectRef = previous;
    isRestoring = false;

    set({
      past: newPast,
      future: [current, ...future],
      canUndo: newPast.length > 0,
      canRedo: true,
    });
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    const current = useProjectStore.getState().project;

    isRestoring = true;
    useProjectStore.setState({ project: next, dirty: true });
    previousProjectRef = next;
    isRestoring = false;

    set({
      past: [...past, current],
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });
  },

  clear: () => set({ past: [], future: [], canUndo: false, canRedo: false }),
}));

let previousProjectRef: Project = useProjectStore.getState().project;

useProjectStore.subscribe((state) => {
  if (isRestoring) {
    previousProjectRef = state.project;
    return;
  }
  if (state.project === previousProjectRef) return;

  useHistoryStore.setState((h) => {
    const nextPast = [...h.past, previousProjectRef];
    const trimmed = nextPast.length > MAX_HISTORY ? nextPast.slice(-MAX_HISTORY) : nextPast;
    return {
      past: trimmed,
      future: [],
      canUndo: true,
      canRedo: false,
    };
  });
  previousProjectRef = state.project;
});
