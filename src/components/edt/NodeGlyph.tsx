import { Arc, Circle, Group, Line, Path, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import type { PlacedNode } from '@/edt/layout';
import { breakerLabelLines, verticalBlockHeight } from '@/edt/layout';

/**
 * Tekent één component van het eendraadschema, met symbolen die één-op-één
 * de klassieke Belgische eendraadschema-conventies volgen (dezelfde
 * geometrie als het open-source eendraadschema-programma en Trikker):
 *
 *  - horizontale elementen ("h"): entry op (0, 0), de lijn loopt naar rechts;
 *  - verticale elementen ("v"): entry onderaan op (0, 0), de stijglijn loopt
 *    omhoog (negatieve y) tot (0, -blokhoogte).
 */

const INK = '#111827';
const SELECT = '#2563eb';
// Eén uniforme, dunne lijndikte voor álle symbolen. Vroeger bestond er een
// tweede, dikkere lijn (SW2) waardoor o.a. stopcontacten dikker oogden dan
// schakelaars. SW2 verwijst nu naar dezelfde waarde zodat elk symbool exact
// dezelfde lijndikte heeft (de dunne lijn).
const SW = 1.3;
const SW2 = 1.3;
const FONT = 'Arial, Helvetica, sans-serif';

const str = (v: unknown) => String(v ?? '');
const num = (v: unknown, d = 1) => Math.max(1, Math.round(Number(v ?? d) || d));

/** Aantal geleiders uit een kabeltype afleiden, bv. "XVB 3G2,5" → 3,
 *  "EXVB 4G10" → 4, "XVB 2x1,5" → 2, "VOB 1,5" → 1 (eenaderig). */
const conductorCount = (kabel: string): number => {
  const m = kabel.match(/(\d+)\s*[GgxX]/);
  return m ? Math.max(1, parseInt(m[1], 10)) : 1;
};

/* ------------------------------------------------------------------ helpers */

const L = ({ p, w = SW }: { p: number[]; w?: number }) => <Line points={p} stroke={INK} strokeWidth={w} />;

/** AREI-aanduiding van het aantal geleiders op een (verticale) leiding:
 *  schuine streepjes (≤4 geleiders) of één streep + getal (≥5), zoals in het
 *  VOLTA-document ("///" resp. "/5"). Getekend rond punt (x, y) op de lijn. */
const ConductorTicks = ({ x, y, n }: { x: number; y: number; n: number }) => {
  if (n <= 1) {
    return <L p={[x - 5, y + 4, x + 5, y - 4]} />;
  }
  if (n >= 5) {
    return (
      <>
        <L p={[x - 5, y + 4, x + 5, y - 4]} />
        <Text x={x + 6} y={y - 10} text={String(n)} fontFamily={FONT} fontSize={9} fill={INK} />
      </>
    );
  }
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const yy = y - ((n - 1) * 4) / 2 + i * 4;
        return <L key={i} p={[x - 5, yy + 3, x + 5, yy - 3]} />;
      })}
    </>
  );
};

/** Cursief adres/lokaal gecentreerd onder het symbool. */
const Adres = ({ text, cx, y, w = 90 }: { text: string; cx: number; y: number; w?: number }) =>
  text ? (
    <Text
      x={cx - w / 2}
      y={y}
      width={w}
      align="center"
      text={text}
      fontFamily={FONT}
      fontSize={10}
      fontStyle="italic"
      fill={INK}
    />
  ) : null;

/** Verticaal gearceerde cirkel (boiler) of rechthoek (verwarming). */
const HatchedCircle = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => (
  <>
    <Group
      clipFunc={(ctx) => {
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
      }}
    >
      {Array.from({ length: Math.floor((2 * r) / 5) + 1 }, (_, i) => (
        <Line key={i} points={[cx - r + i * 5, cy - r, cx - r + i * 5, cy + r]} stroke={INK} strokeWidth={1} />
      ))}
    </Group>
    <Circle x={cx} y={cy} radius={r} stroke={INK} strokeWidth={SW} />
  </>
);

const HatchedRect = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
  <>
    <Group
      clipFunc={(ctx) => {
        ctx.rect(x, y, w, h);
      }}
    >
      {Array.from({ length: Math.floor(w / 5) + 1 }, (_, i) => (
        <Line key={i} points={[x + i * 5, y, x + i * 5, y + h]} stroke={INK} strokeWidth={1} />
      ))}
    </Group>
    <Rect x={x} y={y} width={w} height={h} stroke={INK} strokeWidth={SW} />
  </>
);

/** Zespuntig sterretje (koelkast/diepvriezer). */
const Ster = ({ cx, cy }: { cx: number; cy: number }) => (
  <>
    <L p={[cx, cy - 5, cx, cy + 5]} />
    <L p={[cx - 4.33, cy - 2.5, cx + 4.33, cy + 2.5]} />
    <L p={[cx - 4.33, cy + 2.5, cx + 4.33, cy - 2.5]} />
  </>
);

/** Sinusgolf (microgolf, omvormer). */
const Sinus = ({ x, y }: { x: number; y: number }) => (
  <Path x={x} y={y} data="M0,0 C2,-5 8,-5 10,0 S18,5 20,0" stroke={INK} strokeWidth={1} />
);

/** Tekst die verticaal langs de stijglijn loopt (leest van onder naar boven). */
const VText = ({
  x,
  y,
  text,
  size = 10,
  bold = false,
  italic = false,
  centerOn,
}: {
  x: number;
  y: number;
  text: string;
  size?: number;
  bold?: boolean;
  italic?: boolean;
  /** Indien gezet: verticaal gecentreerd rond dit y-punt (anders start bij y). */
  centerOn?: number;
}) => {
  const style = `${bold ? 'bold' : ''}${italic ? ' italic' : ''}`.trim() || 'normal';
  if (centerOn !== undefined) {
    return (
      <Text
        x={x}
        y={centerOn}
        rotation={-90}
        width={140}
        align="center"
        offsetX={70}
        offsetY={size * 0.8}
        text={text}
        fontFamily={FONT}
        fontSize={size}
        fontStyle={style}
        fill={INK}
      />
    );
  }
  return (
    <Text
      x={x}
      y={y}
      rotation={-90}
      offsetY={size * 0.8}
      text={text}
      fontFamily={FONT}
      fontSize={size}
      fontStyle={style}
      fill={INK}
    />
  );
};

