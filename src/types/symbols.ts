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

export const SYMBOL_CATEGORIES: { id: SymbolCategory; label: string; short: string }[] = [
  { id: 'voeding', label: 'Voeding & Meting', short: 'Voeding' },
  { id: 'beveiliging', label: 'Beveiliging', short: 'Beveiliging' },
  { id: 'stopcontacten', label: 'Contactdozen', short: 'Contacten' },
  { id: 'schakelaars', label: 'Schakelaars', short: 'Schakelaars' },
  { id: 'verlichting', label: 'Verlichting', short: 'Licht' },
  { id: 'toestellen', label: 'Toestellen', short: 'Toestellen' },
  { id: 'diversen', label: 'Diversen', short: 'Diversen' },
];

export type PropertyType = 'number' | 'string' | 'select' | 'boolean';

export interface PropertyDefinition {
  label: string;
  type: PropertyType;
  defaultValue: string | number | boolean;
  options?: string[];
  /** Voorgestelde waarden voor vrije-tekstvelden (combobox: kiezen of zelf typen). */
  suggestions?: string[];
  unit?: string;
}

export interface PropertyValue {
  label: string;
  type: PropertyType;
  value: string | number | boolean;
  options?: string[];
  suggestions?: string[];
  unit?: string;
}

/** Veelgebruikte kabeltypes (AREI) als suggesties bij tekstvelden. */
export const CABLE_TYPE_SUGGESTIONS = [
  'XVB 2x1.5',
  'XVB 3G1.5',
  'XVB 3G2.5',
  'XVB 5G1.5',
  'XVB 5G2.5',
  'XVB 5G6',
  'VOB 1.5',
  'VOB 2.5',
  'VOB 6',
  'EXVB 5G10',
  'VVB 3G1.5',
  'UTP Cat6',
];

/** Veelgebruikte amperages als suggesties. */
export const AMPERAGE_SUGGESTIONS = ['10A', '16A', '20A', '25A', '32A', '40A', '63A'];

/**
 * Standaardsuggesties voor vrije-tekstvelden, gegroepeerd per veldnaam.
 * Worden gebruikt in het eigenschappen-paneel om een keuzelijst aan te bieden.
 */
export const TEXT_FIELD_SUGGESTIONS: Record<string, string[]> = {
  tekst: [...AMPERAGE_SUGGESTIONS, ...CABLE_TYPE_SUGGESTIONS],
  amperage: AMPERAGE_SUGGESTIONS,
  adres: [],
  weerstand: ['< 30 Ω', '< 100 Ω'],
};

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
