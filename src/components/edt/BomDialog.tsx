import { useMemo, useState } from 'react';
import { Check, Copy, FileDown, X } from 'lucide-react';
import { useSchemaStore } from '@/store/schemaStore';
import { buildBom, bomToText } from '@/edt/bom';
import { downloadBomPdf } from '@/edt/io';

/**
 * Materiaallijst / bestellijst.
 *
 * Toont in één oogopslag alles wat aangekocht moet worden, automatisch geteld
 * uit het schema. Telkens dit venster opent wordt de lijst opnieuw berekend uit
 * de actuele boom, zodat ze altijd klopt — geen handmatige telfouten meer.
 */
export const BomDialog = ({ onClose }: { onClose: () => void }) => {
  const doc = useSchemaStore((s) => s.doc);
  const bom = useMemo(() => buildBom(doc.tree), [doc.tree]);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bomToText(doc));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // klembord niet beschikbaar — stil negeren
    }
  };

  const handlePdf = async () => {
    setBusy(true);
    try {
      await downloadBomPdf(doc);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="panel flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-panel-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-panel-border px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Materiaallijst</h2>
            <p className="text-[11px] text-slate-400">
              Automatisch geteld uit het schema — werkt mee bij elke wijziging.
            </p>
          </div>
          <button className="btn-icon" title="Sluiten" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {bom.groups.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Er staan nog geen onderdelen in het schema.
            </p>
          ) : (
            bom.groups.map((group) => (
              <section key={group.id} className="mb-5">
                <h3 className="mb-1.5 flex items-baseline justify-between border-b border-panel-border pb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    {group.label}
                  </span>
                  <span className="text-[11px] tabular-nums text-slate-500">{group.total} st.</span>
                </h3>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.key} className="flex items-baseline gap-3 text-sm text-slate-200">
                      <span className="w-10 shrink-0 text-right font-bold tabular-nums text-accent">
                        {item.qty}×
                      </span>
                      <span>
                        {item.label}
                        {item.unit ? (
                          <span className="text-[11px] text-slate-500"> ({item.unit})</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-panel-border px-4 py-3">
          <span className="text-[11px] text-slate-400">
            Totaal: <b className="text-slate-200">{bom.totalItems}</b> onderdelen
            <span className="text-slate-500"> (excl. bekabeling)</span>
          </span>
          <div className="flex items-center gap-2">
            <button className="btn-ghost" onClick={() => void handleCopy()} title="Lijst kopiëren">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span className="hidden sm:inline">{copied ? 'Gekopieerd' : 'Kopiëren'}</span>
            </button>
            <button
              className="btn-primary"
              onClick={() => void handlePdf()}
              disabled={busy}
              title="Materiaallijst als PDF downloaden"
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
