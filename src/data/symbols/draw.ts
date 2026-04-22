/** Shared drawing constants so every symbol has a consistent AREI look. */

export const STROKE = '#111827';
export const STROKE_HOVER = '#2563eb';
export const STROKE_SELECTED = '#2563eb';
export const FILL_BG = '#ffffff';
export const FILL_BLACK = '#111827';
export const STROKE_WIDTH = 2;
export const STROKE_WIDTH_THIN = 1.25;
export const STROKE_WIDTH_MAIN = 2.5;
export const TEXT_COLOR = '#111827';
export const FONT_FAMILY =
  'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

export const strokeFor = (state: 'normal' | 'hover' | 'selected') =>
  state === 'selected' ? STROKE_SELECTED : state === 'hover' ? STROKE_HOVER : STROKE;
