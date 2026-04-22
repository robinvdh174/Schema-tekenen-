import { Arrow, Circle, Group, Line, Rect, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import {
  FILL_BG,
  FONT_FAMILY,
  STROKE_WIDTH,
  STROKE_WIDTH_MAIN,
  STROKE_WIDTH_THIN,
  strokeFor,
} from './draw';

const VOLTAGE_OPTIONS = ['230V', '400V'];
const AMPERAGE_OPTIONS = ['25A', '40A', '63A', '80A', '100A'];
const DIFF_SENSITIVITY = ['30mA', '100mA', '300mA', '500mA'];
const DIFF_TYPE = ['A', 'AC', 'B'];
const METER_TARIEF = ['Enkelvoudig', 'Dag/Nacht', 'Exclusief nacht'];

/* --- Aansluitpunt net --------------------------------------------------- */
const AansluitpuntRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const voltage = String(properties.voltage?.value ?? '230V');
  return (
    <Group>
      {/* Inkomende pijl */}
      <Arrow
        points={[20, 0, 20, 30]}
        stroke={s}
        fill={s}
        strokeWidth={STROKE_WIDTH_MAIN}
        pointerLength={8}
        pointerWidth={10}
      />
      <Line points={[5, 30, 35, 30]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Line points={[20, 30, 20, 40]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Text
        x={-10}
        y={4}
        width={60}
        text={voltage}
        fontFamily={FONT_FAMILY}
        fontSize={11}
        fontStyle="600"
        align="center"
        fill={s}
      />
    </Group>
  );
};

/* --- Hoofdschakelaar ---------------------------------------------------- */
const HoofdschakelaarRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const amp = String(properties.amperage?.value ?? '40A');
  return (
    <Group>
      <Line points={[20, 0, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Line points={[20, 46, 20, 60]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={16} radius={2} fill={s} />
      {/* Open schakelaarcontact */}
      <Line points={[20, 16, 34, 42]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={44} radius={2} fill={s} />
      <Text
        x={42}
        y={22}
        text={amp}
        fontFamily={FONT_FAMILY}
        fontSize={11}
        fontStyle="600"
        fill={s}
      />
    </Group>
  );
};

/* --- kWh-meter ---------------------------------------------------------- */
const KwhMeterRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const tarief = String(properties.tarief?.value ?? 'Enkelvoudig');
  return (
    <Group>
      <Line points={[30, 0, 30, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Rect
        x={5}
        y={10}
        width={50}
        height={40}
        stroke={s}
        strokeWidth={STROKE_WIDTH}
        fill={FILL_BG}
        cornerRadius={2}
      />
      <Text
        x={5}
        y={20}
        width={50}
        text="kWh"
        fontFamily={FONT_FAMILY}
        fontSize={12}
        fontStyle="700"
        align="center"
        fill={s}
      />
      <Text
        x={5}
        y={34}
        width={50}
        text={tarief === 'Dag/Nacht' ? '2T' : tarief === 'Exclusief nacht' ? 'EN' : '1T'}
        fontFamily={FONT_FAMILY}
        fontSize={9}
        align="center"
        fill={s}
      />
      <Line points={[30, 50, 30, 60]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
    </Group>
  );
};

/* --- Differentieel (generiek) ------------------------------------------- */
const makeDifferentieelRender = (defaultSensitivity: string) => {
  const Render = ({ state, properties }: SymbolRenderProps) => {
    const s = strokeFor(state);
    const amp = String(properties.amperage?.value ?? '40A');
    const sens = String(properties.sensitivity?.value ?? defaultSensitivity);
    const type = String(properties.type?.value ?? 'A');
    return (
      <Group>
        <Line points={[20, 0, 20, 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
        <Rect
          x={2}
          y={10}
          width={36}
          height={50}
          stroke={s}
          strokeWidth={STROKE_WIDTH}
          fill={FILL_BG}
          cornerRadius={2}
        />
        {/* Gestippelde omkaderingslijn toont differentieeldetectie */}
        <Rect
          x={7}
          y={15}
          width={26}
          height={40}
          stroke={s}
          strokeWidth={STROKE_WIDTH_THIN}
          dash={[3, 3]}
          fill="transparent"
        />
        {/* Testknop (T) rechts */}
        <Circle x={32} y={20} radius={3} stroke={s} strokeWidth={1} fill={FILL_BG} />
        <Text x={28} y={16.5} text="T" fontSize={7} fontFamily={FONT_FAMILY} fill={s} />
        {/* Schakelcontact diagonaal */}
        <Line points={[20, 22, 28, 40]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
        <Circle x={20} y={22} radius={2} fill={s} />
        <Circle x={20} y={42} radius={2} fill={s} />
        <Line points={[20, 60, 20, 70]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />

        <Text
          x={42}
          y={18}
          text={amp}
          fontFamily={FONT_FAMILY}
          fontSize={11}
          fontStyle="600"
          fill={s}
        />
        <Text
          x={42}
          y={32}
          text={sens}
          fontFamily={FONT_FAMILY}
          fontSize={10}
          fill={s}
        />
        <Text
          x={42}
          y={46}
          text={`Type ${type}`}
          fontFamily={FONT_FAMILY}
          fontSize={9}
          fill={s}
        />
      </Group>
    );
  };
  return Render;
};

/* --- Definitions -------------------------------------------------------- */
const aansluitpuntProps = {
  voltage: { label: 'Spanning', type: 'select' as const, defaultValue: '230V', options: VOLTAGE_OPTIONS },
};

const hoofdschakelaarProps = {
  amperage: { label: 'Amperage', type: 'select' as const, defaultValue: '40A', options: AMPERAGE_OPTIONS },
};

const kwhProps = {
  tarief: { label: 'Tarief', type: 'select' as const, defaultValue: 'Enkelvoudig', options: METER_TARIEF },
};

const diffProps300 = {
  amperage: { label: 'Amperage', type: 'select' as const, defaultValue: '40A', options: AMPERAGE_OPTIONS },
  sensitivity: { label: 'Gevoeligheid', type: 'select' as const, defaultValue: '300mA', options: DIFF_SENSITIVITY },
  type: { label: 'Type', type: 'select' as const, defaultValue: 'A', options: DIFF_TYPE },
};

const diffProps30 = {
  amperage: { label: 'Amperage', type: 'select' as const, defaultValue: '40A', options: AMPERAGE_OPTIONS },
  sensitivity: { label: 'Gevoeligheid', type: 'select' as const, defaultValue: '30mA', options: DIFF_SENSITIVITY },
  type: { label: 'Type', type: 'select' as const, defaultValue: 'A', options: DIFF_TYPE },
};

export const voedingSymbols: SymbolDefinition[] = [
  {
    type: 'aansluitpunt_net',
    category: 'voeding',
    name: 'Aansluitpunt net',
    description: 'Netaansluiting (230V/400V)',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'out', position: 'bottom', x: 20, y: 40 }],
    properties: aansluitpuntProps,
    Render: AansluitpuntRender,
  },
  {
    type: 'hoofdschakelaar',
    category: 'voeding',
    name: 'Hoofdschakelaar',
    description: 'Hoofdschakelaar installatie',
    width: 40,
    height: 60,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 60 },
    ],
    properties: hoofdschakelaarProps,
    Render: HoofdschakelaarRender,
  },
  {
    type: 'kwh_meter',
    category: 'voeding',
    name: 'kWh-meter',
    description: 'Elektriciteitsmeter',
    width: 60,
    height: 60,
    connectionPoints: [
      { id: 'in', position: 'top', x: 30, y: 0 },
      { id: 'out', position: 'bottom', x: 30, y: 60 },
    ],
    properties: kwhProps,
    Render: KwhMeterRender,
  },
  {
    type: 'differentieel_300ma',
    category: 'voeding',
    name: 'Differentieel 300mA',
    description: 'Hoofddifferentieel',
    width: 40,
    height: 70,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 70 },
    ],
    properties: diffProps300,
    Render: makeDifferentieelRender('300mA'),
  },
  {
    type: 'differentieel_30ma',
    category: 'voeding',
    name: 'Differentieel 30mA',
    description: 'Aanvullend differentieel',
    width: 40,
    height: 70,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 70 },
    ],
    properties: diffProps30,
    Render: makeDifferentieelRender('30mA'),
  },
];
