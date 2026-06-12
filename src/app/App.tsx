import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { PlanCanvas } from '@/components/edt/PlanCanvas';
import { PlanPanel } from '@/components/edt/PlanPanel';
import { SchemaCanvas } from '@/components/edt/SchemaCanvas';
import { PropsPanel } from '@/components/edt/PropsPanel';
import { StatusBar } from '@/components/edt/StatusBar';
import { Toolbar } from '@/components/edt/Toolbar';
import { SymbolPanel } from '@/components/edt/SymbolPanel';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useSchemaStore } from '@/store/schemaStore';

/** Smalle balk met een knop om een ingeklapt zijpaneel terug te openen. */
const CollapsedRail = ({
  side,
  onOpen,
}: {
  side: 'left' | 'right';
  onOpen: () => void;
}) => {
  const Icon = side === 'left' ? PanelLeftOpen : PanelRightOpen;
  const border = side === 'left' ? 'border-r' : 'border-l';
  return (
    <div className={`panel flex w-8 shrink-0 flex-col items-center ${border} py-2`}>
      <button
        onClick={onOpen}
        title={side === 'left' ? 'Symbolen tonen' : 'Eigenschappen tonen'}
        className="btn-icon"
      >
        <Icon className="h-4 w-4" />
      </button>
    </div>
  );
};

export const App = () => {
  const view = useSchemaStore((s) => s.view);
  const leftOpen = useSchemaStore((s) => s.leftPanelOpen);
  const rightOpen = useSchemaStore((s) => s.rightPanelOpen);
  const toggleLeft = useSchemaStore((s) => s.toggleLeftPanel);
  const toggleRight = useSchemaStore((s) => s.toggleRightPanel);
  useKeyboard();

  return (
    <div className="flex h-screen w-screen flex-col bg-panel-dark text-slate-100">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        {leftOpen ? (
          view === 'schema' ? (
            <SymbolPanel />
          ) : (
            <PlanPanel />
          )
        ) : (
          <CollapsedRail side="left" onOpen={toggleLeft} />
        )}
        <main className="relative flex min-w-0 flex-1">
          {view === 'schema' ? <SchemaCanvas /> : <PlanCanvas />}
        </main>
        {view === 'schema' ? (
          rightOpen ? (
            <PropsPanel />
          ) : (
            <CollapsedRail side="right" onOpen={toggleRight} />
          )
        ) : null}
      </div>
      <StatusBar />
    </div>
  );
};
