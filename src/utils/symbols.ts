import type {
  PlacedSymbol,
  PropertyDefinition,
  PropertyValue,
  SymbolDefinition,
} from '@/types/symbols';

/** Build a record of concrete property values from a symbol definition's defaults. */
export const createDefaultProperties = (
  definitions: Record<string, PropertyDefinition>
): Record<string, PropertyValue> => {
  const result: Record<string, PropertyValue> = {};
  for (const [key, def] of Object.entries(definitions)) {
    result[key] = {
      label: def.label,
      type: def.type,
      value: def.defaultValue,
      options: def.options,
      suggestions: def.suggestions,
      unit: def.unit,
    };
  }
  return result;
};

/** Return the bounding rect of a placed symbol given its definition. */
export const getSymbolBounds = (symbol: PlacedSymbol, def: SymbolDefinition) => {
  // Rotation changes width/height swap for 90/270.
  const rotated = symbol.rotation === 90 || symbol.rotation === 270;
  return {
    x: symbol.position.x,
    y: symbol.position.y,
    width: rotated ? def.height : def.width,
    height: rotated ? def.width : def.height,
  };
};
