import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { SYMBOL_CATEGORIES } from '@/types/symbols';

export const SymbolPalette = () => {
  const activeCategoryId = useUiStore((s) => s.activeCategoryId);
  const setActiveCategory = useUiStore((s) => s.setActiveCategory);

  return (
    <aside className="panel flex h-full w-64 shrink-0 flex-col border-r">
      <div className="panel-section flex items-center justify-between">
        <h2 className="panel-heading">Symbolenbibliotheek</h2>
        <Sparkles className="h-3.5 w-3.5 text-slate-500" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {SYMBOL_CATEGORIES.map(({ id, label }) => {
          const open = activeCategoryId === id;
          return (
            <div key={id} className="border-b border-panel-border">
              <button
                onClick={() => setActiveCategory(open ? null : id)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-200 hover:bg-panel-light"
              >
                <span>{label}</span>
                {open ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                )}
              </button>
              {open ? (
                <div className="space-y-1 bg-panel-dark/40 px-3 py-2 text-xs text-slate-400">
                  <p className="italic">
                    Symbolen volgen in Fase 2. Elk symbool wordt getekend conform de AREI-conventies
                    en kan straks vanuit dit paneel op het canvas gesleept worden.
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
