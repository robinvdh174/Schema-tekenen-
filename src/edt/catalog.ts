import type { PropValue, SchemaNode } from './model';

/**
 * Catalogus van alle componenttypes die in het eendraadschema kunnen
 * voorkomen, met hun eigenschappen en welke kinderen ze mogen krijgen.
 * De types en hun symbolen volgen de Belgische AREI-conventies.
 */

export type Category = 'voeding' | 'bord' | 'beveiliging' | 'verbruiker';

export interface PropDef {
  key: string;
  label: string;
  type: 'text' | 'select' | 'boolean' | 'number';
  options?: string[];
  default: PropValue;
  /** Hint die onder het veld getoond wordt. */
  hint?: string;
  /**
   * Voorgestelde waarden voor een vrij tekstveld: de gebruiker kan kiezen uit
   * de lijst of zelf iets typen (combobox via datalist). Bv. kabeltypes.
   */
  suggestions?: string[];
}

/* --------------------------------------------------- voorgestelde waarden ---
 * Lijsten met veelgebruikte waarden zodat de gebruiker bij tekstvelden kan
 * kiezen i.p.v. alles te typen (kabeltype, lokaal, kringnummer …).
 * ------------------------------------------------------------------------- */

/** Veelgebruikte kabeltypes volgens AREI. */
export const CABLE_SUGGESTIONS = [
  'XVB 2x1,5',
  'XVB 3G1,5',
  'XVB 3G2,5',
  'XVB 5G1,5',
  'XVB 5G2,5',
  'XVB 5G4',
  'XVB 5G6',
  'XVB 5G10',
  'EXVB 4G10',
  'EXVB 4G16',
  'EXVB 4G25',
  'VOB 1,5',
  'VOB 2,5',
  'VOB 6',
  'VOB 10',
  'VOB 16',
  'UTP Cat6',
];

/** Voorgestelde kringletters/-nummers (letters worden automatisch toegekend). */
export const KRINGNR_SUGGESTIONS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
];

/** Veelvoorkomende lokalen/ruimtes voor het omschrijvingsveld. */
export const LOKAAL_SUGGESTIONS = [
  'Inkom',
  'Hal',
  'Nachthal',
  'Living',
  'Keuken',
  'Eetkamer',
  'Bureau',
  'Berging',
  'Wasplaats',
  'Garage',
  'Kelder',
  'Zolder',
  'Badkamer',
  'Wc',
  'Slaapkamer 1',
  'Slaapkamer 2',
  'Slaapkamer 3',
  'Dressing',
  'Terras',
  'Tuin',
  'Tuinhuis',
  'Carport',
  'Veranda',
];

/** Voorgestelde namen voor een verdeelbord. */
export const BORD_NAAM_SUGGESTIONS = [
  'Hoofdbord',
  'Verdeelbord',
  'Verdeelbord garage',
  'Verdeelbord kelder',
  'Verdeelbord zolder',
  'Verdeelbord verdieping',
  'Onderverdeelbord',
  'Bord tuinhuis',
];

/** Voorgestelde vermogens voor een vast toestel. */
export const VERMOGEN_SUGGESTIONS = [
  '1000 W',
  '1500 W',
  '2000 W',
  '2200 W',
  '3000 W',
  '3500 W',
  '4600 W',
  '7400 W',
  '11 kW',
  '22 kW',
];

export interface KindDef {
  kind: string;
  label: string;
  description: string;
  category: Category;
  /** Welke categorieën als kind toegevoegd mogen worden. */
  childCategories: Category[];
  props: PropDef[];
}

const POLEN = ['1P', '1P+N', '2P', '3P', '3P+N', '4P'];
const AMPERE = ['2A', '4A', '6A', '10A', '16A', '20A', '25A', '32A', '40A', '50A', '63A', '80A', '100A'];
const CURVES = ['B', 'C', 'D'];
const DIFF_MA = ['10mA', '30mA', '100mA', '300mA', '500mA'];
const DIFF_TYPE = ['A', 'AC', 'B', 'F'];

