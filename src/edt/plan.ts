import { kindDef, nodeTitle } from './catalog';
import { computeKringNumbers } from './layout';
import type { SchemaNode } from './model';

/* =========================================================================
 * Foto-plan: een foto van de woning waarop de componenten uit het
 * eendraadschema worden aangeduid met genummerde markeringen.
 *
 * De nummering wordt volledig afgeleid uit de schemaboom en nergens
 * opgeslagen: kring 2, derde verbruiker → "2.3" (of "A3" bij een eigen
 * kringnummer "A"). Wijzigt het schema, dan veranderen alle labels op het
 * plan automatisch mee.
 * ========================================================================= */

export interface PlanPhoto {
  /** Foto als data-URL; blijft bewaard in het projectbestand. */
  dataUrl: string;
  width: number;
  height: number;
  opacity: number; // 0..1
}

export interface PlanMarker {
  id: string;
  /** Id van de gekoppelde node in de schemaboom. */
  nodeId: string;
  position: { x: number; y: number };
}

export interface PlanState {
  photo: PlanPhoto | null;
  markers: PlanMarker[];
}

export const emptyPlan = (): PlanState => ({ photo: null, markers: [] });

/* ------------------------------------------------------------- nummering */

export const VOEDING_GROUP = 'V';
export const UNASSIGNED_GROUP = '?';

const GROUP_COLORS = [
  '#ef4444',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
];
const VOEDING_COLOR = '#0ea5e9';
const UNASSIGNED_COLOR = '#64748b';

export const groupColor = (kring: string): string => {
  if (kring === VOEDING_GROUP) return VOEDING_COLOR;
  if (kring === UNASSIGNED_GROUP) return UNASSIGNED_COLOR;
  let hash = 0;
  for (let i = 0; i < kring.length; i++) hash = (hash * 31 + kring.charCodeAt(i)) | 0;
  return GROUP_COLORS[Math.abs(hash) % GROUP_COLORS.length];
};

/** "A" + 3 → "A3"; "2" + 3 → "2.3" (punt vermijdt verwarring met kring 23). */
const formatLabel = (kring: string, index: number): string =>
  /\d$/.test(kring) ? `${kring}.${index}` : `${kring}${index}`;

export interface PlanEntry {
  nodeId: string;
  kring: string;
  /** 1-gebaseerd volgnummer binnen de kring. */
  index: number;
  /** Bv. "2.3", "A3" of "V1". */
  label: string;
  color: string;
  title: string;
  /** Omschrijving/lokaal uit de props. */
  sub: string;
}

export interface PlanGroup {
  kring: string;
  title: string;
  color: string;
  entries: PlanEntry[];
}

export interface PlanNumbering {
  byId: Map<string, PlanEntry>;
  groups: PlanGroup[];
}

export const computePlanNumbering = (root: SchemaNode): PlanNumbering => {
  const kringNumbers = computeKringNumbers(root);
  const byId = new Map<string, PlanEntry>();
  const kringGroups = new Map<string, PlanGroup>();
  const kringOrder: string[] = [];
  const voeding: SchemaNode[] = [];
  const unassigned: SchemaNode[] = [];

  const subOf = (node: SchemaNode) =>
    String(node.props.label ?? node.props.lokaal ?? '').trim();

  const addToKring = (node: SchemaNode, kring: string) => {
    let group = kringGroups.get(kring);
    if (!group) {
      group = { kring, title: `Kring ${kring}`, color: groupColor(kring), entries: [] };
      kringGroups.set(kring, group);
      kringOrder.push(kring);
    }
    const index = group.entries.length + 1;
    const entry: PlanEntry = {
      nodeId: node.id,
      kring,
      index,
      label: formatLabel(kring, index),
      color: group.color,
      title: nodeTitle(node),
      sub: subOf(node),
    };
    group.entries.push(entry);
    byId.set(node.id, entry);
  };

  // Diepte-eerst door de boom; de kinderenvolgorde is ook de volgorde waarin
  // het schema de verbruikers doorlust, dus de nummering loopt mee.
  const visit = (node: SchemaNode, kring: string | null) => {
    const current = kringNumbers.get(node.id) ?? kring;
    const category = kindDef(node.kind).category;
    if (category === 'verbruiker') {
      if (current) addToKring(node, current);
      else unassigned.push(node);
    } else if (category === 'voeding' || category === 'bord') {
      voeding.push(node);
    }
    node.children.forEach((child) => visit(child, current));
  };
  visit(root, null);

  const groups: PlanGroup[] = kringOrder.map((kring) => kringGroups.get(kring)!);

  if (voeding.length > 0) {
    const group: PlanGroup = {
      kring: VOEDING_GROUP,
      title: 'Voeding & bord',
      color: VOEDING_COLOR,
      entries: [],
    };
    voeding.forEach((node, i) => {
      const entry: PlanEntry = {
        nodeId: node.id,
        kring: VOEDING_GROUP,
        index: i + 1,
        label: `${VOEDING_GROUP}${i + 1}`,
        color: VOEDING_COLOR,
        title: nodeTitle(node),
        sub: subOf(node),
      };
      group.entries.push(entry);
      byId.set(node.id, entry);
    });
    groups.push(group);
  }

  if (unassigned.length > 0) {
    const group: PlanGroup = {
      kring: UNASSIGNED_GROUP,
      title: 'Niet op een kring',
      color: UNASSIGNED_COLOR,
      entries: [],
    };
    unassigned.forEach((node) => {
      const entry: PlanEntry = {
        nodeId: node.id,
        kring: UNASSIGNED_GROUP,
        index: 0,
        label: UNASSIGNED_GROUP,
        color: UNASSIGNED_COLOR,
        title: nodeTitle(node),
        sub: subOf(node),
      };
      group.entries.push(entry);
      byId.set(node.id, entry);
    });
    groups.push(group);
  }

  return { byId, groups };
};
