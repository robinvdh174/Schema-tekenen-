import type { Point } from '@/types/canvas';

export const snapToGrid = (value: number, gridSize: number): number =>
  Math.round(value / gridSize) * gridSize;

export const snapPoint = (point: Point, gridSize: number): Point => ({
  x: snapToGrid(point.x, gridSize),
  y: snapToGrid(point.y, gridSize),
});

export const distance = (a: Point, b: Point): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
