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

const IP_OPTIONS = ['IP20', 'IP21', 'IP44', 'IP54', 'IP55', 'IP65'];
const APPL_AMPS = ['13A', '16A', '20A', '32A'];

/* Base: halve cirkel stopcontact aan einde van kringlijn
   Bounding box 40x40. Aansluitpunt top center (x=20, y=0).
   Halve cirkel opent naar boven, met verticale lijn van top naar middelpunt. */
const HalveCirkel = ({
  s,
  centerY,
  radius = 14,
  earthDash = true,
}: {
  s: string;
  centerY: number;
  radius?: number;
  earthDash?: boolean;
}) => (
  <>
    <Line points={[20, 0, 20, centerY]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
    <Arc
      x={20}
      y={centerY}
      innerRadius={radius}
      outerRadius={radius}
      angle={180}
      rotation={180}
      stroke={s}
      strokeWidth={STROKE_WIDTH}
      fill={FILL_BG}
    />
    {/* basislijn diameter */}
    <Line
      points={[20 - radius, centerY, 20 + radius, centerY]}
      stroke={s}
      strokeWidth={STROKE_WIDTH}
    />
    {/* Aarding: korte verticale streep in de halve cirkel */}
    <Line
      points={[20, centerY - radius + 2, 20, centerY - 2]}
      stroke={s}
      strokeWidth={STROKE_WIDTH_THIN}
      dash={earthDash ? undefined : [2, 2]}
    />
  </>
);

const StopcontactEnkelRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const kinderveilig = Boolean(properties.kinderveilig?.value ?? true);
  return (
    <Group>
      <HalveCirkel s={s} centerY={20} />
      {kinderveilig ? (
        <Line points={[15, 16, 25, 16]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      ) : null}
    </Group>
  );
};

const StopcontactDubbelRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const kinderveilig = Boolean(properties.kinderveilig?.value ?? true);
  return (
    <Group>
      <HalveCirkel s={s} centerY={20} />
      {/* Tweede streep aan de bovenzijde = 2x contact */}
      <Line points={[20, 32, 20, 38]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Text
        x={0}
        y={34}
        width={40}
        text="2"
        align="center"
        fontFamily={FONT_FAMILY}
        fontSize={10}
        fontStyle="700"
        fill={s}
      />
      {kinderveilig ? (
        <Line points={[15, 16, 25, 16]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      ) : null}
    </Group>
  );
};

const StopcontactDrievoudigRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <Group>
      <HalveCirkel s={s} centerY={20} />
      <Text
        x={0}
        y={34}
        width={40}
        text="3"
        align="center"
        fontFamily={FONT_FAMILY}
        fontSize={10}
        fontStyle="700"
        fill={s}
      />
    </Group>
  );
};

const StopcontactSchakelaarRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <Group>
      <HalveCirkel s={s} centerY={20} />
      {/* Schakelaar-streepje boven */}
      <Circle x={20} y={4} radius={2} stroke={s} strokeWidth={STROKE_WIDTH_THIN} fill={FILL_BG} />
      <Line points={[20, 4, 28, 10]} stroke={s} strokeWidth={STROKE_WIDTH} />
    </Group>
  );
};

const StopcontactWaterdichtRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const ip = String(properties.ip?.value ?? 'IP44');
  return (
    <Group>
      <HalveCirkel s={s} centerY={22} />
      {/* Waterdicht: extra omkadering */}
      <Rect
        x={2}
        y={8}
        width={36}
        height={30}
        stroke={s}
        strokeWidth={STROKE_WIDTH_THIN}
        fill="transparent"
      />
      <Text
        x={0}
        y={40}
        width={40}
        text={ip}
        align="center"
        fontFamily={FONT_FAMILY}
        fontSize={9}
        fill={s}
      />
    </Group>
  );
};

