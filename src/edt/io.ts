import type { ProjectDoc } from './model';
import { exportSchemaImage } from './exporter';
import { buildBom } from './bom';
import { isValidDoc, useSchemaStore } from '@/store/schemaStore';

const triggerDownload = (url: string, filename: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};

const safeName = (name: string) => (name.trim() || 'eendraadschema').replace(/[^\w\- ]+/g, '').trim();

export const downloadProjectJson = (doc: ProjectDoc) => {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${safeName(doc.name)}.eds.json`);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

export const readProjectFile = (file: File): Promise<ProjectDoc> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Bestand kon niet gelezen worden.'));
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as unknown;
        if (!isValidDoc(parsed)) {
          reject(new Error('Dit is geen geldig schemabestand (.eds.json).'));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error('Dit is geen geldig schemabestand (.eds.json).'));
      }
    };
    reader.readAsText(file);
  });

/** Wacht één tel zodat de selectie-markering van het canvas verdwenen is. */
const withCleanCanvas = async <T>(fn: () => T): Promise<T> => {
  useSchemaStore.getState().select(null);
  await new Promise((r) => setTimeout(r, 80));
  return fn();
};

export const downloadPng = async (doc: ProjectDoc) => {
  const image = await withCleanCanvas(exportSchemaImage);
  if (!image) return;
  triggerDownload(image.dataUrl, `${safeName(doc.name)}.png`);
};

export const downloadPdf = async (doc: ProjectDoc) => {
  const image = await withCleanCanvas(exportSchemaImage);
  if (!image) return;
  const { jsPDF } = await import('jspdf');
  const landscape = image.width >= image.height;
  const pdf = new jsPDF({ orientation: landscape ? 'l' : 'p', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;
  const ratio = Math.min(maxW / image.width, maxH / image.height);
  const w = image.width * ratio;
  const h = image.height * ratio;
  pdf.addImage(image.dataUrl, 'PNG', (pageW - w) / 2, (pageH - h) / 2, w, h);
  pdf.save(`${safeName(doc.name)}.pdf`);
};

/**
 * Materiaallijst als nette, afdrukbare PDF (tekst, geen schermafbeelding).
 * De lijst wordt telkens vers uit de boom berekend, dus ze klopt altijd met
 * het schema.
 */
export const downloadBomPdf = async (doc: ProjectDoc) => {
  const bom = buildBom(doc.tree);
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  const newPageIfNeeded = (needed: number) => {
    if (y + needed > pageH - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('Materiaallijst', margin, y);
  y += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(doc.name || 'Eendraadschema', margin, y);
  y += 5;
  pdf.setFontSize(9);
  pdf.setTextColor(110);
  if (doc.installateur) {
    pdf.text(`Installateur: ${doc.installateur}`, margin, y);
    y += 4;
  }
  pdf.text(`Aangemaakt: ${new Date().toLocaleDateString('nl-BE')}`, margin, y);
  y += 7;
  pdf.setTextColor(0);

  const qtyX = margin;
  const labelX = margin + 16;

  if (bom.groups.length === 0) {
    pdf.setFontSize(11);
    pdf.text('Nog geen onderdelen in het schema.', margin, y);
  }

  for (const group of bom.groups) {
    newPageIfNeeded(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(group.label, margin, y);
    y += 2;
    pdf.setDrawColor(200);
    pdf.line(margin, y, pageW - margin, y);
    y += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    for (const item of group.items) {
      newPageIfNeeded(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${item.qty} ×`, qtyX, y);
      pdf.setFont('helvetica', 'normal');
      const text = item.unit ? `${item.label}  (${item.unit})` : item.label;
      const wrapped = pdf.splitTextToSize(text, pageW - margin - labelX) as string[];
      pdf.text(wrapped, labelX, y);
      y += 5 * wrapped.length;
    }
    y += 4;
  }

  newPageIfNeeded(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text(`Totaal aantal onderdelen (excl. bekabeling): ${bom.totalItems}`, margin, y);

  pdf.save(`${safeName(doc.name)} - materiaallijst.pdf`);
};
