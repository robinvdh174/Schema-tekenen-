import { Circle, Group, Line, Rect, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import {
  FILL_BG,
  FONT_FAMILY,
  STROKE_WIDTH,
  STROKE_WIDTH_MAIN,
  STROKE_WIDTH_THIN,
  strokeFor,
} from './draw';

/* Utility: symbool binnen vierkante 40x40 met top connection point */
const WithLead: React.FC<{ s: string; children: React.ReactNode; leadLen?: number }> = ({
  s,
  children,
  leadLen = 8,
}) => (
  <Group>
    <Line points={[20, 0, 20, leadLen]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
    {children}
  </Group>
);

/* --- Bel --- */
const BelRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <WithLead s={s}>
      <Circle x={20} y={22} radius={10} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Line points={[10, 22, 30, 22]} stroke={s} strokeWidth={STROKE_WIDTH} />
      {/* Klepel */}
      <Line points={[20, 22, 20, 32]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
    </WithLead>
  );
};

/* --- Parlofoon --- */
const ParlofoonRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const video = Boolean(properties.video?.value ?? false);
  return (
    <WithLead s={s}>
      <Rect x={6} y={8} width={28} height={28} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      {/* Handset */}
      <Line points={[12, 16, 18, 22]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[28, 16, 22, 22]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[18, 22, 22, 22]} stroke={s} strokeWidth={STROKE_WIDTH} />
      {video ? (
        <Text x={6} y={27} width={28} text="VIDEO" align="center" fontFamily={FONT_FAMILY} fontSize={7} fill={s} />
      ) : null}
    </WithLead>
  );
};

/* --- Rookmelder --- */
const RookmelderRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const type = String(properties.type?.value ?? 'Optisch');
  return (
    <WithLead s={s}>
      <Circle x={20} y={22} radius={10} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Text
        x={10}
        y={16}
        width={20}
        text={type === 'Thermisch' ? 'T' : 'S'}
        align="center"
        fontFamily={FONT_FAMILY}
        fontSize={13}
        fontStyle="700"
        fill={s}
      />
    </WithLead>
  );
};

/* --- CO-melder --- */
const CoMelderRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <WithLead s={s}>
      <Circle x={20} y={22} radius={10} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Text x={10} y={16} width={20} text="CO" align="center" fontFamily={FONT_FAMILY} fontSize={10} fontStyle="700" fill={s} />
    </WithLead>
  );
};

/* --- Thermostaat --- */
const ThermostaatRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <WithLead s={s}>
      <Rect x={6} y={8} width={28} height={22} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Text x={6} y={12} width={28} text="T" align="center" fontFamily={FONT_FAMILY} fontSize={13} fontStyle="700" fill={s} />
      <Text x={6} y={26} width={28} text="°C" align="center" fontFamily={FONT_FAMILY} fontSize={8} fill={s} />
    </WithLead>
  );
};

/* --- Boiler --- */
const BoilerRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const vermogen = String(properties.vermogen?.value ?? 2000);
  return (
    <WithLead s={s}>
      <Rect x={4} y={8} width={32} height={28} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} cornerRadius={4} />
      {/* Verwarmingselement (zigzag) */}
      <Line points={[10, 22, 14, 18, 18, 26, 22, 18, 26, 26, 30, 22]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Text x={0} y={38} width={40} text={`${vermogen}W`} align="center" fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
    </WithLead>
  );
};

/* --- Elektrische verwarming --- */
const VerwarmingRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const wattage = String(properties.wattage?.value ?? 1500);
  return (
    <WithLead s={s}>
      <Rect x={4} y={8} width={32} height={24} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      {/* Horizontale lamellen */}
      <Line points={[6, 14, 34, 14]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[6, 20, 34, 20]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[6, 26, 34, 26]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Text x={0} y={34} width={40} text={`${wattage}W`} align="center" fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
    </WithLead>
  );
};

/* --- Ventilator --- */
const VentilatorRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <WithLead s={s}>
      <Circle x={20} y={22} radius={10} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      {/* Drie bladen */}
      <Line points={[20, 22, 20, 12]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[20, 22, 28, 27]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[20, 22, 12, 27]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Circle x={20} y={22} radius={2} fill={s} />
    </WithLead>
  );
};

/* --- Aarding --- */
const AardingRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <Group>
      <Line points={[20, 0, 20, 16]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Line points={[6, 16, 34, 16]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Line points={[10, 22, 30, 22]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[14, 28, 26, 28]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[17, 34, 23, 34]} stroke={s} strokeWidth={STROKE_WIDTH} />
    </Group>
  );
};

/* --- Equipotentiale verbinding --- */
const EquipotentiaalRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <Group>
      <Line points={[20, 0, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={20} radius={6} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Line points={[20, 14, 20, 26]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[14, 20, 26, 20]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Text x={0} y={28} width={40} text="EQP" align="center" fontFamily={FONT_FAMILY} fontSize={9} fontStyle="700" fill={s} />
    </Group>
  );
};

/* --- Data / RJ45 --- */
const DataRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const cat = String(properties.categorie?.value ?? 'Cat 6');
  return (
    <WithLead s={s}>
      <Rect x={6} y={8} width={28} height={22} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Text x={6} y={10} width={28} text="RJ45" align="center" fontFamily={FONT_FAMILY} fontSize={9} fontStyle="700" fill={s} />
      <Text x={6} y={22} width={28} text={cat} align="center" fontFamily={FONT_FAMILY} fontSize={8} fill={s} />
    </WithLead>
  );
};

