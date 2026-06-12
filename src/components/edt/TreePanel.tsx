import type { ComponentType } from 'react';
import {
  Box,
  CloudLightning,
  Cpu,
  Gauge,
  GitBranch,
  Lightbulb,
  Plug,
  Power,
  Server,
  ShieldAlert,
  ShieldCheck,
  PanelLeftClose,
  ToggleLeft,
  Zap,
} from 'lucide-react';
import type { SchemaNode } from '@/edt/model';
import { findNode } from '@/edt/model';
import { allowedChildKinds, nodeTitle } from '@/edt/catalog';
import { useSchemaStore } from '@/store/schemaStore';

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
  aftakdoos: GitBranch,
};

const TreeRow = ({ node, depth }: { node: SchemaNode; depth: number }) => {
  const selectedId = useSchemaStore((s) => s.selectedId);
  const select = useSchemaStore((s) => s.select);
  const selected = node.id === selectedId;
  const Icon = ICONS[node.kind] ?? Box;
  const sub = String(node.props.label ?? node.props.lokaal ?? '');

  return (
    <>
      <button
        onClick={() => select(node.id)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
          selected ? 'bg-accent text-white' : 'text-slate-200 hover:bg-panel-light'
        }`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        <Icon className={`h-3.5 w-3.5 shrink-0 ${selected ? 'text-white' : 'text-slate-400'}`} />
        <span className="min-w-0 flex-1 truncate">
          {nodeTitle(node)}
          {sub ? (
            <span className={`ml-1.5 text-xs ${selected ? 'text-blue-100' : 'text-slate-500'}`}>{sub}</span>
          ) : null}
        </span>
      </button>
      {node.children.map((child) => (
        <TreeRow key={child.id} node={child} depth={depth + 1} />
      ))}
    </>
  );
};

const AddSection = () => {
  const doc = useSchemaStore((s) => s.doc);
  const selectedId = useSchemaStore((s) => s.selectedId);
  const addChild = useSchemaStore((s) => s.addChild);

  const selected = selectedId ? findNode(doc.tree, selectedId) : null;
  const options = selected ? allowedChildKinds(selected.kind) : [];

  return (
    <div className="shrink-0 border-t border-panel-border bg-panel p-3">
      <p className="panel-heading mb-2">
        {selected ? `Toevoegen onder: ${nodeTitle(selected)}` : 'Toevoegen'}
      </p>
      {!selected ? (
        <p className="text-xs text-slate-500">
          Selecteer eerst een onderdeel in de lijst hierboven of op het schema.
        </p>
      ) : options.length === 0 ? (
        <p className="text-xs text-slate-500">Hieronder kan niets toegevoegd worden.</p>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {options.map((def) => {
            const Icon = ICONS[def.kind] ?? Box;
            return (
              <button
                key={def.kind}
                onClick={() => addChild(selected.id, def.kind)}
                title={def.description}
                className="flex items-center gap-1.5 rounded-md border border-panel-border bg-panel-light px-2 py-1.5 text-left text-xs text-slate-200 transition-colors hover:border-accent hover:bg-panel-dark"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{def.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const TreePanel = () => {
  const tree = useSchemaStore((s) => s.doc.tree);
  const toggleLeft = useSchemaStore((s) => s.toggleLeftPanel);
  return (
    <aside className="panel flex w-72 shrink-0 flex-col border-r">
      <div className="panel-section flex shrink-0 items-center justify-between">
        <p className="panel-heading">Installatie</p>
        <button onClick={toggleLeft} title="Lijst inklappen" className="btn-icon -my-1">
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <TreeRow node={tree} depth={0} />
      </div>
      <AddSection />
    </aside>
  );
};
