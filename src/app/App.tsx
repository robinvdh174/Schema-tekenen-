import { EditorCanvas } from '@/components/canvas/EditorCanvas';
import { CanvasControls } from '@/components/canvas/CanvasControls';
import { DrawingTools } from '@/components/toolbar/DrawingTools';
import { MainToolbar } from '@/components/toolbar/MainToolbar';
import { PropertiesPanel } from '@/components/panels/PropertiesPanel';
import { SymbolPalette } from '@/components/panels/SymbolPalette';
import { SymbolDragGhost } from '@/components/symbols/SymbolDragGhost';
import { StatusBar } from '@/components/ui/StatusBar';
import { useUiStore } from '@/store/uiStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const App = () => {
  const leftOpen = useUiStore((s) => s.leftPanelOpen);
  const rightOpen = useUiStore((s) => s.rightPanelOpen);
  const toggleLeft = useUiStore((s) => s.toggleLeftPanel);
  const toggleRight = useUiStore((s) => s.toggleRightPanel);
  // Brede schermen: panelen vast naast het canvas. Smal: als lade erover.
  const isWide = useMediaQuery('(min-width: 1024px)');
  useKeyboard();

  return (
    <div className="flex h-[100dvh] w-screen flex-col overflow-hidden bg-panel-dark text-slate-100">
      <MainToolbar />
      <div className="relative flex min-h-0 flex-1">
        {/* Linker symbolenpaneel — vast op brede schermen */}
        {isWide && leftOpen ? <SymbolPalette /> : null}

        <main className="relative flex min-w-0 flex-1">
          <EditorCanvas />
          <DrawingTools />
          <CanvasControls />
        </main>

        {/* Rechter eigenschappenpaneel — vast op brede schermen */}
        {isWide && rightOpen ? <PropertiesPanel /> : null}

        {/* Smalle schermen: panelen schuiven als lade over het canvas.
            Geen modale achtergrond, zodat je nog naar het canvas kan slepen. */}
        {!isWide ? (
          <>
            <div
              className={`absolute inset-y-0 left-0 z-30 shadow-2xl transition-transform duration-200 ${
                leftOpen ? 'translate-x-0' : '-translate-x-[110%]'
              }`}
            >
              <SymbolPalette onClose={toggleLeft} />
            </div>
            <div
              className={`absolute inset-y-0 right-0 z-30 shadow-2xl transition-transform duration-200 ${
                rightOpen ? 'translate-x-0' : 'translate-x-[110%]'
              }`}
            >
              <PropertiesPanel onClose={toggleRight} />
            </div>
          </>
        ) : null}
      </div>

      <StatusBar />
      <SymbolDragGhost />
    </div>
  );
};
