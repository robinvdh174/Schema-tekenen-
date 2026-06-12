/**
 * Het canvas registreert hier zijn exportfunctie zodat de werkbalk het
 * schema als afbeelding kan opvragen zonder rechtstreekse koppeling.
 */

export interface SchemaImage {
  dataUrl: string;
  width: number;
  height: number;
}

let exporter: (() => SchemaImage | null) | null = null;
let fitter: (() => void) | null = null;

export const registerExporter = (fn: (() => SchemaImage | null) | null) => {
  exporter = fn;
};

export const exportSchemaImage = (): SchemaImage | null => exporter?.() ?? null;

export const registerFitView = (fn: (() => void) | null) => {
  fitter = fn;
};

export const fitView = () => fitter?.();
