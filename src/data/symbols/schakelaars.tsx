import { Circle, Group, Line, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import { FILL_BG, FONT_FAMILY, STROKE_WIDTH, STROKE_WIDTH_MAIN, strokeFor } from './draw';

/* =========================================================================
 * Schakelaars — Trikker conventies
 *
 * Basis: korte verticale aansluitlijn met een schuine streep aan het einde
 * (lijkt op een hand-schakelaar). Varianten verschillen door extra symbool
 * boven of naast de schuine streep.
 * ========================================================================= */

const TYPE_OPTIONS = [
  'Enkelpolig',
  'Dubbelpolig',
  'Wissel',
  'Dubbele wissel',
  'Kruis',
  'Dubbele aansteking',
  'Dimmer',
  'Drukknop',
  'Rolluikschakelaar',
  'Trekschakelaar',
];

const POL_OPTIONS = ['—', '2P', '3P', '4P'];

const SchakelaarRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const type = String(properties.type?.value ?? 'Enkelpolig');
  const polen = String(properties.polen?.value ?? '—');
  const halfwaterdicht = Boolean(properties.halfwaterdicht?.value ?? false);
  const dimmer = Boolean(properties.dimmer?.value ?? false);
  const verklikker = Boolean(properties.verklikker?.value ?? false);
  const adres = String(properties.adres?.value ?? '');
  const aantalKnoppen = Number(properties.aantal_knoppen?.value ?? 0);

  const cx = 20;
  const yTop = 0;
  const yPivot = 26;

  // Default = enkelpolig (één schuine streep) van pivot omhoog naar rechts
  const slashEnd = { x: cx + 10, y: yPivot - 12 };

  return (
    <Group>
      {/* Aansluitlijn van bovenaf */}
      <Line points={[cx, yTop, cx, yPivot]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />

      {/* Halfwaterdicht "h" links van aansluitlijn */}
      {halfwaterdicht ? (
        <Text x={cx - 12} y={2} text="h" fontFamily={FONT_FAMILY} fontStyle="600" fontSize={10} fill={s} />
      ) : null}

      {/* Pivot-puntje */}
      <Circle x={cx} y={yPivot} radius={1.6} fill={s} />

      {/* Type-specifieke contact-renderingen */}
      {type === 'Enkelpolig' ? (
        <Line points={[cx, yPivot, slashEnd.x, slashEnd.y]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      ) : null}

      {type === 'Dubbelpolig' ? (
        <>
          <Line points={[cx, yPivot, slashEnd.x, slashEnd.y]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
          <Line points={[cx + 3, yPivot - 1, slashEnd.x + 3, slashEnd.y - 1]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {type === 'Wissel' ? (
        // Schuine streep + dwars-streepje aan het uiteinde (driepoot)
        <>
          <Line points={[cx, yPivot, slashEnd.x, slashEnd.y]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
          <Line points={[slashEnd.x - 2, slashEnd.y - 4, slashEnd.x + 4, slashEnd.y + 2]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {type === 'Dubbele wissel' ? (
        <>
          <Line points={[cx, yPivot, cx + 8, yPivot - 8]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
          <Line points={[cx, yPivot, cx - 8, yPivot - 8]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
          <Line points={[cx - 6, yPivot - 4, cx + 6, yPivot - 12]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {type === 'Kruis' ? (
        // Twee gekruiste schuine strepen (X)
        <>
          <Line points={[cx - 8, yPivot - 8, cx + 8, yPivot - 8 + 0]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
          <Line points={[cx - 8, yPivot - 4, cx + 8, yPivot - 12]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
          <Line points={[cx - 8, yPivot - 12, cx + 8, yPivot - 4]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
        </>
      ) : null}

      {type === 'Dubbele aansteking' ? (
        // Twee schuine strepen die uiteenwaaieren vanuit pivot
        <>
          <Line points={[cx, yPivot, cx + 10, yPivot - 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
          <Line points={[cx, yPivot, cx - 10, yPivot - 10]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
        </>
      ) : null}

      {type === 'Dimmer' ? (
        // Schuine streep + driehoek-pijl bij pivot
        <>
          <Line points={[cx, yPivot, slashEnd.x, slashEnd.y]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
          <Line points={[cx - 8, yPivot - 4, cx, yPivot - 12]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[cx - 8, yPivot - 4, cx - 5, yPivot - 8]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[cx - 8, yPivot - 4, cx - 8, yPivot - 8]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {type === 'Drukknop' ? (
        // Open cirkeltje boven de aansluitlijn
        <Circle x={cx} y={yPivot - 6} radius={5} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      ) : null}

      {type === 'Rolluikschakelaar' ? (
        // Schuine streep met dubbele pijl boven (op/neer)
        <>
          <Line points={[cx, yPivot, slashEnd.x, slashEnd.y]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
          <Line points={[cx - 8, 4, cx - 8, 16]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[cx - 8, 4, cx - 11, 7]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[cx - 8, 4, cx - 5, 7]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[cx - 8, 16, cx - 11, 13]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[cx - 8, 16, cx - 5, 13]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {type === 'Trekschakelaar' ? (
        // Schuine streep met pijl-omhoog en dwarssteek
        <>
          <Line points={[cx, yPivot, slashEnd.x, slashEnd.y]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
          <Line points={[slashEnd.x, slashEnd.y, slashEnd.x + 4, slashEnd.y - 4]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[slashEnd.x + 4, slashEnd.y - 4, slashEnd.x + 1, slashEnd.y - 4]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[slashEnd.x + 4, slashEnd.y - 4, slashEnd.x + 4, slashEnd.y - 1]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {/* Aanvullende dimmer-pijl (parameter, naast type=Dimmer) */}
      {dimmer && type !== 'Dimmer' ? (
        <>
          <Line points={[cx - 8, yPivot - 4, cx, yPivot - 12]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {/* Verklikkerlamp = klein cirkeltje met X erin links */}
      {verklikker ? (
        <>
          <Circle x={cx - 12} y={yPivot - 8} radius={3} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
          <Line points={[cx - 14, yPivot - 10, cx - 10, yPivot - 6]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[cx - 14, yPivot - 6, cx - 10, yPivot - 10]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {/* Adres-label */}
      {adres ? (
        <Text x={cx + 12} y={yPivot - 16} text={adres} fontFamily={FONT_FAMILY} fontSize={9} fontStyle="italic" fill={s} />
      ) : null}
      {/* Aantal knoppen */}
      {aantalKnoppen > 1 ? (
        <Text x={cx - 6} y={yPivot - 24} text={`x${aantalKnoppen}`} fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
      ) : null}
      {/* Polen-label */}
      {polen && polen !== '—' ? (
        <Text x={cx + 12} y={yPivot - 4} text={polen} fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
      ) : null}
    </Group>
  );
};

export const schakelaarSymbols: SymbolDefinition[] = [
  {
    type: 'schakelaar',
    category: 'schakelaars',
    name: 'Schakelaar',
    description: 'Schakelaar — type bepaalt de variant',
    width: 40,
    height: 40,
    connectionPoints: [
      { id: 'in', position: 'top', x: 20, y: 0 },
      { id: 'out', position: 'bottom', x: 20, y: 40 },
    ],
    properties: {
      type: { label: 'Type', type: 'select', defaultValue: 'Enkelpolig', options: TYPE_OPTIONS },
      polen: { label: 'Aantal polen', type: 'select', defaultValue: '—', options: POL_OPTIONS },
      adres: { label: 'Adres', type: 'string', defaultValue: '' },
      halfwaterdicht: { label: 'Halfwaterdicht (h)', type: 'boolean', defaultValue: false },
      dimmer: { label: 'Met dimmer', type: 'boolean', defaultValue: false },
      verklikker: { label: 'Verklikkerlamp', type: 'boolean', defaultValue: false },
      aantal_knoppen: { label: 'Aantal knoppen', type: 'number', defaultValue: 1 },
      kring: { label: 'Kring', type: 'string', defaultValue: '' },
    },
    Render: SchakelaarRender,
  },
];