export const SCHAKELAAR_TYPES = [
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

export const LICHTPUNT_TYPES = ['Lichtpunt', 'LED', 'Spot', 'TL-armatuur'];

export const RELAIS_TYPES = [
  'Teleruptor',
  'Relais',
  'Minuterie',
  'Thermostaat',
  'Tijdschakelaar',
  'Dimmer (module)',
];

export const TOESTEL_TYPES = [
  'Wasmachine',
  'Droogkast',
  'Vaatwasser',
  'Koelkast',
  'Diepvriezer',
  'Oven',
  'Microgolfoven',
  'Kookfornuis',
  'Dampkap',
  'Boiler',
  'Boiler (accumulatie)',
  'Elektrische verwarming',
  'Verwarming (accumulatie)',
  'Warmtepomp',
  'Airco',
  'Ventilator',
  'Motor',
  'EV-lader',
  'USB-lader',
  'Omvormer (PV)',
  'Transformator',
  'Bel',
  'Batterij',
  'Ander toestel',
];

const labelProp = (hint = 'Bv. keuken, living, slaapkamer 1 …'): PropDef => ({
  key: 'label',
  label: 'Omschrijving / lokaal',
  type: 'text',
  default: '',
  hint,
  suggestions: LOKAAL_SUGGESTIONS,
});

/** Kabelveld met voorgestelde AREI-kabeltypes. */
const cableProp = (label = 'Kabel kring', def = ''): PropDef => ({
  key: 'kabel',
  label,
  type: 'text',
  default: def,
  hint: 'Kies een kabeltype of typ zelf',
  suggestions: CABLE_SUGGESTIONS,
});

/** Kringnummerveld met voorgestelde nummers/letters (bv. B → F). */
const kringnrProp = (): PropDef => ({
  key: 'kringnr',
  label: 'Kringletter / -nummer',
  type: 'text',
  default: '',
  hint: 'Leeg = automatisch (A, B, C …). Of typ zelf bv. 3 of K om de kring te hernoemen. Verplaatsen doe je met de pijlen ◀ ▶.',
  suggestions: KRINGNR_SUGGESTIONS,
});

export const CATALOG: KindDef[] = [
  /* ------------------------------------------------------------ voeding */
  {
    kind: 'aansluiting',
    label: 'Aansluiting net',
    description: 'Voeding van de netbeheerder',
    category: 'voeding',
    childCategories: ['voeding', 'beveiliging', 'bord'],
    props: [
      {
        key: 'net',
        label: 'Netspanning',
        type: 'select',
        options: ['1F 230V', '2F 230V', '3F 230V', '3F 400V + N'],
        default: '3F 400V + N',
      },
      cableProp('Voedingskabel', 'EXVB 4G10'),
      { key: 'label', label: 'Omschrijving', type: 'text', default: 'Aansluiting netbeheerder' },
    ],
  },
  {
    kind: 'teller',
    label: 'kWh-teller',
    description: 'Elektriciteitsmeter',
    category: 'voeding',
    childCategories: ['voeding', 'beveiliging', 'bord'],
    props: [
      {
        key: 'type',
        label: 'Type teller',
        type: 'select',
        options: ['Enkelvoudig', 'Dag / nacht', 'Digitale meter'],
        default: 'Digitale meter',
      },
    ],
  },
  {
    kind: 'bord',
    label: 'Verdeelbord',
    description: 'Zekeringkast — kringen vertrekken hier',
    category: 'bord',
    childCategories: ['beveiliging'],
    props: [
      {
        key: 'naam',
        label: 'Naam bord',
        type: 'text',
        default: 'Verdeelbord',
        hint: 'Bv. Hoofdbord of Verdeelbord garage',
        suggestions: BORD_NAAM_SUGGESTIONS,
      },
      {
        key: 'lokaal',
        label: 'Plaats',
        type: 'text',
        default: '',
        hint: 'Bv. garage, berging …',
        suggestions: LOKAAL_SUGGESTIONS,
      },
      { key: 'geaard', label: 'Aardingssymbool tonen', type: 'boolean', default: false },
    ],
  },

  /* -------------------------------------------------------- beveiliging */
  {
    kind: 'automaat',
    label: 'Automaat',
    description: 'Automatische zekering — start van een kring',
    category: 'beveiliging',
    childCategories: ['beveiliging', 'bord', 'verbruiker'],
    props: [
      { key: 'polen', label: 'Polen', type: 'select', options: POLEN, default: '2P' },
      { key: 'ampere', label: 'Stroomsterkte', type: 'select', options: AMPERE, default: '16A' },
      { key: 'curve', label: 'Curve', type: 'select', options: CURVES, default: 'C' },
      cableProp('Kabel kring', 'XVB 3G2,5'),
      kringnrProp(),
      labelProp('Bv. stopcontacten keuken'),
    ],
  },
  {
    kind: 'differentieel',
    label: 'Differentieelschakelaar',
    description: 'Verliesstroomschakelaar (Δ)',
    category: 'beveiliging',
    childCategories: ['beveiliging', 'bord', 'verbruiker'],
    props: [
      { key: 'polen', label: 'Polen', type: 'select', options: POLEN, default: '2P' },
      { key: 'ampere', label: 'Stroomsterkte', type: 'select', options: AMPERE, default: '40A' },
      { key: 'gevoeligheid', label: 'Gevoeligheid', type: 'select', options: DIFF_MA, default: '300mA' },
      { key: 'difftype', label: 'Type', type: 'select', options: DIFF_TYPE, default: 'A' },
      { key: 'selectief', label: 'Selectief (S)', type: 'boolean', default: false },
      cableProp('Kabel', ''),
      kringnrProp(),
      labelProp('Bv. natte kringen'),
    ],
  },
  {
    kind: 'diffautomaat',
    label: 'Differentieelautomaat',
    description: 'Automaat + differentieel in één',
    category: 'beveiliging',
    childCategories: ['beveiliging', 'bord', 'verbruiker'],
    props: [
      { key: 'polen', label: 'Polen', type: 'select', options: POLEN, default: '2P' },
      { key: 'ampere', label: 'Stroomsterkte', type: 'select', options: AMPERE, default: '20A' },
      { key: 'curve', label: 'Curve', type: 'select', options: CURVES, default: 'C' },
      { key: 'gevoeligheid', label: 'Gevoeligheid', type: 'select', options: DIFF_MA, default: '30mA' },
      { key: 'difftype', label: 'Type', type: 'select', options: DIFF_TYPE, default: 'A' },
      { key: 'selectief', label: 'Selectief (S)', type: 'boolean', default: false },
      cableProp('Kabel kring', 'XVB 3G2,5'),
      kringnrProp(),
      labelProp(),
    ],
  },
  {
    kind: 'smeltzekering',
    label: 'Smeltzekering',
    description: 'Patroonzekering',
    category: 'beveiliging',
    childCategories: ['beveiliging', 'bord', 'verbruiker'],
    props: [
      { key: 'polen', label: 'Polen', type: 'select', options: POLEN, default: '2P' },
      { key: 'ampere', label: 'Stroomsterkte', type: 'select', options: AMPERE, default: '10A' },
      cableProp('Kabel kring', ''),
      kringnrProp(),
      labelProp(),
    ],
  },
  {
    kind: 'hoofdschakelaar',
    label: 'Hoofd-/lastschakelaar',
    description: 'Schakelaar zonder beveiliging',
    category: 'beveiliging',
    childCategories: ['beveiliging', 'bord', 'verbruiker'],
    props: [
      { key: 'polen', label: 'Polen', type: 'select', options: POLEN, default: '4P' },
      { key: 'ampere', label: 'Stroomsterkte', type: 'select', options: AMPERE, default: '63A' },
      cableProp('Kabel', ''),
      labelProp('Bv. hoofdschakelaar'),
    ],
  },
  {
    kind: 'relais',
    label: 'Relais / teleruptor',
    description: 'Stuurrelais in het bord of in de kring',
    category: 'beveiliging',
    childCategories: ['verbruiker'],
    props: [
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: RELAIS_TYPES,
        default: 'Teleruptor',
      },
      labelProp('Bv. verlichting inkom'),
    ],
  },
  {
    kind: 'overspanning',
    label: 'Overspanningsbeveiliging',
    description: 'SPD / bliksembeveiliging',
    category: 'beveiliging',
    childCategories: [],
    props: [labelProp('')],
  },

  /* --------------------------------------------------------- verbruikers */
  {
    kind: 'stopcontact',
    label: 'Stopcontact',
    description: 'Contactdoos',
    category: 'verbruiker',
    childCategories: ['verbruiker'],
    props: [
      { key: 'aantal', label: 'Aantal (op deze plaats)', type: 'number', default: 1 },
      { key: 'aarding', label: 'Met aardingspen', type: 'boolean', default: true },
      { key: 'kinderveiligheid', label: 'Kinderveiligheid', type: 'boolean', default: true },
      { key: 'halfwaterdicht', label: 'Halfwaterdicht (h)', type: 'boolean', default: false },
      labelProp(),
    ],
  },
  {
    kind: 'lichtpunt',
    label: 'Lichtpunt',
    description: 'Verlichting (kruis-symbool)',
    category: 'verbruiker',
    childCategories: ['verbruiker'],
    props: [
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: LICHTPUNT_TYPES,
        default: 'Lichtpunt',
      },
      { key: 'aantal', label: 'Aantal', type: 'number', default: 1 },
      { key: 'wandlamp', label: 'Wandlamp', type: 'boolean', default: false },
      { key: 'halfwaterdicht', label: 'Halfwaterdicht (h)', type: 'boolean', default: false },
      labelProp(),
    ],
  },
  {
    kind: 'schakelaar',
    label: 'Schakelaar',
    description: 'Lichtschakelaar of drukknop',
    category: 'verbruiker',
    childCategories: ['verbruiker'],
    props: [
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: SCHAKELAAR_TYPES,
        default: 'Enkelpolig',
      },
      { key: 'halfwaterdicht', label: 'Halfwaterdicht (h)', type: 'boolean', default: false },
      labelProp(),
    ],
  },
  {
    kind: 'toestel',
    label: 'Vast toestel',
    description: 'Vast aangesloten toestel (AREI-pictogram)',
    category: 'verbruiker',
    childCategories: ['verbruiker'],
    props: [
      { key: 'type', label: 'Toestel', type: 'select', options: TOESTEL_TYPES, default: 'Wasmachine' },
      {
        key: 'vermogen',
        label: 'Vermogen',
        type: 'text',
        default: '',
        hint: 'Bv. 2200 W (optioneel)',
        suggestions: VERMOGEN_SUGGESTIONS,
      },
      labelProp(),
    ],
  },
  {
    kind: 'aansluitpunt',
    label: 'Aansluitpunt',
    description: 'Vast aansluitpunt / kabeluitgang (cirkeltje)',
    category: 'verbruiker',
    childCategories: ['verbruiker'],
    props: [labelProp('Bv. dampkap, spiegelverlichting …')],
  },
  {
    kind: 'aftakdoos',
    label: 'Aftakdoos',
    description: 'Verbindingsdoos — kring splitst hier',
    category: 'verbruiker',
    childCategories: ['verbruiker'],
    props: [labelProp()],
  },
];

