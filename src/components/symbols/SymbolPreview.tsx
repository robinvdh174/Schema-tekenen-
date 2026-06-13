import { Layer, Stage } from 'react-konva';
import type { SymbolDefinition } from '@/types/symbols';
import { createDefaultProperties } from '@/utils/symbols';

interface SymbolPreviewProps {
  definition: SymbolDefinition;
  size?: number;
  padding?: number;
}

/**
 * Render a scaled-down preview of a symbol definition on a fixed-size stage.
 * Used in the palette and drag-ghost.
 */
export const SymbolPreview = ({ definition, size = 72, padding = 10 }: SymbolPreviewProps) => {
  const inner = size - padding * 2;
  const scale = Math.min(inner / definition.width, inner / definition.height);
  const scaledW = definition.width * scale;
  const scaledH = definition.height * scale;
  const offsetX = (size - scaledW) / 2;
  const offsetY = (size - scaledH) / 2;

  const props = createDefaultProperties(definition.properties);

  return (
    <Stage width={size} height={size} listening={false} style={{ pointerEvents: 'none' }}>
      <Layer x={offsetX} y={offsetY} scaleX={scale} scaleY={scale} listening={false}>
        <definition.Render state="normal" properties={props} />
      </Layer>
    </Stage>
  );
};