/* ===================================================================== *
 *  VERTICALE ELEMENTEN (op de stijglijn)                                *
 * ===================================================================== */

const VAansluiting = ({ placed }: { placed: PlacedNode }) => {
  const p = placed.node.props;
  const h = verticalBlockHeight(placed.node);
  return (
    <>
      <L p={[0, 0, 0, -h]} w={SW2} />
      {/* pijl van de netbeheerder */}
      <L p={[-5, 10, 0, 0]} w={SW} />
      <L p={[5, 10, 0, 0]} w={SW} />
      <Text x={8} y={-16} text={str(p.net)} fontFamily={FONT} fontSize={10} fontStyle="bold" fill={INK} />
      <Text x={8} y={-3} text={str(p.label)} fontFamily={FONT} fontSize={8.5} fill="#475569" />
      {str(p.kabel) ? <VText x={-13} y={-4} text={str(p.kabel)} size={10} italic /> : null}
    </>
  );
};

const VTeller = ({ placed }: { placed: PlacedNode }) => {
  const p = placed.node.props;
  return (
    <>
      <L p={[0, 0, 0, -14]} w={SW2} />
      <Rect x={-20} y={-54} width={40} height={40} stroke={INK} strokeWidth={SW} fill="#ffffff" />
      <L p={[-20, -40, 20, -40]} />
      <Text x={-20} y={-36} width={40} align="center" text="kWh" fontFamily={FONT} fontSize={11} fontStyle="bold" fill={INK} />
      <L p={[0, -54, 0, -68]} w={SW2} />
      <Text x={24} y={-40} text={str(p.type)} fontFamily={FONT} fontSize={8.5} fill="#475569" />
    </>
  );
};

/** Zekering/automaat/differentieel op de stijglijn — zoals de referentie:
 *  schuine lijn (-20°) met zwart blokje, gedraaide tekstlabels rechts. */
const VBeveiliging = ({ placed }: { placed: PlacedNode }) => {
  const { node, kringnr } = placed;
  const p = node.props;
  const kind = node.kind;
  const h = verticalBlockHeight(node);
  const selectief = p.selectief === true;
  const kabel = str(p.kabel).trim();
  const labels = breakerLabelLines(node);
  const contactTop = -45; // 15 stub + 30 contact

  return (
    <>
      {/* stub onderaan */}
      <L p={[0, 0, 0, -15]} w={SW} />

      {kind === 'smeltzekering' ? (
        <>
          <Rect x={-4} y={-45} width={8} height={30} stroke={INK} strokeWidth={SW} fill="#ffffff" />
          <L p={[0, -15, 0, -45]} />
        </>
      ) : (
        <Group x={0} y={-15} rotation={-20}>
          <L p={[0, 0, 0, -30]} />
          {/* Gevuld contactblokje aan het uiteinde van het contact, zoals in het
              VOLTA-document ("40/0.3A type A", "C20"). Het hoort bij een
              automaat, differentieel en differentieelautomaat; het onderscheid
              tussen die toestellen volgt uit het label (Δ-gevoeligheid / curve).
              Een lastschakelaar (hoofdschakelaar) blijft een zuiver contact
              zonder blokje. */}
          {kind === 'automaat' || kind === 'diffautomaat' || kind === 'differentieel' ? (
            <Rect x={-4.5} y={-30} width={4.5} height={10} fill={INK} />
          ) : null}
        </Group>
      )}

      {/* gedraaide labels rechts van de zekering */}
      {labels.map((line, i) => (
        <VText key={i} x={15 + i * 11} y={0} text={line} centerOn={-28} />
      ))}

      {/* selectief differentieel: S-kadertje boven de zekering */}
      {selectief ? (
        <>
          <L p={[0, contactTop, 0, contactTop - 23]} />
          <Rect x={7} y={contactTop - 21} width={16} height={16} stroke={INK} strokeWidth={SW} fill="#ffffff" />
          <Text x={7} y={contactTop - 17} width={16} align="center" text="S" fontFamily={FONT} fontSize={10} fill={INK} />
        </>
      ) : null}

      {/* kabel naar boven met kabeltype ernaast + AREI-geleideraanduiding */}
      <L p={[0, contactTop - (selectief ? 23 : 0), 0, -h]} w={SW} />
      {kabel ? (
        <>
          <ConductorTicks x={0} y={contactTop - (selectief ? 23 : 0) - 12} n={conductorCount(kabel)} />
          <VText x={13} y={contactTop - (selectief ? 23 : 0) - 6} text={kabel} />
        </>
      ) : null}

      {/* kringnummer linksonder */}
      {kringnr ? (
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
      ) : null}

      {/* omschrijving van de kring: verticale vette tekst links */}
      {str(p.label) ? <VText x={-8} y={-52} text={str(p.label)} size={11} bold /> : null}
    </>
  );
};

const VRelais = ({ placed }: { placed: PlacedNode }) => {
  const type = str(placed.node.props.type);
  return (
    <>
      <L p={[0, 0, 0, -12]} w={SW} />
      <Rect x={-8} y={-42} width={16} height={30} stroke={INK} strokeWidth={SW} fill="#ffffff" />
      <L p={[8, -34.5, -8, -19.5]} />
      <L p={[0, -42, 0, -54]} w={SW} />
      <Text x={12} y={-34} text={type} fontFamily={FONT} fontSize={8.5} fill="#475569" />
    </>
  );
};

