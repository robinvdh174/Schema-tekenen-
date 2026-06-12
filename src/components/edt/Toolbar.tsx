import { useRef, useState } from 'react';
import {
  FileDown,
  FilePlus2,
  FolderOpen,
  HelpCircle,
  Image,
  ImageUp,
  Redo2,
  Save,
  SquareStack,
  Undo2,
} from 'lucide-react';
import { useSchemaStore } from '@/store/schemaStore';
import { downloadPdf, downloadPng, downloadProjectJson, readProjectFile } from '@/edt/io';

const HelpPopover = ({ onClose }: { onClose: () => void }) => (
  <div className="absolute right-2 top-14 z-50 w-80 rounded-lg border border-panel-border bg-panel p-4 text-sm text-slate-200 shadow-2xl">
    <p className="mb-2 font-semibold">Zo werkt het</p>
    <ol className="list-decimal space-y-1.5 pl-4 text-[13px] leading-relaxed text-slate-300">
      <li>Klik op het schema een onderdeel aan, bv. het verdeelbord.</li>
      <li>Kies links in het symbolenpalet wat je eronder wil, bv. een automaat (= nieuwe kring).</li>
      <li>Klik onder die automaat verbruikers bij: stopcontacten, schakelaars, lichtpunten, toestellen …</li>
      <li>Pas rechts de eigenschappen aan (ampère, kabel, kring, lokaal …).</li>
    </ol>
    <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
      Het schema tekent en nummert zichzelf. Je werk wordt automatisch in deze browser bewaard;
      gebruik <b>Opslaan</b> voor een bestand als reservekopie en <b>PDF</b> om af te drukken.
    </p>
    <button className="btn-primary mt-3 w-full py-1.5" onClick={onClose}>
      Begrepen
    </button>
  </div>
);

const ViewSwitcher = () => {
  const view = useSchemaStore((s) => s.view);
  const setView = useSchemaStore((s) => s.setView);
  const tabs = [
    { id: 'schema' as const, label: 'Schema', icon: SquareStack },
    { id: 'plan' as const, label: 'Foto / plan', icon: ImageUp },
  ];
  return (
    <div className="flex items-center rounded-md border border-panel-border bg-panel-dark p-0.5">
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = view === id;
        return (
          <button
            key={id}
            onClick={() => setView(id)}
            title={id === 'schema' ? 'Eendraadschema' : 'Foto van de woning met markeringen'}
            className={
              'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ' +
              (active ? 'bg-accent text-white shadow' : 'text-slate-300 hover:bg-panel-light')
            }
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const Toolbar = () => {
  const doc = useSchemaStore((s) => s.doc);
  const view = useSchemaStore((s) => s.view);
  const setName = useSchemaStore((s) => s.setName);
  const newProject = useSchemaStore((s) => s.newProject);
  const loadDoc = useSchemaStore((s) => s.loadDoc);
  const undo = useSchemaStore((s) => s.undo);
  const redo = useSchemaStore((s) => s.redo);
  const canUndo = useSchemaStore((s) => s.undoStack.length > 0);
  const canRedo = useSchemaStore((s) => s.redoStack.length > 0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleNew = () => {
    if (
      window.confirm(
        'Nieuw schema starten? Het huidige schema wordt vervangen. Sla het eerst op als je het wil bewaren.'
      )
    ) {
      newProject();
    }
  };

  const handleOpenFile = async (file: File | null) => {
    if (!file) return;
    try {
      loadDoc(await readProjectFile(file));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Bestand kon niet geopend worden.');
    }
  };

  const exportWith = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <header className="relative flex h-12 shrink-0 items-center justify-between border-b border-panel-border bg-panel px-2 text-slate-100">
      <div className="flex items-center gap-1">
        <span className="px-2 text-sm font-bold tracking-tight text-slate-100">
          Eendraad<span className="text-accent">schema</span>
        </span>
        <div className="toolbar-separator" />
        <button className="btn-ghost" title="Nieuw schema" onClick={handleNew}>
          <FilePlus2 className="h-4 w-4" />
          <span className="hidden lg:inline">Nieuw</span>
        </button>
        <button className="btn-ghost" title="Schemabestand openen" onClick={() => fileInputRef.current?.click()}>
          <FolderOpen className="h-4 w-4" />
          <span className="hidden lg:inline">Openen</span>
        </button>
        <button className="btn-ghost" title="Opslaan als bestand (Ctrl+S)" onClick={() => downloadProjectJson(doc)}>
          <Save className="h-4 w-4" />
          <span className="hidden lg:inline">Opslaan</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            void handleOpenFile(e.target.files?.[0] ?? null);
            e.target.value = '';
          }}
        />
        <div className="toolbar-separator" />
        <button className="btn-icon" title="Ongedaan maken (Ctrl+Z)" onClick={undo} disabled={!canUndo}>
          <Undo2 className="h-4 w-4" />
        </button>
        <button className="btn-icon" title="Opnieuw (Ctrl+Y)" onClick={redo} disabled={!canRedo}>
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <input
          value={doc.name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-[20rem] flex-1 truncate rounded-md border border-transparent bg-panel-light px-3 py-1.5 text-center text-sm font-medium text-slate-100 placeholder-slate-500 focus:border-accent focus:bg-panel-dark focus:outline-none"
          placeholder="Projectnaam"
          spellCheck={false}
        />
      </div>

      <div className="flex items-center gap-1">
        <ViewSwitcher />
        <div className="toolbar-separator" />
        <button
          className="btn-ghost"
          title={view === 'plan' ? 'Ga naar de schema-weergave om te exporteren' : 'Exporteren als afbeelding (PNG)'}
          disabled={busy || view === 'plan'}
          onClick={() => void exportWith(() => downloadPng(doc))}
        >
          <Image className="h-4 w-4" />
          <span className="hidden lg:inline">PNG</span>
        </button>
        <button
          className="btn-primary"
          title={view === 'plan' ? 'Ga naar de schema-weergave om te exporteren' : 'Exporteren als PDF (afdrukken)'}
          disabled={busy || view === 'plan'}
          onClick={() => void exportWith(() => downloadPdf(doc))}
        >
          <FileDown className="h-4 w-4" />
          <span className="hidden lg:inline">PDF</span>
        </button>
        <button className="btn-icon" title="Uitleg" onClick={() => setHelpOpen((open) => !open)}>
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {helpOpen ? <HelpPopover onClose={() => setHelpOpen(false)} /> : null}
    </header>
  );
};
