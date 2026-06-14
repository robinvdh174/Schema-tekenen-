import { Group, Line, Rect, Text } from 'react-konva';
import type { SymbolDefinition, SymbolRenderProps } from '@/types/symbols';
import { FILL_BG, FONT_FAMILY, STROKE_WIDTH, STROKE_WIDTH_MAIN, STROKE_WIDTH_THIN, strokeFor } from './draw';

/* =========================================================================
 * Beveiliging — AREI / Volta-conventies (Symbolen eendraadschema)
 *
 * Volgens het officiële Volta-document worden automaat, differentieel-
 * schakelaar en (kleine) vermogensschakelaar IDENTIEK getekend:
 *   verticale doorvoerlijn → klein zwart vast contact → schuin open contact.
 * Het enige verschil zit in het label naast het symbool:
 *   - Automaat                 → "2P - C 20A"
 *   - Differentieelschakelaar  → "Δ300mA 2P-40A / Type A"
 *   - Differentieelautomaat    → "Δ300mA 2P-M40A / Type A"
 * Een differentieel krijgt dus GEEN extra dwarsstreepje.
 *
 * Optioneel kan per beveiliging de uitgaande kabel (type + doorsnede)
 * worden meegegeven; die wordt als label langs de uitgaande lijn getekend
 * (zoals in Trikker), zodat de kabelkeuze niet vergeten wordt.
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

/** Types die als beschermingsautomaat getekend worden (met zwart vast contact). */
const BREAKER_TYPES = new Set(['Automaat', 'Differentieelschakelaar', 'Differentieelautomaat']);

/**
 * Universeel beveiligings-/contactsymbool volgens de Volta-conventie:
 * een verticale doorvoerlijn met een schuin open contact. Beschermings-
 * automaten (automaat/differentieel) krijgen daarbij een klein zwart vast
 * contact. Het `type` bepaalt verder enkel het label, niet de vorm.
 */