const KIND_MAP = new Map(CATALOG.map((def) => [def.kind, def]));

export const kindDef = (kind: string): KindDef => {
  const def = KIND_MAP.get(kind);
  if (!def) throw new Error(`Onbekend componenttype: ${kind}`);
  return def;
};

export const allowedChildKinds = (parentKind: string): KindDef[] => {
  const parent = kindDef(parentKind);
  return CATALOG.filter((def) => parent.childCategories.includes(def.category));
};

export const defaultProps = (kind: string): Record<string, PropValue> =>
  Object.fromEntries(kindDef(kind).props.map((p) => [p.key, p.default]));

/* ------------------------------------------------------------- het palet ---
 * Het symbolenpalet (linkerpaneel) toont één tegel per symboolvariant, met
 * het echte AREI-symbool als voorbeeld. Een variant is een componenttype
 * (kind) plus eventuele props-overrides — zo is bv. elke schakelaarsoort
 * meteen als eigen symbool kiesbaar, zonder nadien rechts het type te
 * moeten aanpassen.
 * ------------------------------------------------------------------------- */

export interface PaletteItem {
  /** Unieke sleutel binnen het palet. */
  id: string;
  kind: string;
  label: string;
  description: string;
  /** Props-overrides bovenop de standaardwaarden (bv. het type schakelaar). */
  props?: Record<string, PropValue>;
}

