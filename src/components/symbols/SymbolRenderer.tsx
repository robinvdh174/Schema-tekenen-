import { Group, Rect } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useCallback } from 'react';
import type { PlacedSymbol } from '@/types/symbols';
import { requireSymbolDefinition } from '@/data/symbols';
import { useEditorStore } from '@/store/editorStore';
import { useProjectStore } from '@/store/projectStore';
import { snapPoint } from '@/utils/geometry';
import { ConnectionPoints } from './ConnectionPoints';

interface SymbolRendererProps {
  symbol: PlacedSymbol;
}

export const SymbolRenderer = ({ symbol }: SymbolRendererProps) => {
  const def = requireSymbolDefinition(symbol.type);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const setSelection = useEditorStore((s) => s.setSelection);
  const addToSelection = useEditorStore((s) => s.addToSelection);
  const gridSize = useEditorStore((s) => s.gridSize);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const scale = useEditorStore((s) => s.viewport.scale);
  const tool = useEditorStore((s) => s.tool);
  const mode = useEditorStore((s) => s.mode);
  const moveSymbol = useProjectStore((s) => s.moveSymbol);
  const removeSymbols = useProjectStore((s) => s.removeSymbols);

  const isSelected = selectedIds.includes(symbol.id);
  const state = isSelected ? 'selected' : 'normal';

  const handleClick = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      e.cancelBubble = true;
      if (tool === 'delete') {
        removeSymbols(mode, [symbol.id]);
        return;
      }
      const shiftPressed =
        (e.evt as MouseEvent).shiftKey || (e.evt as MouseEvent).metaKey;
      if (shiftPressed) addToSelection(symbol.id);
      else setSelection([symbol.id]);
    },
    [addToSelection, mode, removeSymbols, setSelection, symbol.id, tool]
  );

  const handleDragStart = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      if (!isSelected) setSelection([symbol.id]);
    },
    [isSelected, setSelection, symbol.id]
  );

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      const node = e.target as Konva.Group;
      const raw = { x: node.x(), y: node.y() };
      const snapped = snapEnabled ? snapPoint(raw, gridSize) : raw;
      node.position(snapped);
      moveSymbol(mode, symbol.id, snapped);
    },
    [gridSize, mode, moveSymbol, snapEnabled, symbol.id]
  );

  const draggable = tool === 'select';
  const bboxScale = 1 / Math.max(scale, 0.25);

  return (
    <Group
      x={symbol.position.x}
      y={symbol.position.y}
      rotation={symbol.rotation}
      draggable={draggable}
      onClick={handleClick}
      onTap={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Invisible hit rect so the whole bounding box is clickable even on thin strokes */}
      <Rect x={0} y={0} width={def.width} height={def.height} fill="transparent" />

      <def.Render state={state} properties={symbol.properties} />

      {isSelected ? (
        <Rect
          x={-4 * bboxScale}
          y={-4 * bboxScale}
          width={def.width + 8 * bboxScale}
          height={def.height + 8 * bboxScale}
          stroke="#2563eb"
          strokeWidth={1.25 * bboxScale}
          dash={[4 * bboxScale, 3 * bboxScale]}
          listening={false}
          cornerRadius={2 * bboxScale}
        />
      ) : null}

      <ConnectionPoints points={def.connectionPoints} visible={isSelected} scale={scale} />
    </Group>
  );
};
