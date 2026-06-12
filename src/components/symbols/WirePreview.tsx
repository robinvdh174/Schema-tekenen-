import { Line } from 'react-konva';
import { useEditorStore } from '@/store/editorStore';
import { useProjectStore } from '@/store/projectStore';
import { requireSymbolDefinition } from '@/data/symbols';
import { pointsToArray, resolveConnectionPoint, routeWire } from '@/utils/wireRouting';

/**
 * Renders a dashed orthogonal preview from the first picked connection point
 * to the current cursor position while the user is drawing a new wire.
 */
export const WirePreview = () => {
  const tool = useEditorStore((s) => s.tool);
  const wireStart = useEditorStore((s) => s.wireStart);
  const cursor = useEditorStore((s) => s.cursor);
  const scale = useEditorStore((s) => s.viewport.scale);
  const mode = useEditorStore((s) => s.mode);
  const symbols = useProjectStore((s) =>
    mode === 'eendraad' ? s.project.eendraad.symbols : s.project.situatie.symbols
  );

  if (tool !== 'wire' || !wireStart || !cursor) return null;

  const startSymbol = symbols.find((s) => s.id === wireStart.symbolId);
  if (!startSymbol) return null;
  const def = requireSymbolDefinition(startSymbol.type);
  const start = resolveConnectionPoint(startSymbol, def, wireStart.connectionPointId);
  if (!start) return null;

  // Choose a sensible pseudo-side on the cursor so routing behaves well
  const dx = cursor.x - start.x;
  const dy = cursor.y - start.y;
  const endSide: 'top' | 'bottom' | 'left' | 'right' =
    Math.abs(dx) > Math.abs(dy)
      ? dx >= 0
        ? 'left'
        : 'right'
      : dy >= 0
        ? 'top'
        : 'bottom';

  const points = routeWire(start, { x: cursor.x, y: cursor.y, side: endSide });
  const sInv = 1 / Math.max(scale, 0.25);

  return (
    <Line
      points={pointsToArray(points)}
      stroke="#2563eb"
      strokeWidth={1.8}
      dash={[6 * sInv, 4 * sInv]}
      lineCap="round"
      lineJoin="round"
      listening={false}
    />
  );
};
