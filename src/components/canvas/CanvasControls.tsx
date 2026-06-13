import { Focus, Grid3x3, Magnet, Minus, Plus } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { MAX_ZOOM, MIN_ZOOM } from '@/types/canvas';

/**
 * Floating canvas controls in the bottom-right corner of the editor.
 */
export const CanvasControls = () => {
  const viewport = useEditorStore((s) => s.viewport);
  const zoomAt = useEditorStore((s) => s.zoomAt);
  const resetView = useEditorStore((s) => s.resetView);
  const gridVisible = useEditorStore((s) => s.gridVisible);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);
  const toggleSnap = useEditorStore((s) => s.toggleSnap);

  const zoomIn = () => {
    const el = document.querySelector('.konvajs-content') as HTMLElement | null;
    const rect = el?.getBoundingClientRect();
    const center = rect
      ? { x: rect.width / 2, y: rect.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    zoomAt(1.2, center);
  };
  const zoomOut = () => {
    const el = document.querySelector('.konvajs-content') as HTMLElement | null;
    const rect = el?.getBoundingClientRect();
    const center = rect
      ? { x: rect.width / 2, y: rect.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    zoomAt(1 / 1.2, center);
  };

  return (
    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-md backdrop-blur">
      <button
        className="btn-icon !text-slate-700 hover:!bg-slate-100"
        onClick={toggleGrid}
        title={gridVisible ? 'Raster verbergen (G)' : 'Raster tonen (G)'}
      >
        <Grid3x3 className={`h-4 w-4 ${gridVisible ? 'text-accent' : ''}`} />
      </button>
      <button
        className="btn-icon !text-slate-700 hover:!bg-slate-100"
        onClick={toggleSnap}
        title={snapEnabled ? 'Snap uit' : 'Snap aan'}
      >
        <Magnet className={`h-4 w-4 ${snapEnabled ? 'text-accent' : ''}`} />
      </button>
      <div className="mx-1 h-6 w-px bg-slate-200" />
      <button
        className="btn-icon !text-slate-700 hover:!bg-slate-100 disabled:opacity-30"
        disabled={viewport.scale <= MIN_ZOOM + 0.001}
        onClick={zoomOut}
        title="Uitzoomen (-)"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[3.5rem] text-center text-xs font-medium tabular-nums text-slate-700">
        {Math.round(viewport.scale * 100)}%
      </span>
      <button
        className="btn-icon !text-slate-700 hover:!bg-slate-100 disabled:opacity-30"
        disabled={viewport.scale >= MAX_ZOOM - 0.001}
        onClick={zoomIn}
        title="Inzoomen (+)"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        className="btn-icon !text-slate-700 hover:!bg-slate-100"
        onClick={resetView}
        title="Weergave resetten (Ctrl+0)"
      >
        <Focus className="h-4 w-4" />
      </button>
    </div>
  );
};
