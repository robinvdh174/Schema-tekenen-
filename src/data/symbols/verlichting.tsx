import { Circle, Group, Line, Rect, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import {
  FILL_BG,
  FONT_FAMILY,
  STROKE_WIDTH,
  STROKE_WIDTH_MAIN,
  strokeFor,
} from './draw';

/** Lichtpunt plafond: cirkel met kruis door het midden (officieel AREI symbool). */
const LichtpuntPlafondRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const wattage = String(properties.wattage?.value ?? '');
  return (
    <Group>
      <Line points={[20, 0, 20, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={22} radius={10} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Line points={[13, 15, 27, 29]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[13, 29, 27, 15]} stroke={s} strokeWidth={STROKE_WIDTH} />
      {wattage ? (
        <Text
          x={0}
          y={34}
          width={40}
          text={`${wattage}W`}
          align="center"
          fontFamily={FONT_FAMILY}
          fontSize={9}
          fill={s}
        />
      ) : null}
    </Group>
  );
};

/** Lichtpunt wand: halve cirkel tegen een streep (muur). */
const LichtpuntWandRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const wattage = String(properties.wattage?.value ?? '');
  return (
    <Group>
      <Line points={[20, 0, 20, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={22} radius={10} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Line points={[13, 15, 27, 29]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[13, 29, 27, 15]} stroke={s} strokeWidth={STROKE_WIDTH} />
      {/* Muurstreep */}
      <Line points={[2, 32, 38, 32]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {wattage ? (
        <Text x={0} y={34} width={40} text={`${wattage}W`} align="center" fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
      ) : null}
    </Group>
  );
};

/** Spot / inbouwspot: cirkel met gevuld centrum. */
const SpotRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const aantal = Number(properties.aantal?.value ?? 1);
  return (
    <Group>
      <Line points={[20, 0, 20, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={22} radius={10} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Circle x={20} y={22} radius={4} fill={s} />
      {aantal > 1 ? (
        <Text
          x={0}
          y={34}
          width={40}
          text={`${aantal}x`}
          align="center"
          fontFamily={FONT_FAMILY}
          fontSize={9}
          fontStyle="600"
          fill={s}
        />
      ) : null}
    </Group>
  );
};

/** TL / fluorescent: lange rechthoek met dwarsstrepen. */
const TLRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const lengte = String(properties.lengte?.value ?? '120cm');
  return (
    <Group>
      <Line points={[40, 0, 40, 8]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Rect x={4} y={8} width={72} height={10} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Line points={[4, 13, 76, 13]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[12, 4, 12, 22]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[68, 4, 68, 22]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Text x={0} y={22} width={80} text={lengte} align="center" fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
    </Group>
  );
};

/** LED-strip: zigzag / stippellijn. */
const LedStripRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const lengte = String(properties.lengte?.value ?? '3');
  return (
    <Group>
      <Line points={[20, 0, 20, 8]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Rect x={2} y={10} width={76} height={10} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      {/* LED-puntjes */}
      {[8, 18, 28, 38, 48, 58, 68].map((x, i) => (
        <Circle key={i} x={x + 2} y={15} radius={1.5} fill={s} />
      ))}
      <Text x={0} y={22} width={80} text={`${lengte}m`} align="center" fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
    </Group>
  );
};

/** Noodverlichting: lichtpunt met "N" erbij. */
const NoodverlichtingRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <Group>
      <Line points={[20, 0, 20, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={22} radius={10} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Line points={[13, 15, 27, 29]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[13, 29, 27, 15]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Rect x={28} y={28} width={10} height={10} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Text x={28} y={29} width={10} text="N" align="center" fontFamily={FONT_FAMILY} fontSize={8} fontStyle="700" fill={s} />
    </Group>
  );
};

/** Buitenverlichting: lichtpunt met omkadering (weerbestendig). */
const BuitenverlichtingRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const ip = String(properties.ip?.value ?? 'IP44');
  return (
    <Group>
      <Line points={[20, 0, 20, 8]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Rect x={4} y={8} width={32} height={28} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Circle x={20} y={22} radius={8} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[14, 16, 26, 28]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[14, 28, 26, 16]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Text x={0} y={38} width={40} text={ip} align="center" fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
    </Group>
  );
};

export const verlichtingSymbols: SymbolDefinition[] = [
  {
    type: 'lichtpunt_plafond',
    category: 'verlichting',
    name: 'Lichtpunt plafond',
    description: 'Plafondverlichting',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      wattage: { label: 'Wattage', type: 'number', defaultValue: 60, unit: 'W' },
    },
    Render: LichtpuntPlafondRender,
  },
  {
    type: 'lichtpunt_wand',
    category: 'verlichting',
    name: 'Lichtpunt wand',
    description: 'Wandverlichting',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      wattage: { label: 'Wattage', type: 'number', defaultValue: 40, unit: 'W' },
    },
    Render: LichtpuntWandRender,
  },
  {
    type: 'spot',
    category: 'verlichting',
    name: 'Spot / inbouwspot',
    description: 'Ingebouwde spot',
    width: 40,
    height: 44,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      wattage: { label: 'Wattage per spot', type: 'number', defaultValue: 7, unit: 'W' },
      aantal: { label: 'Aantal', type: 'number', defaultValue: 1 },
    },
    Render: SpotRender,
  },
  {
    type: 'tl_verlichting',
    category: 'verlichting',
    name: 'TL-verlichting',
    description: 'Fluorescent lamp',
    width: 80,
    height: 34,
    connectionPoints: [{ id: 'in', position: 'top', x: 40, y: 0 }],
    properties: {
      wattage: { label: 'Wattage', type: 'number', defaultValue: 36, unit: 'W' },
      lengte: { label: 'Lengte', type: 'select', defaultValue: '120cm', options: ['60cm', '90cm', '120cm', '150cm'] },
    },
    Render: TLRender,
  },
  {
    type: 'led_strip',
    category: 'verlichting',
    name: 'LED-strip',
    description: 'LED-stripverlichting',
    width: 80,
    height: 34,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      wattage_per_meter: { label: 'W / meter', type: 'number', defaultValue: 10, unit: 'W/m' },
      lengte: { label: 'Lengte', type: 'number', defaultValue: 3, unit: 'm' },
    },
    Render: LedStripRender,
  },
  {
    type: 'noodverlichting',
    category: 'verlichting',
    name: 'Noodverlichting',
    description: 'Noodverlichtingsarmatuur',
    width: 42,
    height: 42,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {},
    Render: NoodverlichtingRender,
  },
  {
    type: 'buitenverlichting',
    category: 'verlichting',
    name: 'Buitenverlichting',
    description: 'Buitenlamp',
    width: 40,
    height: 50,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      wattage: { label: 'Wattage', type: 'number', defaultValue: 40, unit: 'W' },
      ip: { label: 'IP-waarde', type: 'select', defaultValue: 'IP44', options: ['IP44', 'IP54', 'IP55', 'IP65'] },
    },
    Render: BuitenverlichtingRender,
  },
];
