import { Arc, Circle, Group, Line, Rect, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import {
  FILL_BG,
  FONT_FAMILY,
  STROKE_WIDTH,
  STROKE_WIDTH_MAIN,
  STROKE_WIDTH_THIN,
  strokeFor,
} from './draw';

const AMPERAGE_OPTIONS = ['2A', '6A', '10A', '13A', '16A', '20A', '25A', '32A', '40A', '63A'];
const CURVE_OPTIONS = ['B', 'C', 'D'];
const POLIGHEID_OPTIONS = ['1P', '1P+N', '2P', '3P', '3P+N'];
const OVP_TYPE = ['Type 1', 'Type 2', 'Type 1+2'];

/* --- Automaat (disjoncteur) -------------------------------------------- */
const AutomaatRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const amp = String(properties.amperage?.value ?? '16A');
  const curve = String(properties.curve?.value ?? 'C');
  const poligheid = String(properties.poligheid?.value ?? '1P+N');
  return (
    <Group>
      <Line points={[20, 0, 20, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={12} radius={2} fill={s} />
      {/* Schakelcontact */}
      <Line points={[20, 12, 32, 32]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {/* Thermisch-magnetisch boogje (uitschakelsymbool) */}
      <Arc
        x={24}
        y={26}
        innerRadius={5}
        outerRadius={5}
        angle={180}
        rotation={-20}
        stroke={s}
        strokeWidth={STROKE_WIDTH_THIN}
      />
      <Circle x={20} y={34} radius={2} fill={s} />
      <Line points={[20, 34, 20, 60]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />

      <Text
        x={38}
        y={8}
        text={`${amp} ${curve}`}
        fontFamily={FONT_FAMILY}
        fontSize={11}
        fontStyle="600"
        fill={s}
      />
      <Text
        x={38}
        y={22}
        text={poligheid}
        fontFamily={FONT_FAMILY}
        fontSize={9}
        fill={s}
      />
    </Group>
  );
};

/* --- Smeltzekering ----------------------------------------------------- */
const SmeltzekeringRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const amp = String(properties.amperage?.value ?? '16A');
  return (
    <Group>
      <Line points={[20, 0, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Rect
        x={12}
        y={14}
        width={16}
        height={32}
        stroke={s}
        strokeWidth={STROKE_WIDTH}
        fill={FILL_BG}
      />
      {/* Smeltdraad */}
      <Line points={[20, 14, 20, 46]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[20, 46, 20, 60]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Text
        x={32}
        y={24}
        text={amp}
        fontFamily={FONT_FAMILY}
        fontSize={11}
        fontStyle="600"
        fill={s}
      />
    </Group>
  );
};

/* --- Overspanningsbeveiliging ------------------------------------------ */
const OverspanningsbeveiligingRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const type = String(properties.type?.value ?? 'Type 2');
  return (
    <Group>
      <Line points={[20, 0, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Rect
        x={6}
        y={14}
        width={28}
        height={30}
        stroke={s}
        strokeWidth={STROKE_WIDTH}
        fill={FILL_BG}
      />
      {/* Pijl symbolen naar beneden (spanningsafleider) */}
      <Line points={[14, 22, 14, 36]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[14, 36, 11, 32]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[14, 36, 17, 32]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[26, 22, 26, 36]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[26, 36, 23, 32]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[26, 36, 29, 32]} stroke={s} strokeWidth={STROKE_WIDTH} />
      {/* Aarding onderaan */}
      <Line points={[20, 44, 20, 54]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Line points={[12, 54, 28, 54]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Line points={[15, 57, 25, 57]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[18, 60, 22, 60]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Text
        x={38}
        y={24}
        text={type}
        fontFamily={FONT_FAMILY}
        fontSize={10}
        fontStyle="600"
        fill={s}
      />
    </Group>
  );
};

export const beveiligingSymbols: SymbolDefinition[] = [
  {
    type: 'automaat',
    category: 'beveiliging',
    name: 'Automaat',
    description: 'Automatische zekering (disjoncteur)',
    width: 40,
    height: 60,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 60 },
    ],
    properties: {
      amperage: { label: 'Amperage', type: 'select', defaultValue: '16A', options: AMPERAGE_OPTIONS },
      curve: { label: 'Curve', type: 'select', defaultValue: 'C', options: CURVE_OPTIONS },
      poligheid: { label: 'Poligheid', type: 'select', defaultValue: '1P+N', options: POLIGHEID_OPTIONS },
      kring: { label: 'Kring', type: 'string', defaultValue: '' },
    },
    Render: AutomaatRender,
  },
  {
    type: 'smeltzekering',
    category: 'beveiliging',
    name: 'Smeltzekering',
    description: 'Patroonzekering',
    width: 40,
    height: 60,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 60 },
    ],
    properties: {
      amperage: { label: 'Amperage', type: 'select', defaultValue: '16A', options: AMPERAGE_OPTIONS },
    },
    Render: SmeltzekeringRender,
  },
  {
    type: 'overspanningsbeveiliging',
    category: 'beveiliging',
    name: 'Overspanningsbeveiliging',
    description: 'Bliksembeveiliging',
    width: 40,
    height: 60,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      type: { label: 'Type', type: 'select', defaultValue: 'Type 2', options: OVP_TYPE },
    },
    Render: OverspanningsbeveiligingRender,
  },
];
