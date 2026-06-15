import { create } from 'zustand';
import type { ProjectDoc, PropValue, SchemaNode } from '@/edt/model';
import {
  cloneWithNewIds,
  createNode,
  findNode,
  findParent,
  labelOffset,
  mapNode,
  removeNode,
  setNodeLabelOffset,
  walk,
} from '@/edt/model';
import { allowedChildKinds, defaultProps, kindDef } from '@/edt/catalog';
import type { PlanMarker, PlanPhoto, PlanState } from '@/edt/plan';
import { emptyPlan } from '@/edt/plan';

const STORAGE_KEY = 'eendraadschema-project-v1';
const MAX_HISTORY = 200;

/**
 * Bepaalt onder welke node een nieuw symbool uit het palet moet komen.
 * Gedrag:
 *  - is er een selectie, dan wordt vanaf die node naar boven gezocht naar de
 *    dichtstbijzijnde node die dit type als kind aanvaardt (zo wordt bv. een
 *    tweede stopcontact netjes doorgelust onder het geselecteerde stopcontact);
 *  - lukt dat niet (of is er niets geselecteerd), dan valt het terug op de
 *    laatste geschikte ouder in de boom, zodat plaatsen vrijwel altijd lukt.
 * Geeft `null` als geen enkele node dit type kan bevatten.
 */
const resolveInsertionParent = (
  tree: SchemaNode,
  selectedId: string | null,
  kind: string
): SchemaNode | null => {
  const accepts = (node: SchemaNode) =>
    allowedChildKinds(node.kind).some((def) => def.kind === kind);

  if (selectedId) {
    let node: SchemaNode | null = findNode(tree, selectedId);
    while (node) {
      if (accepts(node)) return node;
      node = findParent(tree, node.id);
    }
  }

  let candidate: SchemaNode | null = null;
  walk(tree, (node) => {
    if (accepts(node)) candidate = node;
  });
  return candidate;
};

/** Realistisch startproject zodat je meteen ziet hoe het werkt. */
export const buildDefaultTree = (): SchemaNode =>
  createNode('aansluiting', defaultProps('aansluiting'), [
    createNode('teller', defaultProps('teller'), [
      createNode(
        'differentieel',
        { ...defaultProps('differentieel'), gevoeligheid: '300mA', ampere: '40A', label: 'Hoofddifferentieel' },
        [
          createNode('bord', { ...defaultProps('bord'), naam: 'Hoofdbord', geaard: true }, [
            createNode(
              'automaat',
              { ...defaultProps('automaat'), ampere: '16A', label: 'Stopcontacten keuken' },
              [
                createNode('stopcontact', { ...defaultProps('stopcontact'), aantal: 2, label: 'keuken' }, [
                  createNode('stopcontact', { ...defaultProps('stopcontact'), aantal: 2, label: 'keuken' }),
                ]),
              ]
            ),
            createNode(
              'automaat',
              { ...defaultProps('automaat'), ampere: '20A', label: 'Wasmachine' },
              [createNode('toestel', { ...defaultProps('toestel'), type: 'Wasmachine', label: 'berging' })]
            ),
            createNode(
              'automaat',
              {
                ...defaultProps('automaat'),
                curve: 'B',
                ampere: '10A',
                kabel: 'XVB 3G1,5',
                label: 'Verlichting living',
              },
              [
                createNode('schakelaar', { ...defaultProps('schakelaar'), type: 'Wisselschakelaar', label: 'inkom' }, [
                  createNode('lichtpunt', { ...defaultProps('lichtpunt'), aantal: 2, label: 'living' }),
                ]),
              ]
            ),
          ]),
        ]
      ),
    ]),
  ]);

const buildDefaultDoc = (): ProjectDoc => ({
  version: 1,
  name: 'Nieuw eendraadschema',
  installateur: '',
  updatedAt: Date.now(),
  tree: buildDefaultTree(),
  plan: emptyPlan(),
});

