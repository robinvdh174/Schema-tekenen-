import { Circle, Group, Line, Rect, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import { FILL_BG, FILL_BLACK, FONT_FAMILY, STROKE_WIDTH, STROKE_WIDTH_MAIN, strokeFor } from './draw';

/* =========================================================================
 * Toestellen — Trikker conventies
 *
 * Universele "Toestel"-symbool met `type` parameter dat het iconografische
 * uiterlijk binnen het vierkant bepaalt. Volgens Trikker pagina 13 zijn dit
 * allemaal ~20×20 vierkanten met een specifiek pictogram in het midden.
 * ========================================================================= */

const TOESTEL_TYPES = [
  'Algemeen',
  'Kookfornuis',
  'Elektrische oven',
  'Microgolfoven',
  'Wasmachine',
  'Droogkast',
  'Vaatwasmachine',
  'Koelkast',
  'Diepvriezer',
  'Ventilator',
  'Stoomoven',
  'Laadstation auto',
];

const ToestelRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const type = String(properties.type?.value ?? 'Algemeen');
  const adres = String(properties.adres?.value ?? '');

  const cx = 20;
  const yTop = 0;
  const boxY = 8;
  const boxSize = 24;
  const boxLeft = cx - boxSize / 2;
  const center = cx;
  const cy = boxY + boxSize / 2;

  return (
    <Group>
      <Line points={[cx, yTop, cx, boxY]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Rect x={boxLeft} y={boxY} width={boxSize} height={boxSize} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />

      {type === 'Kookfornuis' ? (
        // 4 stippen = kookpitten
        <>
          <Circle x={center - 5} y={cy - 5} radius={1.8} fill={FILL_BLACK} />
          <Circle x={center + 5} y={cy - 5} radius={1.8} fill={FILL_BLACK} />
          <Circle x={center - 5} y={cy + 5} radius={1.8} fill={FILL_BLACK} />
          <Circle x={center + 5} y={cy + 5} radius={1.8} fill={FILL_BLACK} />
        </>
      ) : null}

      {type === 'Elektrische oven' ? (
        <Circle x={center} y={cy} radius={2.5} fill={FILL_BLACK} />
      ) : null}

      {type === 'Microgolfoven' ? (
        // Sinus / golven horizontaal
        <Line
          points={[
            center - 8, cy - 2, center - 5, cy + 2, center - 2, cy - 2,
            center + 1, cy + 2, center + 4, cy - 2, center + 7, cy + 2,
          ]}
          stroke={s}
          strokeWidth={STROKE_WIDTH}
        />
      ) : null}

      {type === 'Wasmachine' ? (
        <>
          <Circle x={center} y={cy} radius={6} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
          <Circle x={center} y={cy} radius={2.5} fill={FILL_BLACK} />
        </>
      ) : null}

      {type === 'Droogkast' ? (
        // 2 cirkeltjes naast elkaar
        <>
          <Circle x={center - 4} y={cy} radius={3.5} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
          <Circle x={center + 4} y={cy} radius={3.5} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
        </>
      ) : null}

      {type === 'Vaatwasmachine' ? (
        // X in vierkant
        <>
          <Line points={[boxLeft + 4, boxY + 4, boxLeft + boxSize - 4, boxY + boxSize - 4]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[boxLeft + boxSize - 4, boxY + 4, boxLeft + 4, boxY + boxSize - 4]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {type === 'Koelkast' ? (
        // Asterisk
        <>
          <Line points={[center, cy - 7, center, cy + 7]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[center - 6, cy - 4, center + 6, cy + 4]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[center - 6, cy + 4, center + 6, cy - 4]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {type === 'Diepvriezer' ? (
        // 3 asterisken
        [-7, 0, 7].map((dx) => (
          <Group key={dx}>
            <Line points={[center + dx, cy - 4, center + dx, cy + 4]} stroke={s} strokeWidth={STROKE_WIDTH} />
            <Line points={[center + dx - 3, cy - 2, center + dx + 3, cy + 2]} stroke={s} strokeWidth={STROKE_WIDTH} />
            <Line points={[center + dx - 3, cy + 2, center + dx + 3, cy - 2]} stroke={s} strokeWidth={STROKE_WIDTH} />
          </Group>
        ))
      ) : null}

      {type === 'Ventilator' ? (
        // 2 cirkeltjes (rotor)
        <>
          <Circle x={center - 3} y={cy} radius={3.5} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
          <Circle x={center + 3} y={cy} radius={3.5} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
        </>
      ) : null}

      {type === 'Stoomoven' ? (
        // Stoomwolkjes (drie boogjes)
        <>
          <Line points={[center - 6, cy + 2, center - 3, cy - 2, center, cy + 2, center + 3, cy - 2, center + 6, cy + 2]} stroke={s} strokeWidth={STROKE_WIDTH} tension={0.4} />
        </>
      ) : null}

      {type === 'Laadstation auto' ? (
        // EV-laadstation icoontje (E in vierkantje)
        <Text x={boxLeft} y={cy - 6} width={boxSize} text="EV" align="center" fontFamily={FONT_FAMILY} fontSize={10} fontStyle="700" fill={s} />
      ) : null}

      {adres ? (
        <Text x={cx + boxSize / 2 + 4} y={cy - 4} text={adres} fontFamily={FONT_FAMILY} fontSize={9} fontStyle="italic" fill={s} />
      ) : null}
    </Group>
  );
};

/* --- Boiler ------------------------------------------------------------ */
const BoilerRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const accumulatie = Boolean(properties.accumulatie?.value ?? false);
  const adres = String(properties.adres?.value ?? '');
  return (
    <Group>
      <Line points={[20, 0, 20, 8]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {/* Horizontale capsule-vorm (boiler-tank) */}
      <Rect x={4} y={8} width={32} height={20} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} cornerRadius={10} />
      {accumulatie ? (
        <Text x={4} y={14} width={32} text="acc." align="center" fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
      ) : null}
      {adres ? (
        <Text x={38} y={14} text={adres} fontFamily={FONT_FAMILY} fontSize={9} fontStyle="italic" fill={s} />
      ) : null}
    </Group>
  );
};

/* --- Verwarmingstoestel ------------------------------------------------ */
const VerwarmingstoestelRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const accumulatie = Boolean(properties.accumulatie?.value ?? false);
  const ventilator = Boolean(properties.ventilator?.value ?? false);
  const adres = String(properties.adres?.value ?? '');
  return (
    <Group>
      <Line points={[20, 0, 20, 8]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Rect x={4} y={8} width={28} height={22} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      {/* Horizontale lamellen */}
      {[12, 16, 20, 24].map((y) => (
        <Line key={y} points={[6, y, 30, y]} stroke={s} strokeWidth={STROKE_WIDTH} />
      ))}
      {accumulatie ? <Text x={4} y={11} text="A" fontSize={7} fontStyle="700" fontFamily={FONT_FAMILY} fill={s} /> : null}
      {ventilator ? (
        <Circle x={36} y={20} radius={4} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      ) : null}
      {adres ? (
        <Text x={ventilator ? 42 : 36} y={14} text={adres} fontFamily={FONT_FAMILY} fontSize={9} fontStyle="italic" fill={s} />
      ) : null}
    </Group>
  );
};

/* --- Ketel ------------------------------------------------------------- */
const KetelRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const energiebron = String(properties.energiebron?.value ?? 'Elektriciteit');
  const adres = String(properties.adres?.value ?? '');
  return (
    <Group>
      <Line points={[20, 0, 20, 6]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Rect x={6} y={6} width={28} height={28} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      {/* Symbool van energiebron in midden */}
      {energiebron === 'Elektriciteit' ? (
        // Bliksem
        <Line points={[18, 12, 16, 18, 21, 18, 18, 28, 24, 18, 19, 18, 22, 12, 18, 12]} stroke={s} strokeWidth={STROKE_WIDTH} closed fill={FILL_BLACK} />
      ) : null}
      {energiebron === 'Gas (ventilator)' ? (
        <Line points={[20, 12, 26, 26, 14, 26, 20, 12]} stroke={s} strokeWidth={STROKE_WIDTH} closed fill={FILL_BLACK} />
      ) : null}
      {energiebron === 'Gas (atmosferisch)' ? (
        <Line points={[20, 12, 26, 26, 14, 26, 20, 12]} stroke={s} strokeWidth={STROKE_WIDTH} closed fill={FILL_BG} />
      ) : null}
      {energiebron === 'Vloeibare brandstof' ? (
        <Circle x={20} y={20} radius={5} fill={FILL_BLACK} />
      ) : null}
      {energiebron === 'Vaste brandstof' ? (
        <Rect x={15} y={15} width={10} height={10} fill={FILL_BLACK} />
      ) : null}
      {adres ? (
        <Text x={36} y={16} text={adres} fontFamily={FONT_FAMILY} fontSize={9} fontStyle="italic" fill={s} />
      ) : null}
    </Group>
  );
};

export const toestelSymbols: SymbolDefinition[] = [
  {
    type: 'toestel',
    category: 'toestellen',
    name: 'Toestel',
    description: 'Vast aangesloten elektrisch toestel',
    width: 40,
    height: 38,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      type: { label: 'Type', type: 'select', defaultValue: 'Algemeen', options: TOESTEL_TYPES },
      adres: { label: 'Adres', type: 'string', defaultValue: '' },
      vermogen: { label: 'Vermogen', type: 'string', defaultValue: '' },
      kring: { label: 'Kring', type: 'string', defaultValue: '' },
    },
    Render: ToestelRender,
  },
  {
    type: 'boiler',
    category: 'toestellen',
    name: 'Boiler',
    description: 'Elektrische boiler',
    width: 40,
    height: 32,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      accumulatie: { label: 'Accumulatie', type: 'boolean', defaultValue: false },
      adres: { label: 'Adres', type: 'string', defaultValue: '' },
      vermogen: { label: 'Vermogen', type: 'string', defaultValue: '' },
    },
    Render: BoilerRender,
  },
  {
    type: 'verwarmingstoestel',
    category: 'toestellen',
    name: 'Verwarmingstoestel',
    description: 'Elektrische radiator / convector',
    width: 40,
    height: 34,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      accumulatie: { label: 'Accumulatie', type: 'boolean', defaultValue: false },
      ventilator: { label: 'Met ventilator', type: 'boolean', defaultValue: false },
      adres: { label: 'Adres', type: 'string', defaultValue: '' },
      vermogen: { label: 'Vermogen', type: 'string', defaultValue: '' },
    },
    Render: VerwarmingstoestelRender,
  },
  {
    type: 'ketel',
    category: 'toestellen',
    name: 'Ketel',
    description: 'CV-ketel / verwarmingsketel',
    width: 40,
    height: 38,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      energiebron: {
        label: 'Energiebron',
        type: 'select',
        defaultValue: 'Elektriciteit',
        options: ['Elektriciteit', 'Gas (ventilator)', 'Gas (atmosferisch)', 'Vloeibare brandstof', 'Vaste brandstof'],
      },
      adres: { label: 'Adres', type: 'string', defaultValue: '' },
    },
    Render: KetelRender,
  },
];