/** Vast aangesloten toestel: vierkant met letter-label (K=kookplaat, D=droogkast, ...) */
const makeApplianceRender =
  (letter: string, labelFallback: string) =>
  ({ state, properties }: SymbolRenderProps) => {
    const s = strokeFor(state);
    const amp = String(properties.amperage?.value ?? labelFallback);
    return (
      <Group>
        <Line points={[20, 0, 20, 6]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
        <Rect
          x={4}
          y={6}
          width={32}
          height={28}
          stroke={s}
          strokeWidth={STROKE_WIDTH}
          fill={FILL_BG}
        />
        <Text
          x={4}
          y={10}
          width={32}
          text={letter}
          align="center"
          fontFamily={FONT_FAMILY}
          fontSize={14}
          fontStyle="700"
          fill={s}
        />
        <Text
          x={0}
          y={36}
          width={40}
          text={amp}
          align="center"
          fontFamily={FONT_FAMILY}
          fontSize={9}
          fill={s}
        />
      </Group>
    );
  };

export const stopcontactSymbols: SymbolDefinition[] = [
  {
    type: 'stopcontact_enkel',
    category: 'stopcontacten',
    name: 'Stopcontact enkel',
    description: 'Enkel stopcontact 2P+A',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      kinderveilig: { label: 'Kinderveilig', type: 'boolean', defaultValue: true },
      opbouw: { label: 'Opbouw', type: 'boolean', defaultValue: false },
    },
    Render: StopcontactEnkelRender,
  },
  {
    type: 'stopcontact_dubbel',
    category: 'stopcontacten',
    name: 'Stopcontact dubbel',
    description: 'Dubbel stopcontact 2P+A',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      kinderveilig: { label: 'Kinderveilig', type: 'boolean', defaultValue: true },
      opbouw: { label: 'Opbouw', type: 'boolean', defaultValue: false },
    },
    Render: StopcontactDubbelRender,
  },
  {
    type: 'stopcontact_drievoudig',
    category: 'stopcontacten',
    name: 'Stopcontact drievoudig',
    description: 'Drievoudig stopcontact',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      kinderveilig: { label: 'Kinderveilig', type: 'boolean', defaultValue: true },
    },
    Render: StopcontactDrievoudigRender,
  },
  {
    type: 'stopcontact_schakelaar',
    category: 'stopcontacten',
    name: 'Stopcontact met schakelaar',
    description: 'Geschakeld stopcontact',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {},
    Render: StopcontactSchakelaarRender,
  },
  {
    type: 'stopcontact_waterdicht',
    category: 'stopcontacten',
    name: 'Stopcontact waterdicht',
    description: 'IP44 of hoger',
    width: 40,
    height: 50,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      ip: { label: 'IP-waarde', type: 'select', defaultValue: 'IP44', options: IP_OPTIONS },
    },
    Render: StopcontactWaterdichtRender,
  },
  {
    type: 'aansluiting_kookfornuis',
    category: 'stopcontacten',
    name: 'Kookfornuis aansluiting',
    description: 'Vaste aansluiting kookplaat',
    width: 40,
    height: 46,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      amperage: { label: 'Amperage', type: 'select', defaultValue: '32A', options: APPL_AMPS },
    },
    Render: makeApplianceRender('K', '32A'),
  },
  {
    type: 'aansluiting_droogkast',
    category: 'stopcontacten',
    name: 'Droogkast aansluiting',
    description: 'Vaste aansluiting droogkast',
    width: 40,
    height: 46,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      amperage: { label: 'Amperage', type: 'select', defaultValue: '16A', options: APPL_AMPS },
    },
    Render: makeApplianceRender('D', '16A'),
  },
  {
    type: 'aansluiting_wasmachine',
    category: 'stopcontacten',
    name: 'Wasmachine aansluiting',
    description: 'Specifiek circuit wasmachine',
    width: 40,
    height: 46,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      amperage: { label: 'Amperage', type: 'select', defaultValue: '16A', options: APPL_AMPS },
    },
    Render: makeApplianceRender('W', '16A'),
  },
  {
    type: 'aansluiting_vaatwasser',
    category: 'stopcontacten',
    name: 'Vaatwasser aansluiting',
    description: 'Specifiek circuit vaatwasser',
    width: 40,
    height: 46,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      amperage: { label: 'Amperage', type: 'select', defaultValue: '16A', options: APPL_AMPS },
    },
    Render: makeApplianceRender('V', '16A'),
  },
];
