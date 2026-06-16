import { memo, useCallback, useMemo, useState } from 'react';
import { PanelLeftClose, PlusCircle, Search, X } from 'lucide-react';
import {
  allowedChildKinds,
  kindDef,
  nodeTitle,
  PALETTE_GROUPS,
  type PaletteGroup,
  type PaletteItem,
} from '@/edt/catalog';
import { findNode, findParent } from '@/edt/model';
import { useSchemaStore } from '@/store/schemaStore';
import { SymbolPreview } from './SymbolPreview';

/**
 * Linkerpaneel: het symbolenpalet in twee kolommen (zoals Trikker).
 *  - Links een smalle rail met alle categorieën onder elkaar.
 *  - Daarnaast (rechts) klappen meteen de keuzes van de gekozen categorie open.
 * Zoeken doorzoekt alle categorieën tegelijk en toont de treffers ernaast.
 * Eén klik plaatst het symbool onder het geselecteerde (of dichtstbijzijnde
 * geschikte) onderdeel.
 */

/** Eén keuze in de fly-out: symbool links, naam rechts (Trikker-stijl rij). */
const SymbolRow = memo(
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
        'group flex w-full items-center gap-2.5 rounded-md border p-1.5 text-left transition-colors ' +
        (primary
          ? 'border-accent/50 bg-panel-light hover:border-accent'
          : 'border-panel-border bg-panel-dark/60 hover:border-accent/50 hover:bg-panel-light')
      }
    >
      <span className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-white">
        <SymbolPreview kind={item.kind} overrides={item.props} width={64} height={40} />
      </span>
      <span
        className={
          'min-w-0 flex-1 text-[12px] leading-tight ' +
          (primary ? 'text-slate-100' : 'text-slate-300 group-hover:text-slate-100')
        }
      >
        {item.label}
      </span>
    </button>
  )
);
SymbolRow.displayName = 'SymbolRow';

/** Categorie-knop in de rail: voorbeeldsymbool met de categorienaam eronder. */
const CategoryButton = memo(
  ({
    group,
    active,
    onSelect,
  }: {
    group: PaletteGroup;
    active: boolean;
    onSelect: (id: string) => void;
  }) => {
    const sample = group.items[0];
    return (
      <button
        onClick={() => onSelect(group.id)}
        title={group.label}
        className={
          'flex w-full flex-col items-center gap-1 rounded-md border px-1 py-1.5 text-center transition-colors ' +
          (active
            ? 'border-accent/60 bg-accent/15'
            : 'border-transparent hover:border-panel-border hover:bg-panel-light')
        }
      >
        <span className="flex w-full items-center justify-center overflow-hidden rounded bg-white">
          {sample ? (
            <SymbolPreview kind={sample.kind} overrides={sample.props} width={76} height={38} />
          ) : null}
        </span>
        <span
          className={
            'line-clamp-2 text-[9px] font-medium leading-tight ' +
            (active ? 'text-white' : 'text-slate-300')
          }
        >
          {group.label}
        </span>
      </button>
    );
  }
);
CategoryButton.displayName = 'CategoryButton';

type InsertMode = 'after' | 'before';

