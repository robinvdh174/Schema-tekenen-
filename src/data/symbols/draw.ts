/** Shared drawing constants so every symbol has a consistent AREI look. */

export const STROKE = '#111827';
export const STROKE_HOVER = '#2563eb';
export const STROKE_SELECTED = '#2563eb';
export const FILL_BG = '#ffffff';
export const FILL_BLACK = '#111827';
/*
 * Alle lijnen in een AREI-eendraadschema worden met één consistente, dunne
 * lijndikte getekend (zoals in het officiële Volta-symbolendocument). Vroeger
 * werden de doorvoer-/aansluitlijnen veel dikker getekend dan de symbolen
 * zelf, wat onrustig oogde. Nu zijn geleiders en symbooldetails even dun.
 */
export const STROKE_WIDTH = 1.6;
export const STROKE_WIDTH_THIN = 1.2;
export const STROKE_WIDTH_MAIN = 1.6;
export const TEXT_COLOR = '#111827';
export const FONT_FAMILY =
  'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

export const strokeFor = (state: 'normal' | 'hover' | 'selected') =>
  state === 'selected' ? STROKE_SELECTED : state === 'hover' ? STROKE_HOVER : STROKE;