const VOverspanning = ({ placed }: { placed: PlacedNode }) => (
  <>
    <L p={[0, 0, 0, -12]} w={SW} />
    <Rect x={-7.5} y={-42} width={15} height={30} stroke={INK} strokeWidth={SW} fill="#ffffff" />
    <L p={[0, -42, 0, -32]} />
    <L p={[0, -32, -3, -36]} />
    <L p={[0, -32, 3, -36]} />
    <L p={[0, -12, 0, -22]} />
    <L p={[0, -22, -3, -18]} />
    <L p={[0, -22, 3, -18]} />
    <Text x={11} y={-32} text="SPD" fontFamily={FONT} fontSize={8.5} fill="#475569" />
    <Adres text={str(placed.node.props.label)} cx={0} y={8} w={80} />
  </>
);

/** Bordglyph: de dikke lijn zelf wordt door de layout getekend; hier de naam
 *  en (optioneel) het aardingssymbool. */
const VBord = ({ placed }: { placed: PlacedNode }) => {
  const p = placed.node.props;
  const lineY = placed.y - 16;
  const geaard = p.geaard === true;
  const startX = placed.box.x + (geaard ? 20 : 4);
  const naam = [str(p.naam) || 'Verdeelbord', str(p.lokaal)].filter(Boolean).join(' — ');
  return (
    <>
      {geaard ? (
        <>
          <L p={[startX - 10, lineY, startX - 10, lineY + 22]} w={SW} />
          <L p={[startX - 19, lineY + 22, startX - 1, lineY + 22]} w={SW2} />
          <L p={[startX - 16, lineY + 26, startX - 4, lineY + 26]} />
          <L p={[startX - 13, lineY + 30, startX - 7, lineY + 30]} />
        </>
      ) : null}
      <Text x={startX + 14} y={lineY + 6} text={naam} fontFamily={FONT} fontSize={10} fontStyle="bold" fill={INK} />
    </>
  );
};

/* ===================================================================== *
 *  HORIZONTALE ELEMENTEN (verbruikers in een ketting)                   *
 * ===================================================================== */

const HStopcontact = ({ placed }: { placed: PlacedNode }) => {
  const p = placed.node.props;
  const n = num(p.aantal);
  const aarding = p.aarding !== false;
  const kv = p.kinderveiligheid !== false;
  const units = Array.from({ length: n }, (_, i) => i * 20);
  const totalW = 20 + n * 20 + 17;
  return (
    <>
      {units.map((ux) => (
        <Group key={ux}>
          <L p={[ux, 0, ux + 20, 0]} w={SW} />
          {/* halve cirkel met de bolle kant naar de lijn (iets kleinere diameter) */}
          <Arc x={ux + 32} y={0} innerRadius={12} outerRadius={12} angle={180} rotation={90} stroke={INK} strokeWidth={SW2} />
          {aarding ? <L p={[ux + 20, -12, ux + 20, 12]} w={SW2} /> : null}
          {kv ? (
            <>
              <L p={[ux + 32, -17, ux + 32, -11.1]} w={SW2} />
              <L p={[ux + 32, 17, ux + 32, 11.1]} w={SW2} />
            </>
          ) : null}
        </Group>
      ))}
      {p.halfwaterdicht === true ? (
        <Text x={24} y={-29} text="h" fontFamily={FONT} fontSize={10} fill={INK} />
      ) : null}
      <Adres text={str(p.label)} cx={totalW / 2 + 8} y={24} />
    </>
  );
};

const HLichtpunt = ({ placed }: { placed: PlacedNode }) => {
  const p = placed.node.props;
  const type = str(p.type);
  const n = num(p.aantal);
  const wand = p.wandlamp === true;
  const upperParts: string[] = [];
  if (p.halfwaterdicht === true) upperParts.push('h');
  if (n > 1) upperParts.push(`x${n}`);
  const upper = upperParts.join(', ');

  let body: JSX.Element;
  let cx = 36;
  if (type === 'TL-armatuur') {
    body = (
      <>
        <L p={[0, 0, 30, 0]} w={SW} />
        <L p={[30, -7, 30, 7]} w={SW2} />
        <L p={[90, -7, 90, 7]} w={SW2} />
        <L p={[30, -3.5, 90, -3.5]} w={SW} />
        <L p={[30, 3.5, 90, 3.5]} w={SW} />
      </>
    );
    cx = 60;
  } else if (type === 'LED') {
    body = (
      <>
        <L p={[0, 0, 30, 0]} w={SW} />
        <L p={[30, -7, 30, 7]} w={SW2} />
        <L p={[30, -7, 42, 0]} w={SW2} />
        <L p={[30, 7, 42, 0]} w={SW2} />
        <L p={[42, -7, 42, 7]} w={SW2} />
        <L p={[36, -6, 37, -11]} />
        <L p={[37, -11, 38.1, -9.3]} />
        <L p={[37, -11, 35.3, -9.9]} />
        <L p={[39, -6, 40, -11]} />
        <L p={[40, -11, 41.1, -9.3]} />
        <L p={[40, -11, 38.3, -9.9]} />
        {wand ? <L p={[30, 11, 42, 11]} w={SW} /> : null}
      </>
    );
  } else if (type === 'Spot') {
    body = (
      <>
        <L p={[0, 0, 30, 0]} w={SW} />
        <Arc x={40} y={0} innerRadius={10} outerRadius={10} angle={180} rotation={90} stroke={INK} strokeWidth={SW} />
        <Circle x={40} y={0} radius={6} stroke={INK} strokeWidth={SW} />
        <L p={[35.8, -4.2, 44.2, 4.2]} />
        <L p={[35.8, 4.2, 44.2, -4.2]} />
        {wand ? <L p={[30, 13, 46, 13]} w={SW} /> : null}
      </>
    );
    cx = 40;
  } else {
    // klassiek lichtpunt: kruis op het einde van de lijn
    body = (
      <>
        <L p={[0, 0, 30, 0]} w={SW} />
        <L p={[19.4, -10.6, 40.6, 10.6]} w={SW2} />
        <L p={[19.4, 10.6, 40.6, -10.6]} w={SW2} />
        {wand ? <L p={[30, 14, 42, 14]} w={SW} /> : null}
      </>
    );
    cx = 30;
  }

  return (
    <>
      {body}
      {upper ? (
        <Text x={cx - 14} y={-22} width={36} align="center" text={upper} fontFamily={FONT} fontSize={8} fill={INK} />
      ) : null}
      <Adres text={str(p.label)} cx={cx + 4} y={22} />
    </>
  );
};

