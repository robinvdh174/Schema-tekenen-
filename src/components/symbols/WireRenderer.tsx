import { Group, Line, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useCallback, useMemo } from 'react';
import type { Wire } from '@/types/wire';
import { useEditorStore } from '@/store/editorStore';
import { useProjectStore } from '@/store/projectStore';
import { requireSymbolDefinition } from '@/data/symbols';
import { pointsToArray, resolveConnectionPoint, routeWire } from '@/utils/wireRouting';
import { FONT_FAMILY } from '@/data/symbols/draw';

interface WireRendererProps {
  wire: Wire;
}

/**
 * Render a wire as an orthogonal polyline. Endpoints are resolved from the
 * referenced symbols so wires stay attached when symbols are moved or rotated.
 */
export const WireRenderer = ({ wire }: WireRendererProps) => {
  const mode = useEditorStore((s) => s.mode);
  const selectedWireIds = useEditorStore((s) => s.selectedWireIds);
  const setWireSelection = useEditorStore((s) => s.setWireSelection);
  const tool = useEditorStore((s) => s.tool);
  const scale = useEditorStore((s) => s.viewport.scale);

  const symbols = useProjectStore((s) =>
    mode === 'eendraad' ? s.project.eendraad.symbols : s.project.situatie.symbols
  );
  const removeWires = useProjectStore((s) => s.removeWires);

  const points = useMemo(() => {
    const aSym = symbols.find((s) => s.id === wire.from.symbolId);
    const bSym = symbols.find((s) => s.id === wire.to.symbolId);
    if (!aSym || !bSym) return null;
    const aDef = requireSymbolDefinition(aSym.type);
    const bDef = requireSymbolDefinition(bSym.type);
    const a = resolveConnectionPoint(aSym, aDef, wire.from.connectionPointId);
    const b = resolveConnectionPoint(bSym, bDef, wire.to.connectionPointId);
    if (!a || !b) return null;
    return routeWire(a, b);
  }, [symbols, wire.from, wire.to]);

  const isSelected = selectedWireIds.includes(wire.id);

  const handleClick = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      e.cancelBubble = true;
      if (tool === 'delete') {
        removeWires(mode, [wire.id]);
        return;
      }
      setWireSelection([wire.id]);
    },
    [mode, removeWires, setWireSelection, tool, wire.id]
  );

  if (!points || points.length < 2) return null;

  const sInv = 1 / Math.max(scale, 0.25);
  const stroke = isSelected ? '#2563eb' : '#111827';
  const strokeWidth = isSelected ? 2.4 : 1.8;

  // Choose the longest segment to put the label on
  let longestIdx = 0;
  let longestLen = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const len = Math.hypot(dx, dy);
    if (len > longestLen) {
      longestLen = len;
      longestIdx = i;
    }
  }
  const seg = { a: points[longestIdx], b: points[longestIdx + 1] };
  const midX = (seg.a.x + seg.b.x) / 2;
  const midY = (seg.a.y + seg.b.y) / 2;
  const horizontalSegment = Math.abs(seg.b.x - seg.a.x) > Math.abs(seg.b.y - seg.a.y);
  const labelText = `${wire.crossSection}mm² ${wire.cableType}`;

  return (
    <Group>
      {/* Fat invisible hit area for easier clicking/tapping */}
      <Line
        points={pointsToArray(points)}
        stroke="transparent"
        strokeWidth={10 * sInv}
        onClick={handleClick}
        onTap={handleClick}
        listening
      />
      <Line
        points={pointsToArray(points)}
        stroke={stroke}
        strokeWidth={strokeWidth}
        lineCap="round"
        lineJoin="round"
        listening={false}
      />
      {longestLen > 40 ? (
        <Text
          x={horizontalSegment ? midX - 40 : midX + 4 * sInv}
          y={horizontalSegment ? midY - 14 * sInv : midY - 6 * sInv}
          width={horizontalSegment ? 80 : undefined}
          text={labelText}
          align={horizontalSegment ? 'center' : 'left'}
          fontFamily={FONT_FAMILY}
          fontSize={9 * sInv}
          fill={isSelected ? '#2563eb' : '#475569'}
          listening={false}
        />
      ) : null}
    </Group>
  );
};
