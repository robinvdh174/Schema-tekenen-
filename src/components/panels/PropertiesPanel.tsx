import { useState } from 'react';
import { Cable, Info, MousePointerSquareDashed, RotateCw, Trash2, X, Zap } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useProjectStore } from '@/store/projectStore';
import { getSymbolDefinition } from '@/data/symbols';
import type { PlacedSymbol, PropertyValue } from '@/types/symbols';
import { TEXT_FIELD_SUGGESTIONS } from '@/types/symbols';
import { collectCircuits } from '@/utils/circuits';
import type { EditorMode } from '@/types/canvas';
import type { Wire, WireCableType, WireCrossSection } from '@/types/wire';
import { WIRE_CABLE_TYPES, WIRE_CROSS_SECTIONS } from '@/types/wire';

export const PropertiesPanel = ({ onClose }: { onClose?: () => void }) => {
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const selectedWireIds = useEditorStore((s) => s.selectedWireIds);
  const mode = useEditorStore((s) => s.mode);
  const symbols = useProjectStore((s) =>
    mode === 'eendraad' ? s.project.eendraad.symbols : s.project.situatie.symbols
  );
  const wires = useProjectStore((s) => (mode === 'eendraad' ? s.project.eendraad.wires : []));

  const selectedSymbols = symbols.filter((s) => selectedIds.includes(s.id));
  const selectedWires = wires.filter((w) => selectedWireIds.includes(w.id));

  return (
    <aside className="panel flex h-full w-72 shrink-0 flex-col border-l">
      <div className="panel-section flex items-center justify-between">
        <h2 className="panel-heading">Eigenschappen</h2>
        {onClose ? (
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-panel-light hover:text-slate-100"
            title="Paneel sluiten"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {selectedSymbols.length === 0 && selectedWires.length === 0 ? (
        <EmptyState />
      ) : selectedSymbols.length === 1 && selectedWires.length === 0 ? (
        <SymbolEditor symbol={selectedSymbols[0]} mode={mode} />
      ) : selectedWires.length === 1 && selectedSymbols.length === 0 ? (
        <WireEditor wire={selectedWires[0]} mode={mode} />
      ) : (
        <MultiSelectEditor
          symbols={selectedSymbols}
          extraCount={selectedWires.length}
          mode={mode}
        />
      )}
    </aside>
  );
};

/** Getoond bij meerdere geselecteerde items: ken samen een kring toe. */
const MultiSelectEditor = ({
  symbols,
  extraCount,
  mode,
}: {
  symbols: PlacedSymbol[];
  extraCount: number;
  mode: EditorMode;
}) => {
  const allSymbols = useProjectStore((s) =>
    mode === 'eendraad' ? s.project.eendraad.symbols : s.project.situatie.symbols
  );
  const assignCircuit = useProjectStore((s) => s.assignCircuit);
  const [kring, setKring] = useState('');
  const circuitNames = collectCircuits(allSymbols).map((c) => c.name);
  const assignable = symbols.filter((s) => s.properties.kring);

  return (
    <div className="space-y-4 p-3 text-xs">
      <p className="text-slate-300">
        {symbols.length + extraCount} items geselecteerd.
      </p>
      {assignable.length > 0 ? (
        <div className="space-y-2 rounded-md border border-panel-border bg-panel-dark/50 p-3">
          <p className="panel-heading flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-accent" /> Kring toekennen
          </p>
          <p className="text-[11px] text-slate-500">
            Zet {assignable.length} symbolen samen op dezelfde kring.
          </p>
          <input
            value={kring}
            onChange={(e) => setKring(e.target.value)}
            list="multi-kring-suggest"
            autoComplete="off"
            placeholder="Bv. F"
            className="w-full rounded-md border border-panel-border bg-panel-dark/60 px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-accent focus:outline-none"
          />
          <datalist id="multi-kring-suggest">
            {circuitNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          <button
            onClick={() => assignCircuit(mode, assignable.map((s) => s.id), kring.trim())}
            disabled={!kring.trim()}
            className="btn-ghost w-full justify-center !text-accent disabled:opacity-40"
          >
            Toekennen aan {assignable.length} symbolen
          </button>
        </div>
      ) : (
        <p className="text-slate-400">
          Selecteer 1 symbool of draad om de eigenschappen te bewerken.
        </p>
      )}
    </div>
  );
};

const EmptyState = () => {
  const metadata = useProjectStore((s) => s.project.metadata);
  const updateMetadata = useProjectStore((s) => s.updateMetadata);
  return (
    <div className="space-y-4 p-3 text-sm">
      <div className="flex items-start gap-2 rounded-md border border-panel-border bg-panel-dark/50 p-3 text-xs text-slate-400">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
        <span>
          Selecteer een symbool om de eigenschappen te bewerken. Hieronder kun je de
          projectgegevens voor het titelblok invullen.
        </span>
      </div>

      <div className="space-y-3">
        <ProjectField
          label="Adres van de installatie"
          value={metadata.address ?? ''}
          onChange={(v) => updateMetadata({ address: v })}
          placeholder="Straat, nummer, postcode, gemeente"
        />
        <ProjectField
          label="Installateur / firma"
          value={metadata.installer ?? ''}
          onChange={(v) => updateMetadata({ installer: v })}
          placeholder="Naam van de elektricien"
        />
        <ProjectField
          label="Onderzoeksdatum"
          type="date"
          value={metadata.inspectionDate ?? ''}
          onChange={(v) => updateMetadata({ inspectionDate: v })}
        />
        <ProjectField
          label="Keuringsinstantie"
          value={metadata.inspectionBody ?? ''}
          onChange={(v) => updateMetadata({ inspectionBody: v })}
          placeholder="Bv. BTV, Vinçotte, ..."
        />
        <ProjectField
          label="Opmerkingen"
          value={metadata.notes ?? ''}
          onChange={(v) => updateMetadata({ notes: v })}
          placeholder="Bijkomende informatie"
          multiline
        />
      </div>

      <CircuitManager />
    </div>
  );
};

/**
 * Beheer van kringen: hernoem een kring overal in één keer (bv. B → F),
 * en selecteer alle symbolen van een kring.
 */
const CircuitManager = () => {
  const mode = useEditorStore((s) => s.mode);
  const symbols = useProjectStore((s) =>
    mode === 'eendraad' ? s.project.eendraad.symbols : s.project.situatie.symbols
  );
  const renameCircuit = useProjectStore((s) => s.renameCircuit);
  const setSelection = useEditorStore((s) => s.setSelection);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const circuits = collectCircuits(symbols);

  if (circuits.length === 0) {
    return (
      <div className="space-y-2">
        <p className="panel-heading flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-accent" /> Kringen
        </p>
        <p className="rounded-md border border-panel-border bg-panel-dark/50 p-3 text-xs text-slate-400">
          Nog geen kringen. Geef een symbool een kring (veld "Kring") en die verschijnt hier. Je
          kan een kring dan in één keer hernoemen, bv. van B naar F.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="panel-heading flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5 text-accent" /> Kringen
      </p>
      <p className="text-[11px] text-slate-500">
        Wijzig de naam om een kring overal te hernoemen (bv. B → F).
      </p>
      <div className="space-y-1.5">
        {circuits.map((c) => (
          <CircuitRow
            key={c.name}
            name={c.name}
            count={c.count}
            onRename={(next) => renameCircuit(mode, c.name, next)}
            onSelect={() => {
              if (c.symbolIds.length > 0) setSelection(c.symbolIds);
              else clearSelection();
            }}
          />
        ))}
      </div>
    </div>
  );
};

const CircuitRow = ({
  name,
  count,
  onRename,
  onSelect,
}: {
  name: string;
  count: number;
  onRename: (next: string) => void;
  onSelect: () => void;
}) => {
  const [draft, setDraft] = useState(name);
  const commit = () => {
    const next = draft.trim();
    if (next && next !== name) onRename(next);
    else setDraft(name);
  };
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-panel-border bg-panel-dark/50 px-2 py-1.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-accent/15 text-[11px] font-semibold text-accent">
        {count}
      </span>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') setDraft(name);
        }}
        className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1.5 py-1 text-sm text-slate-100 hover:border-panel-border focus:border-accent focus:bg-panel-dark focus:outline-none"
        title="Kringnaam — wijzig om overal te hernoemen"
      />
      <button
        onClick={onSelect}
        className="btn-icon shrink-0"
        title={`Selecteer alle ${count} symbolen van kring ${name}`}
      >
        <MousePointerSquareDashed className="h-4 w-4" />
      </button>
    </div>
  );
};

const SymbolEditor = ({ symbol, mode }: { symbol: PlacedSymbol; mode: EditorMode }) => {
  const def = getSymbolDefinition(symbol.type);
  const updateSymbolProperty = useProjectStore((s) => s.updateSymbolProperty);
  const rotateSymbol = useProjectStore((s) => s.rotateSymbol);
  const removeSymbols = useProjectStore((s) => s.removeSymbols);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const allSymbols = useProjectStore((s) =>
    mode === 'eendraad' ? s.project.eendraad.symbols : s.project.situatie.symbols
  );
  const circuitNames = collectCircuits(allSymbols).map((c) => c.name);

  const suggestionsFor = (key: string): string[] | undefined => {
    if (key === 'kring') return circuitNames;
    return TEXT_FIELD_SUGGESTIONS[key];
  };

  if (!def) {
    return (
      <div className="p-3 text-xs text-red-400">Onbekend symbooltype: {symbol.type}</div>
    );
  }

  const propertyEntries = Object.entries(symbol.properties);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="panel-section">
        <p className="text-[11px] uppercase tracking-wider text-slate-500">{def.description}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-100">{def.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 text-xs">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <ReadOnlyField label="Positie X" value={Math.round(symbol.position.x).toString()} />
          <ReadOnlyField label="Positie Y" value={Math.round(symbol.position.y).toString()} />
          <ReadOnlyField label="Rotatie" value={`${symbol.rotation}°`} />
          <ReadOnlyField label="Type" value={def.type} />
        </div>

        {propertyEntries.length > 0 ? (
          <div className="space-y-3">
            <p className="panel-heading">Instellingen</p>
            {propertyEntries.map(([key, prop]) => (
              <PropertyField
                key={key}
                propKey={key}
                value={prop}
                suggestions={suggestionsFor(key)}
                onChange={(v) => updateSymbolProperty(mode, symbol.id, key, v)}
              />
            ))}
          </div>
        ) : (
          <p className="italic text-slate-500">Dit symbool heeft geen instelbare eigenschappen.</p>
        )}
      </div>

      <div className="panel-section flex items-center gap-1 border-t">
        <button
          onClick={() => rotateSymbol(mode, symbol.id, 90)}
          className="btn-ghost !text-slate-200"
          title="Roteer 90° (R)"
        >
          <RotateCw className="h-4 w-4" />
          <span>Roteer</span>
        </button>
        <button
          onClick={() => {
            removeSymbols(mode, [symbol.id]);
            clearSelection();
          }}
          className="btn-ghost !text-red-300 hover:!bg-red-500/10"
          title="Verwijder (Delete)"
        >
          <Trash2 className="h-4 w-4" />
          <span>Verwijder</span>
        </button>
      </div>
    </div>
  );
};

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="mb-0.5 text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
    <p className="truncate rounded border border-panel-border bg-panel-dark/60 px-2 py-1 font-mono text-xs text-slate-300">
      {value}
    </p>
  </div>
);

