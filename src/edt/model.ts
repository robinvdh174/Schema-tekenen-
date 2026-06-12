import { createId } from '@/utils/id';
import type { PlanState } from './plan';

/**
 * Het eendraadschema is een boom: voeding → teller → beveiligingen → bord →
 * kringen → verbruikers. Het schema wordt volledig automatisch getekend
 * vanuit deze boom (zoals Trikker dat doet) — er is geen vrije plaatsing.
 */

export type PropValue = string | number | boolean;

export interface SchemaNode {
  id: string;
  kind: string;
  props: Record<string, PropValue>;
  children: SchemaNode[];
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
});

export const walk = (root: SchemaNode, fn: (node: SchemaNode, depth: number) => void) => {
  const visit = (node: SchemaNode, depth: number) => {
    fn(node, depth);
    node.children.forEach((child) => visit(child, depth + 1));
  };
  visit(root, 0);
};
