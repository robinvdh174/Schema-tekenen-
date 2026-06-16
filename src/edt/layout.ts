import type { SchemaNode } from './model';
import { walk } from './model';
import { allowedChildKinds } from './catalog';

/**
 * Auto-layout van het eendraadschema volgens de klassieke Belgische
 * conventies (zoals Trikker en het eendraadschema-programma van Goethals):
 *
 *  - het verdeelbord is een dikke horizontale lijn;
 *  - kringen stijgen verticaal vanaf het bord, met de zekering onderaan en
 *    het kabeltype verticaal naast de stijglijn;
 *  - verbruikers takken horizontaal naar rechts af van de stijglijn en
 *    worden doorgelust op dezelfde horizontale lijn;
 *  - de voeding (aansluiting → teller → hoofddifferentieel) staat onder het
 *    bord en stijgt er verticaal naartoe.
 */

export type Orient = 'v' | 'h';

/* ------------------------------------------------------------- categorieën */

export const VERTICAL_KINDS = new Set([
  'aansluiting',
  'teller',
  'automaat',
  'differentieel',
  'diffautomaat',
  'smeltzekering',
  'hoofdschakelaar',
  'relais',
  'overspanning',
]);

const KRING_KINDS = new Set([
  'automaat',
  'differentieel',
  'diffautomaat',
  'smeltzekering',
  'hoofdschakelaar',
]);

/**
 * Kringletters per verdeelbord: kinderen van een bord die een kring starten
 * krijgen automatisch A, B, C, … (in alfabetische volgorde, links → rechts)
 * tenzij de 'kringnr' property een eigen waarde (bv. "3" of "K") bevat.
 * Wordt ook gebruikt voor de componentnummering op het foto-plan.
 *
 * Door een kring met de pijlen ◀ ▶ te verplaatsen verandert de volgorde van
 * de bord-kinderen en herschikken de letters zich dus automatisch.
 */
export const computeKringNumbers = (root: SchemaNode): Map<string, string> => {
  const kringNumbers = new Map<string, string>();
  walk(root, (node) => {
    if (node.kind !== 'bord') return;
    let index = 0;
    for (const child of node.children) {
      if (!KRING_KINDS.has(child.kind)) continue;
      const override = String(child.props.kringnr ?? '').trim();
      kringNumbers.set(child.id, override || kringIndexToLetter(index));
      index += 1;
    }
  });
  return kringNumbers;
};

