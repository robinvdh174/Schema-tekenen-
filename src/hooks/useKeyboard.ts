import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useProjectStore } from '@/store/projectStore';

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

    const handler = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const ctrl = e.ctrlKey || e.metaKey;
      const editor = useEditorStore.getState();
      const project = useProjectStore.getState();

      if (ctrl && e.key === '0') {
        e.preventDefault();
        resetView();
        return;
      }
      if (!ctrl && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomAt(1.2, getStageCenter());
        return;
      }
      if (!ctrl && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        zoomAt(1 / 1.2, getStageCenter());
        return;
      }

      if (ctrl && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const mode = editor.mode;
        const ids = project.getSymbols(mode).map((s) => s.id);
        editor.setSelection(ids);
        return;
      }

      if (!ctrl && (e.key === 'Delete' || e.key === 'Backspace')) {
        if (editor.selectedIds.length > 0) {
          e.preventDefault();
          project.removeSymbols(editor.mode, editor.selectedIds);
          editor.clearSelection();
        }
        return;
      }

      if (!ctrl && e.key === 'Escape') {
        editor.clearSelection();
        return;
      }

      if (!ctrl && e.key.toLowerCase() === 'r') {
        if (editor.selectedIds.length > 0) {
          e.preventDefault();
          editor.selectedIds.forEach((id) => project.rotateSymbol(editor.mode, id, 90));
        }
        return;
      }

      if (ctrl) return;

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
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [resetView, setTool, toggleGrid, zoomAt]);
};
