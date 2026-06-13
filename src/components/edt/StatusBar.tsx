import { useMemo } from 'react';
import { walk } from '@/edt/model';
import { useSchemaStore } from '@/store/schemaStore';

const KRING_KINDS = new Set(['automaat', 'differentieel', 'diffautomaat', 'smeltzekering']);

export const StatusBar = () => {
  const tree = useSchemaStore((s) => s.doc.tree);
  const updatedAt = useSchemaStore((s) => s.doc.updatedAt);

  const stats = useMemo(() => {
    let componenten = 0;
    let kringen = 0;
    walk(tree, (node) => {
      componenten += 1;
      if (KRING_KINDS.has(node.kind)) kringen += 1;
    });
    return { componenten, kringen };
  }, [tree]);

  return (
    <footer
      className="flex h-7 shrink-0 items-center justify-between border-t border-panel-border bg-panel px-3 text-[11px] text-slate-400"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <span>
        {stats.kringen} {stats.kringen === 1 ? 'kring' : 'kringen'} · {stats.componenten} componenten
      </span>
      <span className="hidden sm:inline">
        Slepen = verschuiven · scrollen = zoomen · klik op een symbool om het te bewerken
      </span>
      <span>
        automatisch bewaard om{' '}
        {new Date(updatedAt).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </footer>
  );
};
