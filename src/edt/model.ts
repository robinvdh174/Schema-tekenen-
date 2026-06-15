import { createId } from '@/utils/id';
import type { PlanState } from './plan';

/**
 * Het eendraadschema is een boom: voeding → teller → beveiligingen → bord →
 * kringen → verbruikers. Het schema wordt volledig automatisch getekend
 * vanuit deze boom (zoals Trikker dat doet) — er is geen vrije plaatsing.
 */

export type PropValue = string | number | boolean;

/**
 * Fijn-positionering van één tekstlabel ten opzichte van zijn standaardplaats.
 * `dx`/`dy` is een verschuiving in schema-eenheden (zelfde schaal als de
 * tekening). De standaardplaats blijft ongewijzigd zolang er geen offset is,
 * zodat oudere schema's er exact hetzelfde blijven uitzien.
 */
export interface LabelOffset {
  dx: number;
  dy: number;
}

export interface SchemaNode {
  id: string;
  kind: string;
  props: Record<string, PropValue>;
  children: SchemaNode[];
  /**
   * Optionele handmatige verschuivingen van tekstlabels, per label-sleutel
   * (bv. 'kringnr', 'omschrijving', 'kabel', 'waarden', 'adres'). Ontbreekt in
   * oudere bestanden; dan staan alle labels op hun standaardplaats.
   */
  labels?: Record<string, LabelOffset>;
}

export interface ProjectDoc {
  version: 1;
  name: string;
  installateur: string;
  updatedAt: number;
  tree: SchemaNode;
  /** Foto-plan van de woning met markeringen (ontbreekt in oudere bestanden). */
  plan?: PlanState;
}

export const createNode = (
  kind: string,
  props: Record<string, PropValue> = {},
  children: SchemaNode[] = []
): SchemaNode => ({ id: createId('n'), kind, props, children });

/* ---------------------------------------------------------------- helpers */

export const findNode = (root: SchemaNode, id: string): SchemaNode | null => {
  if (root.id === id) return root;
  for (const child of root.children) {
    const hit = findNode(child, id);
    if (hit) return hit;
  }
  return null;
};

export const findParent = (root: SchemaNode, id: string): SchemaNode | null => {
  for (const child of root.children) {
    if (child.id === id) return root;
    const hit = findParent(child, id);
    if (hit) return hit;
  }
  return null;
};

/** Immutable update: geeft een nieuwe boom terug waarin `id` vervangen is. */
export const mapNode = (
  root: SchemaNode,
  id: string,
  fn: (node: SchemaNode) => SchemaNode
): SchemaNode => {
  if (root.id === id) return fn(root);
  let changed = false;
  const children = root.children.map((child) => {
    const next = mapNode(child, id, fn);
    if (next !== child) changed = true;
    return next;
  });
  return changed ? { ...root, children } : root;
};

export const removeNode = (root: SchemaNode, id: string): SchemaNode => {
  const children = root.children
    .filter((child) => child.id !== id)
    .map((child) => removeNode(child, id));
  return { ...root, children };
};

/** Diepe kopie met nieuwe id's (voor dupliceren). */
export const cloneWithNewIds = (node: SchemaNode): SchemaNode => ({
  id: createId('n'),
  kind: node.kind,
  props: { ...node.props },
  children: node.children.map(cloneWithNewIds),
  ...(node.labels ? { labels: structuredCloneLabels(node.labels) } : {}),
});

const structuredCloneLabels = (labels: Record<string, LabelOffset>): Record<string, LabelOffset> => {
  const out: Record<string, LabelOffset> = {};
  for (const [key, val] of Object.entries(labels)) out[key] = { dx: val.dx, dy: val.dy };
  return out;
};

/** Geeft de huidige offset van een label terug (of {0,0} als die ontbreekt of
 *  ongeldig is, bv. een handmatig bewerkt bestand met niet-numerieke waarden). */
export const labelOffset = (node: SchemaNode, key: string): LabelOffset => {
  const raw = node.labels?.[key];
  if (!raw || !Number.isFinite(raw.dx) || !Number.isFinite(raw.dy)) return { dx: 0, dy: 0 };
  return { dx: raw.dx, dy: raw.dy };
};

/**
 * Immutable update van de offset van één tekstlabel. Een offset gelijk aan
 * {0,0} wordt verwijderd, zodat een teruggezet label geen ruis achterlaat in
 * het opgeslagen bestand.
 */
export const setNodeLabelOffset = (
  node: SchemaNode,
  key: string,
  offset: LabelOffset
): SchemaNode => {
  const labels: Record<string, LabelOffset> = { ...(node.labels ?? {}) };
  if (offset.dx === 0 && offset.dy === 0) {
    delete labels[key];
  } else {
    labels[key] = { dx: offset.dx, dy: offset.dy };
  }
  if (Object.keys(labels).length === 0) {
    if (!node.labels) return node;
    const { labels: _omit, ...rest } = node;
    return rest;
  }
  return { ...node, labels };
};

export const walk = (root: SchemaNode, fn: (node: SchemaNode, depth: number) => void) => {
  const visit = (node: SchemaNode, depth: number) => {
    fn(node, depth);
    node.children.forEach((child) => visit(child, depth + 1));
  };
  visit(root, 0);
};
