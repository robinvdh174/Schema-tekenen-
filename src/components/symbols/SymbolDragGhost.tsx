import { useSymbolDrag } from '@/hooks/useSymbolDrag';
import { SymbolPreview } from './SymbolPreview';

const GHOST_SIZE = 80;

export const SymbolDragGhost = () => {
  const definition = useSymbolDrag((s) => s.definition);
  const screen = useSymbolDrag((s) => s.screen);

  if (!definition || !screen) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-md border border-accent/40 bg-white/90 shadow-lg"
      style={{
        left: screen.x - GHOST_SIZE / 2,
        top: screen.y - GHOST_SIZE / 2,
        width: GHOST_SIZE,
        height: GHOST_SIZE,
      }}
    >
      <SymbolPreview definition={definition} size={GHOST_SIZE} padding={10} />
    </div>
  );
};