export interface PaletteGroup {
  id: string;
  label: string;
  items: PaletteItem[];
}

const baseItem = (kind: string): PaletteItem => {
  const def = kindDef(kind);
  return { id: kind, kind, label: def.label, description: def.description };
};

const typeItem = (kind: string, type: string): PaletteItem => ({
  id: `${kind}:${type}`,
  kind,
  label: type,
  description: `${kindDef(kind).label} — ${type}`,
  props: { type },
});

export const PALETTE_GROUPS: PaletteGroup[] = [
  {
    id: 'voeding',
    label: 'Voeding & meting',
    items: [baseItem('aansluiting'), baseItem('teller'), baseItem('bord')],
  },
  {
    id: 'beveiliging',
    label: 'Beveiliging',
    items: [
      baseItem('automaat'),
      baseItem('differentieel'),
      baseItem('diffautomaat'),
      baseItem('smeltzekering'),
      baseItem('hoofdschakelaar'),
      baseItem('overspanning'),
    ],
  },
  {
    id: 'stopcontacten',
    label: 'Stopcontacten & aansluitingen',
    items: [baseItem('stopcontact'), baseItem('aansluitpunt'), baseItem('aftakdoos')],
  },
  {
    id: 'schakelaars',
    label: 'Schakelaars',
    items: SCHAKELAAR_TYPES.map((t) => typeItem('schakelaar', t)),
  },
  {
    id: 'verlichting',
    label: 'Verlichting',
    items: LICHTPUNT_TYPES.map((t) => typeItem('lichtpunt', t)),
  },
  {
    id: 'sturing',
    label: 'Relais & sturing',
    items: RELAIS_TYPES.map((t) => typeItem('relais', t)),
  },
  {
    id: 'toestellen',
    label: 'Vaste toestellen',
    items: TOESTEL_TYPES.map((t) => typeItem('toestel', t)),
  },
];

