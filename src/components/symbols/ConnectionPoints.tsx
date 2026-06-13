import { Circle } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useCallback } from 'react';
import type { ConnectionPointDefinition } from '@/types/symbols';
import type { Wire, WireEndpoint } from '@/types/wire';
import { useEditorStore } from '@/store/editorStore';
import { useProjectStore } from '@/store/projectStore';
import { createId } from '@/utils/id';

interface ConnectionPointsProps {
  symbolId: string;
  points: ConnectionPointDefinition[];
  visible: boolean;
}

export const ConnectionPoints = ({ symbolId, points, visible }: ConnectionPointsProps) => {
  const scale = useEditorStore((s) => s.viewport.scale);
  const tool = useEditorStore((s) => s.tool);
  const wireStart = useEditorStore((s) => s.wireStart);
  const setWireStart = useEditorStore((s) => s.setWireStart);
  const mode = useEditorStore((s) => s.mode);
  const addWire = useProjectStore((s) => s.addWire);

  const handleClick = useCallback(
    (connectionPointId: string, e: KonvaEventObject<Event>) => {
      if (tool !== 'wire') return;
      e.cancelBubble = true;

      const endpoint: WireEndpoint = { symbolId, connectionPointId };

      if (!wireStart) {
        setWireStart(endpoint);
        return;
      }
      // Don't allow connecting a point to itself
      if (
        wireStart.symbolId === endpoint.symbolId &&
        wireStart.connectionPointId === endpoint.connectionPointId
      ) {
        return;
      }

      const wire: Wire = {
        id: createId('wire'),
        from: wireStart,
        to: endpoint,
        points: [],
        crossSection: '2.5',
        cableType: 'XVB',
      };
      addWire(mode, wire);
      setWireStart(null);
    },
    [addWire, mode, setWireStart, symbolId, tool, wireStart]
  );

  if (!visible && tool !== 'wire') return null;

  const sInv = 1 / Math.max(scale, 0.25);
  const radius = 4 * sInv;
  const hitRadius = 10 * sInv;

  const nodes = points.flatMap((p) => {
    const isWireStart =
      wireStart?.symbolId === symbolId && wireStart.connectionPointId === p.id;
    const fill = isWireStart ? '#22c55e' : '#ffffff';
    const stroke = isWireStart ? '#16a34a' : '#2563eb';
    const items = [];
    if (tool === 'wire') {
      items.push(
        <Circle
          key={`${p.id}-hit`}
          x={p.x}
          y={p.y}
          radius={hitRadius}
          fill="transparent"
          onClick={(e) => handleClick(p.id, e)}
          onTap={(e) => handleClick(p.id, e)}
          listening
        />
      );
    }
    items.push(
      <Circle
        key={p.id}
        x={p.x}
        y={p.y}
        radius={radius}
        stroke={stroke}
        strokeWidth={1.5 * sInv}
        fill={fill}
        listening={false}
      />
    );
    return items;
  });

  return <>{nodes}</>;
};
