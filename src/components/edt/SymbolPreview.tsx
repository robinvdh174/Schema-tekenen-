import { memo, useMemo } from 'react';
import { Group, Layer, Line, Stage } from 'react-konva';
import { defaultProps } from '@/edt/catalog';
import { type PlacedNode } from '@/edt/layout';
import { createNode, type PropValue, type SchemaNode } from '@/edt/model';
import { glyphFor } from './NodeGlyph';
import {
  BLANK_KEYS,
  buildPlanSymbol,
  previewBox,
  previewOrient,
  type SymbolBox as Box,
} from './symbolRender';

/**
 * Mini-voorbeeld van een symbool: rendert exact dezelfde tekening als op het
 * schema (via glyphFor), passend geschaald in een klein wit vlak. Twee modi:
 *  - `kind` (+overrides): een palettegel — tekstvelden worden leeggemaakt zodat
 *    enkel het zuivere AREI-symbool te zien is;
 *  - `node`: het echte symbool van een bestaande schema-node (situatieplan-lijst).
 */

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

interface SymbolPreviewProps {
  /** Palettegel: toon het symbool voor dit type (met optionele overrides). */
  kind?: string;
  overrides?: Record<string, PropValue>;
  /** Of: toon het symbool van een bestaande schema-node. */
  node?: SchemaNode;
  width?: number;
  height?: number;
}

export const SymbolPreview = memo(
  ({ kind, overrides, node, width = 112, height = 54 }: SymbolPreviewProps) => {
    const { element, box } = useMemo((): { element: JSX.Element; box: Box } => {
      if (node) return buildPlanSymbol(node);
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
      const built = createNode(kind!, previewProps(kind!, overrides));
      const orient = previewOrient(kind!);
      const placed: PlacedNode = {
        node: built,
        parent: null,
        orient,
        x: 0,
        y: 0,
        box: { x: 0, y: 0, w: 0, h: 0 },
        kringnr: null,
      };
      return { element: glyphFor(placed), box: previewBox(built, orient) };
    }, [kind, overrides, node]);

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
