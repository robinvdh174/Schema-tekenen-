import { Map, SquareStack } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import type { EditorMode } from '@/types/canvas';

const TABS: { id: EditorMode; label: string; icon: typeof SquareStack }[] = [
  { id: 'eendraad', label: 'Eendraadschema', icon: SquareStack },
  { id: 'situatie', label: 'Situatieplan', icon: Map },
];

export const TabSwitcher = () => {
  const mode = useEditorStore((s) => s.mode);
  const setMode = useEditorStore((s) => s.setMode);

  return (
    <div className="flex items-center rounded-md border border-panel-border bg-panel-dark p-0.5">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={
              'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ' +
              (active
                ? 'bg-accent text-white shadow'
                : 'text-slate-300 hover:bg-panel-light')
            }
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
