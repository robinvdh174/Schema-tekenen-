import { memo, useMemo } from 'react';
import { Group, Layer, Line, Stage } from 'react-konva';
import { defaultProps } from '@/edt/catalog';
import { hMetrics, verticalBlockHeight, VERTICAL_KINDS, type PlacedNode } from '@/edt/layout';
import { createNode, type PropValue } from '@/edt/model';
import { glyphFor } from './NodeGlyph';

/**
 * Mini-voorbeeld van een symbool voor in het palet: rendert exact dezelfde
 * tekening als op het schema (via glyphFor), passend geschaald in een klein
 * wit vlak. Tekstvelden (kabel, label, ampère …) worden leeggemaakt zodat
 * enkel het zuivere AREI-symbool te zien is.
 */

/** Props die in een voorbeeld geen tekst mogen tonen. */
const BLANK_KEYS = [
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

const previewProps = (
  kind: string,
  overrides?: Record<string, PropValue>
): Record<string, PropValue> => {
  const props = { ...defaultProps(kind) };
  for (const key of BLANK_KEYS) if (key in props) props[key] = '';
  // De teller toont het type als tekst naast het symbool — niet nodig hier.
  if (kind === 'teller') props.type = '';
  return { ...props, ...overrides };
};

/** Relais en SPD tonen hun herkenbare symbool in horizontale vorm. */
const previewOrient = (kind: string): 'v' | 'h' =>
  kind !== 'relais' && kind !== 'overspanning' && VERTICAL_KINDS.has(kind) ? 'v' : 'h';

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Zichtbare begrenzing van het voorbeeldsymbool (in tekencoördinaten). */
const previewBox = (node: PlacedNode['node'], orient: 'v' | 'h'): Box => {
  if (orient === 'v') {
    const h = verticalBlockHeight(node);
    // Iets ruimte onder y=0 voor bv. de pijl van de netaansluiting.
    return { x: -28, y: -h - 2, w: 56, h: h + 14 };
  }
  const m = hMetrics(node);
  // Zonder labels is de ruimte onder/boven de lijn kleiner dan de layoutmaat.
  // De SPD tekent onderaan het aardingssymbool — die ruimte behouden; bij een
  // toestel valt de type-ondertitel (y ≥ 24) zo net buiten beeld, want het
  // tegel-label vermeldt het type al.
  const up = node.kind === 'overspanning' ? m.up : Math.min(m.up, 24);
  const down =
    node.kind === 'overspanning' ? m.down : node.kind === 'toestel' ? 22 : Math.min(m.down, 24);
  return { x: -2, y: -up - 2, w: m.adv + 4, h: up + down + 4 };
};

interface SymbolPreviewProps {
  kind: string;
  overrides?: Record<string, PropValue>;
  width?: number;
  height?: number;
}

export const SymbolPreview = memo(
  ({ kind, overrides, width = 112, height = 54 }: SymbolPreviewProps) => {
    const { element, box } = useMemo((): { element: JSX.Element; box: Box } => {
      // Het verdeelbord wordt op het schema door de layout getekend (dikke
      // lijn); voor het voorbeeld tekenen we die hier zelf.
      if (kind === 'bord') {
        return {
          element: (
            <>
              <Line points={[0, 12, 0, 0]} stroke="#111827" strokeWidth={1.3} />
              <Line points={[-30, 0, 50, 0]} stroke="#111827" strokeWidth={3} />
            </>
          ),
          box: { x: -34, y: -10, w: 88, h: 26 },
        };
      }
      const node = createNode(kind, previewProps(kind, overrides));
      const orient = previewOrient(kind);
      const placed: PlacedNode = {
        node,
        parent: null,
        orient,
        x: 0,
        y: 0,
        box: { x: 0, y: 0, w: 0, h: 0 },
        kringnr: null,
      };
      return { element: glyphFor(placed), box: previewBox(node, orient) };
    }, [kind, overrides]);

    const pad = 4;
    const scale = Math.min((width - pad * 2) / box.w, (height - pad * 2) / box.h, 1.3);
    const x = (width - box.w * scale) / 2 - box.x * scale;
    const y = (height - box.h * scale) / 2 - box.y * scale;

    return (
      <div className="pointer-events-none" style={{ width, height }}>
        <Stage width={width} height={height} listening={false}>
          <Layer listening={false}>
            <Group
              x={x}
              y={y}
              scaleX={scale}
              scaleY={scale}
              clipX={box.x}
              clipY={box.y}
              clipWidth={box.w}
              clipHeight={box.h}
            >
              {element}
            </Group>
          </Layer>
        </Stage>
      </div>
    );
  }
);
SymbolPreview.displayName = 'SymbolPreview';
