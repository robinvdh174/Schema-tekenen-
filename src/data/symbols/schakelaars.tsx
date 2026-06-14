import { Circle, Group, Line, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import { FILL_BG, FONT_FAMILY, STROKE_WIDTH, STROKE_WIDTH_MAIN, STROKE_WIDTH_THIN, strokeFor } from './draw';

/* =========================================================================
 * Schakelaars — AREI / Volta-conventie (Symbolen eendraadschema, sectie E)
 *
 * Basis: een kleine OPEN CIRKEL (het bedieningsmechanisme) waaraan een schuine
 * HEFBOOM hangt die schuin omhoog wijst en eindigt in een klein VOETJE (haakje).
 * Het aantal polen wordt aangeduid met korte dwarsstreepjes op de hefboom
 * (2P = //, 3P = ///). Varianten:
 *   - Wisselschakelaar  → hefboom omhoog-rechts + tegentak omlaag-links
 *   - Kruisschakelaar   → vier hefbomen in een X
 *   - Dubbele aansteking→ twee hefbomen die omhoog uiteenwaaieren
 *   - Dimmer            → hefboom met gevulde driehoek (i.p.v. voetje)
 *   - Drukknop          → twee concentrische cirkels (geen hefboom)
 *   - Trekschakelaar    → hefboom + pijl omlaag (treksnoer)
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
  const cy = 22; // middelpunt bedieningscirkel
  const r = 4.5; // straal bedieningscirkel
  const armLen = 17; // lengte van de hefboom (vanaf de cirkelrand)

  // Aantal poolstreepjes op de hefboom (2P = //, 3P = ///, ...).
  const poolFromType = type === 'Dubbelpolig' ? 2 : 0;
  const poolFromPolen = polen === '2P' ? 2 : polen === '3P' ? 3 : polen === '4P' ? 4 : 0;
  const poolMarks = Math.max(poolFromType, poolFromPolen);

  /**
   * Teken een hefboom vanuit de cirkelrand in richting (ux,uy) (eenheidsvector).
   * Optioneel met voetje (haakje), poolstreepjes, gevulde driehoek (dimmer) of
   * een treksnoer-pijl. Geeft een array Konva-elementen terug.
   */
  const lever = (
    ux: number,
    uy: number,
    opts: { foot?: boolean; poles?: number; triangle?: boolean; pull?: boolean; key: string } = { key: 'l' }
  ) => {
    const sx = cx + r * ux;
    const sy = cy + r * uy;
    const ex = cx + (r + armLen) * ux;
    const ey = cy + (r + armLen) * uy;
    const els: JSX.Element[] = [
      <Line key={`${opts.key}-arm`} points={[sx, sy, ex, ey]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} lineCap="round" />,
    ];
    // Voetje: kort haaks streepje aan het vrije uiteinde (haakje).
    if (opts.foot) {
      const fl = 6;
      els.push(
        <Line key={`${opts.key}-foot`} points={[ex, ey, ex + uy * fl, ey - ux * fl]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} lineCap="round" />
      );
    }
    // Gevulde driehoek (dimmer) aan het uiteinde i.p.v. een voetje.
    if (opts.triangle) {
      const px = -uy;
      const py = ux;
      const back = 6;
      const half = 3.5;
      const bx = ex - ux * back;
      const by = ey - uy * back;
      els.push(
        <Line
          key={`${opts.key}-tri`}
          points={[ex, ey, bx + px * half, by + py * half, bx - px * half, by - py * half]}
          closed
          fill={s}
          stroke={s}
          strokeWidth={STROKE_WIDTH_THIN}
        />
      );
    }
    // Poolstreepjes: korte dwarsstreepjes op de hefboom.
    if (opts.poles && opts.poles > 1) {
      const px = -uy;
      const py = ux;
      const half = 3;
      for (let i = 0; i < opts.poles; i++) {
        const t = r + armLen * (0.55 + i * 0.13);
        const mx = cx + t * ux;
        const my = cy + t * uy;
        els.push(
          <Line
            key={`${opts.key}-pole-${i}`}
            points={[mx - px * half + ux * 2, my - py * half + uy * 2, mx + px * half - ux * 2, my + py * half - uy * 2]}
            stroke={s}
            strokeWidth={STROKE_WIDTH_THIN}
          />
        );
      }
    }
    // Treksnoer: pijl die op de hefboom naar beneden wijst.
    if (opts.pull) {
      const mx = cx + (r + armLen * 0.55) * ux;
      const my = cy + (r + armLen * 0.55) * uy;
      els.push(<Line key={`${opts.key}-pull`} points={[mx, my - 6, mx, my + 4]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />);
      els.push(<Line key={`${opts.key}-pa1`} points={[mx, my + 4, mx - 2, my + 1]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />);
      els.push(<Line key={`${opts.key}-pa2`} points={[mx, my + 4, mx + 2, my + 1]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />);
    }
    return els;
  };

  // Eenheidsvectoren voor de hefboomrichtingen.
  const UR: [number, number] = [0.6, -0.8]; // omhoog-rechts
  const UL: [number, number] = [-0.6, -0.8]; // omhoog-links
  const DL: [number, number] = [-0.6, 0.8]; // omlaag-links
  const DR: [number, number] = [0.6, 0.8]; // omlaag-rechts

  return (
    <Group>
      {/* Aansluitlijn van bovenaf tot aan de bovenkant van de cirkel */}
      <Line points={[cx, 0, cx, cy - r]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />

      {/* Halfwaterdicht "h" links van aansluitlijn */}
      {halfwaterdicht ? (
        <Text x={cx - 13} y={2} text="h" fontFamily={FONT_FAMILY} fontStyle="600" fontSize={10} fill={s} />
      ) : null}

      {/* Bedieningscirkel (open), behalve bij de drukknop */}
      {type !== 'Drukknop' ? (
        <Circle x={cx} y={cy} radius={r} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      ) : null}

      {/* --- Type-specifieke hefbomen --- */}
      {type === 'Enkelpolig' ? lever(UR[0], UR[1], { foot: true, poles: poolMarks, key: 'ep' }) : null}

      {type === 'Dubbelpolig' ? lever(UR[0], UR[1], { foot: true, poles: Math.max(2, poolMarks), key: 'dp' }) : null}

      {type === 'Wissel' ? (
        <>
          {lever(UR[0], UR[1], { foot: true, poles: poolMarks, key: 'w1' })}
          {lever(DL[0], DL[1], { foot: true, key: 'w2' })}
        </>
      ) : null}

      {type === 'Dubbele wissel' ? (
        <>
          {lever(UR[0], UR[1], { foot: true, poles: Math.max(2, poolMarks), key: 'dw1' })}
          {lever(DL[0], DL[1], { foot: true, poles: Math.max(2, poolMarks), key: 'dw2' })}
        </>
      ) : null}

      {type === 'Kruis' ? (
        <>
          {lever(UR[0], UR[1], { foot: true, key: 'k1' })}
          {lever(UL[0], UL[1], { foot: true, key: 'k2' })}
          {lever(DL[0], DL[1], { foot: true, key: 'k3' })}
          {lever(DR[0], DR[1], { foot: true, key: 'k4' })}
        </>
      ) : null}

      {type === 'Dubbele aansteking' ? (
        <>
          {lever(UR[0], UR[1], { foot: true, key: 'da1' })}
          {lever(UL[0], UL[1], { foot: true, key: 'da2' })}
        </>
      ) : null}

      {type === 'Dimmer' ? lever(UR[0], UR[1], { triangle: true, poles: poolMarks, key: 'dim' }) : null}

      {type === 'Rolluikschakelaar' ? (
        <>
          {lever(UR[0], UR[1], { foot: true, key: 'rl' })}
          {/* Dubbele pijl (op/neer) links */}
          <Line points={[cx - 11, 4, cx - 11, 16]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
          <Line points={[cx - 11, 4, cx - 13, 7]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
          <Line points={[cx - 11, 4, cx - 9, 7]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
          <Line points={[cx - 11, 16, cx - 13, 13]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
          <Line points={[cx - 11, 16, cx - 9, 13]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
        </>
      ) : null}

      {type === 'Trekschakelaar' ? lever(UR[0], UR[1], { foot: true, pull: true, key: 'tr' }) : null}

      {/* Drukknop: twee concentrische cirkels (⊙) */}
      {type === 'Drukknop' ? (
        <>
          <Circle x={cx} y={cy} radius={7} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
          <Circle x={cx} y={cy} radius={2.6} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
        </>
      ) : null}

      {/* Aanvullende dimmer-driehoek (parameter, los van type=Dimmer) */}
      {dimmer && type !== 'Dimmer' ? (
        <Line points={[cx - 13, cy + 2, cx - 5, cy - 4, cx - 5, cy + 4, cx - 13, cy + 2]} closed fill={s} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
      ) : null}

      {/* Verklikker-/signalisatielamp = ⊗ links, verbonden met een kort lijntje */}
      {verklikker ? (
        <>
          <Line points={[cx - r - 2, cy, cx - 12, cy]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Circle x={cx - 16} y={cy} radius={4} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
          <Line points={[cx - 19, cy - 3, cx - 13, cy + 3]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
          <Line points={[cx - 19, cy + 3, cx - 13, cy - 3]} stroke={s} strokeWidth={STROKE_WIDTH_THIN} />
        </>
      ) : null}

      {/* Adres-label */}
      {adres ? (
        <Text x={cx + 13} y={2} text={adres} fontFamily={FONT_FAMILY} fontSize={9} fontStyle="italic" fill={s} />
      ) : null}
      {/* Aantal knoppen */}
      {aantalKnoppen > 1 ? (
        <Text x={cx + 13} y={cy + 6} text={`x${aantalKnoppen}`} fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
      ) : null}
    </Group>
  );
};

type SchakelaarType =
  | 'Enkelpolig'
  | 'Dubbelpolig'
  | 'Wissel'
  | 'Dubbele wissel'
  | 'Kruis'
  | 'Dubbele aansteking'
  | 'Dimmer'
  | 'Drukknop'
  | 'Rolluikschakelaar'
  | 'Trekschakelaar';

const PRESETS: { type: string; name: string; description: string; defaultType: SchakelaarType }[] = [
  { type: 'schakelaar_enkel', name: 'Enkelpolig', description: 'Enkelpolige schakelaar', defaultType: 'Enkelpolig' },
  { type: 'schakelaar_dubbel', name: 'Dubbelpolig', description: 'Dubbelpolige schakelaar', defaultType: 'Dubbelpolig' },
  { type: 'schakelaar_wissel', name: 'Wissel', description: 'Wisselschakelaar', defaultType: 'Wissel' },
  { type: 'schakelaar_dubbel_wissel', name: 'Dubbele wissel', description: 'Dubbele wisselschakelaar', defaultType: 'Dubbele wissel' },
  { type: 'schakelaar_kruis', name: 'Kruis', description: 'Kruisschakelaar', defaultType: 'Kruis' },
  { type: 'schakelaar_dubbele_aansteking', name: 'Dubbele aansteking', description: 'Twee aanstekingen vanaf één punt', defaultType: 'Dubbele aansteking' },
  { type: 'schakelaar_dimmer', name: 'Dimmer', description: 'Lichtdimmer', defaultType: 'Dimmer' },
  { type: 'schakelaar_drukknop', name: 'Drukknop', description: 'Drukknop / belknop', defaultType: 'Drukknop' },
  { type: 'schakelaar_rolluik', name: 'Rolluik', description: 'Rolluikschakelaar (op/neer)', defaultType: 'Rolluikschakelaar' },
  { type: 'schakelaar_trek', name: 'Trekschakelaar', description: 'Trekschakelaar', defaultType: 'Trekschakelaar' },
];

const baseProperties = (defaultType: SchakelaarType) => ({
  type: { label: 'Type', type: 'select' as const, defaultValue: defaultType, options: TYPE_OPTIONS },
  polen: { label: 'Aantal polen', type: 'select' as const, defaultValue: '—', options: POL_OPTIONS },
  adres: { label: 'Adres', type: 'string' as const, defaultValue: '' },
  halfwaterdicht: { label: 'Halfwaterdicht (h)', type: 'boolean' as const, defaultValue: false },
  dimmer: { label: 'Met dimmer', type: 'boolean' as const, defaultValue: false },
  verklikker: { label: 'Verklikkerlamp', type: 'boolean' as const, defaultValue: false },
  aantal_knoppen: { label: 'Aantal knoppen', type: 'number' as const, defaultValue: 1 },
  kring: { label: 'Kring', type: 'string' as const, defaultValue: '' },
});

export const schakelaarSymbols: SymbolDefinition[] = PRESETS.map(({ type, name, description, defaultType }) => ({
  type,
  category: 'schakelaars',
  name,
  description,
  width: 40,
  height: 40,
  connectionPoints: [
    { id: 'in', position: 'top', x: 20, y: 0 },
    { id: 'out', position: 'bottom', x: 20, y: 40 },
  ],
  properties: baseProperties(defaultType),
  Render: SchakelaarRender,
}));
