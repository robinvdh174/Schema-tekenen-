import { useMemo } from 'react';
import { Info, MapPin, PanelLeftClose } from 'lucide-react';
import { computePlanNumbering, emptyPlan } from '@/edt/plan';
import type { PlanEntry } from '@/edt/plan';
import { walk, type SchemaNode } from '@/edt/model';
import { useSchemaStore } from '@/store/schemaStore';
import { SymbolPreview } from './SymbolPreview';

/**
 * Lijst van alle componenten/symbolen uit het eendraadschema, gegroepeerd per
 * kring en met hetzelfde nummer als op het schema. Klik op een symbool en
 * daarna op het plan om het op het situatieplan te plaatsen.
 */
export const PlanPanel = () => {
  const tree = useSchemaStore((s) => s.doc.tree);
  const plan = useSchemaStore((s) => s.doc.plan);
  const pendingNodeId = useSchemaStore((s) => s.pendingPlanNodeId);
  const setPendingPlanNode = useSchemaStore((s) => s.setPendingPlanNode);
  const toggleLeft = useSchemaStore((s) => s.toggleLeftPanel);
  const hasPhoto = Boolean(plan?.photo);

  const numbering = useMemo(() => computePlanNumbering(tree), [tree]);
  const nodeById = useMemo(() => {
    const map = new Map<string, SchemaNode>();
    walk(tree, (node) => map.set(node.id, node));
    return map;
  }, [tree]);
  const markers = (plan ?? emptyPlan()).markers;
  const markerCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const marker of markers) {
      counts.set(marker.nodeId, (counts.get(marker.nodeId) ?? 0) + 1);
    }
    return counts;
  }, [markers]);

  return (
    <aside className="panel flex w-72 shrink-0 flex-col border-r">
      <div className="panel-section shrink-0">
        <div className="flex items-center justify-between">
          <p className="panel-heading">Symbolen op het plan</p>
          <button onClick={toggleLeft} title="Lijst inklappen" className="btn-icon -my-1">
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-[11px] leading-snug text-slate-500">
          {hasPhoto
            ? 'Klik op een symbool en duid daarna de plaats aan op het plan.'
            : 'Laad eerst rechts een grondplan of foto van de woning.'}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {numbering.groups.length === 0 ? (
          <div className="flex items-start gap-2 p-3 text-xs text-slate-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <span>Het eendraadschema bevat nog geen componenten.</span>
          </div>
        ) : (
          numbering.groups.map((group) => (
            <div key={group.kring} className="border-b border-panel-border">
              <div className="flex items-center gap-2 px-3 py-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-xs font-semibold text-slate-200">{group.title}</span>
                <span className="ml-auto text-[11px] text-slate-500">{group.entries.length}</span>
              </div>
              <div className="pb-1">
                {group.entries.map((entry) => (
                  <ComponentRow
                    key={entry.nodeId}
                    entry={entry}
                    node={nodeById.get(entry.nodeId) ?? null}
                    placedCount={markerCount.get(entry.nodeId) ?? 0}
                    pending={pendingNodeId === entry.nodeId}
                    disabled={!hasPhoto}
                    onClick={() =>
                      setPendingPlanNode(pendingNodeId === entry.nodeId ? null : entry.nodeId)
                    }
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="panel-section shrink-0 text-[11px] leading-snug text-slate-500">
        De symbolen zijn gekoppeld aan het eendraadschema: wijzigt het schema, dan veranderen de
        symbolen en hun nummers op het plan automatisch mee.
      </div>
    </aside>
  );
};

interface ComponentRowProps {
  entry: PlanEntry;
  node: SchemaNode | null;
  placedCount: number;
  pending: boolean;
  disabled: boolean;
  onClick: () => void;
}

const ComponentRow = ({ entry, node, placedCount, pending, disabled, onClick }: ComponentRowProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={
      disabled
        ? 'Laad eerst een plan of foto'
        : pending
          ? 'Klik nogmaals om te annuleren'
          : 'Klik en duid daarna de plaats aan op het plan'
    }
    className={
      'flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ' +
      (pending ? 'bg-accent/20' : 'hover:bg-panel-light')
    }
  >
    <span
      className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
      style={{ backgroundColor: entry.color }}
    >
      {entry.label}
    </span>
    {node ? (
      <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded bg-white">
        <SymbolPreview node={node} width={40} height={32} />
      </span>
    ) : null}
    <span className="min-w-0 flex-1">
      <span className="block truncate text-xs text-slate-200">{entry.title}</span>
      {entry.sub ? (
        <span className="block truncate text-[10px] text-slate-500">{entry.sub}</span>
      ) : null}
    </span>
    {placedCount > 0 ? (
      <span
        className="flex shrink-0 items-center gap-0.5 text-[10px] text-emerald-400"
        title={`${placedCount}× op de foto geplaatst`}
      >
        <MapPin className="h-3 w-3" />
        {placedCount > 1 ? placedCount : null}
      </span>
    ) : (
      <span className="shrink-0 text-[10px] text-slate-600">—</span>
    )}
  </button>
);
