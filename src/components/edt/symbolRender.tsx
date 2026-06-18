import { Line, Rect } from 'react-konva';
import {
  hMetrics,
  verticalBlockHeight,
  VERTICAL_KINDS,
  type PlacedNode,
} from '@/edt/layout';
import type { SchemaNode } from '@/edt/model';
import { glyphFor, INK } from './NodeGlyph';

/**
 * Gedeelde hulpmiddelen om één AREI-symbool los te tekenen — zowel voor het
 * symbolenpalet (SymbolPreview) als voor het situatieplan (PlanSymbol). Zo
 * ziet een symbool er overal identiek uit en is er één bron van waarheid voor
 * de begrenzing (bounding box) en de oriëntatie.
 */

export interface SymbolBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Props die op een 'schoon' symbool (palet/plan) geen tekst mogen tonen. */
export const BLANK_KEYS = [
  'label',
  'kabel',
  'kringnr',
  'net',
  'vermogen',
  'polen',
  'ampere',
  'curve',
  'difftype',
  'gevoeligheid',
];

/** Relais en SPD tonen hun herkenbare symbool in horizontale vorm. */
export const previewOrient = (kind: string): 'v' | 'h' =>
  kind !== 'relais' && kind !== 'overspanning' && VERTICAL_KINDS.has(kind) ? 'v' : 'h';

/** Zichtbare begrenzing van een los symbool (in tekencoördinaten). */
export const previewBox = (node: SchemaNode, orient: 'v' | 'h'): SymbolBox => {
  if (orient === 'v') {
    const h = verticalBlockHeight(node);
    // Iets ruimte onder y=0 voor bv. de pijl van de netaansluiting.
    return { x: -28, y: -h - 2, w: 56, h: h + 14 };
  }
  const m = hMetrics(node);
  // Zonder labels is de ruimte onder/boven de lijn kleiner dan de layoutmaat.
  const up = node.kind === 'overspanning' ? m.up : Math.min(m.up, 24);
  const down =
    node.kind === 'overspanning' ? m.down : node.kind === 'toestel' ? 22 : Math.min(m.down, 24);
  return { x: -2, y: -up - 2, w: m.adv + 4, h: up + down + 4 };
};

/** Kopie van een node met de tekstvelden leeggemaakt (functionele props blijven). */
const cleanedNode = (node: SchemaNode): SchemaNode => {
  const props = { ...node.props };
  for (const key of BLANK_KEYS) if (key in props) props[key] = '';
  if (node.kind === 'teller') props.type = '';
  return { ...node, props };
};

/** Eenvoudig kastsymbool voor een verdeelbord op het situatieplan. */
const BORD_W = 46;
const BORD_H = 30;
const bordSymbol = (): { element: JSX.Element; box: SymbolBox } => ({
  element: (
    <>
      <Rect x={0} y={0} width={BORD_W} height={BORD_H} stroke={INK} strokeWidth={1.4} cornerRadius={2} />
      <Line points={[10, 7, 10, BORD_H - 7]} stroke={INK} strokeWidth={1.2} />
      <Line points={[18, 7, 18, BORD_H - 7]} stroke={INK} strokeWidth={1.2} />
      <Line points={[26, 7, 26, BORD_H - 7]} stroke={INK} strokeWidth={1.2} />
      <Line points={[34, 7, 34, BORD_H - 7]} stroke={INK} strokeWidth={1.2} />
    </>
  ),
  box: { x: -2, y: -2, w: BORD_W + 4, h: BORD_H + 4 },
});

/**
 * Bouwt het tekenbare symbool voor een bestaande schema-node, klaar om los op
 * het situatieplan geplaatst te worden. De tekstlabels (kabel, kringnr …)
 * worden weggelaten zodat enkel het zuivere AREI-symbool overblijft.
 */
export const buildPlanSymbol = (
  node: SchemaNode
): { element: JSX.Element; box: SymbolBox } => {
  if (node.kind === 'bord') return bordSymbol();
  const clean = cleanedNode(node);
  const orient = previewOrient(node.kind);
  const placed: PlacedNode = {
    node: clean,
    parent: null,
    orient,
    x: 0,
    y: 0,
    box: { x: 0, y: 0, w: 0, h: 0 },
    kringnr: null,
  };
  return { element: glyphFor(placed), box: previewBox(clean, orient) };
};
