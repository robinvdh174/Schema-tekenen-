import { Circle, Group, Line, Rect, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import { FILL_BG, FILL_BLACK, FONT_FAMILY, STROKE_WIDTH, STROKE_WIDTH_MAIN, strokeFor } from './draw';

/* =========================================================================
 * Diverse symbolen — Trikker conventies
 * ========================================================================= */

/* --- Geluidsbron (bel/sirene/hoorn/zoemer) ----------------------------- */
const GELUIDSBRON_TYPES = ['Bel', 'Sirene', 'Hoorn', 'Zoemer'];

const GeluidsbronRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const type = String(properties.type?.value ?? 'Bel');
  const adres = String(properties.adres?.value ?? '');
  const autonoom = Boolean(properties.autonoom?.value ?? false);

  const cx = 20;
  const yTop = 0;
  const yMid = 16;

  return (
    <Group>
      <Line points={[cx, yTop, cx, yMid]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {/* Autonoom = "+" boven */}
      {autonoom ? (
        <>
          <Line points={[cx - 3, 4, cx + 3, 4]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[cx, 1, cx, 7]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {type === 'Bel' ? (
        // D-vorm (halve cirkel met diameter rechts)
        <>
          <Line points={[cx, yMid, cx + 14, yMid]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line
            points={(() => {
              const pts: number[] = [];
              for (let i = 0; i <= 16; i++) {
                const a = -Math.PI / 2 + (Math.PI * i) / 16;
                pts.push(cx + 8 * Math.cos(a));
                pts.push(yMid + 8 + 8 * Math.sin(a));
              }
              return pts;
            })()}
            stroke={s}
            strokeWidth={STROKE_WIDTH}
          />
        </>
      ) : null}

      {type === 'Sirene' ? (
        // Driehoek met punt naar rechts
        <Line points={[cx, yMid, cx + 14, yMid + 6, cx, yMid + 12, cx, yMid]} stroke={s} strokeWidth={STROKE_WIDTH} closed fill={FILL_BG} />
      ) : null}

      {type === 'Hoorn' ? (
        // Trapezium-vorm
        <Line points={[cx, yMid + 2, cx + 8, yMid - 2, cx + 14, yMid + 4, cx + 14, yMid + 8, cx + 8, yMid + 14, cx, yMid + 10, cx, yMid + 2]} stroke={s} strokeWidth={STROKE_WIDTH} closed fill={FILL_BG} />
      ) : null}

      {type === 'Zoemer' ? (
        // Halve cirkel met diameter onder (gevuld zwart)
        <Line
          points={(() => {
            const pts: number[] = [cx, yMid + 8];
            for (let i = 0; i <= 16; i++) {
              const a = Math.PI - (Math.PI * i) / 16;
              pts.push(cx + 8 * Math.cos(a) + 8);
              pts.push(yMid + 8 - 8 * Math.sin(a));
            }
            pts.push(cx + 16, yMid + 8);
            return pts;
          })()}
          stroke={s}
          strokeWidth={STROKE_WIDTH}
          closed
          fill={FILL_BG}
        />
      ) : null}

      {adres ? (
        <Text x={cx + 18} y={yMid + 4} text={adres} fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
      ) : null}
    </Group>
  );
};

/* --- Intercom ---------------------------------------------------------- */
const IntercomRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const adres = String(properties.adres?.value ?? '');
  return (
    <Group>
      <Line points={[20, 0, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Rect x={10} y={14} width={20} height={16} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      {/* Pijl naar rechts (transmit) */}
      <Line points={[26, 22, 30, 22]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[28, 20, 30, 22, 28, 24]} stroke={s} strokeWidth={STROKE_WIDTH} />
      {adres ? (
        <Text x={32} y={16} text={adres} fontFamily={FONT_FAMILY} fontSize={10} fill={s} />
      ) : null}
    </Group>
  );
};

/* --- Bewegingsdetector (passief) --------------------------------------- */
const BewegingsdetectorRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const adres = String(properties.adres?.value ?? '');
  return (
    <Group>
      <Line points={[20, 0, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {/* Driehoek met top naar rechts */}
      <Line points={[20, 14, 32, 22, 20, 30, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH} closed fill={FILL_BG} />
      {/* Stralen */}
      <Line points={[26, 18, 32, 14]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[28, 22, 36, 22]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[26, 26, 32, 30]} stroke={s} strokeWidth={STROKE_WIDTH} />
      {adres ? (
        <Text x={38} y={18} text={adres} fontFamily={FONT_FAMILY} fontSize={9} fontStyle="italic" fill={s} />
      ) : null}
    </Group>
  );
};

/* --- Branddetector ----------------------------------------------------- */
const BRAND_TYPES = ['Niet gespecifieerd', 'Rookdetector', 'Warmtedetector', 'Vlamdetector', 'Gasdetector', 'Manueel', 'Straaldetector'];

const BranddetectorRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const type = String(properties.type?.value ?? 'Rookdetector');
  const adres = String(properties.adres?.value ?? '');

  const cx = 20;
  const yMid = 22;

  return (
    <Group>
      <Line points={[cx, 0, cx, 12]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {/* Vierkant kader */}
      <Rect x={cx - 8} y={yMid - 8} width={16} height={16} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />

      {type === 'Rookdetector' ? (
        // S-krul (gespiegeld) binnen het vierkant
        <Line points={[cx - 4, yMid + 4, cx - 4, yMid - 2, cx + 4, yMid + 2, cx + 4, yMid - 4]} stroke={s} strokeWidth={STROKE_WIDTH} tension={0.5} />
      ) : null}
      {type === 'Warmtedetector' ? (
        // < teken
        <Line points={[cx + 3, yMid - 5, cx - 3, yMid, cx + 3, yMid + 5]} stroke={s} strokeWidth={STROKE_WIDTH} />
      ) : null}
      {type === 'Vlamdetector' ? (
        // Hangende S
        <Line points={[cx - 4, yMid - 4, cx + 4, yMid + 4]} stroke={s} strokeWidth={STROKE_WIDTH} />
      ) : null}
      {type === 'Gasdetector' ? (
        // Driehoek
        <Line points={[cx, yMid - 5, cx + 5, yMid + 4, cx - 5, yMid + 4, cx, yMid - 5]} stroke={s} strokeWidth={STROKE_WIDTH} />
      ) : null}
      {type === 'Manueel' ? (
        <Text x={cx - 4} y={yMid - 6} width={8} text="M" align="center" fontSize={10} fontStyle="700" fontFamily={FONT_FAMILY} fill={s} />
      ) : null}
      {type === 'Straaldetector' ? (
        // Verticale streep
        <Line points={[cx, yMid - 6, cx, yMid + 6]} stroke={s} strokeWidth={STROKE_WIDTH} />
      ) : null}

      {adres ? (
        <Text x={cx + 12} y={yMid - 4} text={adres} fontFamily={FONT_FAMILY} fontSize={9} fontStyle="italic" fill={s} />
      ) : null}
    </Group>
  );
};

/* --- Thermostaat ------------------------------------------------------- */
const ThermostaatRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <Group>
      <Line points={[20, 0, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Rect x={6} y={14} width={28} height={14} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      {/* Horizontale streep midden = thermostaat */}
      <Line points={[12, 21, 28, 21]} stroke={s} strokeWidth={STROKE_WIDTH} />
    </Group>
  );
};

/* --- Motor ------------------------------------------------------------- */
const MotorRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const adres = String(properties.adres?.value ?? '');
  return (
    <Group>
      <Line points={[20, 0, 20, 12]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={22} radius={10} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Text x={10} y={16} width={20} text="M" align="center" fontFamily={FONT_FAMILY} fontSize={12} fontStyle="700" fill={s} />
      {adres ? (
        <Text x={34} y={18} text={adres} fontFamily={FONT_FAMILY} fontSize={9} fontStyle="italic" fill={s} />
      ) : null}
    </Group>
  );
};

/* --- Pomp -------------------------------------------------------------- */
const PompRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const adres = String(properties.adres?.value ?? '');
  return (
    <Group>
      <Line points={[20, 0, 20, 12]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Circle x={20} y={22} radius={10} fill={FILL_BLACK} />
      {/* Witte driehoek-pijl in midden voor stromingsrichting */}
      <Line points={[16, 18, 26, 22, 16, 26]} stroke={FILL_BG} strokeWidth={STROKE_WIDTH_MAIN} fill={FILL_BG} closed />
      {adres ? (
        <Text x={34} y={18} text={adres} fontFamily={FONT_FAMILY} fontSize={9} fontStyle="italic" fill={s} />
      ) : null}
    </Group>
  );
};

/* --- Trillingsdetector ------------------------------------------------- */
const TrillingsdetectorRender = ({ state }: SymbolRenderProps) => {
  const s = strokeFor(state);
  return (
    <Group>
      <Line points={[20, 0, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {/* Cirkel-helft met "U" voor glasbreuk */}
      <Line points={[10, 22, 10, 14, 30, 14, 30, 22]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[10, 22, 30, 22]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[10, 14, 12, 12, 28, 12, 30, 14]} stroke={s} strokeWidth={STROKE_WIDTH} />
    </Group>
  );
};

export const diversenSymbols: SymbolDefinition[] = [
  {
    type: 'geluidsbron',
    category: 'diversen',
    name: 'Geluidsbron',
    description: 'Bel / sirene / hoorn / zoemer',
    width: 40,
    height: 40,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      type: { label: 'Type', type: 'select', defaultValue: 'Bel', options: GELUIDSBRON_TYPES },
      adres: { label: 'Adres', type: 'string', defaultValue: '' },
      autonoom: { label: 'Autonoom', type: 'boolean', defaultValue: false },
      aantal: { label: 'Aantal', type: 'number', defaultValue: 1 },
    },
    Render: GeluidsbronRender,
  },
  {
    type: 'intercom',
    category: 'diversen',
    name: 'Intercom',
    description: 'Parlofoon / videofoon',
    width: 40,
    height: 32,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      adres: { label: 'Adres', type: 'string', defaultValue: '' },
      aantal: { label: 'Aantal', type: 'number', defaultValue: 1 },
    },
    Render: IntercomRender,
  },
  {
    type: 'bewegingsdetector',
    category: 'diversen',
    name: 'Bewegingsdetector',
    description: 'Passieve bewegingsdetectie',
    width: 40,
    height: 32,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      adres: { label: 'Adres', type: 'string', defaultValue: '' },
      infrarood: { label: 'Infrarood', type: 'boolean', defaultValue: true },
      radar: { label: 'Radar', type: 'boolean', defaultValue: false },
      ultrasoon: { label: 'Ultrasoon', type: 'boolean', defaultValue: false },
    },
    Render: BewegingsdetectorRender,
  },
  {
    type: 'branddetector',
    category: 'diversen',
    name: 'Branddetector',
    description: 'Rook / warmte / vlam / gas / manueel',
    width: 40,
    height: 32,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      type: { label: 'Type', type: 'select', defaultValue: 'Rookdetector', options: BRAND_TYPES },
      adres: { label: 'Adres', type: 'string', defaultValue: '' },
      aantal: { label: 'Aantal', type: 'number', defaultValue: 1 },
    },
    Render: BranddetectorRender,
  },
  {
    type: 'thermostaat',
    category: 'diversen',
    name: 'Thermostaat',
    description: 'Verwarmingsregeling',
    width: 40,
    height: 32,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      programmeerbaar: { label: 'Programmeerbaar', type: 'boolean', defaultValue: true },
    },
    Render: ThermostaatRender,
  },
  {
    type: 'motor',
    category: 'diversen',
    name: 'Motor',
    description: 'Elektromotor',
    width: 40,
    height: 36,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      adres: { label: 'Adres', type: 'string', defaultValue: '' },
      aantal: { label: 'Aantal', type: 'number', defaultValue: 1 },
      vermogen: { label: 'Vermogen', type: 'string', defaultValue: '' },
    },
    Render: MotorRender,
  },
  {
    type: 'pomp',
    category: 'diversen',
    name: 'Pomp',
    description: 'Waterpomp',
    width: 40,
    height: 36,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      adres: { label: 'Adres', type: 'string', defaultValue: '' },
      aantal: { label: 'Aantal', type: 'number', defaultValue: 1 },
    },
    Render: PompRender,
  },
  {
    type: 'trillingsdetector',
    category: 'diversen',
    name: 'Trillingsdetector',
    description: 'Glasbreukdetector',
    width: 40,
    height: 28,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      adres: { label: 'Adres', type: 'string', defaultValue: '' },
    },
    Render: TrillingsdetectorRender,
  },
];
