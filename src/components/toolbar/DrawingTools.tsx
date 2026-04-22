import { Cable, Hand, MousePointer2, Trash2 } from 'lucide-react';
import type { ComponentType } from 'react';
import { useEditorStore } from '@/store/editorStore';
import type { EditorTool } from '@/types/canvas';

interface ToolItem {
  id: EditorTool;
  label: string;
  shortcut: string;
  icon: ComponentType<{ className?: string }>;
}

const TOOLS: ToolItem[] = [
  { id: 'select', label: 'Selecteren', shortcut: 'V', icon: MousePointer2 },
  { id: 'pan', label: 'Verschuiven', shortcut: 'H', icon: Hand },
  { id: 'wire', label: 'Draad tekenen', shortcut: 'W', icon: Cable },
  { id: 'delete', label: 'Verwijderen', shortcut: 'Del', icon: Trash2 },
];

export const DrawingTools = () => {
  const tool = useEditorStore((s) => s.tool);
  const setTool = useEditorStore((s) => s.setTool);

  return (
    <div className="absolute left-4 top-4 z-10 flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-md backdrop-blur">
      {TOOLS.map(({ id, label, shortcut, icon: Icon }) => {
        const active = tool === id;
        return (
          <button
            key={id}
            onClick={() => setTool(id)}
            title={`${label} (${shortcut})`}
            className={
              'inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors ' +
              (active
                ? 'bg-accent text-white'
                : 'text-slate-700 hover:bg-slate-100')
            }
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
};
