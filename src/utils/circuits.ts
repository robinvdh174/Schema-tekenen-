import type { PlacedSymbol } from '@/types/symbols';

export interface CircuitSummary {
  /** De kring-waarde zoals ingevuld op de symbolen (bv. "B", "F", "Kring 3"). */
  name: string;
  /** Aantal symbolen dat op deze kring zit. */
  count: number;
  /** Id's van de symbolen op deze kring. */
  symbolIds: string[];
}

/** Lees de kring-waarde van een symbool (leeg indien niet ingesteld). */
export const getSymbolCircuit = (symbol: PlacedSymbol): string => {
  const prop = symbol.properties.kring;
  return prop ? String(prop.value ?? '').trim() : '';
};

/** Geef alle gebruikte kringen, gesorteerd, met telling en symbool-id's. */
export const collectCircuits = (symbols: PlacedSymbol[]): CircuitSummary[] => {
  const map = new Map<string, CircuitSummary>();
  for (const symbol of symbols) {
    const name = getSymbolCircuit(symbol);
    if (!name) continue;
    const entry = map.get(name) ?? { name, count: 0, symbolIds: [] };
    entry.count += 1;
    entry.symbolIds.push(symbol.id);
    map.set(name, entry);
  }
  return [...map.values()].sort((a, b) =>
    a.name.localeCompare(b.name, 'nl', { numeric: true, sensitivity: 'base' })
  );
};

/** Geef enkel de namen van de gebruikte kringen (voor suggesties). */
export const collectCircuitNames = (symbols: PlacedSymbol[]): string[] =>
  collectCircuits(symbols).map((c) => c.name);
