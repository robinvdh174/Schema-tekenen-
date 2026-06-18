import type { ProjectDoc, SchemaNode } from './model';
import { walk } from './model';

/**
 * Materiaallijst / bestellijst.
 *
 * Vat de volledige schemaboom samen tot een telling van alles wat aangekocht
 * moet worden (automaten per type, schakelaars per soort, stopcontacten,
 * bekabeling per kabeltype …). De lijst wordt volledig automatisch uit de boom
 * afgeleid, zodat er nooit telfouten kunnen sluipen: ze klopt per definitie met
 * wat er getekend staat en werkt mee bij elke wijziging.
 */

export interface BomItem {
  /** Stabiele sleutel waarop identieke onderdelen samengeteld worden. */
  key: string;
  /** Omschrijving zoals getoond in de lijst. */
  label: string;
  qty: number;
  /** Optionele eenheid/nota (bv. "kring(en)" bij bekabeling). */
  unit?: string;
}

export interface BomGroup {
  id: string;
  label: string;
  items: BomItem[];
  /** Totaal aantal stuks in deze groep. */
  total: number;
}

export interface Bom {
  groups: BomGroup[];
  /** Totaal aantal getelde onderdelen (bekabeling niet meegerekend). */
  totalItems: number;
}

/* --------------------------------------------------------- groepsvolgorde --- */

const GROUP_LABELS: Record<string, string> = {
  voeding: 'Verdeelborden & meting',
  beveiliging: 'Beveiligingen (modulair)',
  schakelaars: 'Schakelaars & drukknoppen',
  stopcontacten: 'Stopcontacten & aansluitingen',
  verlichting: 'Verlichting',
  data: 'Data & communicatie',
  detectie: 'Detectie & signalisatie',
  toestellen: 'Vaste toestellen',
  sturing: 'Relais, domotica & sturing',
  bekabeling: 'Bekabeling (aantal kringen per type)',
};

const GROUP_ORDER = Object.keys(GROUP_LABELS);

/* ------------------------------------------------------------- hulpfuncties */

const str = (n: SchemaNode, k: string): string => String(n.props[k] ?? '').trim();
const bool = (n: SchemaNode, k: string): boolean => n.props[k] === true;
const count = (n: SchemaNode, k: string): number => {
  const v = Number(n.props[k]);
  return Number.isFinite(v) && v > 0 ? Math.round(v) : 1;
};

interface Contribution {
  group: string;
  key: string;
  label: string;
  qty: number;
  unit?: string;
}

const SCHAKELAAR_LABELS: Record<string, string> = {
  Enkelpolig: 'Enkelpolige schakelaar',
  Tweepolig: 'Tweepolige schakelaar',
  Driepolig: 'Driepolige schakelaar',
};

