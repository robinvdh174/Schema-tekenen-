import { memo, useCallback, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, PanelLeftClose, Search, X } from 'lucide-react';
import {
  allowedChildKinds,
  kindDef,
  nodeTitle,
  PALETTE_GROUPS,
  type PaletteItem,
} from '@/edt/catalog';
import { findNode } from '@/edt/model';
import { useSchemaStore } from '@/store/schemaStore';
import { SymbolPreview } from './SymbolPreview';

/**
 * Linkerpaneel: het symbolenpalet. Elke variant (bv. wisselschakelaar,
 * kruisschakelaar, dimmer …) heeft een eigen tegel met het echte
 * AREI-symbool, netjes gegroepeerd per categorie. Eén klik plaatst het
 * juiste symbool meteen — onder het geselecteerde onderdeel of het
 * dichtstbijzijnde geschikte onderdeel.
 */

const SymbolTile = memo(
  ({
    item,
    primary,
    onAdd,
  }: {
    item: PaletteItem;
    /** Past dit type rechtstreeks onder de huidige selectie? */
    primary: boolean;
    onAdd: (item: PaletteItem) => void;
  }) => (
    <button
      onClick={() => onAdd(item)}
      title={`${item.label} — ${item.description}`}
      className={
        'group flex flex-col items-center gap-1 rounded-md border p-1.5 text-center transition-colors ' +
        (primary
          ? 'border-accent/50 bg-panel-light hover:border-accent'
          : 'border-panel-border bg-panel-dark/60 hover:border-accent/50 hover:bg-panel-light')
      }
    >
      <span className="flex w-full items-center justify-center overflow-hidden rounded bg-white">
        <SymbolPreview kind={item.kind} overrides={item.props} width={110} height={52} />
      </span>
      <span
        className={
          'line-clamp-2 w-full text-[10px] leading-tight ' +
          (primary ? 'text-slate-100' : 'text-slate-300 group-hover:text-slate-100')
        }
      >
        {item.label}
      </span>
    </button>
  )
);
SymbolTile.displayName = 'SymbolTile';

export const SymbolPanel = () => {
  const doc = useSchemaStore((s) => s.doc);
  const selectedId = useSchemaStore((s) => s.selectedId);
  const addComponent = useSchemaStore((s) => s.addComponent);
  const toggleLeft = useSchemaStore((s) => s.toggleLeftPanel);

  const [query, setQuery] = useState('');
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const [warning, setWarning] = useState<string | null>(null);

  const selected = selectedId ? findNode(doc.tree, selectedId) : null;

  // Welke types passen rechtstreeks onder de huidige selectie (of de wortel)?
  const primaryKinds = useMemo(() => {
    const host = selected ?? doc.tree;
    return new Set(allowedChildKinds(host.kind).map((def) => def.kind));
  }, [selected, doc.tree]);

  const trimmed = query.trim().toLowerCase();
  const matches = useCallback(
    (item: PaletteItem) =>
      !trimmed ||
      item.label.toLowerCase().includes(trimmed) ||
      item.description.toLowerCase().includes(trimmed),
    [trimmed]
  );

  const handleAdd = useCallback(
    (item: PaletteItem) => {
      const id = addComponent(item.kind, item.props);
      setWarning(
        id
          ? null
          : `"${item.label}" past hier niet. Selecteer eerst een geschikt onderdeel op het schema (bv. een automaat of het verdeelbord).`
      );
    },
    [addComponent]
  );

  return (
    <aside className="panel flex w-72 shrink-0 flex-col border-r">
      <div className="panel-section flex shrink-0 items-center justify-between">
        <p className="panel-heading">Symbolen</p>
        <button onClick={toggleLeft} title="Paneel inklappen" className="btn-icon -my-1">
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Waar komt een nieuw symbool terecht? */}
      <div className="shrink-0 border-b border-panel-border bg-panel-dark/40 px-3 py-2">
        {selected ? (
          <p className="text-[11px] leading-tight text-slate-400">
            Toevoegen onder{' '}
            <span className="font-medium text-accent">{nodeTitle(selected)}</span>{' '}
            <span className="text-slate-500">({kindDef(selected.kind).label})</span>
          </p>
        ) : (
          <p className="text-[11px] leading-tight text-slate-500">
            Tip: selecteer eerst een onderdeel op het schema; nieuwe symbolen komen daar netjes
            onder.
          </p>
        )}
      </div>

      {/* Zoeken */}
      <div className="shrink-0 px-3 pb-1 pt-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek symbool…"
            className="w-full rounded-md border border-panel-border bg-panel-dark px-7 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-accent focus:outline-none"
            spellCheck={false}
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              title="Wissen"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-500 hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Palet per categorie */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-1">
        {PALETTE_GROUPS.map((group) => {
          const items = group.items.filter(matches);
          if (items.length === 0) return null;
          // Tijdens het zoeken altijd alles tonen, ook ingeklapte groepen.
          const isClosed = !trimmed && closed[group.id] === true;
          return (
            <div key={group.id} className="mb-2">
              <button
                onClick={() => setClosed((c) => ({ ...c, [group.id]: !isClosed }))}
                className="mb-1.5 flex w-full items-center gap-1 rounded px-1 py-1 text-left hover:bg-panel-light"
              >
                {isClosed ? (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                )}
                <span className="panel-heading">{group.label}</span>
                <span className="ml-auto text-[10px] text-slate-600">{items.length}</span>
              </button>
              {!isClosed ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {items.map((item) => (
                    <SymbolTile
                      key={item.id}
                      item={item}
                      primary={primaryKinds.has(item.kind)}
                      onAdd={handleAdd}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
        {trimmed && PALETTE_GROUPS.every((g) => g.items.filter(matches).length === 0) ? (
          <p className="px-1 py-6 text-center text-xs text-slate-500">
            Geen symbool gevonden voor “{query}”.
          </p>
        ) : null}
      </div>

      {warning ? (
        <div className="shrink-0 border-t border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-tight text-amber-300">
          {warning}
        </div>
      ) : null}
    </aside>
  );
};
