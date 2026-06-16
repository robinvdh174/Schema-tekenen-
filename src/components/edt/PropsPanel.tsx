import { useId, useMemo } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  Move,
  PanelRightClose,
  RotateCcw,
  Trash2,
  Zap,
} from 'lucide-react';
import { findNode, findParent, labelOffset, type SchemaNode } from '@/edt/model';
import { kindDef, nodeTitle, type PropDef } from '@/edt/catalog';
import { computeKringNumbers, layoutTree } from '@/edt/layout';
import { labelKeysFor } from '@/edt/labels';
import { computePlanNumbering, UNASSIGNED_GROUP, VOEDING_GROUP } from '@/edt/plan';
import { useSchemaStore } from '@/store/schemaStore';

/** Stapgrootte (in schema-eenheden) per klik op een richtingsknop. */
const NUDGE = 6;

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
  const listId = useId();
  const hasSuggestions = def.type === 'text' && def.suggestions && def.suggestions.length > 0;

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
        <>
          <input
            type="text"
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            spellCheck={false}
            list={hasSuggestions ? listId : undefined}
            autoComplete="off"
            placeholder={hasSuggestions ? 'Kies of typ…' : undefined}
          />
          {hasSuggestions ? (
            <datalist id={listId}>
              {def.suggestions!.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
          ) : null}
        </>
      )}
      {def.hint ? <p className="text-[11px] text-slate-500">{def.hint}</p> : null}
    </div>
  );
};

/**
 * Knoppen om de tekstlabels van een component te verplaatsen: per label vier
 * richtingsknoppen (links/boven/onder/rechts) en een terugzet-knop. Voor exacte
 * plaatsing kan de gebruiker het label ook rechtstreeks op het schema slepen.
 */
const LabelControls = ({
  node,
  specs,
}: {
  node: SchemaNode;
  specs: { key: string; label: string }[];
}) => {
  const nudgeLabel = useSchemaStore((s) => s.nudgeLabel);
  const resetLabel = useSchemaStore((s) => s.resetLabel);
  if (specs.length === 0) return null;

  const arrow =
    'flex h-7 w-7 items-center justify-center rounded bg-panel-light text-slate-200 hover:bg-panel-border';

  return (
    <div className="mt-4 border-t border-panel-border pt-3">
      <p className="panel-heading mb-1 flex items-center gap-1.5">
        <Move className="h-3.5 w-3.5" /> Tekstlabels plaatsen
      </p>
      <p className="mb-2 text-[11px] leading-relaxed text-slate-500">
        Verschuif een label met de pijlen, of sleep het rechtstreeks op het schema voor de exacte
        plek.
      </p>
      <div className="space-y-2">
        {specs.map(({ key, label }) => {
          const off = labelOffset(node, key);
          const moved = off.dx !== 0 || off.dy !== 0;
          return (
            <div key={key} className="rounded-md border border-panel-border bg-panel-dark/40 p-2">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-medium text-slate-300">{label}</span>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-panel-light hover:text-slate-200 disabled:opacity-30"
                  title="Terug naar standaardplaats"
                  onClick={() => resetLabel(node.id, key)}
                  disabled={!moved}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button className={arrow} title="Naar links" onClick={() => nudgeLabel(node.id, key, -NUDGE, 0)}>
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button className={arrow} title="Naar boven" onClick={() => nudgeLabel(node.id, key, 0, -NUDGE)}>
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button className={arrow} title="Naar onder" onClick={() => nudgeLabel(node.id, key, 0, NUDGE)}>
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button className={arrow} title="Naar rechts" onClick={() => nudgeLabel(node.id, key, NUDGE, 0)}>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
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
        Klik een onderdeel aan op het schema om de eigenschappen ervan aan te passen. Nieuwe
        symbolen voeg je toe via het palet links.
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

  // De plaatsing (oriëntatie + kringnummer) bepaalt welke labels een component
  // heeft; we leiden ze af uit dezelfde auto-layout als het canvas.
  const placed = useMemo(() => {
    if (!selectedId) return null;
    return layoutTree(doc.tree).placed.find((p) => p.node.id === selectedId) ?? null;
  }, [doc.tree, selectedId]);

  // Heeft de geselecteerde component een (verplaatsbaar) componentnummer (bv.
  // "B1", "C2")? Dezelfde nummering als op het foto-plan.
  const hasComponentNumber = useMemo(() => {
    if (!selectedId) return false;
    const entry = computePlanNumbering(doc.tree).byId.get(selectedId);
    return !!entry && entry.kring !== VOEDING_GROUP && entry.kring !== UNASSIGNED_GROUP;
  }, [doc.tree, selectedId]);

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
  // Kringen hangen horizontaal naast elkaar aan het bord, dus verplaatsen is
  // hier links/rechts; voor in serie gestapelde of doorgeluste onderdelen is
  // het eerder/later in de rij (omhoog/omlaag).
  const onBord = parent?.kind === 'bord';
  const MovePrevIcon = onBord ? ArrowLeft : ArrowUp;
  const MoveNextIcon = onBord ? ArrowRight : ArrowDown;
  const movePrevTitle = onBord ? 'Kring naar links' : 'Eerder in de rij (omhoog)';
  const moveNextTitle = onBord ? 'Kring naar rechts' : 'Later in de rij (omlaag)';

  // Voor een kring-startende beveiliging tonen we het huidige kringnummer
  // prominent, zodat duidelijk is welke kring dit is en hoe je ze hernoemt.
  const hasKringnr = def.props.some((p) => p.key === 'kringnr');
  const effectiveKring = hasKringnr ? computeKringNumbers(doc.tree).get(node.id) ?? null : null;

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
        {effectiveKring ? (
          <div className="mb-3 flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-2.5 py-2">
            <span className="flex h-7 min-w-7 items-center justify-center rounded bg-accent px-1.5 text-sm font-bold text-white">
              {effectiveKring}
            </span>
            <span className="text-[11px] leading-tight text-slate-300">
              <Zap className="mr-1 inline h-3 w-3 text-accent" />
              Kring <b className="text-slate-100">{effectiveKring}</b>. Verplaats de kring met de
              pijlen ◀ ▶ onderaan — de letters herschikken zich dan automatisch in alfabetische
              volgorde. Of typ een eigen letter/nummer in het veld hieronder.
            </span>
          </div>
        ) : null}
        {def.props.map((propDef) => (
          <Field
            key={propDef.key}
            def={propDef}
            value={node.props[propDef.key] ?? propDef.default}
            onChange={(value) => updateProp(node.id, propDef.key, value)}
          />
        ))}
        {placed ? (
          <LabelControls
            node={node}
            specs={[
              ...labelKeysFor(node, placed.orient, placed.kringnr),
              ...(hasComponentNumber ? [{ key: 'nummer', label: 'Componentnummer' }] : []),
            ]}
          />
        ) : null}
      </div>

      {!isRoot ? (
        <div className="shrink-0 border-t border-panel-border p-3">
          <div className="grid grid-cols-4 gap-1.5">
            <button
              className="btn-icon bg-panel-light"
              title={movePrevTitle}
              onClick={() => moveSelected(-1)}
              disabled={siblingCount < 2}
            >
              <MovePrevIcon className="h-4 w-4" />
            </button>
            <button
              className="btn-icon bg-panel-light"
              title={moveNextTitle}
              onClick={() => moveSelected(1)}
              disabled={siblingCount < 2}
            >
              <MoveNextIcon className="h-4 w-4" />
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
