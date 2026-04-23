import { Circle, Group, Line, Rect, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import { FILL_BG, FILL_BLACK, FONT_FAMILY, STROKE_WIDTH, STROKE_WIDTH_MAIN, strokeFor } from './draw';

/* =========================================================================
 * Voeding & meting — Trikker conventies
 * ========================================================================= */

const VOLTAGE_OPTIONS = ['230V', '400V'];

/* --- Aansluitpunt (open cirkeltje) -------------------------------------- */
const AansluitpuntRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const tekst = String(properties.tekst?.value ?? '');
  return (
    <Group>
      <Line points={[20, 0, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={20} radius={6} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      {tekst ? (
        <Text x={32} y={16} text={tekst} fontFamily={FONT_FAMILY} fontSize={11} fill={s} />
      ) : null}
    </Group>
  );
};

/* --- Aansluitklem (cirkeltje met diagonale streep) ---------------------- */
const AansluitklemRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const tekst = String(properties.tekst?.value ?? '');
  return (
    <Group>
      <Line points={[20, 0, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={20} radius={6} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Line points={[15, 25, 25, 15]} stroke={s} strokeWidth={STROKE_WIDTH} />
      {tekst ? (
        <Text x={32} y={16} text={tekst} fontFamily={FONT_FAMILY} fontSize={11} fill={s} />
      ) : null}
    </Group>
  );
};

/* --- Aftakkast (zwarte gevulde cirkel, optioneel met dubbele omtrek) --- */
const AftakkastRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const compact = Boolean(properties.compact?.value ?? false);
  const adres = String(properties.adres?.value ?? '');
  return (
    <Group>
      <Line points={[20, 0, 20, 12]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {compact ? (
        <Circle x={20} y={20} radius={6} fill={FILL_BLACK} stroke={s} strokeWidth={STROKE_WIDTH} />
      ) : (
        <>
          <Circle x={20} y={20} radius={9} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
          <Circle x={20} y={20} radius={5} fill={FILL_BLACK} />
        </>
      )}
      {adres ? (
        <Text x={32} y={16} text={adres} fontFamily={FONT_FAMILY} fontSize={11} fill={s} />
      ) : null}
    </Group>
  );
};

/* --- Aarding (drie aflopende horizontale strepen) ----------------------- */
const AardingRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const weerstand = String(properties.weerstand?.value ?? '');
  return (
    <Group>
      <Line points={[20, 0, 20, 16]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Line points={[8, 16, 32, 16]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Line points={[12, 22, 28, 22]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[16, 28, 24, 28]} stroke={s} strokeWidth={STROKE_WIDTH} />
      {weerstand ? (
        <Text x={36} y={14} text={weerstand} fontFamily={FONT_FAMILY} fontSize={11} fill={s} />
      ) : null}
    </Group>
  );
};

/* --- Aardingsstrip (verticale condensator-achtige) ---------------------- */
const AardingstripRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <Group>
      <Line points={[20, 0, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Line points={[10, 14, 30, 14]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[10, 18, 30, 18]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[20, 18, 20, 32]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
    </Group>
  );
};

/* --- Teller / kWh-meter (rechthoek met "kWh") --------------------------- */
const TellerRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const tekst = String(properties.tekst?.value ?? 'kWh');
  return (
    <Group>
      <Line points={[20, 0, 20, 6]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Rect x={4} y={6} width={32} height={22} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Text
        x={4}
        y={10}
        width={32}
        text={tekst}
        align="center"
        fontFamily={FONT_FAMILY}
        fontSize={12}
        fontStyle="700"
        fill={s}
      />
      <Line points={[20, 28, 20, 34]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
    </Group>
  );
};

export const voedingSymbols: SymbolDefinition[] = [
  {
    type: 'aansluitpunt',
    category: 'voeding',
    name: 'Aansluitpunt',
    description: 'Aansluitpunt op een kring',
    width: 40,
    height: 30,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      tekst: { label: 'Tekst', type: 'string', defaultValue: '' },
      voltage: { label: 'Spanning', type: 'select', defaultValue: '230V', options: VOLTAGE_OPTIONS },
    },
    Render: AansluitpuntRender,
  },
  {
    type: 'aansluitklem',
    category: 'voeding',
    name: 'Aansluitklem',
    description: 'Aansluitklem',
    width: 40,
    height: 30,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      tekst: { label: 'Tekst', type: 'string', defaultValue: '' },
    },
    Render: AansluitklemRender,
  },
  {
    type: 'aftakkast',
    category: 'voeding',
    name: 'Aftakkast',
    description: 'Aftakkast / verbindingskast',
    width: 40,
    height: 32,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      adres: { label: 'Adres', type: 'string', defaultValue: '' },
      compact: { label: 'Compact symbool', type: 'boolean', defaultValue: false },
    },
    Render: AftakkastRender,
  },
  {
    type: 'aarding',
    category: 'voeding',
    name: 'Aarding',
    description: 'Aardingspunt',
    width: 40,
    height: 32,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      weerstand: { label: 'Weerstand', type: 'string', defaultValue: '' },
    },
    Render: AardingRender,
  },
  {
    type: 'aardingsstrip',
    category: 'voeding',
    name: 'Aardingsstrip',
    description: 'Aardingsstrip',
    width: 40,
    height: 34,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 32 },
    ],
    properties: {},
    Render: AardingstripRender,
  },
  {
    type: 'teller_kwh',
    category: 'voeding',
    name: 'Teller (kWh)',
    description: 'Elektriciteitsteller',
    width: 40,
    height: 34,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 34 },
    ],
    properties: {
      tekst: { label: 'Tekst', type: 'string', defaultValue: 'kWh' },
    },
    Render: TellerRender,
  },
];
