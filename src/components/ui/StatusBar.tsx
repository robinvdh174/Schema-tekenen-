import { useEditorStore } from '@/store/editorStore';

const TOOL_LABELS: Record<string, string> = {
  select: 'Selecteren',
  pan: 'Verschuiven',
  wire: 'Draad tekenen',
  delete: 'Verwijderen',
};

const MODE_LABELS: Record<string, string> = {
  eendraad: 'Eendraadschema',
  situatie: 'Situatieplan',
};

export const StatusBar = () => {
  const cursor = useEditorStore((s) => s.cursor);
  const tool = useEditorStore((s) => s.tool);
  const mode = useEditorStore((s) => s.mode);
  const scale = useEditorStore((s) => s.viewport.scale);
  const gridSize = useEditorStore((s) => s.gridSize);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-panel-border bg-panel px-3 text-[11px] text-slate-400">
      <div className="flex items-center gap-4">
        <span>
          Modus: <span className="text-slate-200">{MODE_LABELS[mode]}</span>
        </span>
        <span>
          Tool: <span className="text-slate-200">{TOOL_LABELS[tool]}</span>
        </span>
        <span>
          Snap: <span className="text-slate-200">{snapEnabled ? 'aan' : 'uit'}</span>
        </span>
        <span>
          Raster: <span className="text-slate-200">{gridSize}px</span>
        </span>
      </div>
      <div className="flex items-center gap-4 tabular-nums">
        {cursor ? (
          <span>
            x: <span className="text-slate-200">{Math.round(cursor.x)}</span>
            {'  '}
            y: <span className="text-slate-200">{Math.round(cursor.y)}</span>
          </span>
        ) : (
          <span className="opacity-60">x: — y: —</span>
        )}
        <span>
          Zoom: <span className="text-slate-200">{Math.round(scale * 100)}%</span>
        </span>
      </div>
    </footer>
  );
};
