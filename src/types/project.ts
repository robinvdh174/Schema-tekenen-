import type { PlacedSymbol } from './symbols';
import type { Wire } from './wire';

export interface Circuit {
  id: string;
  number: number;
  name: string;
  description?: string;
  color?: string;
}

export interface RoomShape {
  id: string;
  name: string;
  /** Ordered polygon points in canvas units. */
  points: { x: number; y: number }[];
}

export interface WallSegment {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  thickness: number;
}

export interface ProjectMetadata {
  name: string;
  address?: string;
  installer?: string;
  inspectionDate?: string;
  inspectionBody?: string;
  notes?: string;
}

export interface EendraadDiagram {
  symbols: PlacedSymbol[];
  wires: Wire[];
  circuits: Circuit[];
}

export interface SituatiePlan {
  walls: WallSegment[];
  rooms: RoomShape[];
  symbols: PlacedSymbol[];
  scale: number; // 50 means 1:50
}

export interface Project {
  id: string;
  createdAt: number;
  updatedAt: number;
  metadata: ProjectMetadata;
  eendraad: EendraadDiagram;
  situatie: SituatiePlan;
}