const HSchakelaar = ({ placed }: { placed: PlacedNode }) => {
  const p = placed.node.props;
  const type = str(p.type);
  const verklikker = p.verklikker === true;
  const signalisatie = p.signalisatie === true;
  const c = { x: 30, y: 0 };

  const stroke = (dx: 1 | -1, dy: 1 | -1, ticks: 0 | 1 | 2 | 3) => (
    <>
      <L p={[c.x, c.y, c.x + dx * 10, c.y + dy * -20]} />
      {ticks >= 1 ? <L p={[c.x + dx * 10, c.y + dy * -20, c.x + dx * 15, c.y + dy * -17.5]} /> : null}
      {ticks >= 2 ? <L p={[c.x + dx * 8, c.y + dy * -16, c.x + dx * 13, c.y + dy * -13.5]} /> : null}
      {ticks >= 3 ? <L p={[c.x + dx * 6, c.y + dy * -12, c.x + dx * 11, c.y + dy * -9.5]} /> : null}
    </>
  );

  let body: JSX.Element;
  if (type === 'Drukknop') {
    body = (
      <>
        <L p={[0, 0, 30, 0]} w={SW} />
        <Circle x={37} y={0} radius={7} stroke={INK} strokeWidth={SW} fill="#ffffff" />
        <Circle x={37} y={0} radius={4} stroke={INK} strokeWidth={SW} fill="#ffffff" />
      </>
    );
  } else if (type === 'Bewegingsmelder') {
    body = (
      <>
        <L p={[0, 0, 30, 0]} w={SW} />
        <Rect x={30} y={-13} width={10} height={26} stroke={INK} strokeWidth={SW} fill="#ffffff" />
        <Rect x={40} y={-13} width={30} height={26} stroke={INK} strokeWidth={SW} fill="#ffffff" />
        <L p={[40, 13, 70, -13]} />
        <L p={[45, -5, 50, -5]} />
        <L p={[50, -10, 50, -5]} />
        <L p={[50, -10, 55, -10]} />
        <Text x={51} y={2} text="PIR" fontFamily={FONT} fontSize={8} fontStyle="bold" fill={INK} />
      </>
    );
  } else {
    body = (
      <>
        <L p={[0, 0, 30, 0]} w={SW} />
        {type === 'Enkelpolig' || type === 'Dimmer' ? stroke(1, 1, 1) : null}
        {type === 'Tweepolig' ? stroke(1, 1, 2) : null}
        {type === 'Driepolig' ? stroke(1, 1, 3) : null}
        {type === 'Wisselschakelaar' || type === 'Wissel + dimmer' ? (
          <>
            {stroke(1, 1, 1)}
            {stroke(-1, -1, 1)}
          </>
        ) : null}
        {type === 'Kruisschakelaar' ? (
          <>
            {stroke(1, 1, 1)}
            {stroke(-1, -1, 1)}
            {stroke(-1, 1, 1)}
            {stroke(1, -1, 1)}
          </>
        ) : null}
        {type === 'Dubbele aansteking' ? (
          <>
            {stroke(1, 1, 1)}
            {stroke(-1, 1, 1)}
          </>
        ) : null}
        {type === 'Rolluikschakelaar' ? (
          <>
            {stroke(1, 1, 1)}
            {stroke(-1, 1, 1)}
            <Rect x={22} y={-8} width={16} height={16} stroke={INK} strokeWidth={SW} fill="#ffffff" />
            <Text x={22} y={-5} width={16} align="center" text="S" fontFamily={FONT} fontSize={11} fontStyle="bold" fill={INK} />
          </>
        ) : null}
        {type === 'Vertraagde opening' ? (
          <>
            {stroke(1, 1, 1)}
            <Text x={43} y={-22} text="t" fontFamily={FONT} fontSize={12} fontStyle="italic" fill={INK} />
          </>
        ) : null}
        {type === 'Trekschakelaar' ? (
          <>
            {stroke(1, 1, 1)}
            <L p={[30, 5, 30, 17]} />
            <L p={[30, 17, 27, 13]} />
            <L p={[30, 17, 33, 13]} />
          </>
        ) : null}
        {type === 'Dimmer' || type === 'Wissel + dimmer' ? (
          <Line points={[29, -8, 41, -8, 41, -15]} closed fill={INK} stroke={INK} strokeWidth={SW} />
        ) : null}
        <Circle x={30} y={0} radius={5} stroke={INK} strokeWidth={SW} fill="#ffffff" />
      </>
    );
  }

  const cCircle = type === 'Drukknop' ? 37 : 30;

  return (
    <>
      {body}
      {/* Verklikkerlamp: kruis (×) in het bedieningspunt */}
      {verklikker ? (
        <>
          <L p={[cCircle - 3.5, -3.5, cCircle + 3.5, 3.5]} />
          <L p={[cCircle - 3.5, 3.5, cCircle + 3.5, -3.5]} />
        </>
      ) : null}
      {/* Signalisatielamp: apart ⊗-lampje boven de schakelaar, verbonden met een lijntje */}
      {signalisatie ? (
        <>
          <L p={[cCircle - 12, -6, cCircle - 5, 0]} />
          <Circle x={cCircle - 16} y={-10} radius={6} stroke={INK} strokeWidth={SW} fill="#ffffff" />
          <L p={[cCircle - 20.2, -14.2, cCircle - 11.8, -5.8]} />
          <L p={[cCircle - 20.2, -5.8, cCircle - 11.8, -14.2]} />
        </>
      ) : null}
      {p.halfwaterdicht === true ? <Text x={38} y={-26} text="h" fontFamily={FONT} fontSize={10} fill={INK} /> : null}
      <Adres text={str(p.label)} cx={36} y={24} w={76} />
    </>
  );
};