const AutomaatRender = ({ state, properties }: SymbolRenderProps) => {
  const s = strokeFor(state);
  const type = String(properties.type?.value ?? 'Automaat');
  const polen = String(properties.polen?.value ?? '2P');
  const amp = String(properties.amperage?.value ?? '16A');
  const curve = String(properties.curve?.value ?? 'C');
  const sensitivity = String(properties.gevoeligheid?.value ?? '300mA');
  const diffType = String(properties.diff_type?.value ?? 'A');
  const kabel = String(properties.kabel?.value ?? '').trim();

  // Geometrie van het contact (binnen de 40×50 box, geleider op x = cx).
  //
  // AREI/Volta-conventie (zie officieel document, sectie D):
  //   - Inkomende geleider komt verticaal van boven en stopt met een kleine
  //     onderbreking (= het open contact).
  //   - Het beweegbare contact is een schuine arm die DRAAIT op de uitgaande
  //     geleider (draaipunt onderaan) en SCHUIN OMHOOG NAAR LINKS wijst.
  //   - Beschermingsautomaten (automaat/differentieel) krijgen aan het vrije
  //     uiteinde van de arm een klein zwart VAST CONTACT (gekanteld vierkantje).
  const cx = 20;
  const yIn = 14; // onderkant inkomende geleider (boven de onderbreking)
  const yPivot = 34; // draaipunt op de uitgaande geleider
  const armEnd = { x: cx - 10, y: 16 }; // vrij uiteinde van de schuine arm (links boven)
  const isBreaker = BREAKER_TYPES.has(type);

  // Hoofdlabel rechts van het symbool.
  const label = (() => {
    const p = polen ? polen : '';
    if (type === 'Differentieelschakelaar') return `Δ${sensitivity} ${p}-${amp}\nType ${diffType}`;
    if (type === 'Differentieelautomaat') return `Δ${sensitivity} ${p}-M${amp}\nType ${diffType}`;
    if (type === 'Automaat')
      return curve && curve !== '—' ? `${p} - ${curve} ${amp}` : `${p} - ${amp}`;
    return p;
  })();

  return (
    <Group>
      {/* Inkomende geleider boven (stopt met onderbreking = open contact) */}
      <Line points={[cx, 0, cx, yIn]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />

      {/* Schuin (open) beweegbaar contact: van draaipunt omhoog naar links */}
      <Line points={[cx, yPivot, armEnd.x, armEnd.y]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />

      {/* Vast contact: klein gekanteld zwart vierkantje aan het vrije uiteinde
          van de arm (enkel bij beschermingsautomaten) */}
      {isBreaker ? (
        <Line
          points={[armEnd.x, armEnd.y - 3.5, armEnd.x + 3.5, armEnd.y, armEnd.x, armEnd.y + 3.5, armEnd.x - 3.5, armEnd.y]}
          stroke={s}
          strokeWidth={STROKE_WIDTH_THIN}
          closed
          fill={s}
        />
      ) : null}

      {/* Zekeringscheider: smeltzekering (rechthoekje) op de uitgaande lijn */}
      {type === 'Zekeringscheider' ? (
        <Rect x={cx - 4} y={38} width={8} height={9} stroke={s} strokeWidth={STROKE_WIDTH} fill={FILL_BG} />
      ) : null}

      {/* Uitgaande geleider beneden */}
      <Line points={[cx, yPivot, cx, 50]} stroke={s} strokeWidth={STROKE_WIDTH_MAIN} />

      {/* Hoofdlabel rechts van het symbool */}
      {label ? (
        <Text
          x={32}
          y={9}
          text={label}
          fontFamily={FONT_FAMILY}
          fontSize={10}
          fontStyle="600"
          lineHeight={1.2}
          fill={s}
        />
      ) : null}

      {/* Kabel langs de uitgaande lijn (zoals Trikker), bv. "XVB 3G2.5" */}
      {kabel ? (
        <Text
          x={cx + 5}
          y={39}
          text={kabel}
          fontFamily={FONT_FAMILY}
          fontSize={8.5}
          fontStyle="italic"
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

const AUTOMAAT_PRESETS: { type: string; name: string; description: string; defaultType: string }[] = [
  { type: 'automaat', name: 'Automaat', description: 'Automatische zekering', defaultType: 'Automaat' },
  { type: 'differentieelschakelaar', name: 'Differentieelschakelaar', description: 'Differentieelschakelaar (Δ)', defaultType: 'Differentieelschakelaar' },
  { type: 'differentieelautomaat', name: 'Differentieelautomaat', description: 'Combineert automaat + differentieel', defaultType: 'Differentieelautomaat' },
  { type: 'zekeringscheider', name: 'Zekeringscheider', description: 'Zekeringscheider', defaultType: 'Zekeringscheider' },
  { type: 'draaischakelaar', name: 'Draaischakelaar', description: 'Draaischakelaar in bord', defaultType: 'Draaischakelaar' },
  { type: 'schemerschakelaar_bord', name: 'Schemerschakelaar', description: 'Schemerschakelaar in bord', defaultType: 'Schemerschakelaar' },
  { type: 'contact', name: 'Contact', description: 'Algemeen schakelcontact', defaultType: 'Contact' },
];

const automaatProperties = (defaultType: string) => ({
  type: { label: 'Type', type: 'select' as const, defaultValue: defaultType, options: TYPE_OPTIONS },
  polen: { label: 'Polen', type: 'select' as const, defaultValue: '2P', options: POL_OPTIONS },
  amperage: { label: 'Amperage', type: 'string' as const, defaultValue: '16A' },
  curve: { label: 'Curve', type: 'select' as const, defaultValue: 'C', options: CURVE_OPTIONS },
  gevoeligheid: { label: 'Gevoeligheid (Δ)', type: 'select' as const, defaultValue: '300mA', options: DIFF_GEVOELIGHEID },
  diff_type: { label: 'Diff. type', type: 'select' as const, defaultValue: 'A', options: DIFF_TYPES },
  kabel: { label: 'Kabel (type + doorsnede)', type: 'string' as const, defaultValue: '' },
  kring: { label: 'Kring', type: 'string' as const, defaultValue: '' },
});

export const beveiligingSymbols: SymbolDefinition[] = [
  ...AUTOMAAT_PRESETS.map(({ type, name, description, defaultType }) => ({
    type,
    category: 'beveiliging' as const,
    name,
    description,
    width: 40,
    height: 50,
    connectionPoints: [
      { id: 'in', position: 'top' as const, x: 20, y: 0 },
      { id: 'out', position: 'bottom' as const, x: 20, y: 50 },
    ],
    properties: automaatProperties(defaultType),
    Render: AutomaatRender,
  })),
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
