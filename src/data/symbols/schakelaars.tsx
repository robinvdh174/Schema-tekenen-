import { Circle, Group, Line, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import {
  FILL_BG,
  FONT_FAMILY,
  STROKE_WIDTH,
  STROKE_WIDTH_MAIN,
  STROKE_WIDTH_THIN,
  strokeFor,
} from './draw';

/**
 * Schakelaars in AREI eendraadschema: diagonale lijn tussen twee contactpunten.
 * Bounding box 40x40, ingang bovenaan (20,0), uitgang onderaan (20,40).
 */
const makeSchakelaarRender =
  (cijfer?: string) =>
  ({ state }: SymbolRenderProps) => {
    const s = strokeFor(state);
    return (
      <Group>
        <Line points={[20, 0, 20, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
        <Circle x={20} y={12} radius={2} fill={s} />
        {/* Diagonale schakelaarlijn */}
        <Line points={[20, 12, 32, 28]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
        <Circle x={20} y={30} radius={2} fill={s} />
        <Line points={[20, 30, 20, 40]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
        {cijfer ? (
          <Text
            x={4}
            y={14}
            text={cijfer}
            fontFamily={FONT_FAMILY}
            fontSize={10}
            fontStyle="600"
            fill={s}
          />
        ) : null}
      </Group>
    );
  };

/* Dubbelpolige: twee parallelle schuine lijnen */
const DubbelpoligRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <Group>
      <Line points={[14, 0, 14, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Line points={[26, 0, 26, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={14} y={12} radius={2} fill={s} />
      <Circle x={26} y={12} radius={2} fill={s} />
      <Line points={[14, 12, 26, 28]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Line points={[26, 12, 38, 28]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={14} y={30} radius={2} fill={s} />
      <Circle x={26} y={30} radius={2} fill={s} />
      <Line points={[14, 30, 14, 40]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Line points={[26, 30, 26, 40]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
    </Group>
  );
};

/* Dimmer: schakelaar met driehoek-symbool */
const DimmerRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <Group>
      <Line points={[20, 0, 20, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={12} radius={2} fill={s} />
      <Line points={[20, 12, 32, 28]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={30} radius={2} fill={s} />
      <Line points={[20, 30, 20, 40]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {/* Dimmer-pijl */}
      <Line points={[4, 26, 12, 14]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[4, 26, 9, 22]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[4, 26, 4, 20]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
    </Group>
  );
};

/* Bewegingsmelder: schakelaar met "M" */
const BewegingsmelderRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <Group>
      <Line points={[20, 0, 20, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={20} radius={10} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Text
        x={10}
        y={14}
        width={20}
        text="M"
        align="center"
        fontFamily={FONT_FAMILY}
        fontSize={12}
        fontStyle="700"
        fill={s}
      />
      <Line points={[20, 30, 20, 40]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
    </Group>
  );
};

/* Schemerschakelaar: zon-symbool */
const SchemerschakelaarRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <Group>
      <Line points={[20, 0, 20, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={12} radius={2} fill={s} />
      <Line points={[20, 12, 32, 28]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={30} radius={2} fill={s} />
      <Line points={[20, 30, 20, 40]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {/* Pijlen naar binnen (lichtsensor) */}
      <Line points={[10, 10, 14, 14]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[14, 14, 12, 12]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[10, 10, 12, 10]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[4, 14, 10, 14]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[4, 22, 10, 18]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
    </Group>
  );
};

/* Rolluikschakelaar: twee pijlen op/neer */
const RolluikschakelaarRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <Group>
      <Line points={[20, 0, 20, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={12} radius={2} fill={s} />
      <Line points={[20, 12, 32, 28]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={30} radius={2} fill={s} />
      <Line points={[20, 30, 20, 40]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {/* Pijl omhoog */}
      <Line points={[8, 12, 8, 20]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[8, 12, 5, 15]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[8, 12, 11, 15]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      {/* Pijl omlaag */}
      <Line points={[8, 22, 8, 30]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[8, 30, 5, 27]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[8, 30, 11, 27]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
    </Group>
  );
};

/* Drukknop: cirkel met centrale lijn */
const DrukknopRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <Group>
      <Line points={[20, 0, 20, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={20} radius={10} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Line points={[12, 20, 28, 20]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[20, 20, 20, 30]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Line points={[20, 30, 20, 40]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
    </Group>
  );
};

export const schakelaarSymbols: SymbolDefinition[] = [
  {
    type: 'schakelaar_enkel',
    category: 'schakelaars',
    name: 'Enkelpolige schakelaar',
    description: 'Gewone lichtschakelaar',
    width: 40,
    height: 40,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 40 },
    ],
    properties: {
      opbouw: { label: 'Opbouw', type: 'boolean', defaultValue: false },
    },
    Render: makeSchakelaarRender(),
  },
  {
    type: 'schakelaar_dubbel',
    category: 'schakelaars',
    name: 'Dubbelpolige schakelaar',
    description: 'Twee circuits schakelen',
    width: 40,
    height: 40,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 40 },
    ],
    properties: {},
    Render: DubbelpoligRender,
  },
  {
    type: 'schakelaar_wissel',
    category: 'schakelaars',
    name: 'Wisselschakelaar',
    description: 'Schakelaar in wisselschakeling',
    width: 40,
    height: 40,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 40 },
    ],
    properties: {},
    Render: makeSchakelaarRender('W'),
  },
  {
    type: 'schakelaar_kruis',
    category: 'schakelaars',
    name: 'Kruisschakelaar',
    description: 'Schakelaar in kruisschakeling',
    width: 40,
    height: 40,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 40 },
    ],
    properties: {},
    Render: makeSchakelaarRender('K'),
  },
  {
    type: 'dimmer',
    category: 'schakelaars',
    name: 'Dimmer',
    description: 'Lichtdimmer',
    width: 40,
    height: 40,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 40 },
    ],
    properties: {
      type: { label: 'Type', type: 'select', defaultValue: 'Draai', options: ['Druk', 'Draai', 'Touch'] },
    },
    Render: DimmerRender,
  },
  {
    type: 'bewegingsmelder',
    category: 'schakelaars',
    name: 'Bewegingsmelder',
    description: 'Automatische schakelaar',
    width: 40,
    height: 40,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 40 },
    ],
    properties: {
      buiten: { label: 'Buiten gebruik', type: 'boolean', defaultValue: false },
      bereik: { label: 'Bereik (m)', type: 'number', defaultValue: 8, unit: 'm' },
    },
    Render: BewegingsmelderRender,
  },
  {
    type: 'schemerschakelaar',
    category: 'schakelaars',
    name: 'Schemerschakelaar',
    description: 'Lichtgevoelige schakelaar',
    width: 40,
    height: 40,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 40 },
    ],
    properties: {},
    Render: SchemerschakelaarRender,
  },
  {
    type: 'rolluikschakelaar',
    category: 'schakelaars',
    name: 'Rolluikschakelaar',
    description: 'Op/neer schakelaar',
    width: 40,
    height: 40,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 40 },
    ],
    properties: {},
    Render: RolluikschakelaarRender,
  },
  {
    type: 'drukknop',
    category: 'schakelaars',
    name: 'Drukknop',
    description: 'Drukknop (bv. voor bel)',
    width: 40,
    height: 40,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 40 },
    ],
    properties: {},
    Render: DrukknopRender,
  },
];