export const SymbolPanel = () => {
  const doc = useSchemaStore((s) => s.doc);
  const selectedId = useSchemaStore((s) => s.selectedId);
  const addComponent = useSchemaStore((s) => s.addComponent);
  const insertBefore = useSchemaStore((s) => s.insertBefore);
  const insertSibling = useSchemaStore((s) => s.insertSibling);
  const pendingInsert = useSchemaStore((s) => s.pendingInsert);
  const setPendingInsert = useSchemaStore((s) => s.setPendingInsert);
  const toggleLeft = useSchemaStore((s) => s.toggleLeftPanel);

  const [query, setQuery] = useState('');
  const [activeGroupId, setActiveGroupId] = useState<string>(PALETTE_GROUPS[0]?.id ?? '');
  const [warning, setWarning] = useState<string | null>(null);
  const [insertMode, setInsertMode] = useState<InsertMode>('after');

  const selected = selectedId ? findNode(doc.tree, selectedId) : null;
  // Onderdeel waar — via een aangeklikte "＋" op het schema — vóór ingevoegd wordt.
  const pendingTarget = pendingInsert ? findNode(doc.tree, pendingInsert.beforeId) : null;
  // "Ervóór invoegen" heeft enkel zin bij een geselecteerd onderdeel dat niet de
  // wortel is; anders valt alles terug op gewoon toevoegen.
  const canInsertBefore = !!selected && selected.id !== doc.tree.id;
  const effectiveMode: InsertMode = canInsertBefore ? insertMode : 'after';

  // Welke types passen op de actieve plek? Bij een aangeklikte "＋" hangt dat
  // af van de invoegplek; anders van de selectie (of de wortel).
  const primaryKinds = useMemo(() => {
    if (pendingInsert && pendingTarget) {
      const parent = findParent(doc.tree, pendingTarget.id);
      if (!parent) return new Set<string>();
      if (pendingInsert.mode === 'sibling') {
        return new Set(allowedChildKinds(parent.kind).map((def) => def.kind));
      }
      // series: het nieuwe type moet het doel kunnen dragen én in de ouder passen.
      return new Set(
        allowedChildKinds(parent.kind)
          .filter((def) => allowedChildKinds(def.kind).some((c) => c.kind === pendingTarget.kind))
          .map((def) => def.kind)
      );
    }
    const host = selected ?? doc.tree;
    return new Set(allowedChildKinds(host.kind).map((def) => def.kind));
  }, [pendingInsert, pendingTarget, selected, doc.tree]);

  const trimmed = query.trim().toLowerCase();
  const matches = useCallback(
    (item: PaletteItem) =>
      item.label.toLowerCase().includes(trimmed) ||
      item.description.toLowerCase().includes(trimmed),
    [trimmed]
  );

  const handleAdd = useCallback(
    (item: PaletteItem) => {
      // Op een aangeklikte "＋": rechtstreeks op die plek invoegen.
      if (pendingInsert) {
        const id =
          pendingInsert.mode === 'sibling'
            ? insertSibling(pendingInsert.beforeId, item.kind, item.props)
            : insertBefore(pendingInsert.beforeId, item.kind, item.props);
        setWarning(
          id
            ? null
            : `"${item.label}" past niet op deze plek. ${
                pendingInsert.mode === 'sibling'
                  ? 'Kies een beveiliging (automaat, differentieel …) om een nieuwe kring tussen te voegen.'
                  : 'Kies een symbool dat in deze kring past (bv. een verbruiker tussen twee verbruikers).'
              }`
        );
        return;
      }
      if (effectiveMode === 'before' && selectedId) {
        const id = insertBefore(selectedId, item.kind, item.props);
        setWarning(
          id
            ? null
            : `"${item.label}" kan hier niet vóór het geselecteerde onderdeel ingevoegd worden. Kies een symbool dat in dezelfde kring past (bv. een verbruiker vóór een andere verbruiker).`
        );
        return;
      }
      const id = addComponent(item.kind, item.props);
      setWarning(
        id
          ? null
          : `"${item.label}" past hier niet. Selecteer eerst een geschikt onderdeel op het schema (bv. een automaat of het verdeelbord).`
      );
    },
    [addComponent, insertBefore, insertSibling, pendingInsert, effectiveMode, selectedId]
  );

  const activeGroup = PALETTE_GROUPS.find((g) => g.id === activeGroupId) ?? PALETTE_GROUPS[0];
  const searchResults = trimmed
    ? PALETTE_GROUPS.flatMap((g) => g.items).filter(matches)
    : [];

  const selectCategory = useCallback((id: string) => {
    setQuery('');
    setActiveGroupId(id);
  }, []);

  return (
    <aside className="panel flex w-80 shrink-0 flex-col border-r">
      <div className="panel-section flex shrink-0 items-center justify-between">
        <p className="panel-heading">Symbolen</p>
        <button onClick={toggleLeft} title="Paneel inklappen" className="btn-icon -my-1">
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Waar komt een nieuw symbool terecht? */}
      <div className="shrink-0 border-b border-panel-border bg-panel-dark/40 px-3 py-2">
        {pendingInsert ? (
          <div className="rounded-md border border-accent/50 bg-accent/15 px-2.5 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-1.5">
                <PlusCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <p className="text-[11px] leading-tight text-slate-100">
                  {pendingInsert.mode === 'sibling'
                    ? 'Nieuwe kring invoegen vóór '
                    : 'Invoegen vóór '}
                  <span className="font-medium text-accent">
                    {pendingTarget ? nodeTitle(pendingTarget) : 'onderdeel'}
                  </span>
                  <br />
                  <span className="text-slate-400">Kies hieronder een symbool.</span>
                </p>
              </div>
              <button
                onClick={() => setPendingInsert(null)}
                title="Invoegen annuleren"
                className="-my-0.5 shrink-0 rounded p-0.5 text-slate-300 hover:bg-panel-light hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : selected ? (
          <>
            {/* Plaatsingsmodus: gewoon eronder, of net ervóór invoegen (tussen
                twee bestaande onderdelen, bv. tussen A2 en A3). */}
            {canInsertBefore ? (
              <div className="mb-2 grid grid-cols-2 gap-1 rounded-md bg-panel-dark p-0.5">
                {(
                  [
                    ['after', 'Eronder'],
                    ['before', 'Ervóór invoegen'],
                  ] as [InsertMode, string][]
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    onClick={() => setInsertMode(mode)}
                    className={
                      'rounded px-2 py-1 text-[11px] font-medium transition-colors ' +
                      (effectiveMode === mode
                        ? 'bg-accent text-white'
                        : 'text-slate-300 hover:bg-panel-light')
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
            <p className="text-[11px] leading-tight text-slate-400">
              {effectiveMode === 'before' ? 'Invoegen vóór' : 'Toevoegen onder'}{' '}
              <span className="font-medium text-accent">{nodeTitle(selected)}</span>{' '}
              <span className="text-slate-500">({kindDef(selected.kind).label})</span>
            </p>
            {effectiveMode === 'before' ? (
              <p className="mt-1 text-[11px] leading-tight text-slate-500">
                Het nieuwe symbool komt tússen dit onderdeel en het vorige; de nummering schuift
                automatisch mee op.
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-[11px] leading-tight text-slate-500">
            Tip: klik op een blauw <span className="font-medium text-accent">＋</span> tussen twee
            onderdelen om daar iets tussen te voegen — of selecteer een onderdeel om er iets onder te
            plaatsen.
          </p>
        )}
      </div>

      {/* Zoeken (doorzoekt alle categorieën) */}
      <div className="shrink-0 px-3 pb-2 pt-2">
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

      {/* Twee kolommen: links de categorie-rail, rechts de keuzes ernaast. */}
      <div className="flex min-h-0 flex-1">
        {trimmed ? (
          /* Tijdens het zoeken: resultaten over alle categorieën heen. */
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-3">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <SymbolRow
                  key={item.id}
                  item={item}
                  primary={primaryKinds.has(item.kind)}
                  onAdd={handleAdd}
                />
              ))
            ) : (
              <p className="px-1 py-6 text-center text-xs text-slate-500">
                Geen symbool gevonden voor “{query}”.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="w-[96px] shrink-0 space-y-1 overflow-y-auto border-r border-panel-border bg-panel-dark/40 px-1.5 py-2">
              {PALETTE_GROUPS.map((group) => (
                <CategoryButton
                  key={group.id}
                  group={group}
                  active={activeGroup?.id === group.id}
                  onSelect={selectCategory}
                />
              ))}
            </div>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-2">
              {activeGroup?.items.map((item) => (
                <SymbolRow
                  key={item.id}
                  item={item}
                  primary={primaryKinds.has(item.kind)}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {warning ? (
        <div className="shrink-0 border-t border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-tight text-amber-300">
          {warning}
        </div>
      ) : null}
    </aside>
  );
};
