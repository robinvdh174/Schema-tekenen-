import { create } from 'zustand';
import type { Project } from '@/types/project';
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

interface ProjectState {
  project: Project;
  dirty: boolean;

  loadProject: (project: Project) => void;
  newProject: () => void;
  updateMetadata: (updates: Partial<Project['metadata']>) => void;
  markSaved: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: createEmptyProject(),
  dirty: false,

  loadProject: (project) => set({ project, dirty: false }),
  newProject: () => set({ project: createEmptyProject(), dirty: false }),
  updateMetadata: (updates) =>
    set((state) => ({
      project: {
        ...state.project,
        metadata: { ...state.project.metadata, ...updates },
        updatedAt: Date.now(),
      },
      dirty: true,
    })),
  markSaved: () => set({ dirty: false }),
}));
