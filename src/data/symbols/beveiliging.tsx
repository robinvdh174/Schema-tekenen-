import { Group, Line, Rect, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import { FILL_BG, FONT_FAMILY, STROKE_WIDTH, STROKE_WIDTH_MAIN, strokeFor } from './draw';

/* =========================================================================
 * Beveiliging — Trikker conventies
 *
 * Een automaat in eendraadschema = simpele schuine streep over een verticale
 * doorvoerlijn, met labels naast (bv. "2P - 16A C").
 * Differentieelschakelaar = idem met "Δ300mA 2P - 40A".
 * Differentieelautomaat = idem met "Δ300mA 2P - M40A".
 * ========================================================================= */

const POL_OPTIONS = ['1P', '1P+N', '2P', '3P', '3P+N', '4P'];
const CURVE_OPTIONS = ['—', 'B', 'C', 'D'];
const DIFF_TYPES = ['A', 'AC', 'B'];
const DIFF_GEVOELIGHEID = ['10mA', '30mA', '100mA', '300mA', '500mA'];
const TYPE_OPTIONS = [
  'Automaat',
  'Differentieelschakelaar',
  'Differentieelautomaat',
  'Zekeringscheider',
  'Draaischakelaar',
  'Schemerschakelaar',
  'Contact',
];

/**
 * Universeel "beveiligings-/contact"-symbool. Trikker tekent dit altijd als
 * een schakelcontact (schuine streep) op een verticale lijn met labels naast.
 * De `type` property bepaalt het extra teken bovenop de schuine streep.
 */
const AutomaatRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const type = String(properties.type?.value ?? 'Automaat');
  const polen = String(properties.polen?.value ?? '2P');
  const amp = String(properties.amperage?.value ?? '16A');
  const curve = String(properties.curve?.value ?? 'C');
  const sensitivity = String(properties.gevoeligheid?.value ?? '300mA');
  const diffType = String(properties.diff_type?.value ?? 'A');

  // Verticale doorvoerlijn met breakpoint waar de schuine streep aanhaakt
  const cx = 20;
  const yTop = 0;
  const yMid = 22;
  const yBot = 50;

  // Hoofdcontact = korte schuine streep van (cx, yMid) naar (cx+10, yMid-10)
  const slashFrom = { x: cx, y: yMid };
  const slashTo = { x: cx + 10, y: yMid - 10 };

  // Compose the right-side text label
  const label = (() => {
    const polenStr = polen ? polen : '';
    if (type === 'Differentieelschakelaar')
      return `Δ${sensitivity} ${polenStr} - ${amp}\nType ${diffType}`;
    if (type === 'Differentieelautomaat')
      return `Δ${sensitivity} ${polenStr} - M${amp}\nType ${diffType}`;
    if (type === 'Automaat')
      return curve && curve !== '—' ? `${polenStr} - ${curve} ${amp}` : `${polenStr} - ${amp}`;
    if (type === 'Zekeringscheider') return polenStr;
    if (type === 'Draaischakelaar') return polenStr;
    if (type === 'Schemerschakelaar') return polenStr;
    if (type === 'Contact') return polenStr;
    return polenStr;
  })();

  return (
    <Group>
      {/* Hoofdlijn boven */}
      <Line points={[cx, yTop, cx, yMid]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {/* Schuine streep (basiscontact) */}
      <Line
        points={[slashFrom.x, slashFrom.y, slashTo.x, slashTo.y]}
        stroke={s}
        strokeWidth={STROKE_WIDTH_MAIN}
      />

      {/* Type-specifieke extra's bovenop de schuine streep */}
      {type === 'Zekeringscheider' ? (
        <>
          <Line points={[slashFrom.x - 2, slashFrom.y - 4, slashTo.x - 2, slashTo.y - 4]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[slashFrom.x + 2, slashFrom.y + 4, slashTo.x + 2, slashTo.y + 4]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {type === 'Draaischakelaar' ? (
        // klein cirkeltje aan het uiteinde
        <Line points={[slashTo.x, slashTo.y, slashTo.x + 2, slashTo.y - 2]} stroke={s} strokeWidth={STROKE_WIDTH} />
      ) : null}

      {type === 'Schemerschakelaar' ? (
        <>
          <Line points={[slashFrom.x - 6, slashFrom.y - 8, slashFrom.x - 2, slashFrom.y - 12]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[slashFrom.x - 4, slashFrom.y - 6, slashFrom.x, slashFrom.y - 10]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {(type === 'Differentieelschakelaar' || type === 'Differentieelautomaat') ? (
        // Streep dwars op de schakelaar = differentieel-symbool
        <Line points={[slashFrom.x + 1, slashFrom.y - 4, slashTo.x - 4, slashTo.y + 1]} stroke={s} strokeWidth={STROKE_WIDTH} />
      ) : null}

      {/* Hoofdlijn beneden */}
      <Line points={[cx, yMid, cx, yBot]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />

      {/* Polen-label onder de schuine streep */}
      {polen ? (
        <Text
          x={2}
          y={yMid + 14}
          text={polen}
          fontFamily={FONT_FAMILY}
          fontSize={9}
          fill={s}
        />
      ) : null}

      {/* Hoofdlabel rechts van het symbool */}
      {label ? (
        <Text
          x={36}
          y={yMid - 8}
          text={label}
          fontFamily={FONT_FAMILY}
          fontSize={10}
          fontStyle="600"
          lineHeight={1.2}
          fill={s}
        />
      ) : null}
    </Group>
  );
};

/* --- Smeltveiligheid (rechthoekje op de doorvoerlijn) ------------------ */
const SmeltveiligheidRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const amp = String(properties.amperage?.value ?? '16A');
  return (
    <Group>
      <Line points={[20, 0, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Rect x={12} y={14} width={16} height={22} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Line points={[20, 36, 20, 50]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Text x={32} y={20} text={amp} fontFamily={FONT_FAMILY} fontSize={10} fontStyle="600" fill={s} />
    </Group>
  );
};

/* --- Overspanningsbeveiliging ------------------------------------------ */
const OverspanningsbeveiligingRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const tekst = String(properties.tekst?.value ?? '2L + PE');
  return (
    <Group>
      <Line points={[20, 0, 20, 8]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {/* Pijl omhoog (overspanning) */}
      <Line points={[20, 8, 17, 12]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[20, 8, 23, 12]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Rect x={14} y={14} width={12} height={18} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      <Line points={[20, 32, 20, 38]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {/* Aarding onderaan */}
      <Line points={[12, 38, 28, 38]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      <Line points={[15, 41, 25, 41]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[18, 44, 22, 44]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Text x={32} y={20} text={tekst} fontFamily={FONT_FAMILY} fontSize={10} fill={s} />
    </Group>
  );
};

export const beveiligingSymbols: SymbolDefinition[] = [
  {
    type: 'automaat',
    category: 'beveiliging',
    name: 'Automatische schakelaar',
    description: 'Automaat / disjoncteur',
    width: 40,
    height: 50,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 50 },
    ],
    properties: {
      type: { label: 'Type', type: 'select', defaultValue: 'Automaat', options: TYPE_OPTIONS },
      polen: { label: 'Polen', type: 'select', defaultValue: '2P', options: POL_OPTIONS },
      amperage: { label: 'Amperage', type: 'string', defaultValue: '16A' },
      curve: { label: 'Curve', type: 'select', defaultValue: 'C', options: CURVE_OPTIONS },
      gevoeligheid: { label: 'Gevoeligheid (Δ)', type: 'select', defaultValue: '300mA', options: DIFF_GEVOELIGHEID },
      diff_type: { label: 'Diff. type', type: 'select', defaultValue: 'A', options: DIFF_TYPES },
      kring: { label: 'Kring', type: 'string', defaultValue: '' },
    },
    Render: AutomaatRender,
  },
  {
    type: 'smeltveiligheid',
    category: 'beveiliging',
    name: 'Smeltveiligheid',
    description: 'Patroonzekering',
    width: 40,
    height: 50,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 50 },
    ],
    properties: {
      amperage: { label: 'Amperage', type: 'string', defaultValue: '16A' },
      polen: { label: 'Polen', type: 'select', defaultValue: '2P', options: POL_OPTIONS },
    },
    Render: SmeltveiligheidRender,
  },
  {
    type: 'overspanningsbeveiliging',
    category: 'beveiliging',
    name: 'Overspanningsbeveiliging',
    description: 'Bliksembeveiliging',
    width: 40,
    height: 48,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      tekst: { label: 'Tekst', type: 'string', defaultValue: '2L + PE' },
    },
    Render: OverspanningsbeveiligingRender,
  },
];
