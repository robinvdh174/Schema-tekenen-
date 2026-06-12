import { ArrowDown, ArrowUp, Copy, PanelRightClose, Trash2 } from 'lucide-react';
import { findNode, findParent } from '@/edt/model';
import { kindDef, nodeTitle, type PropDef } from '@/edt/catalog';
import { useSchemaStore } from '@/store/schemaStore';

const Field = ({
  def,
  value,
  onChange,
}: {
  def: PropDef;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}) => {
  const inputClass =
    'w-full rounded-md border border-panel-border bg-panel-dark px-2.5 py-1.5 text-sm text-slate-100 focus:border-accent focus:outline-none';

  if (def.type === 'boolean') {
    return (
      <label className="flex cursor-pointer items-center justify-between gap-2 py-1">
        <span className="text-sm text-slate-300">{def.label}</span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-blue-500"
        />
      </label>
    );
  }

  return (
    <div className="space-y-1 py-1">
      <label className="block text-xs font-medium text-slate-400">{def.label}</label>
      {def.type === 'select' ? (
        <select value={String(value)} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          {def.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : def.type === 'number' ? (
        <input
          type="number"
          min={1}
          max={40}
          value={Number(value) || 1}
          onChange={(e) => onChange(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
          className={inputClass}
        />
      ) : (
        <input
          type="text"
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          spellCheck={false}
        />
      )}
      {def.hint ? <p className="text-[11px] text-slate-500">{def.hint}</p> : null}
    </div>
  );
};

const ProjectFields = () => {
  const doc = useSchemaStore((s) => s.doc);
  const setName = useSchemaStore((s) => s.setName);
  const setInstallateur = useSchemaStore((s) => s.setInstallateur);
  const inputClass =
    'w-full rounded-md border border-panel-border bg-panel-dark px-2.5 py-1.5 text-sm text-slate-100 focus:border-accent focus:outline-none';

  const toggleRight = useSchemaStore((s) => s.toggleRightPanel);
  return (
    <div className="p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="panel-heading">Projectgegevens</p>
        <button onClick={toggleRight} title="Paneel inklappen" className="btn-icon -my-1">
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-1 py-1">
        <label className="block text-xs font-medium text-slate-400">Projectnaam</label>
        <input value={doc.name} onChange={(e) => setName(e.target.value)} className={inputClass} spellCheck={false} />
      </div>
      <div className="space-y-1 py-1">
        <label className="block text-xs font-medium text-slate-400">Installateur / opsteller</label>
        <input
          value={doc.installateur}
          onChange={(e) => setInstallateur(e.target.value)}
          className={inputClass}
          spellCheck={false}
          placeholder="Naam (komt in het titelblok)"
        />
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Selecteer een onderdeel in het schema of in de lijst links om de eigenschappen ervan aan te
        passen.
      </p>
    </div>
  );
};

export const PropsPanel = () => {
  const doc = useSchemaStore((s) => s.doc);
  const selectedId = useSchemaStore((s) => s.selectedId);
  const updateProp = useSchemaStore((s) => s.updateProp);
  const removeSelected = useSchemaStore((s) => s.removeSelected);
  const duplicateSelected = useSchemaStore((s) => s.duplicateSelected);
  const moveSelected = useSchemaStore((s) => s.moveSelected);
  const toggleRight = useSchemaStore((s) => s.toggleRightPanel);

  const node = selectedId ? findNode(doc.tree, selectedId) : null;

  if (!node) {
    return (
      <aside className="panel flex w-72 shrink-0 flex-col overflow-y-auto border-l">
        <ProjectFields />
      </aside>
    );
  }

  const def = kindDef(node.kind);
  const isRoot = node.id === doc.tree.id;
  const parent = isRoot ? null : findParent(doc.tree, node.id);
  const siblingCount = parent?.children.length ?? 1;

  return (
    <aside className="panel flex w-72 shrink-0 flex-col border-l">
      <div className="panel-section flex shrink-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="panel-heading">{def.label}</p>
          <p className="mt-0.5 truncate text-sm text-slate-300">{nodeTitle(node)}</p>
        </div>
        <button onClick={toggleRight} title="Paneel inklappen" className="btn-icon -my-1 shrink-0">
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {def.props.map((propDef) => (
          <Field
            key={propDef.key}
            def={propDef}
            value={node.props[propDef.key] ?? propDef.default}
            onChange={(value) => updateProp(node.id, propDef.key, value)}
          />
        ))}
      </div>

      {!isRoot ? (
        <div className="shrink-0 border-t border-panel-border p-3">
          <div className="grid grid-cols-4 gap-1.5">
            <button
              className="btn-icon bg-panel-light"
              title="Eerder in de rij (omhoog)"
              onClick={() => moveSelected(-1)}
              disabled={siblingCount < 2}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              className="btn-icon bg-panel-light"
              title="Later in de rij (omlaag)"
              onClick={() => moveSelected(1)}
              disabled={siblingCount < 2}
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            <button className="btn-icon bg-panel-light" title="Dupliceren (Ctrl+D)" onClick={duplicateSelected}>
              <Copy className="h-4 w-4" />
            </button>
            <button
              className="btn-icon bg-red-900/40 text-red-300 hover:bg-red-900/70"
              title="Verwijderen (Del) — verwijdert ook alles wat eronder hangt"
              onClick={removeSelected}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
};