/** Pictogrammen voor vaste toestellen — rechtstreeks naar AREI-conventie. */
const HToestel = ({ placed }: { placed: PlacedNode }) => {
  const p = placed.node.props;
  const type = str(p.type);
  const vermogen = str(p.vermogen).trim();

  const box = (inner: JSX.Element | null, w = 40) => (
    <>
      <L p={[0, 0, 20, 0]} w={SW} />
      <Rect x={20} y={-20} width={w} height={40} stroke={INK} strokeWidth={SW} fill="#ffffff" />
      {inner}
    </>
  );

  let body: JSX.Element;
  let w = 40;
  switch (type) {
    case 'Wasmachine':
      body = box(
        <>
          <Circle x={40} y={0} radius={15} stroke={INK} strokeWidth={SW} />
          <Circle x={40} y={0} radius={3} fill={INK} />
        </>
      );
      break;
    case 'Droogkast':
      body = box(
        <>
          <Circle x={35} y={-7.5} radius={5} stroke={INK} strokeWidth={SW} />
          <Circle x={45} y={-7.5} radius={5} stroke={INK} strokeWidth={SW} />
          <Circle x={40} y={7.5} radius={3} fill={INK} />
        </>
      );
      break;
    case 'Vaatwasser':
      body = box(
        <>
          <L p={[20, -20, 34.3, -5.7]} />
          <L p={[60, 20, 45.7, 5.7]} />
          <L p={[20, 20, 34.3, 5.7]} />
          <L p={[60, -20, 45.7, -5.7]} />
          <Circle x={40} y={0} radius={8} stroke={INK} strokeWidth={SW} />
        </>
      );
      break;
    case 'Koelkast':
      body = box(<Ster cx={40} cy={0} />);
      break;
    case 'Diepvriezer':
      body = box(
        <>
          <Ster cx={30} cy={0} />
          <Ster cx={40} cy={0} />
          <Ster cx={50} cy={0} />
        </>
      );
      break;
    case 'Oven':
      body = box(
        <>
          <L p={[20, -5, 60, -5]} />
          <Circle x={40} y={7.5} radius={3} fill={INK} />
        </>
      );
      break;
    case 'Microgolfoven':
      body = box(
        <>
          <Sinus x={30} y={-10} />
          <Sinus x={30} y={0} />
          <Sinus x={30} y={10} />
        </>
      );
      break;
    case 'Kookfornuis':
      body = box(
        <>
          <Circle x={30} y={10} radius={3} fill={INK} />
          <Circle x={50} y={10} radius={3} fill={INK} />
          <Circle x={50} y={-10} radius={3} fill={INK} />
        </>
      );
      break;
    case 'Boiler':
      body = (
        <>
          <L p={[0, 0, 20, 0]} w={SW} />
          <HatchedCircle cx={40} cy={0} r={20} />
        </>
      );
      break;
    case 'Boiler (accumulatie)':
      body = (
        <>
          <L p={[0, 0, 20, 0]} w={SW} />
          <Circle x={40} y={0} radius={20} stroke={INK} strokeWidth={SW} />
          <HatchedCircle cx={40} cy={0} r={15} />
        </>
      );
      break;
    case 'Elektrische verwarming':
      body = (
        <>
          <L p={[0, 0, 20, 0]} w={SW} />
          <HatchedRect x={20} y={-15} w={50} h={30} />
        </>
      );
      w = 50;
      break;
    case 'Verwarming (accumulatie)':
      body = (
        <>
          <L p={[0, 0, 20, 0]} w={SW} />
          <Rect x={20} y={-15} width={50} height={30} stroke={INK} strokeWidth={SW} fill="#ffffff" />
          <HatchedRect x={25} y={-10} w={40} h={20} />
        </>
      );
      w = 50;
      break;
    case 'Motor':
    case 'Warmtepomp':
    case 'Airco':
      body = (
        <>
          <L p={[0, 0, 20, 0]} w={SW} />
          <Circle x={40} y={0} radius={20} stroke={INK} strokeWidth={SW} />
          <Text
            x={20}
            y={type === 'Motor' ? -8 : -6}
            width={40}
            align="center"
            text={type === 'Motor' ? 'M' : type === 'Warmtepomp' ? 'WP' : 'AC'}
            fontFamily={FONT}
            fontSize={type === 'Motor' ? 16 : 12}
            fontStyle="bold"
            fill={INK}
          />
        </>
      );
      break;
    case 'Ventilator':
    case 'Dampkap':
      body = (
        <>
          <L p={[0, 0, 20, 0]} w={SW} />
          <Rect x={20} y={-15} width={30} height={30} stroke={INK} strokeWidth={SW} fill="#ffffff" />
          <Circle x={30} y={0} radius={5} stroke={INK} strokeWidth={SW} />
          <Circle x={40} y={0} radius={5} stroke={INK} strokeWidth={SW} />
        </>
      );
      w = 30;
      break;
    case 'EV-lader':
      body = (
        <>
          <L p={[0, 0, 7, 0]} w={SW} />
          <Rect x={7} y={13} width={40} height={7} stroke={INK} strokeWidth={SW} fill="#ffffff" />
          <L p={[14, -20, 14, 13]} />
          <L p={[40, -20, 40, 13]} />
          <L p={[14, -20, 40, -20]} />
          <Rect x={17} y={-17} width={20} height={8} stroke={INK} strokeWidth={SW} fill="#ffffff" />
          <L p={[27, -6, 27, 10]} />
          <L p={[40, -6, 43, -6]} />
          <L p={[43, -6, 43, 4]} />
          <L p={[43, 4, 46, 4]} />
          <L p={[46, 4, 46, -15]} />
          <L p={[46, -6, 46, -15]} w={SW2} />
          <Text x={18} y={-4} text="V  E" fontFamily={FONT} fontSize={6} fontStyle="bold" fill={INK} />
          <Text x={18} y={4} text="E  V" fontFamily={FONT} fontSize={6} fontStyle="bold" fill={INK} />
        </>
      );
      w = 46;
      break;
    case 'USB-lader':
      body = (
        <>
          <L p={[0, 0, 20, 0]} w={SW} />
          <Rect x={20} y={-15} width={60} height={30} stroke={INK} strokeWidth={SW} fill="#ffffff" />
          <Circle x={32} y={-5} radius={5} stroke={INK} strokeWidth={SW} />
          <Circle x={39} y={-5} radius={5} stroke={INK} strokeWidth={SW} />
          <Text x={20} y={4} width={30} align="center" text="AC/DC" fontFamily={FONT} fontSize={7} fill={INK} />
          <Text x={52} y={-3} text="USB" fontFamily={FONT} fontSize={10} fill={INK} />
        </>
      );
      w = 60;
      break;
    case 'Omvormer (PV)':
      body = box(
        <>
          <L p={[20, 20, 60, -20]} />
          <Sinus x={25} y={-12} />
          <L p={[40, 10, 55, 10]} />
          <Line points={[40, 13, 55, 13]} stroke={INK} strokeWidth={1} dash={[3, 3]} />
        </>
      );
      break;
    case 'Transformator':
      body = (
        <>
          <L p={[0, 0, 20, 0]} w={SW} />
          <Circle x={28} y={0} radius={8} stroke={INK} strokeWidth={SW} />
          <Circle x={40} y={0} radius={8} stroke={INK} strokeWidth={SW} />
        </>
      );
      w = 28;
      break;
    case 'Zonnepaneel (PV)':
      body = box(
        <>
          <L p={[20, 20, 60, -20]} />
          {/* invallende lichtstralen (pijltjes naar het paneel) */}
          <L p={[30, -17, 38, -9]} />
          <L p={[38, -9, 38, -13]} />
          <L p={[38, -9, 34, -9]} />
          <L p={[40, -13, 48, -5]} />
          <L p={[48, -5, 48, -9]} />
          <L p={[48, -5, 44, -5]} />
        </>
      );
      break;
    case 'Deurslot':
      body = box(
        <>
          <Circle x={40} y={-4} radius={4} stroke={INK} strokeWidth={SW} />
          <L p={[40, 0, 37, 9]} />
          <L p={[40, 0, 43, 9]} />
        </>
      );
      break;
    case 'Zoemer':
      body = (
        <>
          <L p={[0, 0, 20, 0]} w={SW} />
          <L p={[20, -14, 20, 14]} w={SW} />
          <Arc x={20} y={0} innerRadius={14} outerRadius={14} angle={180} rotation={90} stroke={INK} strokeWidth={SW} />
        </>
      );
      w = 16;
      break;
    case 'Sirene':
      body = (
        <>
          <L p={[0, 0, 20, 0]} w={SW} />
          <L p={[20, -14, 20, 14]} w={SW} />
          <L p={[20, -14, 42, -7]} />
          <L p={[42, -7, 42, 7]} />
          <L p={[42, 7, 20, 14]} />
        </>
      );
      w = 24;
      break;
    case 'Bel':
      body = (
        <>
          <L p={[0, 0, 20, 0]} w={SW} />
          <L p={[20, -15, 20, 15]} w={SW2} />
          <Arc x={20} y={0} innerRadius={15} outerRadius={15} angle={180} rotation={-90} stroke={INK} strokeWidth={SW2} />
        </>
      );
      w = 16;
      break;
    case 'Batterij':
      body = (
        <>
          <L p={[0, 0, 20, 0]} w={SW} />
          <L p={[20, -15, 20, 15]} w={SW} />
          <L p={[27, -8, 27, 8]} w={3} />
          <Line points={[28.5, 0, 41.5, 0]} stroke={INK} strokeWidth={1} dash={[3, 3]} />
          <L p={[42, -15, 42, 15]} w={SW} />
          <L p={[49, -8, 49, 8]} w={3} />
        </>
      );
      w = 30;
      break;
    default:
      body = box(null);
      break;
  }

  const cxText = 20 + w / 2;
  return (
    <>
      {body}
      <Text
        x={cxText - 45}
        y={24}
        width={90}
        align="center"
        text={type + (vermogen ? ` — ${vermogen}` : '')}
        fontFamily={FONT}
        fontSize={8.5}
        fill="#475569"
      />
      <Adres text={str(p.label)} cx={cxText} y={36} />
    </>
  );
};

