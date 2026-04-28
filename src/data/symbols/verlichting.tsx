import { Circle, Group, Line, Rect, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import { FILL_BG, FILL_BLACK, FONT_FAMILY, STROKE_WIDTH, STROKE_WIDTH_MAIN, strokeFor } from './draw';

/* =========================================================================
 * Lichtpunten — Trikker conventies
 *
 * Het basis lichtpunt-symbool is een KRUIS (X), géén cirkel.
 * Spot = cirkel met X, TL = rechthoek, LED = rechthoek met diode-driehoek,
 * Noodverlichting = X met gevuld vierkantje, Signalisatielamp = cirkel met X.
 * ========================================================================= */

const TYPE_OPTIONS = ['Lichtpunt', 'Spot', 'TL', 'LED', 'LED-strip', 'Noodverlichting', 'Signalisatielamp', 'Wandverlichting'];

const LichtpuntRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const type = String(properties.type?.value ?? 'Lichtpunt');
  const aantal = Number(properties.aantal?.value ?? 1);
  const halfwaterdicht = Boolean(properties.halfwaterdicht?.value ?? false);
  const noodverlichting = String(properties.noodverlichting?.value ?? 'Geen'); // Geen / Centraal / Decentraal
  const wandverlichting = Boolean(properties.wandverlichting?.value ?? false);
  const sensorIngebouwd = String(properties.sensor?.value ?? 'Geen'); // Geen / Infrarood
  const schakelaarIngebouwd = Boolean(properties.schakelaar?.value ?? false);
  const adres = String(properties.adres?.value ?? '');
  const tekst = String(properties.tekst?.value ?? '');

  const cx = 20;
  const yTop = 0;
  const yCenter = 24;
  const armLen = 8;

  const drawX = (color: string) => (
    <>
      <Line
        points={[cx - armLen, yCenter - armLen, cx + armLen, yCenter + armLen]}
        stroke={color}
        strokeWidth={STROKE_WIDTH_MAIN}
      />
      <Line
        points={[cx - armLen, yCenter + armLen, cx + armLen, yCenter - armLen]}
        stroke={color}
        strokeWidth={STROKE_WIDTH_MAIN}
      />
    </>
  );

  return (
    <Group>
      {/* Aansluitlijn van bovenaf */}
      <Line points={[cx, yTop, cx, yCenter - armLen]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />

      {/* Halfwaterdicht "h" links */}
      {halfwaterdicht ? (
        <Text x={cx - 14} y={2} text="h" fontFamily={FONT_FAMILY} fontStyle="600" fontSize={10} fill={s} />
      ) : null}

      {type === 'Lichtpunt' || type === 'Wandverlichting' ? (
        <>
          {drawX(s)}
          {(wandverlichting || type === 'Wandverlichting') ? (
            <Line points={[cx - armLen - 2, yCenter + armLen + 2, cx + armLen + 2, yCenter + armLen + 2]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
          ) : null}
        </>
      ) : null}

      {type === 'Spot' || type === 'Signalisatielamp' ? (
        <>
          <Circle x={cx} y={yCenter} radius={armLen} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
          {drawX(s)}
        </>
      ) : null}

      {type === 'TL' ? (
        <>
          <Rect x={cx - 14} y={yCenter - 4} width={28} height={8} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
          <Line points={[cx - 14, yCenter, cx + 14, yCenter]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {type === 'LED' ? (
        // Diode-symbool: driehoek + verticale streep
        <>
          <Line points={[cx - 6, yCenter - 6, cx + 6, yCenter, cx - 6, yCenter + 6, cx - 6, yCenter - 6]} closed stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
          <Line points={[cx + 6, yCenter - 6, cx + 6, yCenter + 6]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {type === 'LED-strip' ? (
        // Reeks diodes
        Array.from({ length: 3 }).map((_, i) => (
          <Line
            key={i}
            points={[cx - 14 + i * 10, yCenter - 4, cx - 14 + i * 10 + 6, yCenter, cx - 14 + i * 10, yCenter + 4, cx - 14 + i * 10, yCenter - 4]}
            closed
            stroke={s}
            strokeWidth={STROKE_WIDTH}
            fill={FILL_BG}
          />
        ))
      ) : null}

      {type === 'Noodverlichting' ? (
        // X met klein gevuld vierkantje in midden
        <>
          {drawX(s)}
          <Rect x={cx - 3} y={yCenter - 3} width={6} height={6} fill={FILL_BLACK} />
        </>
      ) : null}

      {/* Sensor ingebouwd */}
      {sensorIngebouwd === 'Infrarood' && (type === 'Lichtpunt' || type === 'Wandverlichting') ? (
        <>
          <Line points={[cx - 14, yCenter - 14, cx - 8, yCenter - 8]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[cx - 14, yCenter - 14, cx - 11, yCenter - 11]} stroke={s} strokeWidth={STROKE_WIDTH} />
          <Line points={[cx - 14, yCenter - 14, cx - 14, yCenter - 11]} stroke={s} strokeWidth={STROKE_WIDTH} />
        </>
      ) : null}

      {/* Schakelaar ingebouwd: schuine streepje boven X */}
      {schakelaarIngebouwd ? (
        <Line points={[cx + 6, yCenter - 18, cx + 14, yCenter - 10]} stroke={s} strokeWidth={STROKE_WIDTH} />
      ) : null}

      {/* Centraal/Decentraal noodverlichting */}
      {noodverlichting === 'Centraal' ? (
        <Circle x={cx} y={yCenter} radius={3.5} fill={FILL_BLACK} />
      ) : null}
      {noodverlichting === 'Decentraal' ? (
        <Rect x={cx - 4} y={yCenter - 4} width={8} height={8} fill={FILL_BLACK} />
      ) : null}

      {/* Aantal label */}
      {aantal > 1 ? (
        <Text x={cx - 6} y={2} text={`x${aantal}`} fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
      ) : null}

      {/* Adres-label */}
      {adres ? (
        <Text x={cx + armLen + 4} y={yCenter - 6} text={adres} fontFamily={FONT_FAMILY} fontSize={9} fontStyle="italic" fill={s} />
      ) : null}

      {/* Vrij tekstveld */}
      {tekst ? (
        <Text x={cx + armLen + 4} y={yCenter + 4} text={tekst} fontFamily={FONT_FAMILY} fontSize={9} fill={s} />
      ) : null}
    </Group>
  );
};

/* --- Luidspreker -------------------------------------------------------- */
const LuidsprekerRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const adres = String(properties.adres?.value ?? '');
  return (
    <Group>
      <Line points={[20, 0, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {/* Trapezium-vorm van een speaker */}
      <Line points={[10, 14, 30, 14, 26, 26, 14, 26, 10, 14]} stroke={s} strokeWidth={STROKE_WIDTH} closed fill={FILL_BG} />
      {adres ? (
        <Text x={32} y={16} text={adres} fontFamily={FONT_FAMILY} fontSize={10} fill={s} />
      ) : null}
    </Group>
  );
};

const LICHTPUNT_PRESETS: { type: string; name: string; description: string; defaultType: string; extra?: Record<string, string | boolean> }[] = [
  { type: 'lichtpunt', name: 'Lichtpunt', description: 'Plafondlichtpunt (X)', defaultType: 'Lichtpunt' },
  { type: 'lichtpunt_wand', name: 'Wandverlichting', description: 'Wandverlichting', defaultType: 'Wandverlichting', extra: { wandverlichting: true } },
  { type: 'lichtpunt_spot', name: 'Spot', description: 'Inbouwspot', defaultType: 'Spot' },
  { type: 'lichtpunt_tl', name: 'TL', description: 'TL-armatuur', defaultType: 'TL' },
  { type: 'lichtpunt_led', name: 'LED', description: 'LED-armatuur', defaultType: 'LED' },
  { type: 'lichtpunt_led_strip', name: 'LED-strip', description: 'LED-strip', defaultType: 'LED-strip' },
  { type: 'lichtpunt_nood', name: 'Noodverlichting', description: 'Noodverlichtingsarmatuur', defaultType: 'Noodverlichting', extra: { noodverlichting: 'Decentraal' } },
  { type: 'lichtpunt_signalisatie', name: 'Signalisatielamp', description: 'Signalisatielamp', defaultType: 'Signalisatielamp' },
];

const lichtpuntProperties = (defaultType: string, extra: Record<string, string | boolean> = {}) => ({
  type: { label: 'Type', type: 'select' as const, defaultValue: defaultType, options: TYPE_OPTIONS },
  aantal: { label: 'Aantal', type: 'number' as const, defaultValue: 1 },
  adres: { label: 'Adres', type: 'string' as const, defaultValue: '' },
  tekst: { label: 'Tekst', type: 'string' as const, defaultValue: '' },
  halfwaterdicht: { label: 'Halfwaterdicht (h)', type: 'boolean' as const, defaultValue: false },
  wandverlichting: { label: 'Wandverlichting', type: 'boolean' as const, defaultValue: Boolean(extra.wandverlichting ?? false) },
  noodverlichting: {
    label: 'Noodverlichting',
    type: 'select' as const,
    defaultValue: String(extra.noodverlichting ?? 'Geen'),
    options: ['Geen', 'Centraal', 'Decentraal'],
  },
  sensor: { label: 'Sensor ingebouwd', type: 'select' as const, defaultValue: 'Geen', options: ['Geen', 'Infrarood'] },
  schakelaar: { label: 'Schakelaar ingebouwd', type: 'boolean' as const, defaultValue: false },
  kring: { label: 'Kring', type: 'string' as const, defaultValue: '' },
});

export const verlichtingSymbols: SymbolDefinition[] = [
  ...LICHTPUNT_PRESETS.map(({ type, name, description, defaultType, extra }) => ({
    type,
    category: 'verlichting' as const,
    name,
    description,
    width: 40,
    height: 44,
    connectionPoints: [{ id: 'in', position: 'top' as const, x: 20, y: 0 }],
    properties: lichtpuntProperties(defaultType, extra),
    Render: LichtpuntRender,
  })),
  {
    type: 'luidspreker',
    category: 'verlichting',
    name: 'Luidspreker',
    description: 'Luidspreker',
    width: 40,
    height: 32,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      adres: { label: 'Adres', type: 'string', defaultValue: '' },
      aantal: { label: 'Aantal', type: 'number', defaultValue: 1 },
    },
    Render: LuidsprekerRender,
  },
];