/** Geeft de bijdrage(n) van één node aan de materiaallijst. */
const describe = (n: SchemaNode): Contribution | null => {
  switch (n.kind) {
    case 'aansluiting':
      return { group: 'voeding', key: 'aansluiting', label: 'Aansluiting netbeheerder', qty: 1 };
    case 'teller':
      return { group: 'voeding', key: `teller|${str(n, 'type')}`, label: `kWh-teller (${str(n, 'type')})`, qty: 1 };
    case 'bord':
      return { group: 'voeding', key: 'bord', label: 'Verdeelbord / zekeringkast', qty: 1 };

    case 'automaat': {
      const p = str(n, 'polen');
      const c = str(n, 'curve');
      const a = str(n, 'ampere');
      return { group: 'beveiliging', key: `automaat|${p}|${c}|${a}`, label: `Automaat ${p} ${c}${a}`, qty: 1 };
    }
    case 'differentieel': {
      const p = str(n, 'polen');
      const a = str(n, 'ampere');
      const g = str(n, 'gevoeligheid');
      const t = str(n, 'difftype');
      const s = bool(n, 'selectief') ? ' (S)' : '';
      return {
        group: 'beveiliging',
        key: `diff|${p}|${a}|${g}|${t}|${s}`,
        label: `Differentieelschakelaar ${p} ${a} ${g} type ${t}${s}`,
        qty: 1,
      };
    }
    case 'diffautomaat': {
      const p = str(n, 'polen');
      const c = str(n, 'curve');
      const a = str(n, 'ampere');
      const g = str(n, 'gevoeligheid');
      const t = str(n, 'difftype');
      const s = bool(n, 'selectief') ? ' (S)' : '';
      return {
        group: 'beveiliging',
        key: `diffa|${p}|${c}|${a}|${g}|${t}|${s}`,
        label: `Differentieelautomaat ${p} ${c}${a} ${g} type ${t}${s}`,
        qty: 1,
      };
    }
    case 'smeltzekering': {
      const p = str(n, 'polen');
      const a = str(n, 'ampere');
      return { group: 'beveiliging', key: `smelt|${p}|${a}`, label: `Smeltzekering ${p} ${a}`, qty: 1 };
    }
    case 'hoofdschakelaar': {
      const p = str(n, 'polen');
      const a = str(n, 'ampere');
      return { group: 'beveiliging', key: `last|${p}|${a}`, label: `Lastschakelaar ${p} ${a}`, qty: 1 };
    }
    case 'overspanning':
      return { group: 'beveiliging', key: 'spd', label: 'Overspanningsbeveiliging (SPD)', qty: 1 };

    case 'relais': {
      const t = str(n, 'type');
      return { group: 'sturing', key: `relais|${t}`, label: t, qty: 1 };
    }
    case 'domotica': {
      const s = str(n, 'sturing');
      return { group: 'sturing', key: `domotica|${s}`, label: `Domotica-sturing (${s})`, qty: 1 };
    }

    case 'schakelaar': {
      const t = str(n, 'type');
      const base = SCHAKELAAR_LABELS[t] ?? t;
      const mods: string[] = [];
      if (bool(n, 'halfwaterdicht')) mods.push('halfwaterdicht');
      if (bool(n, 'verklikker')) mods.push('met verklikkerlamp');
      if (bool(n, 'signalisatie')) mods.push('met signalisatielamp');
      const suffix = mods.length ? ` (${mods.join(', ')})` : '';
      return { group: 'schakelaars', key: `schak|${t}|${mods.join(',')}`, label: `${base}${suffix}`, qty: 1 };
    }

    case 'stopcontact': {
      const mods: string[] = [];
      if (bool(n, 'aarding')) mods.push('met aarding');
      if (bool(n, 'kinderveiligheid')) mods.push('kinderveilig');
      if (bool(n, 'halfwaterdicht')) mods.push('halfwaterdicht');
      const suffix = mods.length ? ` (${mods.join(', ')})` : '';
      return {
        group: 'stopcontacten',
        key: `stopcontact|${mods.join(',')}`,
        label: `Stopcontact${suffix}`,
        qty: count(n, 'aantal'),
      };
    }
    case 'aansluitpunt':
      return { group: 'stopcontacten', key: 'aansluitpunt', label: 'Aansluitpunt / kabeluitgang', qty: 1 };
    case 'aftakdoos':
      return { group: 'stopcontacten', key: 'aftakdoos', label: 'Aftakdoos', qty: 1 };
    case 'aarding':
      return { group: 'stopcontacten', key: 'aarding', label: 'Aarding / aardelektrode', qty: 1 };

    case 'lichtpunt': {
      const t = str(n, 'type');
      const mods: string[] = [];
      if (bool(n, 'wandlamp')) mods.push('wand');
      if (bool(n, 'halfwaterdicht')) mods.push('halfwaterdicht');
      const suffix = mods.length ? ` (${mods.join(', ')})` : '';
      return { group: 'verlichting', key: `licht|${t}|${mods.join(',')}`, label: `${t}${suffix}`, qty: count(n, 'aantal') };
    }

    case 'communicatie': {
      const t = str(n, 'type');
      return { group: 'data', key: `comm|${t}`, label: `Contactdoos ${t}`, qty: count(n, 'aantal') };
    }

    case 'melder': {
      const t = str(n, 'type');
      return { group: 'detectie', key: `melder|${t}`, label: t, qty: 1 };
    }

    case 'toestel': {
      const t = str(n, 'type');
      const signaal = t === 'Bel' || t === 'Zoemer' || t === 'Sirene';
      const v = str(n, 'vermogen');
      const suffix = v ? ` (${v})` : '';
      return {
        group: signaal ? 'detectie' : 'toestellen',
        key: `toestel|${t}|${v}`,
        label: `${t}${suffix}`,
        qty: 1,
      };
    }

    default:
      return null;
  }
};

/** Bouwt de volledige materiaallijst op uit de schemaboom. */
export const buildBom = (tree: SchemaNode): Bom => {
  const buckets = new Map<string, Map<string, BomItem>>();

  const add = (c: Contribution) => {
    let group = buckets.get(c.group);
    if (!group) {
      group = new Map();
      buckets.set(c.group, group);
    }
    const existing = group.get(c.key);
    if (existing) existing.qty += c.qty;
    else group.set(c.key, { key: c.key, label: c.label, qty: c.qty, unit: c.unit });
  };

  walk(tree, (node) => {
    const c = describe(node);
    if (c) add(c);

    // Bekabeling: elk kabelveld telt als één kring/segment van dat type. De
    // werkelijke lengte moet de installateur opmeten — dit geeft enkel aan
    // hoeveel kringen welk kabeltype gebruiken.
    const kabel = str(node, 'kabel');
    if (kabel) add({ group: 'bekabeling', key: `kabel|${kabel}`, label: kabel, qty: 1, unit: 'kring(en)' });
  });

  const groups: BomGroup[] = [];
  let totalItems = 0;
  for (const id of GROUP_ORDER) {
    const bucket = buckets.get(id);
    if (!bucket || bucket.size === 0) continue;
    const items = [...bucket.values()].sort((a, b) => a.label.localeCompare(b.label, 'nl'));
    const total = items.reduce((sum, it) => sum + it.qty, 0);
    if (id !== 'bekabeling') totalItems += total;
    groups.push({ id, label: GROUP_LABELS[id], items, total });
  }

  return { groups, totalItems };
};

/** Materiaallijst als platte tekst (voor kopiëren naar klembord). */
export const bomToText = (doc: ProjectDoc): string => {
  const bom = buildBom(doc.tree);
  const lines: string[] = [];
  lines.push(`Materiaallijst — ${doc.name || 'Eendraadschema'}`);
  if (doc.installateur) lines.push(`Installateur: ${doc.installateur}`);
  lines.push(`Aangemaakt: ${new Date().toLocaleDateString('nl-BE')}`);
  lines.push('');
  if (bom.groups.length === 0) {
    lines.push('(nog geen onderdelen in het schema)');
    return lines.join('\n');
  }
  for (const group of bom.groups) {
    lines.push(`== ${group.label} ==`);
    for (const item of group.items) {
      lines.push(`  ${String(item.qty).padStart(3, ' ')} ×  ${item.label}${item.unit ? ` (${item.unit})` : ''}`);
    }
    lines.push('');
  }
  lines.push(`Totaal aantal onderdelen (excl. bekabeling): ${bom.totalItems}`);
  return lines.join('\n');
};
