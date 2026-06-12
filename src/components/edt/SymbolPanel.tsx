import { useMemo, useState, type ComponentType } from 'react';
import {
  Box,
  CloudLightning,
  Cpu,
  Gauge,
  GitBranch,
  Lightbulb,
  PanelLeftClose,
  Plug,
  Power,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  ToggleLeft,
  X,
  Zap,
} from 'lucide-react';
import { allowedChildKinds, CATEGORY_META, kindDef, kindsByCategory, nodeTitle, type KindDef } from '@/edt/catalog';
import { findNode } from '@/edt/model';
import { useSchemaStore } from '@/store/schemaStore';

/** Pictogram per componenttype (zelfde set als op het schema). */
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  aansluiting: Zap,
  teller: Gauge,
  bord: Server,
  automaat: ShieldCheck,
  differentieel: ShieldAlert,
  diffautomaat: ShieldAlert,
  smeltzekering: ShieldCheck,
  hoofdschakelaar: Power,
  relais: Cpu,
  overspanning: CloudLightning,
  stopcontact: Plug,
  lichtpunt: Lightbulb,
  schakelaar: ToggleLeft,
  toestel: Box,
  aansluitpunt: GitBranch,
  aftakdoos: GitBranch,
};

const SymbolTile = ({
  def,
  primary,
  onAdd,
}: {
  def: KindDef;
  /** Past dit type rechtstreeks onder de huidige selectie? */
  primary: boolean;
  onAdd: (kind: string) => void;
}) => {
  const Icon = ICONS[def.kind] ?? Box;
  return (
    <button
      onClick={() => onAdd(def.kind)}
      title={`${def.label} — ${def.description}`}
      className={
        'group flex items-center gap-2 rounded-md border px-2 py-2 text-left text-xs transition-colors ' +
        (primary
          ? 'border-accent/60 bg-panel-light text-slate-100 hover:border-accent hover:bg-panel-dark'
          : 'border-panel-border bg-panel-dark/60 text-slate-300 hover:border-accent/50 hover:bg-panel-light hover:text-slate-100')
      }
    >
      <span
        className={
          'flex h-7 w-7 shrink-0 items-center justify-center rounded ' +
          (primary ? 'bg-accent/20 text-accent' : 'bg-panel-dark text-slate-400 group-hover:text-slate-200')
        }
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{def.label}</span>
    </button>
  );
};

/**
 * Linkerpaneel: een overzichtelijk symbolenpalet, gegroepeerd per categorie.
 * Hier vind je álle symbolen om te plaatsen (in plaats van een kopie van wat
 * er al getekend is). Een klik voegt het symbool toe op de slimste plek:
 * onder het geselecteerde onderdeel of, als dat niet kan, onder het
 * dichtstbijzijnde geschikte onderdeel.
 */
export const SymbolPanel = () => {
  const doc = useSchemaStore((s) => s.doc);
  const selectedId = useSchemaStore((s) => s.selectedId);
  const addComponent = useSchemaStore((s) => s.addComponent);
  const toggleLeft = useSchemaStore((s) => s.toggleLeftPanel);

  const [query, setQuery] = useState('');
  const [warning, setWarning] = useState<string | null>(null);

  const selected = selectedId ? findNode(doc.tree, selectedId) : null;

  // Welke types kunnen rechtstreeks onder de huidige selectie (of de wortel)?
  const primaryKinds = useMemo(() => {
    const host = selected ?? doc.tree;
    return new Set(allowedChildKinds(host.kind).map((def) => def.kind));
  }, [selected, doc.tree]);

  const trimmed = query.trim().toLowerCase();
  const matches = (def: KindDef) =>
    !trimmed ||
    def.label.toLowerCase().includes(trimmed) ||
    def.description.toLowerCase().includes(trimmed);

  const handleAdd = (kind: string) => {
    const id = addComponent(kind);
    if (!id) {
      setWarning(
        `"${kindDef(kind).label}" past hier niet. Selecteer eerst een geschikt onderdeel op het schema.`
      );
    } else {
      setWarning(null);
    }
  };

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
            <span className="font-medium text-accent">{nodeTitle(selected)}</span>
          </p>
        ) : (
          <p className="text-[11px] leading-tight text-slate-500">
            Tip: selecteer eerst een onderdeel op het schema; nieuwe symbolen komen daar netjes onder.
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
        {CATEGORY_META.map(({ id, label }) => {
          const kinds = kindsByCategory(id).filter(matches);
          if (kinds.length === 0) return null;
          return (
            <div key={id} className="mb-3">
              <p className="panel-heading mb-1.5">{label}</p>
              <div className="grid grid-cols-1 gap-1.5">
                {kinds.map((def) => (
                  <SymbolTile
                    key={def.kind}
                    def={def}
                    primary={primaryKinds.has(def.kind)}
                    onAdd={handleAdd}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {trimmed && CATEGORY_META.every(({ id }) => kindsByCategory(id).filter(matches).length === 0) ? (
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
