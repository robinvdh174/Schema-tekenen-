import { useCallback, useEffect, useRef, useState } from 'react';
import { Layer, Stage } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useEditorStore } from '@/store/editorStore';
import { useProjectStore } from '@/store/projectStore';
import { useContainerSize } from '@/hooks/useContainerSize';
import { Grid } from './Grid';
import { SymbolRenderer } from '@/components/symbols/SymbolRenderer';
import { clamp } from '@/utils/geometry';

/**
 * The main editor canvas. Handles pan, wheel zoom, pinch zoom, and renders
 * all placed symbols for the currently active mode.
 */
export const EditorCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const { width, height } = useContainerSize(containerRef);

  const viewport = useEditorStore((s) => s.viewport);
  const setViewport = useEditorStore((s) => s.setViewport);
  const zoomAt = useEditorStore((s) => s.zoomAt);
  const gridVisible = useEditorStore((s) => s.gridVisible);
  const gridSize = useEditorStore((s) => s.gridSize);
  const tool = useEditorStore((s) => s.tool);
  const mode = useEditorStore((s) => s.mode);
  const setCursor = useEditorStore((s) => s.setCursor);
  const clearSelection = useEditorStore((s) => s.clearSelection);

  const symbols = useProjectStore((s) =>
    mode === 'eendraad' ? s.project.eendraad.symbols : s.project.situatie.symbols
  );

  const [isPanning, setIsPanning] = useState(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const pinchRef = useRef<{ distance: number; center: { x: number; y: number } } | null>(null);

  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const isZoomGesture = e.evt.ctrlKey || Math.abs(e.evt.deltaY) > 40;
      if (!isZoomGesture) {
        setViewport({
          offsetX: viewport.offsetX - e.evt.deltaX,
          offsetY: viewport.offsetY - e.evt.deltaY,
        });
        return;
      }

      const factor = e.evt.deltaY > 0 ? 0.9 : 1.1;
      zoomAt(factor, pointer);
    },
    [setViewport, viewport.offsetX, viewport.offsetY, zoomAt]
  );

  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (e.target === e.target.getStage()) clearSelection();
    },
    [clearSelection]
  );

  const handlePointerDown = useCallback(
    (e: KonvaEventObject<PointerEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;

      const middleButton = e.evt.button === 1;
      const spaceDown = (window as unknown as { __spaceDown?: boolean }).__spaceDown === true;
      const shouldPan = tool === 'pan' || middleButton || spaceDown;

      if (shouldPan) {
        setIsPanning(true);
        lastPointerRef.current = { x: e.evt.clientX, y: e.evt.clientY };
        e.evt.preventDefault();
      }
    },
    [tool]
  );

  const handlePointerMove = useCallback(
    (e: KonvaEventObject<PointerEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (pointer) {
        setCursor({
          x: (pointer.x - viewport.offsetX) / viewport.scale,
          y: (pointer.y - viewport.offsetY) / viewport.scale,
        });
      }

      if (isPanning && lastPointerRef.current) {
        const dx = e.evt.clientX - lastPointerRef.current.x;
        const dy = e.evt.clientY - lastPointerRef.current.y;
        lastPointerRef.current = { x: e.evt.clientX, y: e.evt.clientY };
        setViewport({
          offsetX: viewport.offsetX + dx,
          offsetY: viewport.offsetY + dy,
        });
      }
    },
    [isPanning, setCursor, setViewport, viewport.offsetX, viewport.offsetY, viewport.scale]
  );

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
    lastPointerRef.current = null;
  }, []);

  const handleTouchMove = useCallback(
    (e: KonvaEventObject<TouchEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;
      const touches = e.evt.touches;
      if (touches.length !== 2) return;

      e.evt.preventDefault();
      const [t1, t2] = [touches[0], touches[1]];
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      const dist = Math.hypot(dx, dy);

      const rect = stage.container().getBoundingClientRect();
      const center = {
        x: (t1.clientX + t2.clientX) / 2 - rect.left,
        y: (t1.clientY + t2.clientY) / 2 - rect.top,
      };

      const prev = pinchRef.current;
      if (!prev) {
        pinchRef.current = { distance: dist, center };
        return;
      }

      const factor = clamp(dist / prev.distance, 0.5, 2);
      if (factor !== 1) zoomAt(factor, center);
      const pan = {
        x: center.x - prev.center.x,
        y: center.y - prev.center.y,
      };
      if (pan.x || pan.y) {
        setViewport({
          offsetX: viewport.offsetX + pan.x,
          offsetY: viewport.offsetY + pan.y,
        });
      }
      pinchRef.current = { distance: dist, center };
    },
    [setViewport, viewport.offsetX, viewport.offsetY, zoomAt]
  );

  const handleTouchEnd = useCallback((e: KonvaEventObject<TouchEvent>) => {
    if (e.evt.touches.length < 2) pinchRef.current = null;
  }, []);

  useEffect(() => {
    const global = window as unknown as { __spaceDown?: boolean };
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) global.__spaceDown = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') global.__spaceDown = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const cursorClass = isPanning
    ? 'cursor-grabbing'
    : tool === 'pan'
      ? 'cursor-grab'
      : tool === 'delete'
        ? 'cursor-crosshair'
        : 'cursor-default';

  return (
    <div
      ref={containerRef}
      data-canvas-surface="true"
      className={`relative h-full w-full bg-canvas ${cursorClass}`}
    >
      {width > 0 && height > 0 ? (
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Grid layer (non-interactive) */}
          <Layer
            x={viewport.offsetX}
            y={viewport.offsetY}
            scaleX={viewport.scale}
            scaleY={viewport.scale}
            listening={false}
          >
            {gridVisible ? (
              <Grid
                width={width}
                height={height}
                gridSize={gridSize}
                scale={viewport.scale}
                offsetX={viewport.offsetX}
                offsetY={viewport.offsetY}
              />
            ) : null}
          </Layer>

          {/* Symbols layer */}
          <Layer
            x={viewport.offsetX}
            y={viewport.offsetY}
            scaleX={viewport.scale}
            scaleY={viewport.scale}
          >
            {symbols.map((symbol) => (
              <SymbolRenderer key={symbol.id} symbol={symbol} />
            ))}
          </Layer>
        </Stage>
      ) : null}
    </div>
  );
};