const HAansluitpunt = ({ placed }: { placed: PlacedNode }) => (
  <>
    <L p={[0, 0, 20, 0]} w={SW} />
    <Circle x={25} y={0} radius={5} stroke={INK} strokeWidth={SW} />
    <Adres text={str(placed.node.props.label)} cx={18} y={14} w={70} />
  </>
);

const HAftakdoos = ({ placed }: { placed: PlacedNode }) => (
  <>
    <L p={[0, 0, 20, 0]} w={SW} />
    <Circle x={35} y={0} radius={15} stroke={INK} strokeWidth={SW} />
    <Circle x={35} y={0} radius={7.5} fill={INK} />
    <Adres text={str(placed.node.props.label)} cx={35} y={20} w={80} />
  </>
);

/** Communicatiecontactdoos (data/TV/telefoon): socket-halve-cirkel + label. */
const HCommunicatie = ({ placed }: { placed: PlacedNode }) => {
  const p = placed.node.props;
  const type = str(p.type);
  const n = num(p.aantal);
  const tag = type.startsWith('Data') ? 'RJ45' : type.startsWith('TV') ? 'TV' : 'T';
  return (
    <>
      <L p={[0, 0, 20, 0]} w={SW} />
      <Arc x={32} y={0} innerRadius={12} outerRadius={12} angle={180} rotation={90} stroke={INK} strokeWidth={SW} />
      <L p={[20, -12, 20, 12]} w={SW} />
      <Text x={24} y={-7} text={tag} fontFamily={FONT} fontSize={9} fontStyle="bold" fill={INK} />
      {n > 1 ? <Text x={20} y={-26} text={`×${n}`} fontFamily={FONT} fontSize={9} fill={INK} /> : null}
      <Adres text={str(p.label)} cx={20} y={20} />
    </>
  );
};