/* --- TV / coax --- */
const TvRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <WithLead s={s}>
      <Rect x={6} y={8} width={28} height={22} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Text x={6} y={13} width={28} text="TV" align="center" fontFamily={FONT_FAMILY} fontSize={12} fontStyle="700" fill={s} />
    </WithLead>
  );
};

/* --- Telefoon --- */
const TelefoonRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <WithLead s={s}>
      <Rect x={6} y={8} width={28} height={22} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Text x={6} y={13} width={28} text="TEL" align="center" fontFamily={FONT_FAMILY} fontSize={11} fontStyle="700" fill={s} />
    </WithLead>
  );
};

/* --- Zonnepanelen omvormer --- */
const OmvormerRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const vermogen = String(properties.vermogen?.value ?? '5 kWp');
  return (
    <Group>
      <Line points={[20, 0, 20, 8]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Rect x={4} y={8} width={52} height={32} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      {/* DC -> AC pictogram */}
      <Line points={[10, 18, 18, 18]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[10, 22, 14, 22]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      <Line points={[16, 22, 18, 22]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      {/* Sinus aan rechterkant */}
      <Line
        points={[36, 22, 40, 16, 44, 22, 48, 28, 52, 22]}
        stroke={s}
        strokeWidth={STROKE_WIDTH_THIN}
      />
      <Text x={0} y={42} width={60} text={vermogen} align="center" fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
    </Group>
  );
};

export const diversenSymbols: SymbolDefinition[] = [
  {
    type: 'bel',
    category: 'diversen',
    name: 'Bel / deurbel',
    description: 'Belsignaal',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {},
    Render: BelRender,
  },
  {
    type: 'parlofoon',
    category: 'diversen',
    name: 'Parlofoon',
    description: 'Intercom',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      video: { label: 'Met video', type: 'boolean', defaultValue: false },
    },
    Render: ParlofoonRender,
  },
  {
    type: 'rookmelder',
    category: 'diversen',
    name: 'Rookmelder',
    description: 'Branddetectie',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      type: { label: 'Type', type: 'select', defaultValue: 'Optisch', options: ['Optisch', 'Thermisch'] },
    },
    Render: RookmelderRender,
  },
  {
    type: 'co_melder',
    category: 'diversen',
    name: 'CO-melder',
    description: 'Koolmonoxidedetector',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {},
    Render: CoMelderRender,
  },
  {
    type: 'thermostaat',
    category: 'diversen',
    name: 'Thermostaat',
    description: 'Verwarmingsregeling',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      programmeerbaar: { label: 'Programmeerbaar', type: 'boolean', defaultValue: true },
    },
    Render: ThermostaatRender,
  },
  {
    type: 'boiler',
    category: 'diversen',
    name: 'Boiler',
    description: 'Elektrische boiler',
    width: 40,
    height: 46,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      vermogen: { label: 'Vermogen', type: 'number', defaultValue: 2000, unit: 'W' },
    },
    Render: BoilerRender,
  },
  {
    type: 'verwarming',
    category: 'diversen',
    name: 'Elektrische verwarming',
    description: 'Radiator / convector',
    width: 40,
    height: 46,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      wattage: { label: 'Wattage', type: 'number', defaultValue: 1500, unit: 'W' },
    },
    Render: VerwarmingRender,
  },
  {
    type: 'ventilator',
    category: 'diversen',
    name: 'Ventilator',
    description: 'Ventilatiesysteem',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      debiet: { label: 'Debiet', type: 'number', defaultValue: 100, unit: 'm³/u' },
    },
    Render: VentilatorRender,
  },
  {
    type: 'aarding',
    category: 'diversen',
    name: 'Aarding',
    description: 'Aardingspen / -plaat',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      type: { label: 'Type', type: 'select', defaultValue: 'Pen', options: ['Pen', 'Plaat', 'Lus'] },
    },
    Render: AardingRender,
  },
  {
    type: 'equipotentiaal',
    category: 'diversen',
    name: 'Equipotentiale verbinding',
    description: 'Gelijkpotentiaalverbinding',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {},
    Render: EquipotentiaalRender,
  },
  {
    type: 'data_rj45',
    category: 'diversen',
    name: 'Data / netwerk',
    description: 'RJ45 ethernet aansluiting',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      categorie: { label: 'Categorie', type: 'select', defaultValue: 'Cat 6', options: ['Cat 5e', 'Cat 6', 'Cat 6a', 'Cat 7'] },
    },
    Render: DataRender,
  },
  {
    type: 'tv_coax',
    category: 'diversen',
    name: 'TV / coax',
    description: 'Televisie aansluiting',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {},
    Render: TvRender,
  },
  {
    type: 'telefoon',
    category: 'diversen',
    name: 'Telefoon',
    description: 'Telefoonaansluiting (RJ11)',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {},
    Render: TelefoonRender,
  },
  {
    type: 'omvormer',
    category: 'diversen',
    name: 'Zonnepanelen omvormer',
    description: 'PV-omvormer',
    width: 60,
    height: 54,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 30, y: 40 },
    ],
    properties: {
      vermogen: { label: 'Vermogen', type: 'string', defaultValue: '5 kWp' },
    },
    Render: OmvormerRender,
  },
];
