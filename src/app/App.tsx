import { EditorCanvas } from '@/components/canvas/EditorCanvas';
import { CanvasControls } from '@/components/canvas/CanvasControls';
import { DrawingTools } from '@/components/toolbar/DrawingTools';
import { MainToolbar } from '@/components/toolbar/MainToolbar';
import { PropertiesPanel } from '@/components/panels/PropertiesPanel';
import { SymbolPalette } from '@/components/panels/SymbolPalette';
import { StatusBar } from '@/components/ui/StatusBar';
import { useUiStore } from '@/store/uiStore';
import { useKeyboard } from '@/hooks/useKeyboard';

export const App = () => {
  const leftOpen = useUiStore((s) => s.leftPanelOpen);
  const rightOpen = useUiStore((s) => s.rightPanelOpen);
  useKeyboard();

  return (
    <div className="flex h-screen w-screen flex-col bg-panel-dark text-slate-100">
      <MainToolbar />
      <div className="flex min-h-0 flex-1">
        {leftOpen ? <SymbolPalette /> : null}
        <main className="relative flex min-w-0 flex-1">
          <EditorCanvas />
          <DrawingTools />
          <CanvasControls />
        </main>
        {rightOpen ? <PropertiesPanel /> : null}
      </div>
      <StatusBar />
    </div>
  );
};
