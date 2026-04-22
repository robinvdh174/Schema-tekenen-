import { Cable, Info, RotateCw, Trash2 } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useProjectStore } from '@/store/projectStore';
import { getSymbolDefinition } from '@/data/symbols';
import type { PlacedSymbol, PropertyValue } from '@/types/symbols';
import type { EditorMode } from '@/types/canvas';
import type { Wire, WireCableType, WireCrossSection } from '@/types/wire';
import { WIRE_CABLE_TYPES, WIRE_CROSS_SECTIONS } from '@/types/wire';

export const PropertiesPanel = () => {
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
      <div className="panel-section">
        <h2 className="panel-heading">Eigenschappen</h2>
      </div>

      {selectedSymbols.length === 0 && selectedWires.length === 0 ? (
        <EmptyState />
      ) : selectedSymbols.length === 1 && selectedWires.length === 0 ? (
        <SymbolEditor symbol={selectedSymbols[0]} mode={mode} />
      ) : selectedWires.length === 1 && selectedSymbols.length === 0 ? (
        <WireEditor wire={selectedWires[0]} mode={mode} />
      ) : (
        <div className="p-3 text-xs text-slate-400">
          {selectedSymbols.length + selectedWires.length} items geselecteerd. Selecteer 1 symbool of
          draad om eigenschappen te bewerken.
        </div>
      )}
    </aside>
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
    </div>
  );
};

const SymbolEditor = ({ symbol, mode }: { symbol: PlacedSymbol; mode: EditorMode }) => {
  const def = getSymbolDefinition(symbol.type);
  const updateSymbolProperty = useProjectStore((s) => s.updateSymbolProperty);
  const rotateSymbol = useProjectStore((s) => s.rotateSymbol);
  const removeSymbols = useProjectStore((s) => s.removeSymbols);
  const clearSelection = useEditorStore((s) => s.clearSelection);

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
}

const PropertyField = ({ propKey, value, onChange }: PropertyFieldProps) => {
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
        placeholder={propKey}
      />
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
