export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds extends Point, Size {}

export interface ViewportState {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export type EditorTool = 'select' | 'pan' | 'wire' | 'delete';

export type EditorMode = 'eendraad' | 'situatie';

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;
export const DEFAULT_GRID_SIZE = 10;
export const DEFAULT_MAJOR_GRID_MULTIPLIER = 5; // major every 50px
