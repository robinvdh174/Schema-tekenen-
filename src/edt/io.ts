import type { ProjectDoc } from './model';
import { exportSchemaImage } from './exporter';
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
