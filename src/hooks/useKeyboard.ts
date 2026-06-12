import { useEffect } from 'react';
import { useSchemaStore } from '@/store/schemaStore';
import { downloadProjectJson } from '@/edt/io';

const isTyping = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
};

export const useKeyboard = () => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const store = useSchemaStore.getState();
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        store.undo();
        return;
      }
      if ((mod && e.key.toLowerCase() === 'y') || (mod && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        store.redo();
        return;
      }
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        downloadProjectJson(store.doc);
        return;
      }

      if (isTyping(e.target)) return;

      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        store.duplicateSelected();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (store.view === 'plan') {
          if (store.selectedMarkerId) store.removePlanMarker(store.selectedMarkerId);
        } else {
          store.removeSelected();
        }
        return;
      }
      if (e.key === 'Escape') {
        store.select(null);
        store.setPendingPlanNode(null);
        store.selectMarker(null);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
};