/** 0 → "A", 25 → "Z", 26 → "AA", 27 → "AB", … */
export const kringIndexToLetter = (index: number): string => {
  let n = index;
  let letter = '';
  do {
    letter = String.fromCharCode(65 + (n % 26)) + letter;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return letter;
};

/* ------------------------------------------------------- geometrie-helpers */

const str = (v: unknown) => String(v ?? '');
const num = (v: unknown, d = 1) => Math.max(1, Math.round(Number(v ?? d) || d));

/** Aantal gedraaide tekstregels naast een zekering (bepaalt breedte rechts). */
export const breakerLabelLines = (node: SchemaNode): string[] => {
  const p = node.props;
  const lines: string[] = [];
  const polen = str(p.polen);
  const amp = str(p.ampere);
  const polAmp = polen && amp ? `${polen} - ${amp}` : polen || amp;
  switch (node.kind) {
    case 'differentieel':
      lines.push(`Δ${str(p.gevoeligheid)}`);
      if (polAmp) lines.push(polAmp);
      if (str(p.difftype)) lines.push(`Type ${str(p.difftype)}`);
      break;
    case 'diffautomaat':
      lines.push(`Δ${str(p.gevoeligheid)}`);
      if (polAmp) lines.push(polAmp);
      if (str(p.curve)) lines.push(`Curve ${str(p.curve)}`);
      if (str(p.difftype)) lines.push(`Type ${str(p.difftype)}`);
      break;
    case 'automaat':
      if (polAmp) lines.push(polAmp);
      if (str(p.curve)) lines.push(`Curve ${str(p.curve)}`);
      break;
    default:
      if (polAmp) lines.push(polAmp);
      break;
  }
  return lines;
};

/** Hoogte van het eigen verticale blok van een node (stijglijn-context). */
export const verticalBlockHeight = (node: SchemaNode): number => {
  switch (node.kind) {
    case 'aansluiting':
      return 56;
    case 'teller':
      return 68;
    case 'automaat':
    case 'differentieel':
    case 'diffautomaat':
    case 'smeltzekering':
    case 'hoofdschakelaar': {
      const kabel = str(node.props.kabel).trim() !== '';
      const selectief = node.props.selectief === true;
      return 15 + 30 + (selectief ? 23 : 0) + (kabel ? 72 : 16);
    }
    case 'relais':
      return 54;
    case 'overspanning':
      return 60;
    default:
      return 50;
  }
};

/** Horizontale maat van een element in een ketting (verbruikers). */
export const hMetrics = (node: SchemaNode): { adv: number; up: number; down: number } => {
  const p = node.props;
  switch (node.kind) {
    // Voedingselementen op de horizontale voedingslijn (onderaan het schema).
    case 'aansluiting':
      return { adv: 74, up: 26, down: 16 };
    case 'teller':
      return { adv: 66, up: 24, down: 34 };
    case 'stopcontact': {
      const n = num(p.aantal);
      return { adv: 20 + n * 20 + 17, up: 32, down: 36 };
    }
    case 'lichtpunt': {
      const type = str(p.type);
      if (type === 'TL-armatuur') return { adv: 98, up: 26, down: 34 };
      if (type === 'Spot') return { adv: 56, up: 26, down: 36 };
      if (type === 'LED') return { adv: 52, up: 28, down: 34 };
      return { adv: 52, up: 28, down: 34 };
    }
    case 'schakelaar': {
      const type = str(p.type);
      if (type === 'Bewegingsmelder') return { adv: 80, up: 30, down: 34 };
      if (type === 'Drukknop') return { adv: 48, up: 24, down: 34 };
      return { adv: 50, up: 30, down: 34 };
    }
    case 'toestel': {
      const type = str(p.type);
      const wide = type === 'EV-lader' || type === 'USB-lader' || type === 'Verwarming (accumulatie)';
      return { adv: wide ? 90 : 66, up: 28, down: 50 };
    }
    case 'aansluitpunt':
      return { adv: 36, up: 18, down: 32 };
    case 'aftakdoos':
      return { adv: 72, up: 20, down: 34 };
    case 'communicatie': {
      const n = num(p.aantal);
      return { adv: 20 + n * 20 + 20, up: 30, down: 36 };
    }
    case 'melder':
      return { adv: 56, up: 26, down: 34 };
    case 'aarding':
      return { adv: 44, up: 18, down: 40 };
    case 'domotica':
      return { adv: 66, up: 30, down: 34 };
    case 'stopcontact_dummy':
      return { adv: 40, up: 25, down: 25 };
    case 'automaat':
    case 'differentieel':
    case 'diffautomaat':
    case 'smeltzekering':
    case 'hoofdschakelaar': {
      const lines = breakerLabelLines(node).length;
      return { adv: 62, up: 18, down: 22 + lines * 11 };
    }
    case 'relais':
      return { adv: 66, up: 20, down: 34 };
    case 'overspanning':
      return { adv: 58, up: 20, down: 44 };
    default:
      return { adv: 60, up: 25, down: 30 };
  }
};

/* --------------------------------------------------------------- resultaat */

export interface PlacedNode {
  node: SchemaNode;
  parent: SchemaNode | null;
  orient: Orient;
  /** Entry-punt: h = linkeruiteinde op de middellijn; v = onderkant stijglijn. */
  x: number;
  y: number;
  /** Selectie-/klikrechthoek. */
  box: { x: number; y: number; w: number; h: number };
  kringnr: string | null;
}

export interface SchemaLine {
  points: number[];
  heavy?: boolean;
}

/**
 * Een klikbare invoegplek op het schema: een "＋" tussen onderdelen zodat je
 * rechtstreeks op de tekening kan aanduiden waar een nieuw symbool moet komen.
 *
 *  - `series`  → het nieuwe symbool komt ín de keten vóór `beforeId` (de
 *                bestaande verbruiker schuift door als kind), bv. tussen twee
 *                schakelaars of tussen A1 en A2.
 *  - `sibling` → het nieuwe onderdeel komt als nieuwe nevenkring vóór
 *                `beforeId` op hetzelfde bord, bv. een nieuwe kring tussen A en B.
 *  - `append`  → het nieuwe onderdeel komt achteraan bij, als laatste kind van
 *                `parentId` (een verbruiker doorlussen, of een nieuwe kring
 *                rechts op het bord).
 */
export interface InsertSlot {
  x: number;
  y: number;
  mode: 'series' | 'sibling' | 'append';
  /** series/sibling: het onderdeel waar vóór ingevoegd wordt. */
  beforeId?: string;
  /** append: het onderdeel waaronder achteraan bijgevoegd wordt. */
  parentId?: string;
}

export interface LayoutResult {
  placed: PlacedNode[];
  lines: SchemaLine[];
  /** Klikbare invoegplekken tussen onderdelen. */
  slots: InsertSlot[];
  /** Begrenzing van de tekening. */
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const ROW_GAP = 6;
const SLOT_GAP = 16;
const SLOT_LEFT_PAD = 46;

interface VSize {
  h: number;
  left: number; // uitbreiding links van de stijglijn
  right: number; // uitbreiding rechts van de stijglijn
}

export const layoutTree = (root: SchemaNode): LayoutResult => {
  const placed: PlacedNode[] = [];
  const lines: SchemaLine[] = [];
  const slots: InsertSlot[] = [];
  const kringNumbers = computeKringNumbers(root);

  /* --------------------------------------------------------- meten (pass 1) */

  const measureChain = (node: SchemaNode): { w: number; up: number; down: number } => {
    const m = hMetrics(node);
    let w = m.adv;
    let up = m.up;
    let down = m.down;
    for (const child of node.children) {
      if (node.kind === 'aftakdoos') break; // kinderen van aftakdoos gaan verticaal
      const cm = measureChain(child);
      w += cm.w;
      up = Math.max(up, cm.up);
      down = Math.max(down, cm.down);
    }
    // Aftakdoos: verticale aftakkingen boven de doos
    if (node.kind === 'aftakdoos' && node.children.length > 0) {
      const vm = measureRows(node.children);
      w = Math.max(w, 35 + vm.right);
      up += vm.h;
    }
    return { w, up, down };
  };

  const measureRows = (children: SchemaNode[]): VSize => {
    let h = 0;
    let left = 0;
    let right = 0;
    for (const child of children) {
      if (child.kind === 'bord') {
        const bm = measureBord(child);
        h += bm.h;
        left = Math.max(left, bm.left);
        right = Math.max(right, bm.right);
      } else if (VERTICAL_KINDS.has(child.kind)) {
        const vm = measureVertical(child);
        h += vm.h;
        left = Math.max(left, vm.left);
        right = Math.max(right, vm.right);
      } else {
        const cm = measureChain(child);
        h += cm.up + cm.down + ROW_GAP;
        right = Math.max(right, cm.w + 8);
      }
    }
    return { h, left, right };
  };

  const measureVertical = (node: SchemaNode): VSize => {
    const own = verticalBlockHeight(node);
    const labelRight = KRING_KINDS.has(node.kind) ? 15 + breakerLabelLines(node).length * 11 + 8 : 30;
    const rows = measureRows(node.children);
    return {
      h: own + rows.h,
      left: Math.max(SLOT_LEFT_PAD, rows.left),
      right: Math.max(labelRight, rows.right),
    };
  };

  const measureBord = (node: SchemaNode): VSize => {
    let width = 24;
    let maxH = 0;
    for (const child of node.children) {
      const vm = measureVertical(child);
      width += vm.left + vm.right + SLOT_GAP;
      maxH = Math.max(maxH, vm.h);
    }
    width = Math.max(width, 140);
    const geaard = node.props.geaard === true;
    return { h: maxH + 30, left: geaard ? 60 : 16, right: width };
  };

  /* ------------------------------------------------------ plaatsen (pass 2) */

  const place = (
    node: SchemaNode,
    parent: SchemaNode | null,
    orient: Orient,
    x: number,
    y: number,
    box: { x: number; y: number; w: number; h: number }
  ) => {
    placed.push({ node, parent, orient, x, y, box, kringnr: kringNumbers.get(node.id) ?? null });
  };

  /**
   * Horizontale ketting; entry op (x, y). Geeft eindbreedte terug.
   *
   * `reachEnd` = true betekent dat dit onderdeel gevolgd wordt door nóg een
   * broer/zus op dezelfde lijn (een vertakking, bv. een schakelaar die twee
   * lichtpunten voedt). Dan moet de doorverbindingslijn helemaal tot het einde
   * van dit (deel)takje doorlopen, zodat het volgende element écht verbonden is
   * en er geen los lijntje overblijft.
   */
  const placeChain = (
    node: SchemaNode,
    parent: SchemaNode | null,
    x: number,
    y: number,
    reachEnd = false,
    isChainLink = false
  ): number => {
    const m = hMetrics(node);
    const chainW = m.adv;

    // Invoegplek tússen dit onderdeel en het vorige op dezelfde lijn (enkel bij
    // een echte doorlus-schakel, niet vóór het eerste element van een rij). Het
    // "＋" staat op het verbindingspunt, mooi gecentreerd tussen beide symbolen.
    if (isChainLink) slots.push({ x, y, mode: 'series', beforeId: node.id });

    if (node.kind === 'aftakdoos' && node.children.length > 0) {
      // verticale aftakkingen vanaf de doos omhoog
      const riserX = x + 35;
      const topY = placeRows(node.children, node, riserX, y - 22);
      lines.push({ points: [riserX, y - 15, riserX, topY] });
      place(node, parent, 'h', x, y, { x, y: y - m.up, w: m.adv, h: m.up + m.down });
      // Sluit aan op de volgende broer/zus indien nodig.
      if (reachEnd) lines.push({ points: [x, y, x + chainW, y] });
      return chainW;
    }

    place(node, parent, 'h', x, y, { x, y: y - m.up, w: m.adv, h: m.up + m.down });
    let cx = x + m.adv;
    const kids = node.children;
    // Doorlopende horizontale verbindingslijn: overbrugt de ruimte tussen het
    // symbool en het volgende element in de ketting (bv. schakelaar → lichtpunt),
    // zodat er geen gaten vallen op de doorverbindingslijn.
    if (kids.length > 0) {
      lines.push({ points: [x, y, cx, y] });
      kids.forEach((child, i) => {
        // Elk kind behalve het laatste wordt gevolgd door een broer/zus → de
        // lijn moet doorlopen. Het laatste kind erft de eis van dit niveau.
        const isLast = i === kids.length - 1;
        cx += placeChain(child, node, cx, y, isLast ? reachEnd : true, true);
      });
    } else {
      // Heeft het blad nog een volgend onderdeel op de lijn (een vertakking),
      // trek de lijn dan door over de volledige breedte zodat de aansluiting
      // sluit. Anders is dit het écht einde van de lijn → een "＋" om achteraan
      // iets bij te doorlussen (op de plek waar het volgende onderdeel zou komen).
      if (reachEnd) {
        lines.push({ points: [x, y, cx, y] });
      } else if (allowedChildKinds(node.kind).length > 0) {
        slots.push({ x: cx, y, mode: 'append', parentId: node.id });
      }
    }
    return cx - x;
  };

  /**
   * Stapelt kinderen verticaal langs een stijglijn op `riserX`, beginnend
   * net boven `yStart` en omhoog werkend. Geeft de hoogste y terug (top).
   */
  const placeRows = (children: SchemaNode[], parent: SchemaNode, riserX: number, yStart: number): number => {
    let yCursor = yStart;
    let topAttach = yStart;
    for (const child of children) {
      if (child.kind === 'bord') {
        const bm = measureBord(child);
        placeBord(child, parent, riserX, yCursor);
        yCursor -= bm.h;
        topAttach = yCursor + bm.h - 0; // bordlijn zelf
      } else if (VERTICAL_KINDS.has(child.kind)) {
        const vm = measureVertical(child);
        placeVertical(child, parent, riserX, yCursor);
        yCursor -= vm.h;
        topAttach = yCursor;
      } else {
        const cm = measureChain(child);
        const rowY = yCursor - cm.down;
        placeChain(child, parent, riserX, rowY);
        topAttach = rowY;
        yCursor -= cm.up + cm.down + ROW_GAP;
      }
    }
    return topAttach;
  };

  /** Verticale node (stijglijn). Entry onderaan op (x, yBottom). */
  const placeVertical = (node: SchemaNode, parent: SchemaNode | null, x: number, yBottom: number) => {
    const own = verticalBlockHeight(node);
    const vm = measureVertical(node);
    const yTop = yBottom - own;

    place(node, parent, 'v', x, yBottom, {
      x: x - 40,
      y: yTop,
      w: 40 + Math.max(60, KRING_KINDS.has(node.kind) ? 15 + breakerLabelLines(node).length * 11 + 8 : 40),
      h: own,
    });

    if (node.children.length > 0) {
      const top = placeRows(node.children, node, x, yTop);
      // Stijglijn van blok-top tot bovenste rij — enkel tekenen wanneer de
      // kinderen horizontale verbruikers zijn. Verticale blokken (teller,
      // beveiligingen, bord) sluiten zelf op elkaar aan; een doorlopende
      // stijglijn zou hier dwars door hun contact-symbool lopen en zo een
      // gesloten én geopend contact tegelijk tonen.
      const childrenAreVertical = node.children.every(
        (c) => c.kind === 'bord' || VERTICAL_KINDS.has(c.kind)
      );
      if (!childrenAreVertical && top < yTop) lines.push({ points: [x, yTop, x, top] });
    }
    return vm;
  };

  /** Bord: dikke horizontale lijn; kringen erboven. Entry onderaan (x, yBottom). */
  const placeBord = (node: SchemaNode, parent: SchemaNode | null, x: number, yBottom: number) => {
    const bm = measureBord(node);
    const lineY = yBottom - 16;

    // verbindingsstukje van binnenkomende lijn naar het bord
    lines.push({ points: [x, yBottom, x, lineY] });

    const startX = x - 8;
    let slotX = startX + 16;
    let endX = startX + bm.right;
    const riserXs: number[] = [];
    for (const child of node.children) {
      const vm = measureVertical(child);
      const riserX = slotX + vm.left;
      riserXs.push(riserX);
      placeVertical(child, node, riserX, lineY);
      slotX += vm.left + vm.right + SLOT_GAP;
    }
    endX = Math.max(endX, slotX);

    // Invoegplekken tussen aangrenzende kringen (bv. een nieuwe kring tussen
    // A en B): op de bordlijn, halverwege twee stijglijnen.
    for (let i = 1; i < node.children.length; i += 1) {
      slots.push({
        x: (riserXs[i - 1] + riserXs[i]) / 2,
        y: lineY,
        mode: 'sibling',
        beforeId: node.children[i].id,
      });
    }
    // Eind-plus rechts op de bordlijn: een nieuwe kring achteraan bijvoegen.
    if (riserXs.length > 0) {
      const gap =
        riserXs.length > 1 ? riserXs[riserXs.length - 1] - riserXs[riserXs.length - 2] : 36;
      slots.push({
        x: riserXs[riserXs.length - 1] + Math.min(Math.max(gap, 28), 60),
        y: lineY,
        mode: 'append',
        parentId: node.id,
      });
    }

    lines.push({ points: [startX - (node.props.geaard === true ? 30 : 6), lineY, endX, lineY], heavy: true });

    place(node, parent, 'v', x, yBottom, {
      x: startX - (node.props.geaard === true ? 50 : 10),
      y: lineY - 6,
      w: endX - startX + 30,
      h: 30,
    });
  };

  /** Horizontale voedingsketen onderaan: aansluiting → kWh-teller die met een
   *  horizontale lijn vertrekt, daarna stijgt de installatie verticaal op via
   *  de differentieel(en) naar de horizontale bordlijn (zoals op papier). */
  const placeFeeder = (feeder: SchemaNode[], riserRoot: SchemaNode) => {
    // Ruimte tussen de teller en de opstijgende differentieel: hier takt de
    // hoofdaarding naar onder af.
    const GAP = 44;
    const widths = feeder.map((n) => hMetrics(n).adv);
    const total = widths.reduce((a, b) => a + b, 0);
    // De keten eindigt net links van de stijglijn (x = -GAP); leg ze rechts→links.
    const rightEnd = -GAP;
    const leftX = rightEnd - total;

    let cx = leftX;
    feeder.forEach((node, i) => {
      const m = hMetrics(node);
      const parent = i === 0 ? null : feeder[i - 1];
      place(node, parent, 'h', cx, 0, { x: cx, y: -m.up, w: m.adv, h: m.up + m.down });
      cx += widths[i];
    });

    // Doorlopende horizontale voedingslijn tot aan de stijglijn (x = 0).
    lines.push({ points: [leftX, 0, 0, 0] });

    // Hoofdaarding: aftakking naar onder, halverwege de ruimte vóór de stijglijn.
    const ex = rightEnd / 2;
    lines.push({ points: [ex, 0, ex, 16] });
    lines.push({ points: [ex - 9, 16, ex + 9, 16], heavy: false });
    lines.push({ points: [ex - 6, 20, ex + 6, 20] });
    lines.push({ points: [ex - 3, 24, ex + 3, 24] });

    // De installatie stijgt verticaal op vanaf (0, 0).
    const riserParent = feeder[feeder.length - 1] ?? null;
    if (riserRoot.kind === 'bord') {
      placeBord(riserRoot, riserParent, 0, 0);
    } else {
      placeVertical(riserRoot, riserParent, 0, 0);
    }
  };

  /* ------------------------------------------------------------- startpunt */

  // Probeer de horizontale voedingslayout (aansluiting/teller onderaan, dan
  // verticaal omhoog). Lukt dat niet (onverwachte boomvorm), val terug op de
  // klassieke volledig-verticale opbouw zodat niets stuk gaat.
  const FEEDER_KINDS = new Set(['aansluiting', 'teller']);
  const feeder: SchemaNode[] = [];
  let cur: SchemaNode | null = root;
  while (cur && FEEDER_KINDS.has(cur.kind) && cur.children.length === 1) {
    feeder.push(cur);
    cur = cur.children[0];
  }
  const riserRoot = cur;
  const canFeeder =
    feeder.length >= 1 &&
    !!riserRoot &&
    (VERTICAL_KINDS.has(riserRoot.kind) || riserRoot.kind === 'bord');

  if (canFeeder && riserRoot) {
    placeFeeder(feeder, riserRoot);
  } else {
    // De wortel staat onderaan; alles stijgt vanaf (0, 0).
    placeVertical(root, null, 0, 0);
  }

  /* ------------------------------------------------------------ begrenzing */

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of placed) {
    minX = Math.min(minX, p.box.x);
    minY = Math.min(minY, p.box.y);
    maxX = Math.max(maxX, p.box.x + p.box.w);
    maxY = Math.max(maxY, p.box.y + p.box.h);
  }
  for (const l of lines) {
    for (let i = 0; i < l.points.length; i += 2) {
      minX = Math.min(minX, l.points[i]);
      maxX = Math.max(maxX, l.points[i]);
      minY = Math.min(minY, l.points[i + 1]);
      maxY = Math.max(maxY, l.points[i + 1]);
    }
  }
  if (!Number.isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = 100;
    maxY = 100;
  }

  return { placed, lines, slots, minX, minY, maxX, maxY };
};
