import { ChevronDown, ChevronRight } from 'lucide-react';
import { getSymbolsByCategory } from '@/data/symbols';
import { SYMBOL_CATEGORIES } from '@/types/symbols';
import { useUiStore } from '@/store/uiStore';
import { SymbolPaletteItem } from './SymbolPaletteItem';

export const SymbolPalette = () => {
  const activeCategoryId = useUiStore((s) => s.activeCategoryId);
  const setActiveCategory = useUiStore((s) => s.setActiveCategory);

  return (
    <aside className="panel flex h-full w-64 shrink-0 flex-col border-r">
      <div className="panel-section flex items-center justify-between">
        <h2 className="panel-heading">Symbolenbibliotheek</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {SYMBOL_CATEGORIES.map(({ id, label }) => {
          const open = activeCategoryId === id;
          const symbols = getSymbolsByCategory(id);
          return (
            <div key={id} className="border-b border-panel-border">
              <button
                onClick={() => setActiveCategory(open ? null : id)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-200 hover:bg-panel-light"
              >
                <span className="flex items-center gap-2">
                  {open ? (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  )}
                  {label}
                </span>
                <span className="text-[11px] text-slate-500">{symbols.length}</span>
              </button>
              {open ? (
                <div className="grid grid-cols-2 gap-1.5 bg-panel-dark/40 p-2">
                  {symbols.map((def) => (
                    <SymbolPaletteItem key={def.type} definition={def} />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="panel-section text-[11px] text-slate-500">
        Sleep een symbool naar het canvas om het te plaatsen.
      </div>
    </aside>
  );
};
