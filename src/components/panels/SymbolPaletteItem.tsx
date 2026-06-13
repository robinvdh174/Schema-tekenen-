import { useCallback, useEffect, useRef } from 'react';
import type { PlacedSymbol, SymbolDefinition } from '@/types/symbols';
import { useSymbolDrag } from '@/hooks/useSymbolDrag';
import { useEditorStore } from '@/store/editorStore';
import { useProjectStore } from '@/store/projectStore';
import { createDefaultProperties } from '@/utils/symbols';
import { createId } from '@/utils/id';
import { snapPoint } from '@/utils/geometry';
import { SymbolPreview } from '@/components/symbols/SymbolPreview';

const DRAG_THRESHOLD = 4;

interface SymbolPaletteItemProps {
  definition: SymbolDefinition;
}

/**
 * One draggable tile in the symbol palette.
 * Uses pointer events for a drag gesture that works consistently
 * on mouse, trackpad and iPad touch.
 */
export const SymbolPaletteItem = ({ definition }: SymbolPaletteItemProps) => {
  const startDrag = useSymbolDrag((s) => s.startDrag);
  const updateDrag = useSymbolDrag((s) => s.updateDrag);
  const endDrag = useSymbolDrag((s) => s.endDrag);

  const draggingRef = useRef(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const handleDrop = useCallback(
    (clientX: number, clientY: number) => {
      const surface = document
        .elementFromPoint(clientX, clientY)
        ?.closest('[data-canvas-surface="true"]') as HTMLElement | null;
      if (!surface) return;

      const rect = surface.getBoundingClientRect();
      const { viewport, gridSize, snapEnabled } = useEditorStore.getState();
      const mode = useEditorStore.getState().mode;

      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      let world = {
        x: (localX - viewport.offsetX) / viewport.scale - definition.width / 2,
        y: (localY - viewport.offsetY) / viewport.scale - definition.height / 2,
      };
      if (snapEnabled) world = snapPoint(world, gridSize);

      const symbol: PlacedSymbol = {
        id: createId('sym'),
        type: definition.type,
        position: world,
        rotation: 0,
        properties: createDefaultProperties(definition.properties),
      };

      useProjectStore.getState().addSymbol(mode, symbol);
      useEditorStore.getState().setSelection([symbol.id]);
    },
    [definition]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      draggingRef.current = false;
      startRef.current = { x: e.clientX, y: e.clientY };

      const onMove = (ev: PointerEvent) => {
        const start = startRef.current;
        if (!start) return;
        const dx = ev.clientX - start.x;
        const dy = ev.clientY - start.y;
        if (!draggingRef.current && Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
          draggingRef.current = true;
          startDrag(definition, { x: ev.clientX, y: ev.clientY });
        }
        if (draggingRef.current) updateDrag({ x: ev.clientX, y: ev.clientY });
      };

      const onUp = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        if (draggingRef.current) {
          handleDrop(ev.clientX, ev.clientY);
          endDrag();
        }
        draggingRef.current = false;
        startRef.current = null;
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [definition, endDrag, handleDrop, startDrag, updateDrag]
  );

  // Prevent native drag behavior from interfering on touch devices
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener('dragstart', prevent);
    return () => document.removeEventListener('dragstart', prevent);
  }, []);

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      title={`${definition.name} — ${definition.description}`}
      className="group flex flex-col items-center gap-1 rounded-md border border-transparent bg-panel-dark/60 p-2 text-center text-[10px] text-slate-300 transition hover:border-accent/40 hover:bg-panel-light active:border-accent touch-none select-none"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded bg-white text-slate-900">
        <SymbolPreview definition={definition} size={64} padding={8} />
      </div>
      <span className="line-clamp-2 leading-tight text-slate-200 group-hover:text-white">
        {definition.name}
      </span>
    </button>
  );
};