/** Korte beschrijvende titel van een node voor de boomweergave. */
export const nodeTitle = (node: SchemaNode): string => {
  const def = kindDef(node.kind);
  const p = node.props;
  const str = (key: string) => String(p[key] ?? '');
  switch (node.kind) {
    case 'aansluiting':
      return `Aansluiting ${str('net')}`;
    case 'teller':
      return `kWh-teller (${str('type')})`;
    case 'bord':
      return str('naam') || 'Verdeelbord';
    case 'automaat':
      return `Automaat ${str('polen')} ${str('curve')}${str('ampere')}`;
    case 'differentieel':
      return `Differentieel Δ${str('gevoeligheid')} ${str('ampere')}`;
    case 'diffautomaat':
      return `Diff.automaat Δ${str('gevoeligheid')} ${str('curve')}${str('ampere')}`;
    case 'smeltzekering':
      return `Smeltzekering ${str('ampere')}`;
    case 'hoofdschakelaar':
      return `Schakelaar ${str('polen')} ${str('ampere')}`;
    case 'relais':
      return str('type');
    case 'stopcontact': {
      const n = Number(p.aantal ?? 1);
      return n > 1 ? `Stopcontact ×${n}` : 'Stopcontact';
    }
    case 'lichtpunt': {
      const n = Number(p.aantal ?? 1);
      const type = str('type');
      return n > 1 ? `${type} ×${n}` : type;
    }
    case 'schakelaar':
      return str('type');
    case 'toestel':
      return str('type');
    default:
      return def.label;
  }
};
