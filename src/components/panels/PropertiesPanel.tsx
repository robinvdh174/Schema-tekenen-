import { Info } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useProjectStore } from '@/store/projectStore';

export const PropertiesPanel = () => {
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const metadata = useProjectStore((s) => s.project.metadata);
  const updateMetadata = useProjectStore((s) => s.updateMetadata);

  return (
    <aside className="panel flex h-full w-72 shrink-0 flex-col border-l">
      <div className="panel-section">
        <h2 className="panel-heading">Eigenschappen</h2>
      </div>

      {selectedIds.length === 0 ? (
        <div className="space-y-4 p-3 text-sm">
          <div className="flex items-start gap-2 rounded-md border border-panel-border bg-panel-dark/50 p-3 text-xs text-slate-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <span>
              Selecteer een symbool of draad om de eigenschappen te bewerken. Voor nu tonen we de
              projectgegevens zodat je alvast een titelblok kan invullen.
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
      ) : (
        <div className="p-3 text-xs text-slate-400">
          {selectedIds.length} item(s) geselecteerd. Eigenschappeneditor volgt in Fase 3.
        </div>
      )}
    </aside>
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