const WireEditor = ({ wire, mode }: { wire: Wire; mode: EditorMode }) => {
  const updateWire = useProjectStore((s) => s.updateWire);
  const removeWires = useProjectStore((s) => s.removeWires);
  const symbols = useProjectStore((s) =>
    mode === 'eendraad' ? s.project.eendraad.symbols : s.project.situatie.symbols
  );
  const setWireSelection = useEditorStore((s) => s.setWireSelection);

  const fromSym = symbols.find((s) => s.id === wire.from.symbolId);
  const toSym = symbols.find((s) => s.id === wire.to.symbolId);
  const fromName = fromSym ? getSymbolDefinition(fromSym.type)?.name ?? fromSym.type : '—';
  const toName = toSym ? getSymbolDefinition(toSym.type)?.name ?? toSym.type : '—';

  const baseClass =
    'w-full rounded-md border border-panel-border bg-panel-dark/60 px-2 py-1.5 text-sm text-slate-100 focus:border-accent focus:outline-none';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="panel-section">
        <p className="text-[11px] uppercase tracking-wider text-slate-500">Verbinding</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-100">
          <Cable className="h-4 w-4 text-accent" />
          Draad
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 text-xs">
        <div className="mb-4 grid grid-cols-1 gap-3">
          <ReadOnlyField label="Van" value={fromName} />
          <ReadOnlyField label="Naar" value={toName} />
        </div>

        <div className="space-y-3">
          <p className="panel-heading">Kabel</p>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-slate-400">Doorsnede</span>
            <select
              className={baseClass}
              value={wire.crossSection}
              onChange={(e) =>
                updateWire(mode, wire.id, {
                  crossSection: e.target.value as WireCrossSection,
                })
              }
            >
              {WIRE_CROSS_SECTIONS.map((cs) => (
                <option key={cs} value={cs}>
                  {cs} mm²
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-slate-400">Kabeltype</span>
            <select
              className={baseClass}
              value={wire.cableType}
              onChange={(e) =>
                updateWire(mode, wire.id, { cableType: e.target.value as WireCableType })
              }
            >
              {WIRE_CABLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-slate-400">Label (optioneel)</span>
            <input
              className={baseClass}
              type="text"
              value={wire.label ?? ''}
              placeholder="Bv. Kring 3"
              onChange={(e) => updateWire(mode, wire.id, { label: e.target.value })}
            />
          </label>
        </div>
      </div>

      <div className="panel-section flex items-center gap-1 border-t">
        <button
          onClick={() => {
            removeWires(mode, [wire.id]);
            setWireSelection([]);
          }}
          className="btn-ghost !text-red-300 hover:!bg-red-500/10"
          title="Verwijder (Delete)"
        >
          <Trash2 className="h-4 w-4" />
          <span>Verwijder draad</span>
        </button>
      </div>
    </div>
  );
};

interface PropertyFieldProps {
  propKey: string;
  value: PropertyValue;
  onChange: (v: PropertyValue['value']) => void;
  /** Voorgestelde waarden voor vrije-tekstvelden (combobox). */
  suggestions?: string[];
}

const PropertyField = ({ propKey, value, onChange, suggestions }: PropertyFieldProps) => {
  const baseClass =
    'w-full rounded-md border border-panel-border bg-panel-dark/60 px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-accent focus:outline-none';

  if (value.type === 'select' && value.options) {
    return (
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium text-slate-400">{value.label}</span>
        <select
          value={String(value.value)}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        >
          {value.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (value.type === 'boolean') {
    return (
      <label className="flex items-center justify-between gap-2 rounded-md border border-panel-border bg-panel-dark/60 px-2 py-1.5">
        <span className="text-[11px] text-slate-300">{value.label}</span>
        <input
          type="checkbox"
          checked={Boolean(value.value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
      </label>
    );
  }

  if (value.type === 'number') {
    return (
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium text-slate-400">
          {value.label}
          {value.unit ? <span className="ml-1 text-slate-500">({value.unit})</span> : null}
        </span>
        <input
          type="number"
          value={typeof value.value === 'number' ? value.value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className={baseClass}
        />
      </label>
    );
  }

  const list = suggestions ?? value.suggestions;
  const listId = list && list.length > 0 ? `sugg-${propKey}` : undefined;
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-slate-400">
        {value.label}
        {value.unit ? <span className="ml-1 text-slate-500">({value.unit})</span> : null}
      </span>
      <input
        type="text"
        value={String(value.value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        className={baseClass}
        placeholder={list && list.length > 0 ? 'Kies of typ…' : propKey}
        list={listId}
        autoComplete="off"
      />
      {listId ? (
        <datalist id={listId}>
          {list!.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      ) : null}
    </label>
  );
};

interface ProjectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}

const ProjectField = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline,
}: ProjectFieldProps) => (
  <label className="block text-xs">
    <span className="mb-1 block font-medium text-slate-400">{label}</span>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-md border border-panel-border bg-panel-dark/60 px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-accent focus:outline-none"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-panel-border bg-panel-dark/60 px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-accent focus:outline-none"
      />
    )}
  </label>
);
