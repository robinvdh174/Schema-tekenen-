import { Circle, Group, Line, Rect, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import { FILL_BG, FILL_BLACK, FONT_FAMILY, STROKE_WIDTH, STROKE_WIDTH_MAIN, strokeFor } from './draw';

/* =========================================================================
 * Schakelaars — geometrie overgenomen van de goede (EDT) versie, ingepast in
 * de verticale conventie van deze editor (inkomende draad bovenaan op x=20).
 *
 * Basisvorm = een CIRKEL (bedieningspunt) met een schuine HEFBOOM. Het aantal
 * polen wordt aangeduid met korte dwarse streepjes op de hefboom. Varianten:
 *   - Wisselschakelaar : extra stub naar de tweede stand
 *   - Kruisschakelaar  : X-vorm (vier armen)
 *   - Dubbele aansteking: twee hefbomen in V-vorm
 *   - Dimmer / Wissel + dimmer: gevuld driehoekje aan de hefboom
 *   - Drukknop         : dubbele cirkel
 *   - Rolluikschakelaar: vierkantje met "S"
 *   - Bewegingsmelder  : kastje met "PIR"
 * ========================================================================= */

const TYPE_OPTIONS = [
  'Enkelpolig',
  'Tweepolig',
  'Driepolig',
  'Wisselschakelaar',
  'Kruisschakelaar',
  'Dubbele aansteking',
  'Dimmer',
  'Wissel + dimmer',
  'Drukknop',
  'Rolluikschakelaar',
  'Bewegingsmelder',
];

const POL_OPTIONS = ['—', '2P', '3P', '4P'];

// Gedeelde geometrie binnen de 40×40 box.
const CX = 20;
const C = { x: 20, y: 13 }; // cirkelcentrum (bedieningspunt), hoog zodat de
const R = 5; //               hefbomen er onder voldoende ruimte hebben
const LEN = 17; // lengte hoofd-hefboom vanaf het centrum

// Eenheidsrichtingen voor de hefbomen (omlaag = weg van de inkomende draad).
const DR = { x: 0.78, y: 0.63 }; // omlaag-rechts (hoofdstand)
const DL = { x: -0.78, y: 0.63 }; // omlaag-links
const UL = { x: -0.78, y: -0.63 }; // omhoog-links (tweede stand)
const UR = { x: 0.78, y: -0.63 }; // omhoog-rechts

const SchakelaarRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const type = String(properties.type?.value ?? 'Enkelpolig');
  const polen = String(properties.polen?.value ?? '—');
  const halfwaterdicht = Boolean(properties.halfwaterdicht?.value ?? false);
  const dimmer = Boolean(properties.dimmer?.value ?? false);
  const verklikker = Boolean(properties.verklikker?.value ?? false);
  const adres = String(properties.adres?.value ?? '');
  const aantalKnoppen = Number(properties.aantal_knoppen?.value ?? 0);

  // Pool-aantal: primair uit het type, eventueel overschreven door 'polen'.
  const polesFromType = type === 'Tweepolig' ? 2 : type === 'Driepolig' ? 3 : 1;
  const poles =
    polen === '2P' ? 2 : polen === '3P' ? 3 : polen === '4P' ? 4 : polesFromType;

  // Eén hefboom vanaf het bedieningspunt in richting d, met n dwarse streepjes
  // (= polen) vlak bij de tip.
  const lever = (d: { x: number; y: number }, len: number, n: number, key: string) => {
    const tip = { x: C.x + d.x * len, y: C.y + d.y * len };
    const perp = { x: -d.y, y: d.x };
    const out = [
      <Line
        key={`${key}m`}
        points={[C.x, C.y, tip.x, tip.y]}
        stroke={s}
        strokeWidth={STROKE_WIDTH_MAIN}
      />,
    ];
    for (let k = 0; k < n; k++) {
      const dist = len - 2 - k * 3.4;
      const px = C.x + d.x * dist;
      const py = C.y + d.y * dist;
      out.push(
        <Line
          key={`${key}t${k}`}
          points={[px - perp.x * 4, py - perp.y * 4, px + perp.x * 4, py + perp.y * 4]}
          stroke={s}
          strokeWidth={STROKE_WIDTH}
        />,
      );
    }
    return out;
  };

  const body: JSX.Element[] = [];

  if (type === 'Drukknop') {
    body.push(
      <Circle key="o" x={C.x} y={C.y} radius={6} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />,
      <Circle key="i" x={C.x} y={C.y} radius={3} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />,
    );
  } else if (type === 'Bewegingsmelder') {
    body.push(
      <Rect key="b" x={C.x - 9} y={C.y - 7} width={18} height={16} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />,
      <Text key="p" x={C.x - 9} y={C.y - 4} width={18} align="center" text="PIR" fontFamily={FONT_FAMILY} fontSize={8} fontStyle="bold" fill={s} />,
    );
  } else {
    // Hefbomen per type.
    if (type === 'Wisselschakelaar' || type === 'Wissel + dimmer') {
      body.push(...lever(DR, LEN, poles, 'a'), ...lever(UL, 9, 0, 'b'));
    } else if (type === 'Kruisschakelaar') {
      body.push(
        ...lever(DR, 13, 0, 'a'),
        ...lever(UL, 13, 0, 'b'),
        ...lever(DL, 13, 0, 'c'),
        ...lever(UR, 13, 0, 'd'),
      );
    } else if (type === 'Dubbele aansteking') {
      body.push(...lever(DR, LEN, 0, 'a'), ...lever(DL, LEN, 0, 'b'));
    } else if (type === 'Rolluikschakelaar') {
      body.push(...lever(DR, LEN, 0, 'a'), ...lever(DL, LEN, 0, 'b'));
    } else {
      body.push(...lever(DR, LEN, poles, 'a'));
    }

    // Gevuld driehoekje voor (licht)dimmer.
    if (type === 'Dimmer' || type === 'Wissel + dimmer' || (dimmer && type !== 'Drukknop')) {
      body.push(
        <Line
          key="dim"
          points={[C.x - 11, C.y + 9, C.x - 4, C.y + 9, C.x - 4, C.y + 2]}
          closed
          fill={FILL_BLACK}
          stroke={s}
          strokeWidth={1}
        />,
      );
    }

    // "S"-kastje voor rolluikschakelaar.
    if (type === 'Rolluikschakelaar') {
      body.push(
        <Rect key="rb" x={C.x - 8} y={C.y + 14} width={16} height={16} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />,
        <Text key="rs" x={C.x - 8} y={C.y + 16} width={16} align="center" text="S" fontFamily={FONT_FAMILY} fontSize={11} fontStyle="bold" fill={s} />,
      );
    }

    // Verklikkerlamp = klein cirkeltje met X erin, links van het bedieningspunt.
    if (verklikker) {
      body.push(
        <Circle key="vk" x={C.x - 12} y={C.y} radius={3} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />,
        <Line key="vk1" points={[C.x - 14, C.y - 2, C.x - 10, C.y + 2]} stroke={s} strokeWidth={STROKE_WIDTH} />,
        <Line key="vk2" points={[C.x - 14, C.y + 2, C.x - 10, C.y - 2]} stroke={s} strokeWidth={STROKE_WIDTH} />,
      );
    }

    // Bedieningspunt-cirkel bovenop de hefbomen.
    body.push(<Circle key="c" x={C.x} y={C.y} radius={R} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />);
  }

  return (
    <Group>
      {/* Inkomende geleider van bovenaf naar het bedieningspunt. */}
      <Line points={[CX, 0, CX, C.y - R]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />

      {/* Halfwaterdicht "h" links van de aansluitlijn. */}
      {halfwaterdicht ? (
        <Text x={CX - 13} y={1} text="h" fontFamily={FONT_FAMILY} fontStyle="600" fontSize={10} fill={s} />
      ) : null}

      {body}

      {/* Adres-label. */}
      {adres ? (
        <Text x={CX + 12} y={C.y - 6} text={adres} fontFamily={FONT_FAMILY} fontSize={9} fontStyle="italic" fill={s} />
      ) : null}
      {/* Aantal knoppen. */}
      {aantalKnoppen > 1 ? (
        <Text x={CX + 12} y={2} text={`x${aantalKnoppen}`} fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
      ) : null}
      {/* Polen-label (alleen tonen bij expliciete keuze). */}
      {polen && polen !== '—' ? (
        <Text x={CX + 12} y={C.y + 6} text={polen} fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
      ) : null}
    </Group>
  );
};

type SchakelaarType = (typeof TYPE_OPTIONS)[number];

const PRESETS: { type: string; name: string; description: string; defaultType: SchakelaarType }[] = [
  { type: 'schakelaar_enkel', name: 'Enkelpolig', description: 'Enkelpolige schakelaar', defaultType: 'Enkelpolig' },
  { type: 'schakelaar_twee', name: 'Tweepolig', description: 'Tweepolige schakelaar', defaultType: 'Tweepolig' },
  { type: 'schakelaar_drie', name: 'Driepolig', description: 'Driepolige schakelaar', defaultType: 'Driepolig' },
  { type: 'schakelaar_wissel', name: 'Wisselschakelaar', description: 'Wisselschakelaar', defaultType: 'Wisselschakelaar' },
  { type: 'schakelaar_kruis', name: 'Kruisschakelaar', description: 'Kruisschakelaar', defaultType: 'Kruisschakelaar' },
  { type: 'schakelaar_dubbele_aansteking', name: 'Dubbele aansteking', description: 'Twee aanstekingen vanaf één punt', defaultType: 'Dubbele aansteking' },
  { type: 'schakelaar_dimmer', name: 'Dimmer', description: 'Lichtdimmer', defaultType: 'Dimmer' },
  { type: 'schakelaar_wissel_dimmer', name: 'Wissel + dimmer', description: 'Wisselschakelaar met dimmer', defaultType: 'Wissel + dimmer' },
  { type: 'schakelaar_drukknop', name: 'Drukknop', description: 'Drukknop / belknop', defaultType: 'Drukknop' },
  { type: 'schakelaar_rolluik', name: 'Rolluikschakelaar', description: 'Rolluikschakelaar (op/neer)', defaultType: 'Rolluikschakelaar' },
  { type: 'schakelaar_beweging', name: 'Bewegingsmelder', description: 'Bewegingsmelder (PIR)', defaultType: 'Bewegingsmelder' },
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