/** Melder/detector: vierkantje met aanduiding van het type. */
const HMelder = ({ placed }: { placed: PlacedNode }) => {
  const p = placed.node.props;
  const type = str(p.type);
  const tag = type.startsWith('CO') ? 'CO' : type.startsWith('Warmte') ? 'θ' : 'RM';
  return (
    <>
      <L p={[0, 0, 14, 0]} w={SW} />
      <Rect x={14} y={-13} width={26} height={26} stroke={INK} strokeWidth={SW} fill="#ffffff" cornerRadius={3} />
      {/* rookmelder = cirkel (rookkamer); andere = letteraanduiding */}
      {tag === 'RM' ? (
        <>
          <Circle x={27} y={0} radius={6} stroke={INK} strokeWidth={SW} />
          <Circle x={27} y={0} radius={2} fill={INK} />
        </>
      ) : (
        <Text x={14} y={-6} width={26} align="center" text={tag} fontFamily={FONT} fontSize={11} fontStyle="bold" fill={INK} />
      )}
      <Adres text={str(p.label)} cx={27} y={20} />
    </>
  );
};

/** Aardingssymbool: korte stijglijn met drie aflopende streepjes. */
const HAarding = ({ placed }: { placed: PlacedNode }) => (
  <>
    <L p={[0, 0, 20, 0]} w={SW} />
    <L p={[20, 0, 20, 8]} w={SW} />
    <L p={[12, 8, 28, 8]} w={SW} />
    <L p={[15, 12, 25, 12]} />
    <L p={[18, 16, 22, 16]} />
    <Adres text={str(placed.node.props.label)} cx={20} y={24} w={80} />
  </>
);

/** Domotica-sturingseenheid: rechthoek in twee delen (sturing boven, basis onder). */
const HDomotica = ({ placed }: { placed: PlacedNode }) => {
  const p = placed.node.props;
  const sturing = str(p.sturing);
  return (
    <>
      <L p={[0, 0, 20, 0]} w={SW} />
      <Rect x={20} y={-18} width={28} height={36} stroke={INK} strokeWidth={SW} fill="#ffffff" />
      <L p={[20, 0, 48, 0]} w={SW} />
      {/* bovenste deel = type sturing */}
      {sturing === 'Geprogrammeerd' ? (
        <>
          <Circle x={34} y={-9} radius={5} stroke={INK} strokeWidth={SW} />
          <L p={[34, -9, 34, -12]} />
          <L p={[34, -9, 37, -9]} />
        </>
      ) : sturing === 'Drukknop' ? (
        <>
          <Circle x={34} y={-9} radius={5} stroke={INK} strokeWidth={SW} />
          <Circle x={34} y={-9} radius={2} fill={INK} />
        </>
      ) : (
        // Draadloos / Detectie = radiogolven )))
        <>
          <Arc x={30} y={-9} innerRadius={4} outerRadius={4} angle={120} rotation={-60} stroke={INK} strokeWidth={SW} />
          <Arc x={30} y={-9} innerRadius={7} outerRadius={7} angle={120} rotation={-60} stroke={INK} strokeWidth={SW} />
        </>
      )}
      {/* onderste deel = basissymbool (schakelcontact) */}
      <Circle x={26} y={9} radius={3} stroke={INK} strokeWidth={SW} fill="#ffffff" />
      <L p={[26, 9, 42, 4]} />
      <Adres text={str(p.label)} cx={34} y={24} />
    </>
  );
};

/** Zekering in een horizontale ketting (zelden, maar ondersteund). */
const HBeveiliging = ({ placed }: { placed: PlacedNode }) => {
  const { node } = placed;
  const labels = breakerLabelLines(node);
  return (
    <>
      <L p={[0, 0, 20, 0]} w={SW} />
      {node.kind === 'smeltzekering' ? (
        <>
          <Rect x={20} y={-4} width={30} height={8} stroke={INK} strokeWidth={SW} fill="#ffffff" />
          <L p={[20, 0, 50, 0]} />
        </>
      ) : (
        <Group x={20} y={0} rotation={-20}>
          <L p={[0, 0, 30, 0]} />
          {node.kind !== 'hoofdschakelaar' ? <Rect x={20} y={-4} width={10} height={4} fill={INK} /> : null}
        </Group>
      )}
      {labels.map((line, i) => (
        <Text
          key={i}
          x={0}
          y={12 + i * 11}
          width={62}
          align="center"
          text={line}
          fontFamily={FONT}
          fontSize={10}
          fill={INK}
        />
      ))}
    </>
  );
};

