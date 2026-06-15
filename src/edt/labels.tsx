import { Text } from 'react-konva';
import type { JSX } from 'react';
import type { SchemaNode } from './model';
import type { Orient } from './layout';
import { breakerLabelLines } from './layout';
import { Adres, VText, FONT, INK } from '@/components/edt/NodeGlyph';

/**
 * Versleepbare tekstlabels.
 *
 * De labels die vroeger vast in de symbool-tekening (NodeGlyph) zaten —
 * kringnummer, omschrijving, kabeltype, waarde-aanduidingen en het
 * adres/lokaal onder een verbruiker — worden nu hier beschreven en door het
 * canvas als afzonderlijke, versleepbare elementen getekend. Zo kan de
 * gebruiker ze vrij naast/onder/boven het symbool plaatsen zodat ze niet over
 * lijnen of andere symbolen vallen.
 *
 * BELANGRIJK: de standaardplaats (offset {0,0}) is exact dezelfde geometrie
 * als voorheen, zodat bestaande schema's er ongewijzigd uitzien.
 */

const str = (v: unknown) => String(v ?? '');
const num = (v: unknown, d = 1) => Math.max(1, Math.round(Number(v ?? d) || d));

const BREAKER_KINDS = new Set([
  'automaat',
  'differentieel',
  'diffautomaat',
  'smeltzekering',
  'hoofdschakelaar',
]);

export interface LabelSpec {
  /** Stabiele sleutel binnen de node (bv. 'kringnr', 'adres'). */
  key: string;
  /** Mensvriendelijke naam voor het eigenschappenpaneel. */
  label: string;
  /** Konva-inhoud op node-lokale coördinaten (standaardplaats). */
  content: JSX.Element;
}

/** Breedte van het toestel-symbool — bepaalt waar het bijschrift centreert.
 *  Moet gelijklopen met de afmetingen in HToestel (NodeGlyph). */
const toestelBodyWidth = (type: string): number => {
  switch (type) {
    case 'Elektrische verwarming':
    case 'Verwarming (accumulatie)':
      return 50;
    case 'Ventilator':
    case 'Dampkap':
    case 'Batterij':
      return 30;
    case 'EV-lader':
      return 46;
    case 'USB-lader':
      return 60;
    case 'Transformator':
      return 28;
    case 'Sirene':
      return 24;
    case 'Zoemer':
    case 'Bel':
      return 16;
    default:
      return 40;
  }
};

/** Ankerpunt (cx, y, breedte) van het adres/lokaal-bijschrift per verbruiker.
 *  Reproduceert exact de vroegere <Adres>-aanroep in elke glyph. */
const adresAnchor = (
  node: SchemaNode,
  orient: Orient
): { cx: number; y: number; w: number } | null => {
  const p = node.props;
  switch (node.kind) {
    case 'stopcontact': {
      const n = num(p.aantal);
      const totalW = 20 + n * 20 + 17;
      return { cx: totalW / 2 + 8, y: 24, w: 90 };
    }
    case 'lichtpunt': {
      const type = str(p.type);
      const cx = type === 'TL-armatuur' ? 60 : type === 'Spot' ? 40 : type === 'LED' ? 36 : 30;
      return { cx: cx + 4, y: 22, w: 90 };
    }
    case 'schakelaar':
      return { cx: 36, y: 24, w: 76 };
    case 'toestel': {
      const w = toestelBodyWidth(str(p.type));
      return { cx: 20 + w / 2, y: 36, w: 90 };
    }
    case 'aansluitpunt':
      return { cx: 18, y: 14, w: 70 };
    case 'aftakdoos':
      return { cx: 35, y: 20, w: 80 };
    case 'communicatie':
      return { cx: 20, y: 20, w: 90 };
    case 'melder':
      return { cx: 27, y: 20, w: 90 };
    case 'aarding':
      return { cx: 20, y: 24, w: 80 };
    case 'domotica':
      return { cx: 34, y: 24, w: 90 };
    case 'relais':
      // alleen de horizontale relais-glyph heeft een adres-bijschrift
      return orient === 'h' ? { cx: 40, y: 20, w: 80 } : null;
    case 'overspanning':
      return orient === 'h' ? { cx: 28, y: 38, w: 70 } : { cx: 0, y: 8, w: 80 };
    default:
      return null;
  }
};

/**
 * Bouwt de lijst versleepbare labels van een node. Enkel labels met effectieve
 * tekst worden opgenomen (een leeg adres levert geen label op).
 */
export const buildLabelSpecs = (
  node: SchemaNode,
  orient: Orient,
  kringnr: string | null
): LabelSpec[] => {
  const specs: LabelSpec[] = [];
  const p = node.props;

  // ── Kring/beveiliging op de stijglijn ────────────────────────────────────
  if (orient === 'v' && BREAKER_KINDS.has(node.kind)) {
    const selectief = p.selectief === true;
    const contactTop = -45;
    const kabel = str(p.kabel).trim();
    const waarden = breakerLabelLines(node);

    if (kringnr) {
      specs.push({
        key: 'kringnr',
        label: 'Kringnummer',
        content: (
          <Text
            x={-68}
            y={-16}
            width={60}
            align="right"
            text={kringnr}
            fontFamily={FONT}
            fontSize={12}
            fontStyle="bold"
            fill={INK}
          />
        ),
      });
    }

    if (str(p.label)) {
      specs.push({
        key: 'omschrijving',
        label: 'Omschrijving',
        content: <VText x={-8} y={-52} text={str(p.label)} size={11} bold />,
      });
    }

    if (waarden.length > 0) {
      specs.push({
        key: 'waarden',
        label: 'Waarde-aanduiding',
        content: (
          <>
            {waarden.map((line, i) => (
              <VText key={i} x={15 + i * 11} y={0} text={line} centerOn={-28} />
            ))}
          </>
        ),
      });
    }

    if (kabel) {
      specs.push({
        key: 'kabel',
        label: 'Kabeltype',
        content: <VText x={13} y={contactTop - (selectief ? 23 : 0) - 6} text={kabel} />,
      });
    }
    return specs;
  }

  // ── Vaste toestellen: apart type/vermogen-bijschrift ─────────────────────
  if (node.kind === 'toestel') {
    const type = str(p.type);
    const vermogen = str(p.vermogen).trim();
    const w = toestelBodyWidth(type);
    const cxText = 20 + w / 2;
    const text = type + (vermogen ? ` — ${vermogen}` : '');
    if (text) {
      specs.push({
        key: 'type',
        label: 'Type / vermogen',
        content: (
          <Text
            x={cxText - 45}
            y={24}
            width={90}
            align="center"
            text={text}
            fontFamily={FONT}
            fontSize={8.5}
            fill="#475569"
          />
        ),
      });
    }
  }

  // ── Adres/lokaal onder de verbruiker ─────────────────────────────────────
  const anchor = adresAnchor(node, orient);
  const adresText = str(p.label);
  if (anchor && adresText) {
    specs.push({
      key: 'adres',
      label: 'Adres / lokaal',
      content: <Adres text={adresText} cx={anchor.cx} y={anchor.y} w={anchor.w} />,
    });
  }

  return specs;
};

/** Lichtere variant voor het eigenschappenpaneel: enkel sleutel + naam. */
export const labelKeysFor = (
  node: SchemaNode,
  orient: Orient,
  kringnr: string | null
): { key: string; label: string }[] =>
  buildLabelSpecs(node, orient, kringnr).map(({ key, label }) => ({ key, label }));
