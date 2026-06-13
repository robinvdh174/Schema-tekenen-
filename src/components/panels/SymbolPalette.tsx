import { useMemo, useState } from 'react';
import {
  Gauge,
  Lightbulb,
  type LucideIcon,
  Plug,
  Refrigerator,
  Search,
  Shapes,
  ShieldCheck,
  ToggleRight,
  X,
} from 'lucide-react';
import { ALL_SYMBOLS, getSymbolsByCategory } from '@/data/symbols';
import { SYMBOL_CATEGORIES, type SymbolCategory } from '@/types/symbols';
import { useUiStore } from '@/store/uiStore';
import { SymbolPaletteItem } from './SymbolPaletteItem';

const CATEGORY_ICONS: Record<SymbolCategory, LucideIcon> = {
  voeding: Gauge,
  beveiliging: ShieldCheck,
  stopcontacten: Plug,
  schakelaars: ToggleRight,
  verlichting: Lightbulb,
  toestellen: Refrigerator,
  diversen: Shapes,
};

export const SymbolPalette = ({ onClose }: { onClose?: () => void }) => {
  const activeCategoryId = useUiStore((s) => s.activeCategoryId);
  const setActiveCategory = useUiStore((s) => s.setActiveCategory);
  const [query, setQuery] = useState('');

  const activeId = (activeCategoryId ?? 'voeding') as SymbolCategory;
  const trimmed = query.trim().toLowerCase();

  // Bij zoeken: toon platte resultaten over alle categorieën heen.
  const searchResults = useMemo(() => {
    if (!trimmed) return null;
    return ALL_SYMBOLS.filter(
      (def) =>
        def.name.toLowerCase().includes(trimmed) ||
        def.description.toLowerCase().includes(trimmed)
    );
  }, [trimmed]);

  const activeCategory = SYMBOL_CATEGORIES.find((c) => c.id === activeId);
  const categorySymbols = getSymbolsByCategory(activeId);

  return (
    <aside className="panel flex h-full shrink-0 border-r">
      {/* Categorie-iconrail (Trikker-stijl) */}
      <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-panel-border bg-panel-dark/40 py-2">
        {SYMBOL_CATEGORIES.map(({ id, short }) => {
          const Icon = CATEGORY_ICONS[id];
          const active = !trimmed && id === activeId;
          return (
            <button
              key={id}
              onClick={() => {
                setQuery('');
                setActiveCategory(id);
              }}
              title={SYMBOL_CATEGORIES.find((c) => c.id === id)?.label}
              className={
                'flex w-14 flex-col items-center gap-1 rounded-md py-2 text-[9px] leading-tight transition ' +
                (active
                  ? 'bg-accent/15 text-accent'
                  : 'text-slate-400 hover:bg-panel-light hover:text-slate-100')
              }
            >
              <Icon className="h-5 w-5" />
              <span className="line-clamp-1">{short}</span>
            </button>
          );
        })}
      </nav>

      {/* Symbolen-inhoud */}
      <div className="flex w-60 flex-col">
        <div className="panel-section space-y-2">
          {onClose ? (
            <div className="flex items-center justify-between">
              <span className="panel-heading">Symbolen</span>
              <button
                onClick={onClose}
                className="rounded p-1 text-slate-400 hover:bg-panel-light hover:text-slate-100"
                title="Paneel sluiten"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoek symbool…"
              className="w-full rounded-md border border-panel-border bg-panel-dark/60 py-1.5 pl-7 pr-7 text-sm text-slate-100 placeholder-slate-500 focus:border-accent focus:outline-none"
            />
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-500 hover:text-slate-200"
                title="Wissen"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          {!trimmed && activeCategory ? (
            <h2 className="panel-heading">{activeCategory.label}</h2>
          ) : (
            <h2 className="panel-heading">
              {searchResults?.length ?? 0} resultaat
              {(searchResults?.length ?? 0) === 1 ? '' : 'en'}
            </h2>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {searchResults ? (
            searchResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5">
                {searchResults.map((def) => (
                  <SymbolPaletteItem key={def.type} definition={def} />
                ))}
              </div>
            ) : (
              <p className="px-1 py-4 text-center text-xs text-slate-500">
                Geen symbool gevonden voor "{query}".
              </p>
            )
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {categorySymbols.map((def) => (
                <SymbolPaletteItem key={def.type} definition={def} />
              ))}
            </div>
          )}
        </div>

        <div className="panel-section text-[11px] text-slate-500">
          Sleep een symbool naar het canvas om het te plaatsen.
        </div>
      </div>
    </aside>
  );
};
