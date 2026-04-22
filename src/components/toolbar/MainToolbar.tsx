import {
  Download,
  FilePlus2,
  FolderOpen,
  PanelLeft,
  PanelRight,
  Redo2,
  Save,
  Undo2,
} from 'lucide-react';
import { useHistoryStore } from '@/store/historyStore';
import { useProjectStore } from '@/store/projectStore';
import { useUiStore } from '@/store/uiStore';
import { TabSwitcher } from '@/components/ui/TabSwitcher';

export const MainToolbar = () => {
  const projectName = useProjectStore((s) => s.project.metadata.name);
  const dirty = useProjectStore((s) => s.dirty);
  const updateMetadata = useProjectStore((s) => s.updateMetadata);
  const toggleLeftPanel = useUiStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useUiStore((s) => s.toggleRightPanel);
  const canUndo = useHistoryStore((s) => s.canUndo);
  const canRedo = useHistoryStore((s) => s.canRedo);
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-panel-border bg-panel px-2 text-slate-100">
      <div className="flex items-center gap-1">
        <button className="btn-icon" title="Linker paneel" onClick={toggleLeftPanel}>
          <PanelLeft className="h-4 w-4" />
        </button>
        <div className="toolbar-separator" />
        <button className="btn-ghost" title="Nieuw project">
          <FilePlus2 className="h-4 w-4" />
          <span className="hidden md:inline">Nieuw</span>
        </button>
        <button className="btn-ghost" title="Project openen">
          <FolderOpen className="h-4 w-4" />
          <span className="hidden md:inline">Openen</span>
        </button>
        <button className="btn-ghost" title="Opslaan (Ctrl+S)">
          <Save className="h-4 w-4" />
          <span className="hidden md:inline">Opslaan</span>
        </button>
        <div className="toolbar-separator" />
        <button
          className="btn-icon"
          title="Ongedaan maken (Ctrl+Z)"
          onClick={undo}
          disabled={!canUndo}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          className="btn-icon"
          title="Opnieuw doen (Ctrl+Shift+Z)"
          onClick={redo}
          disabled={!canRedo}
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center gap-3 px-4">
        <input
          value={projectName}
          onChange={(e) => updateMetadata({ name: e.target.value })}
          className="max-w-[22rem] flex-1 truncate rounded-md border border-transparent bg-panel-light px-3 py-1.5 text-center text-sm font-medium text-slate-100 placeholder-slate-500 focus:border-accent focus:bg-panel-dark focus:outline-none"
          placeholder="Projectnaam"
          spellCheck={false}
        />
        {dirty ? (
          <span className="text-xs text-amber-400" title="Niet opgeslagen wijzigingen">
            &bull; niet opgeslagen
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        <TabSwitcher />
        <div className="toolbar-separator" />
        <button className="btn-ghost" title="Exporteren naar PDF">
          <Download className="h-4 w-4" />
          <span className="hidden md:inline">PDF</span>
        </button>
        <button className="btn-icon" title="Rechter paneel" onClick={toggleRightPanel}>
          <PanelRight className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
