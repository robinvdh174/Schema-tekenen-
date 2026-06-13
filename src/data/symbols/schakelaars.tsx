import { Circle, Group, Line, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import { FILL_BG, FILL_BLACK, FONT_FAMILY, STROKE_WIDTH, STROKE_WIDTH_MAIN, strokeFor } from './draw';

/* =========================================================================
 * Schakelaars — volgens het Volta-document "Symbolen eendraadschema".
 *
 * Basisvorm = een CIRKEL (bedieningspunt) met een schuine HEFBOOM naar
 * boven-rechts die eindigt in een klein haakje (vast contact). Het aantal
 * polen wordt aangeduid met korte dwarsstreepjes ("veren") op de hefboom.
 * Varianten:
 *   - Wisselschakelaar: extra stub naar onder-links (tweede stand)
 *   - Kruisschakelaar: X-vorm (vier armen)
 *   - Dubbele aansteking: twee hefbomen in V-vorm
 *   - Dimmer: driehoekje aan de hefboom
 *   - Trekschakelaar: pijl naar beneden over de hefboom
 *   - Drukknop: dubbele cirkel
 *   - Verklikkerlamp: kruis (⊗) in de cirkel
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

// Gedeelde geometrie binnen de 40×40 box.
const CX = 20;
const C = { x: 20, y: 27 }; // cirkelcentrum (bedieningspunt)
const R = 5.5;
const T = { x: 31, y: 13 }; // tip hefboom (vast contact, boven-rechts)

/** Punt op de rand van de cirkel in de richting van een doelpunt. */
const edgePoint = (target: { x: number; y: number }) => {
  const dx = target.x - C.x;
  const dy = target.y - C.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: C.x + (dx / len) * R, y: C.y + (dy / len) * R };
};

const SchakelaarRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const type = String(properties.type?.value ?? 'Enkelpolig');
  const polen = String(properties.polen?.value ?? '—');
  const halfwaterdicht = Boolean(properties.halfwaterdicht?.value ?? false);
  const dimmer = Boolean(properties.dimmer?.value ?? false);
  const verklikker = Boolean(properties.verklikker?.value ?? false);
  const adres = String(properties.adres?.value ?? '');
  const aantalKnoppen = Number(properties.aantal_knoppen?.value ?? 0);

  const poleCount =
    polen === '2P' ? 2 : polen === '3P' ? 3 : polen === '4P' ? 4 : type === 'Dubbelpolig' ? 2 : 1;
  const isDrukknop = type === 'Drukknop';

  // Hefboom-richting (cirkelrand → tip) en loodrechte richting voor de veren.
  const start = edgePoint(T);
  const dx = T.x - start.x;
  const dy = T.y - start.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy; // loodrecht
  const py = ux;

  // Korte dwarsstreepjes ("veren") = extra polen, vlak onder de tip.
  const feathers = Array.from({ length: Math.max(0, poleCount - 1) }).map((_, i) => {
    const d = 4 + i * 3.2; // afstand vanaf de tip terug langs de hefboom
    const bx = T.x - ux * d;
    const by = T.y - uy * d;
    const fl = 3.2;
    return [bx - px * fl, by - py * fl, bx + px * fl, by + py * fl];
  });

  // Klein haakje aan de tip.
  const hook = [T.x, T.y, T.x - 3.5, T.y - 1.5];

  return (
    <Group>
      {/* Inkomende geleider (haaks) naar de tip/vast contact */}
      <Line points={[CX, 0, CX, T.y, T.x, T.y]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />

      {/* Halfwaterdicht "h" links van de aansluitlijn */}
      {halfwaterdicht ? (
        <Text x={CX - 13} y={1} text="h" fontFamily={FONT_FAMILY} fontStyle="600" fontSize={10} fill={s} />
      ) : null}

      {/* Bedieningspunt (cirkel) — drukknop = dubbele cirkel, anders gewone cirkel */}
      {isDrukknop ? (
        <>
          <Circle x={C.x} y={C.y} radius={R + 2.5} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
          {verklikker ? (
            <>
              <Circle x={C.x} y={C.y} radius={R - 1.5} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
              <Line points={[C.x - 3, C.y - 3, C.x + 3, C.y + 3]} stroke={s} strokeWidth={STROKE_WIDTH} />
              <Line points={[C.x - 3, C.y + 3, C.x + 3, C.y - 3]} stroke={s} strokeWidth={STROKE_WIDTH} />
            </>
          ) : (
            <Circle x={C.x} y={C.y} radius={2.2} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
          )}
        </>
      ) : (
        <>
          <Circle x={C.x} y={C.y} radius={R} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
          {/* Verklikkerlamp = kruis in de cirkel (⊗) */}
          {verklikker ? (
            <>
              <Line points={[C.x - 3.8, C.y - 3.8, C.x + 3.8, C.y + 3.8]} stroke={s} strokeWidth={STROKE_WIDTH} />
              <Line points={[C.x - 3.8, C.y + 3.8, C.x + 3.8, C.y - 3.8]} stroke={s} strokeWidth={STROKE_WIDTH} />
            </>
          ) : null}
        </>
      )}

      {/* Hefboom + varianten (niet bij drukknop) */}
      {!isDrukknop ? (
        <>
          {/* Hoofdhefboom naar boven-rechts met haakje */}
          {type !== 'Kruis' ? (
            <>
              <Line points={[start.x, start.y, T.x, T.y]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
              <Line points={hook} stroke={s} strokeWidth={STROKE_WIDTH} />
              {feathers.map((pts, i) => (
                <Line key={`f-${i}`} points={pts} stroke={s} strokeWidth={STROKE_WIDTH} />
              ))}
            </>
          ) : null}

          {/* Tweede hefboom naar boven-links (V) = dubbele aansteking */}
          {type === 'Dubbele aansteking' ? (
            <>
              <Line points={[edgePoint({ x: 9, y: 13 }).x, edgePoint({ x: 9, y: 13 }).y, 9, 13]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
              <Line points={[9, 13, 12, 14.5]} stroke={s} strokeWidth={STROKE_WIDTH} />
            </>
          ) : null}

          {/* Stub naar onder-links = wisselstand */}
          {type === 'Wissel' || type === 'Dubbele wissel' ? (
            <>
              <Line points={[edgePoint({ x: 9, y: 38 }).x, edgePoint({ x: 9, y: 38 }).y, 10, 37]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
              <Line points={[10, 37, 13, 35.5]} stroke={s} strokeWidth={STROKE_WIDTH} />
            </>
          ) : null}

          {/* Kruisschakelaar = X met vier armen + haakjes */}
          {type === 'Kruis' ? (
            <>
              {[
                { x: 31, y: 13 },
                { x: 9, y: 13 },
                { x: 31, y: 41 },
                { x: 9, y: 41 },
              ].map((arm, i) => {
                const e = edgePoint(arm);
                return <Line key={`arm-${i}`} points={[e.x, e.y, arm.x, arm.y]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />;
              })}
            </>
          ) : null}

          {/* Dimmer = driehoekje aan de hefboom */}
          {type === 'Dimmer' || (dimmer && type !== 'Dimmer') ? (
            <Line points={[24, 18, 31, 15, 27, 21]} closed stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BLACK} />
          ) : null}

          {/* Trekschakelaar = pijl naar beneden over de hefboom */}
          {type === 'Trekschakelaar' ? (
            <>
              <Line points={[27, 13, 27, 23]} stroke={s} strokeWidth={STROKE_WIDTH} />
              <Line points={[24.5, 20, 27, 23, 29.5, 20]} stroke={s} strokeWidth={STROKE_WIDTH} />
            </>
          ) : null}

          {/* Rolluikschakelaar = op/neer-pijltjes links */}
          {type === 'Rolluikschakelaar' ? (
            <>
              <Line points={[10, 4, 10, 16]} stroke={s} strokeWidth={STROKE_WIDTH} />
              <Line points={[7, 7, 10, 4, 13, 7]} stroke={s} strokeWidth={STROKE_WIDTH} />
              <Line points={[7, 13, 10, 16, 13, 13]} stroke={s} strokeWidth={STROKE_WIDTH} />
            </>
          ) : null}
        </>
      ) : null}

      {/* Uitgaande geleider onderaan */}
      <Line points={[CX, C.y + R, CX, 40]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />

      {/* Adres-label */}
      {adres ? (
        <Text x={CX + 14} y={2} text={adres} fontFamily={FONT_FAMILY} fontSize={9} fontStyle="italic" fill={s} />
      ) : null}
      {/* Aantal knoppen */}
      {aantalKnoppen > 1 ? (
        <Text x={CX + 14} y={20} text={`×${aantalKnoppen}`} fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
      ) : null}
      {/* Polen-label */}
      {polen && polen !== '—' ? (
        <Text x={2} y={30} text={polen} fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
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
