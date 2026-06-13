import { Circle, Group, Line, Rect, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import { FILL_BG, FONT_FAMILY, STROKE_WIDTH, STROKE_WIDTH_MAIN, strokeFor } from './draw';

/* =========================================================================
 * Contactdoos (stopcontact) — Trikker conventies
 *
 * Het basis-symbool is één halve cirkel met diameter bovenaan en bolling
 * naar onder, hangend aan een korte aansluitlijn van bovenaf.
 *
 * Parameters die het uiterlijk wijzigen:
 *   polen           - '1P' | '3P' | '3P+N' → 0 / 3 / 4 schuine streepjes
 *   nulgeleider     - bolletje (•) op de aansluitlijn na de streepjes
 *   pe              - verticale streep BINNEN de halve cirkel (PE)
 *   halfwaterdicht  - kleine "h" boven de aansluitlijn
 *   schakelaar      - schuine streep van een schakelaarcontact erboven
 *   tekst           - label rechts naast (bv. "32A")
 *   aantal          - 1, 2 of 3 — meerdere halve cirkels gestapeld
 *   in_verdeelbord  - vierkant kader rond het symbool
 *   transformator   - cirkeltje aan de zijkant
 * ========================================================================= */

const POL_OPTIONS = ['1P', '3P', '3P+N'];

/** Genereer een halve cirkel (diameter boven, bolling onder) als Konva Line points. */
const halfCircleDownPoints = (cx: number, cy: number, r: number, segments = 24): number[] => {
  const out: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = Math.PI - Math.PI * t; // π → 0 (links → rechts via boven)
    out.push(cx - r * Math.cos(angle));
    out.push(cy + r * Math.sin(angle));
  }
  return out;
};

const ContactdoosRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const polen = String(properties.polen?.value ?? '1P');
  const nulgeleider = Boolean(properties.nulgeleider?.value ?? false);
  const pe = Boolean(properties.pe?.value ?? true);
  const halfwaterdicht = Boolean(properties.halfwaterdicht?.value ?? false);
  const schakelaar = Boolean(properties.schakelaar?.value ?? false);
  const tekst = String(properties.tekst?.value ?? '');
  const aantal = Math.max(1, Math.min(3, Number(properties.aantal?.value ?? 1)));
  const inVerdeelbord = Boolean(properties.in_verdeelbord?.value ?? false);
  const transformator = Boolean(properties.transformator?.value ?? false);

  const cx = 20;
  const r = 10;
  const aansluitTop = 0;
  const halfCircleY = 24; // y-positie van diameter (= top van halve cirkel)

  // Aantal schuine streepjes op de aansluitlijn voor fase-aanduiding
  const fasenCount = polen === '3P' || polen === '3P+N' ? 3 : 0;
  const slashSpacing = 3;
  const slashLen = 5;

  return (
    <Group>
      {/* Aansluitlijn van bovenaf */}
      <Line points={[cx, aansluitTop, cx, halfCircleY]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />

      {/* Halfwaterdicht: kleine "h" links naast de aansluitlijn */}
      {halfwaterdicht ? (
        <Text
          x={cx - 14}
          y={2}
          text="h"
          fontFamily={FONT_FAMILY}
          fontStyle="600"
          fontSize={10}
          fill={s}
        />
      ) : null}

      {/* Schakelaar ingebouwd: schuine streep voor een schakelaarcontact bovenop */}
      {schakelaar ? (
        <Line points={[cx, 14, cx + 9, 6]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      ) : null}

      {/* Schuine streepjes (fasen) */}
      {Array.from({ length: fasenCount }).map((_, i) => {
        const xCenter = cx - ((fasenCount - 1) * slashSpacing) / 2 + i * slashSpacing;
        const yCenter = halfCircleY - 10;
        return (
          <Line
            key={`fase-${i}`}
            points={[xCenter - slashLen / 2, yCenter + slashLen / 2, xCenter + slashLen / 2, yCenter - slashLen / 2]}
            stroke={s}
            strokeWidth={STROKE_WIDTH}
          />
        );
      })}
      {/* Nulgeleider (•) na de schuine streepjes */}
      {(nulgeleider || polen === '3P+N') ? (
        <Circle
          x={cx + (fasenCount > 0 ? (fasenCount * slashSpacing) / 2 + 3 : 4)}
          y={halfCircleY - 10}
          radius={1.6}
          fill={s}
        />
      ) : null}

      {/* Transformator ingebouwd: cirkeltje rechts van de aansluitlijn */}
      {transformator ? (
        <Circle x={cx + 7} y={halfCircleY - 8} radius={3.5} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      ) : null}

      {/* Halve cirkel(s) - diameter boven, bolling onder */}
      {Array.from({ length: aantal }).map((_, i) => {
        const cy = halfCircleY + i * 8;
        return (
          <Line
            key={`half-${i}`}
            points={halfCircleDownPoints(cx, cy, r)}
            stroke={s}
            strokeWidth={STROKE_WIDTH}
            tension={0}
            closed={false}
          />
        );
      })}
      {/* Diameter (horizontaal lijntje bovenaan eerste halve cirkel) */}
      <Line points={[cx - r, halfCircleY, cx + r, halfCircleY]} stroke={s} strokeWidth={STROKE_WIDTH} />

      {/* PE-streep binnen halve cirkel */}
      {pe ? (
        <Line
          points={[cx, halfCircleY + 1, cx, halfCircleY + r - 1]}
          stroke={s}
          strokeWidth={STROKE_WIDTH}
        />
      ) : null}

      {/* In verdeelbord: vierkant kader rond het symbool */}
      {inVerdeelbord ? (
        <Rect
          x={cx - r - 3}
          y={halfCircleY - 4}
          width={2 * r + 6}
          height={r + 8 + (aantal - 1) * 8}
          stroke={s}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
        />
      ) : null}

      {/* Label rechts (bv. "32A") */}
      {tekst ? (
        <Text
          x={cx + r + 4}
          y={halfCircleY + 2}
          text={tekst}
          fontFamily={FONT_FAMILY}
          fontSize={10}
          fontStyle="600"
          fill={s}
        />
      ) : null}
    </Group>
  );
};

/* --- Communicatiecontactdoos (RJ45) ------------------------------------- */
const ContactdoosCommunicatieRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const tekst = String(properties.tekst?.value ?? 'UTP Cat6');
  return (
    <Group>
      <Line points={[20, 0, 20, 14]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />
      {/* Rechthoekige plug-vorm */}
      <Line points={[10, 14, 30, 14]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[10, 14, 10, 24]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[30, 14, 30, 24]} stroke={s} strokeWidth={STROKE_WIDTH} />
      <Line points={[10, 24, 30, 24]} stroke={s} strokeWidth={STROKE_WIDTH} />
      {tekst ? (
        <Text x={36} y={14} text={tekst} fontFamily={FONT_FAMILY} fontSize={10} fill={s} />
      ) : null}
    </Group>
  );
};

interface CdPreset {
  type: string;
  name: string;
  description: string;
  polen?: string;
  nulgeleider?: boolean;
  pe?: boolean;
  halfwaterdicht?: boolean;
  schakelaar?: boolean;
  aantal?: number;
  tekst?: string;
}

const CONTACTDOOS_PRESETS: CdPreset[] = [
  { type: 'contactdoos', name: 'Contactdoos', description: 'Standaard stopcontact 2P+A' },
  { type: 'contactdoos_dubbel', name: 'Dubbele contactdoos', description: 'Dubbel stopcontact', aantal: 2 },
  { type: 'contactdoos_drievoudig', name: 'Drievoudige contactdoos', description: 'Drievoudig stopcontact', aantal: 3 },
  { type: 'contactdoos_h', name: 'Halfwaterdicht', description: 'Stopcontact halfwaterdicht (h)', halfwaterdicht: true },
  { type: 'contactdoos_schakelaar', name: 'Met schakelaar', description: 'Stopcontact met schakelaar', schakelaar: true },
  { type: 'contactdoos_kookplaat', name: 'Kookplaat (3P+N)', description: '3-fasen stopcontact met N+PE', polen: '3P+N', nulgeleider: true, tekst: '32A' },
  { type: 'contactdoos_3p', name: 'Drie-fase (3P+PE)', description: 'Drie-fase stopcontact', polen: '3P', tekst: '16A' },
];

const contactdoosProperties = (preset: CdPreset) => ({
  polen: { label: 'Polen', type: 'select' as const, defaultValue: preset.polen ?? '1P', options: POL_OPTIONS },
  nulgeleider: { label: 'Nulgeleider (N)', type: 'boolean' as const, defaultValue: preset.nulgeleider ?? false },
  pe: { label: 'Beschermingsgeleider (PE)', type: 'boolean' as const, defaultValue: preset.pe ?? true },
  halfwaterdicht: { label: 'Halfwaterdicht (h)', type: 'boolean' as const, defaultValue: preset.halfwaterdicht ?? false },
  schakelaar: { label: 'Schakelaar ingebouwd', type: 'boolean' as const, defaultValue: preset.schakelaar ?? false },
  transformator: { label: 'Transformator ingebouwd', type: 'boolean' as const, defaultValue: false },
  in_verdeelbord: { label: 'In verdeelbord', type: 'boolean' as const, defaultValue: false },
  aantal: { label: 'Aantal', type: 'number' as const, defaultValue: preset.aantal ?? 1 },
  tekst: { label: 'Tekst', type: 'string' as const, defaultValue: preset.tekst ?? '' },
  kring: { label: 'Kring', type: 'string' as const, defaultValue: '' },
});

export const stopcontactSymbols: SymbolDefinition[] = [
  ...CONTACTDOOS_PRESETS.map((preset) => ({
    type: preset.type,
    category: 'stopcontacten' as const,
    name: preset.name,
    description: preset.description,
    width: 40,
    height: 50,
    connectionPoints: [{ id: 'in', position: 'top' as const, x: 20, y: 0 }],
    properties: contactdoosProperties(preset),
    Render: ContactdoosRender,
  })),
  {
    type: 'contactdoos_communicatie',
    category: 'stopcontacten',
    name: 'Contactdoos communicatie',
    description: 'Data / netwerk / RJ45',
    width: 40,
    height: 30,
    connectionPoints: [{ id: 'in', position: 'top', x: 20, y: 0 }],
    properties: {
      tekst: { label: 'Tekst', type: 'string', defaultValue: 'UTP Cat6' },
    },
    Render: ContactdoosCommunicatieRender,
  },
];