const isValidDoc = (doc: unknown): doc is ProjectDoc => {
  if (!doc || typeof doc !== 'object') return false;
  const d = doc as ProjectDoc;
  return d.version === 1 && typeof d.name === 'string' && !!d.tree && typeof d.tree.kind === 'string';
};

/** Oudere bestanden/opslag kennen het foto-plan nog niet. */
const normalizeDoc = (doc: ProjectDoc): ProjectDoc => ({
  ...doc,
  plan: doc.plan ? { photo: doc.plan.photo ?? null, markers: doc.plan.markers ?? [] } : emptyPlan(),
});

const loadInitialDoc = (): ProjectDoc => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (isValidDoc(parsed)) return normalizeDoc(parsed);
    }
  } catch {
    // corrupte opslag → start opnieuw
  }
  return buildDefaultDoc();
};

const persist = (doc: ProjectDoc) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch {
    // opslag vol of niet beschikbaar — stil negeren
  }
};

export type EditorView = 'schema' | 'plan';

interface SchemaState {
  doc: ProjectDoc;
  selectedId: string | null;
  undoStack: ProjectDoc[];
  redoStack: ProjectDoc[];

  /** Actieve weergave: het eendraadschema of het foto-plan van de woning. */
  view: EditorView;
  /** Node waarvoor de volgende klik op de foto een markering plaatst. */
  pendingPlanNodeId: string | null;
  selectedMarkerId: string | null;

  /** Zijpanelen in-/uitklappen zodat het tekenblad meer ruimte krijgt. */
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;

  select: (id: string | null) => void;
  setName: (name: string) => void;
  setInstallateur: (value: string) => void;

  addChild: (parentId: string, kind: string) => void;
  /**
   * Plaatst een symbool uit het palet op de slimste plek (zie
   * resolveInsertionParent), eventueel met props-overrides (bv. het type
   * schakelaar). Geeft het id van de nieuwe node terug, of `null` wanneer
   * het type hier niet geplaatst kan worden.
   */
  addComponent: (kind: string, props?: Record<string, PropValue>) => string | null;
  removeSelected: () => void;
  duplicateSelected: () => void;
  moveSelected: (direction: -1 | 1) => void;
  updateProp: (id: string, key: string, value: PropValue) => void;

  /** Verschuift een tekstlabel naar een exacte offset (vrij slepen). */
  setLabelOffset: (id: string, key: string, dx: number, dy: number) => void;
  /** Duwt een tekstlabel een stapje in een richting (knoppen in het paneel). */
  nudgeLabel: (id: string, key: string, dx: number, dy: number) => void;
  /** Zet een tekstlabel terug op zijn standaardplaats. */
  resetLabel: (id: string, key: string) => void;

  setView: (view: EditorView) => void;
  setPendingPlanNode: (nodeId: string | null) => void;
  selectMarker: (id: string | null) => void;
  setPlanPhoto: (photo: PlanPhoto | null) => void;
  updatePlanPhoto: (updates: Partial<PlanPhoto>) => void;
  addPlanMarker: (marker: PlanMarker) => void;
  movePlanMarker: (id: string, position: { x: number; y: number }) => void;
  removePlanMarker: (id: string) => void;

  newProject: () => void;
  loadDoc: (doc: ProjectDoc) => void;
  undo: () => void;
  redo: () => void;
}

/** Markeringen op het plan horen bij een node; verdwijnt die, dan ook de markering. */
const pruneMarkers = (doc: ProjectDoc): ProjectDoc => {
  const plan = doc.plan;
  if (!plan || plan.markers.length === 0) return doc;
  const ids = new Set<string>();
  walk(doc.tree, (node) => ids.add(node.id));
  const markers = plan.markers.filter((m) => ids.has(m.nodeId));
  if (markers.length === plan.markers.length) return doc;
  return { ...doc, plan: { ...plan, markers } };
};

