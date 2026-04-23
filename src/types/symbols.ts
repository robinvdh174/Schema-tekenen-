import type { ComponentType } from 'react';
import type { Point } from './canvas';

export type SymbolCategory =
  | 'voeding'
  | 'beveiliging'
  | 'stopcontacten'
  | 'schakelaars'
  | 'verlichting'
  | 'toestellen'
  | 'diversen';

export const SYMBOL_CATEGORIES: { id: SymbolCategory; label: string }[] = [
  { id: 'voeding', label: 'Voeding & Meting' },
  { id: 'beveiliging', label: 'Beveiliging' },
  { id: 'stopcontacten', label: 'Contactdozen' },
  { id: 'schakelaars', label: 'Schakelaars' },
  { id: 'verlichting', label: 'Verlichting' },
  { id: 'toestellen', label: 'Toestellen' },
  { id: 'diversen', label: 'Diversen' },
];

export type PropertyType = 'number' | 'string' | 'select' | 'boolean';

export interface PropertyDefinition {
  label: string;
  type: PropertyType;
  defaultValue: string | number | boolean;
  options?: string[];
  unit?: string;
}

export interface PropertyValue {
  label: string;
  type: PropertyType;
  value: string | number | boolean;
  options?: string[];
  unit?: string;
}

export type ConnectionSide = 'top' | 'bottom' | 'left' | 'right';

export interface ConnectionPointDefinition {
  id: string;
  position: ConnectionSide;
  /** Offset relative to the symbol origin (top-left of bounding box), in canvas units. */
  x: number;
  y: number;
}

export type SymbolVisualState = 'normal' | 'hover' | 'selected';

export interface SymbolRenderProps {
  state: SymbolVisualState;
  properties: Record<string, PropertyValue>;
}

/**
 * Definition of a symbol type that can be placed on the canvas.
 * Lives in the palette/library, not on the canvas.
 *
 * `Render` returns Konva shapes drawn within the bounding box
 * [(0,0), (width,height)] and is wrapped in a Konva.Group by the renderer.
 */
export interface SymbolDefinition {
  type: string;
  category: SymbolCategory;
  name: string;
  description: string;
  width: number;
  height: number;
  connectionPoints: ConnectionPointDefinition[];
  properties: Record<string, PropertyDefinition>;
  Render: ComponentType<SymbolRenderProps>;
}

/**
 * A symbol instance actually placed on the canvas.
 */
export interface PlacedSymbol {
  id: string;
  type: string;
  position: Point;
  rotation: number; // 0, 90, 180, 270
  properties: Record<string, PropertyValue>;
  /** Optional circuit reference the symbol belongs to. */
  circuitId?: string;
}