const HRelais = ({ placed }: { placed: PlacedNode }) => {
  const p = placed.node.props;
  const type = str(p.type);
  let inner: JSX.Element | null = null;
  switch (type) {
    case 'Teleruptor':
      inner = (
        <>
          <L p={[28, 6, 36, 6]} />
          <L p={[44, 6, 52, 6]} />
          <L p={[36, -6, 36, 6]} />
          <L p={[44, -6, 44, 6]} />
        </>
      );
      break;
    case 'Relais':
      inner = <L p={[30, -13, 50, 13]} />;
      break;
    case 'Minuterie':
      inner = <Text x={20} y={-6} width={40} align="center" text="t" fontFamily={FONT} fontSize={14} fill={INK} />;
      break;
    case 'Thermostaat':
      inner = (
        <>
          <Circle x={40} y={0} radius={8} stroke={INK} strokeWidth={SW} />
          <L p={[32, 0, 48, 0]} />
        </>
      );
      break;
    case 'Tijdschakelaar':
      inner = (
        <>
          <Circle x={31} y={0} radius={8} stroke={INK} strokeWidth={SW} />
          <L p={[30, 0, 37, 0]} />
          <L p={[31, -6, 31, 1]} />
          <L p={[41, 0, 45, 0]} />
          <L p={[45, 0, 51, -5]} />
          <L p={[51, 0, 56, 0]} />
        </>
      );
      break;
    case 'Dimmer (module)':
      inner = (
        <>
          <L p={[30, 5, 50, 5]} />
          <L p={[30, 5, 30, -5]} />
          <L p={[30, -5, 50, 5]} />
        </>
      );
      break;
    default:
      inner = null;
  }
  return (
    <>
      <L p={[0, 0, 20, 0]} w={SW} />
      <Rect x={20} y={-13} width={40} height={26} stroke={INK} strokeWidth={SW} fill="#ffffff" />
      {inner}
      <Adres text={str(p.label)} cx={40} y={20} w={80} />
    </>
  );
};

const HOverspanning = ({ placed }: { placed: PlacedNode }) => (
  <>
    <L p={[0, 0, 20, 0]} w={SW} />
    <Rect x={20} y={-15} width={15} height={30} stroke={INK} strokeWidth={SW} fill="#ffffff" />
    <L p={[27.5, -15, 27.5, -5]} />
    <L p={[27.5, -5, 24.5, -9]} />
    <L p={[27.5, -5, 30.5, -9]} />
    <L p={[27.5, 15, 27.5, 5]} />
    <L p={[27.5, 5, 24.5, 9]} />
    <L p={[27.5, 5, 30.5, 9]} />
    <L p={[27.5, 15, 27.5, 26]} />
    <L p={[19.5, 26, 35.5, 26]} w={SW2} />
    <L p={[22.5, 30, 32.5, 30]} />
    <L p={[25.5, 34, 29.5, 34]} />
    <Adres text={str(placed.node.props.label)} cx={28} y={38} w={70} />
  </>
);

/* ====================================================================== */

/** Geeft de symbool-tekening van een component; ook gebruikt door het
 *  symbolenpalet om een live voorbeeld van elk symbool te tonen. */
export const glyphFor = (placed: PlacedNode): JSX.Element => {
  const { node, orient } = placed;
  if (orient === 'v') {
    switch (node.kind) {
      case 'aansluiting':
        return <VAansluiting placed={placed} />;
      case 'teller':
        return <VTeller placed={placed} />;
      case 'bord':
        return <VBord placed={placed} />;
      case 'automaat':
      case 'differentieel':
      case 'diffautomaat':
      case 'smeltzekering':
      case 'hoofdschakelaar':
        return <VBeveiliging placed={placed} />;
      case 'relais':
        return <VRelais placed={placed} />;
      case 'overspanning':
        return <VOverspanning placed={placed} />;
      default:
        return <Text text={node.kind} fontFamily={FONT} fontSize={10} fill={INK} />;
    }
  }
  switch (node.kind) {
    case 'stopcontact':
      return <HStopcontact placed={placed} />;
    case 'lichtpunt':
      return <HLichtpunt placed={placed} />;
    case 'schakelaar':
      return <HSchakelaar placed={placed} />;
    case 'toestel':
      return <HToestel placed={placed} />;
    case 'aansluitpunt':
      return <HAansluitpunt placed={placed} />;
    case 'aftakdoos':
      return <HAftakdoos placed={placed} />;
    case 'communicatie':
      return <HCommunicatie placed={placed} />;
    case 'melder':
      return <HMelder placed={placed} />;
    case 'aarding':
      return <HAarding placed={placed} />;
    case 'domotica':
      return <HDomotica placed={placed} />;
    case 'automaat':
    case 'differentieel':
    case 'diffautomaat':
    case 'smeltzekering':
    case 'hoofdschakelaar':
      return <HBeveiliging placed={placed} />;
    case 'relais':
      return <HRelais placed={placed} />;
    case 'overspanning':
      return <HOverspanning placed={placed} />;
    default:
      return <Text text={node.kind} fontFamily={FONT} fontSize={10} fill={INK} />;
  }
};

interface GlyphProps {
  placed: PlacedNode;
  selected: boolean;
  onSelect: (id: string) => void;
}

export const NodeGlyph = ({ placed, selected, onSelect }: GlyphProps) => {
  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent | PointerEvent>) => {
    e.cancelBubble = true;
    onSelect(placed.node.id);
  };
  const { box } = placed;

  return (
    <>
      {selected ? (
        <Rect
          x={box.x - 3}
          y={box.y - 3}
          width={box.w + 6}
          height={box.h + 6}
          fill="rgba(37, 99, 235, 0.08)"
          stroke={SELECT}
          strokeWidth={1.25}
          dash={[5, 4]}
          cornerRadius={5}
          listening={false}
        />
      ) : null}
      <Group x={placed.x} y={placed.y} listening={false}>
        {glyphFor(placed)}
      </Group>
      <Rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        fill="transparent"
        onClick={handleClick}
        onTap={handleClick}
        onMouseEnter={(e) => {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = 'pointer';
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = '';
        }}
      />
    </>
  );
};