export const useSchemaStore = create<SchemaState>((set, get) => {
  /** Voert een mutatie op het document uit met undo-snapshot en autosave. */
  const commit = (mutate: (doc: ProjectDoc) => ProjectDoc, extra: Partial<SchemaState> = {}) => {
    const { doc, undoStack } = get();
    const next = pruneMarkers({ ...mutate(doc), updatedAt: Date.now() });
    persist(next);
    set({
      doc: next,
      undoStack: [...undoStack.slice(-MAX_HISTORY + 1), doc],
      redoStack: [],
      ...extra,
    });
  };

  /** Muteert het foto-plan binnen het document. */
  const commitPlan = (
    mutate: (plan: PlanState) => PlanState,
    extra: Partial<SchemaState> = {}
  ) => commit((doc) => ({ ...doc, plan: mutate(doc.plan ?? emptyPlan()) }), extra);

  return {
    doc: loadInitialDoc(),
    selectedId: null,
    undoStack: [],
    redoStack: [],
    view: 'schema',
    pendingPlanNodeId: null,
    selectedMarkerId: null,
    leftPanelOpen: true,
    rightPanelOpen: true,

    toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
    toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),

    select: (id) => set({ selectedId: id }),

    setName: (name) => commit((doc) => ({ ...doc, name })),
    setInstallateur: (value) => commit((doc) => ({ ...doc, installateur: value })),

    addChild: (parentId, kind) => {
      const { doc } = get();
      const parent = findNode(doc.tree, parentId);
      if (!parent) return;
      if (!allowedChildKinds(parent.kind).some((def) => def.kind === kind)) return;
      const child = createNode(kind, defaultProps(kind));
      commit(
        (d) => ({
          ...d,
          tree: mapNode(d.tree, parentId, (n) => ({ ...n, children: [...n.children, child] })),
        }),
        { selectedId: child.id }
      );
    },

    addComponent: (kind, props) => {
      const { doc, selectedId } = get();
      const parent = resolveInsertionParent(doc.tree, selectedId, kind);
      if (!parent) return null;
      const child = createNode(kind, { ...defaultProps(kind), ...props });
      commit(
        (d) => ({
          ...d,
          tree: mapNode(d.tree, parent.id, (n) => ({ ...n, children: [...n.children, child] })),
        }),
        { selectedId: child.id }
      );
      return child.id;
    },

    removeSelected: () => {
      const { doc, selectedId } = get();
      if (!selectedId || selectedId === doc.tree.id) return;
      const parent = findParent(doc.tree, selectedId);
      commit((d) => ({ ...d, tree: removeNode(d.tree, selectedId) }), {
        selectedId: parent?.id ?? null,
      });
    },

    duplicateSelected: () => {
      const { doc, selectedId } = get();
      if (!selectedId || selectedId === doc.tree.id) return;
      const parent = findParent(doc.tree, selectedId);
      const original = findNode(doc.tree, selectedId);
      if (!parent || !original) return;
      const copy = cloneWithNewIds(original);
      commit(
        (d) => ({
          ...d,
          tree: mapNode(d.tree, parent.id, (n) => {
            const idx = n.children.findIndex((c) => c.id === selectedId);
            const children = [...n.children];
            children.splice(idx + 1, 0, copy);
            return { ...n, children };
          }),
        }),
        { selectedId: copy.id }
      );
    },

    moveSelected: (direction) => {
      const { doc, selectedId } = get();
      if (!selectedId) return;
      const parent = findParent(doc.tree, selectedId);
      if (!parent) return;
      const idx = parent.children.findIndex((c) => c.id === selectedId);
      const target = idx + direction;
      if (target < 0 || target >= parent.children.length) return;
      commit((d) => ({
        ...d,
        tree: mapNode(d.tree, parent.id, (n) => {
          const children = [...n.children];
          const [moved] = children.splice(idx, 1);
          children.splice(target, 0, moved);
          return { ...n, children };
        }),
      }));
    },

    updateProp: (id, key, value) => {
      // Alleen bestaande props van het type aanvaarden
      const node = findNode(get().doc.tree, id);
      if (!node || !kindDef(node.kind).props.some((p) => p.key === key)) return;
      commit((d) => ({
        ...d,
        tree: mapNode(d.tree, id, (n) => ({ ...n, props: { ...n.props, [key]: value } })),
      }));
    },

    setLabelOffset: (id, key, dx, dy) => {
      const node = findNode(get().doc.tree, id);
      if (!node) return;
      const rounded = { dx: Math.round(dx), dy: Math.round(dy) };
      const current = labelOffset(node, key);
      if (current.dx === rounded.dx && current.dy === rounded.dy) return;
      commit((d) => ({
        ...d,
        tree: mapNode(d.tree, id, (n) => setNodeLabelOffset(n, key, rounded)),
      }));
    },

    nudgeLabel: (id, key, dx, dy) => {
      const node = findNode(get().doc.tree, id);
      if (!node) return;
      const current = labelOffset(node, key);
      commit((d) => ({
        ...d,
        tree: mapNode(d.tree, id, (n) =>
          setNodeLabelOffset(n, key, { dx: current.dx + dx, dy: current.dy + dy })
        ),
      }));
    },

    resetLabel: (id, key) => {
      const node = findNode(get().doc.tree, id);
      if (!node) return;
      const current = labelOffset(node, key);
      if (current.dx === 0 && current.dy === 0) return;
      commit((d) => ({
        ...d,
        tree: mapNode(d.tree, id, (n) => setNodeLabelOffset(n, key, { dx: 0, dy: 0 })),
      }));
    },

    setView: (view) =>
      set({ view, pendingPlanNodeId: null, selectedMarkerId: null }),

    setPendingPlanNode: (pendingPlanNodeId) =>
      set({ pendingPlanNodeId, selectedMarkerId: null }),

    selectMarker: (selectedMarkerId) =>
      set({ selectedMarkerId, pendingPlanNodeId: null }),

    setPlanPhoto: (photo) =>
      commitPlan((plan) => ({ ...plan, photo }), { selectedMarkerId: null }),

    updatePlanPhoto: (updates) =>
      commitPlan((plan) =>
        plan.photo ? { ...plan, photo: { ...plan.photo, ...updates } } : plan
      ),

    addPlanMarker: (marker) =>
      commitPlan((plan) => ({ ...plan, markers: [...plan.markers, marker] }), {
        pendingPlanNodeId: null,
        selectedMarkerId: marker.id,
      }),

    movePlanMarker: (id, position) =>
      commitPlan((plan) => ({
        ...plan,
        markers: plan.markers.map((m) => (m.id === id ? { ...m, position } : m)),
      })),

    removePlanMarker: (id) =>
      commitPlan(
        (plan) => ({ ...plan, markers: plan.markers.filter((m) => m.id !== id) }),
        { selectedMarkerId: null }
      ),

    newProject: () => {
      const fresh = buildDefaultDoc();
      persist(fresh);
      set({
        doc: fresh,
        selectedId: null,
        undoStack: [],
        redoStack: [],
        pendingPlanNodeId: null,
        selectedMarkerId: null,
      });
    },

    loadDoc: (doc) => {
      const normalized = normalizeDoc(doc);
      persist(normalized);
      set({
        doc: normalized,
        selectedId: null,
        undoStack: [],
        redoStack: [],
        pendingPlanNodeId: null,
        selectedMarkerId: null,
      });
    },

    undo: () => {
      const { undoStack, redoStack, doc } = get();
      const prev = undoStack[undoStack.length - 1];
      if (!prev) return;
      persist(prev);
      set({
        doc: prev,
        undoStack: undoStack.slice(0, -1),
        redoStack: [...redoStack, doc],
        selectedId: null,
        pendingPlanNodeId: null,
        selectedMarkerId: null,
      });
    },

    redo: () => {
      const { undoStack, redoStack, doc } = get();
      const next = redoStack[redoStack.length - 1];
      if (!next) return;
      persist(next);
      set({
        doc: next,
        undoStack: [...undoStack, doc],
        redoStack: redoStack.slice(0, -1),
        selectedId: null,
        pendingPlanNodeId: null,
        selectedMarkerId: null,
      });
    },
  };
});

export { isValidDoc };
