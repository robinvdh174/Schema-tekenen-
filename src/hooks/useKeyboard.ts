import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useHistoryStore } from '@/store/historyStore';
import { useProjectStore } from '@/store/projectStore';
import { useUiStore } from '@/store/uiStore';
import { createId } from '@/utils/id';

const PASTE_OFFSET = 20;

/**
 * Global keyboard shortcuts for the editor. Ignores events while typing in inputs.
 */
export const useKeyboard = () => {
  const setTool = useEditorStore((s) => s.setTool);
  const zoomAt = useEditorStore((s) => s.zoomAt);
  const resetView = useEditorStore((s) => s.resetView);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
    };

    const getStageCenter = () => {
      const el = document.querySelector('.konvajs-content') as HTMLElement | null;
      const rect = el?.getBoundingClientRect();
      return rect
        ? { x: rect.width / 2, y: rect.height / 2 }
        : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    };

    const copySelection = () => {
      const editor = useEditorStore.getState();
      const project = useProjectStore.getState();
      if (editor.selectedIds.length === 0) return;
      const selected = project
        .getSymbols(editor.mode)
        .filter((s) => editor.selectedIds.includes(s.id));
      if (selected.length > 0) useUiStore.getState().setClipboard(selected);
    };

    const pasteClipboard = () => {
      const clipboard = useUiStore.getState().clipboard;
      if (clipboard.length === 0) return;
      const editor = useEditorStore.getState();
      const project = useProjectStore.getState();

      const newIds: string[] = [];
      for (const original of clipboard) {
        const copy = {
          ...original,
          id: createId('sym'),
          position: {
            x: original.position.x + PASTE_OFFSET,
            y: original.position.y + PASTE_OFFSET,
          },
        };
        project.addSymbol(editor.mode, copy);
        newIds.push(copy.id);
      }
      editor.setSelection(newIds);
    };

    const duplicateSelection = () => {
      const editor = useEditorStore.getState();
      const project = useProjectStore.getState();
      const selected = project
        .getSymbols(editor.mode)
        .filter((s) => editor.selectedIds.includes(s.id));
      if (selected.length === 0) return;

      const newIds: string[] = [];
      for (const original of selected) {
        const copy = {
          ...original,
          id: createId('sym'),
          position: {
            x: original.position.x + PASTE_OFFSET,
            y: original.position.y + PASTE_OFFSET,
          },
        };
        project.addSymbol(editor.mode, copy);
        newIds.push(copy.id);
      }
      editor.setSelection(newIds);
    };

    const handler = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const ctrl = e.ctrlKey || e.metaKey;
      const editor = useEditorStore.getState();
      const project = useProjectStore.getState();
      const history = useHistoryStore.getState();

      // --- Ctrl-combos ---
      if (ctrl) {
        const key = e.key.toLowerCase();

        if (key === 'z' && !e.shiftKey) {
          e.preventDefault();
          history.undo();
          return;
        }
        if ((key === 'z' && e.shiftKey) || key === 'y') {
          e.preventDefault();
          history.redo();
          return;
        }
        if (e.key === '0') {
          e.preventDefault();
          resetView();
          return;
        }
        if (key === 'a') {
          e.preventDefault();
          const ids = project.getSymbols(editor.mode).map((s) => s.id);
          editor.setSelection(ids);
          return;
        }
        if (key === 'c') {
          e.preventDefault();
          copySelection();
          return;
        }
        if (key === 'v') {
          e.preventDefault();
          pasteClipboard();
          return;
        }
        if (key === 'd') {
          e.preventDefault();
          duplicateSelection();
          return;
        }
        return; // unhandled Ctrl combo
      }

      // --- Plain keys ---
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomAt(1.2, getStageCenter());
        return;
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomAt(1 / 1.2, getStageCenter());
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const hasSymbols = editor.selectedIds.length > 0;
        const hasWires = editor.selectedWireIds.length > 0;
        if (hasSymbols || hasWires) {
          e.preventDefault();
          if (hasWires) project.removeWires(editor.mode, editor.selectedWireIds);
          if (hasSymbols) {
            project.removeSymbols(editor.mode, editor.selectedIds);
            project.removeWiresTouching(editor.mode, editor.selectedIds);
          }
          editor.clearSelection();
        }
        return;
      }

      if (e.key === 'Escape') {
        editor.clearSelection();
        editor.setWireStart(null);
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setTool('select');
          break;
        case 'h':
          setTool('pan');
          break;
        case 'w':
          setTool('wire');
          break;
        case 'g':
          toggleGrid();
          break;
        case 'r':
          if (editor.selectedIds.length > 0) {
            e.preventDefault();
            editor.selectedIds.forEach((id) => project.rotateSymbol(editor.mode, id, 90));
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [resetView, setTool, toggleGrid, zoomAt]);
};
