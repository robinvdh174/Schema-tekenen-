import type { SymbolCategory, SymbolDefinition } from '@/types/symbols';
import { beveiligingSymbols } from './beveiliging';
import { diversenSymbols } from './diversen';
import { schakelaarSymbols } from './schakelaars';
import { stopcontactSymbols } from './stopcontacten';
import { toestelSymbols } from './toestellen';
import { verlichtingSymbols } from './verlichting';
import { voedingSymbols } from './voeding';

export const ALL_SYMBOLS: SymbolDefinition[] = [
  ...voedingSymbols,
  ...beveiligingSymbols,
  ...stopcontactSymbols,
  ...schakelaarSymbols,
  ...verlichtingSymbols,
  ...toestelSymbols,
  ...diversenSymbols,
];

const SYMBOL_MAP = new Map<string, SymbolDefinition>(
  ALL_SYMBOLS.map((def) => [def.type, def])
);

export const getSymbolDefinition = (type: string): SymbolDefinition | undefined =>
  SYMBOL_MAP.get(type);

export const getSymbolsByCategory = (category: SymbolCategory): SymbolDefinition[] =>
  ALL_SYMBOLS.filter((def) => def.category === category);

export const requireSymbolDefinition = (type: string): SymbolDefinition => {
  const def = SYMBOL_MAP.get(type);
  if (!def) throw new Error(`Onbekend symbooltype: ${type}`);
  return def;
};
