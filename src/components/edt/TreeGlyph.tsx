/**
 * Compacte AREI-symbolen voor de INSTALLATIE-lijst (linkerpaneel).
 *
 * Dit zijn vereenvoudigde, tekst-loze versies van de symbolen die ook in het
 * eendraadschema (NodeGlyph) gebruikt worden, zodat de lijst dezelfde
 * herkenbare Belgische conventies toont in plaats van generieke icoontjes.
 *
 * Tekenstijl: stroke = currentColor (zo kleurt het symbool mee met de rij,
 * wit wanneer geselecteerd), verticale beveiligingen op een stijglijn,
 * horizontale verbruikers op een korte aansluitlijn.
 */

const SW = 1.4; // dunne lijn
const SW2 = 2; // hoofdlijn (aardingsbalk, railslijn)

interface Props {
  kind: string;
  /** Optioneel `type`-veld (schakelaar/lichtpunt) voor de juiste variant. */
  type?: string;
  className?: string;
}

const Body = ({ kind, type }: { kind: string; type?: string }) => {
  switch (kind) {
    /* --------------------------------------------------- voeding / bord */
    case 'aansluiting':
      return (
        <>
          <line x1={14} y1={28} x2={14} y2={2} strokeWidth={SW2} />
          <line x1={14} y1={28} x2={10} y2={23} strokeWidth={SW} />
          <line x1={14} y1={28} x2={18} y2={23} strokeWidth={SW} />
        </>
      );
    case 'teller':
      return (
        <>
          <line x1={14} y1={28} x2={14} y2={2} strokeWidth={SW2} />
          <rect x={5} y={8} width={18} height={13} strokeWidth={SW} fill="#fff" />
          <line x1={5} y1={14} x2={23} y2={14} strokeWidth={SW} />
        </>
      );
    case 'bord':
      return <line x1={14} y1={27} x2={14} y2={3} strokeWidth={3} strokeLinecap="round" />;

    /* ----------------------------------------------------- beveiliging */
    case 'smeltzekering':
      return (
        <>
          <line x1={14} y1={28} x2={14} y2={2} strokeWidth={SW2} />
          <rect x={9} y={9} width={10} height={12} strokeWidth={SW} fill="#fff" />
        </>
      );
    case 'automaat':
    case 'differentieel':
    case 'diffautomaat':
    case 'hoofdschakelaar': {
      const block = kind === 'automaat' || kind === 'diffautomaat';
      const ring = kind === 'differentieel' || kind === 'diffautomaat';
      return (
        <>
          <line x1={14} y1={28} x2={14} y2={2} strokeWidth={SW2} />
          {/* schuin schakelcontact */}
          <line x1={14} y1={20} x2={23} y2={9} strokeWidth={SW} />
          {/* gevuld blokje = automatische uitschakeling */}
          {block ? <line x1={19.8} y1={12.8} x2={22.5} y2={9.5} strokeWidth={3} strokeLinecap="butt" /> : null}
          {/* ringkern = differentieelfunctie */}
          {ring ? <rect x={9} y={17} width={10} height={6} rx={3} strokeWidth={SW} fill="none" /> : null}
        </>
      );
    }
    case 'relais':
      return (
        <>
          <line x1={14} y1={28} x2={14} y2={2} strokeWidth={SW2} />
          <rect x={7} y={9} width={14} height={12} strokeWidth={SW} fill="#fff" />
          <line x1={9} y1={19} x2={19} y2={9} strokeWidth={SW} />
        </>
      );
    case 'overspanning':
      return (
        <>
          <line x1={14} y1={23} x2={14} y2={2} strokeWidth={SW2} />
          <rect x={8} y={7} width={12} height={12} strokeWidth={SW} fill="#fff" />
          <line x1={14} y1={18} x2={14} y2={9} strokeWidth={SW} />
          <line x1={14} y1={9} x2={11} y2={12} strokeWidth={SW} />
          <line x1={14} y1={9} x2={17} y2={12} strokeWidth={SW} />
          <line x1={8} y1={23} x2={20} y2={23} strokeWidth={SW2} />
          <line x1={10} y1={25} x2={18} y2={25} strokeWidth={SW} />
          <line x1={12} y1={27} x2={16} y2={27} strokeWidth={SW} />
        </>
      );

    /* ------------------------------------------------- verbruikers (h) */
    case 'stopcontact':
      return (
        <>
          <line x1={2} y1={15} x2={12} y2={15} strokeWidth={SW} />
          <line x1={12} y1={7} x2={12} y2={23} strokeWidth={SW2} />
          <path d="M12 7 A8 8 0 0 1 12 23" strokeWidth={SW2} fill="none" />
        </>
      );
    case 'lichtpunt':
      if (type === 'TL-armatuur')
        return (
          <>
            <line x1={2} y1={15} x2={11} y2={15} strokeWidth={SW} />
            <rect x={11} y={10} width={14} height={10} strokeWidth={SW} fill="#fff" />
            <line x1={11} y1={15} x2={25} y2={15} strokeWidth={SW} />
          </>
        );
      if (type === 'Spot')
        return (
          <>
            <line x1={2} y1={15} x2={11} y2={15} strokeWidth={SW} />
            <circle cx={16} cy={15} r={6} strokeWidth={SW} fill="#fff" />
            <line x1={11.8} y1={10.8} x2={20.2} y2={19.2} strokeWidth={SW} />
            <line x1={11.8} y1={19.2} x2={20.2} y2={10.8} strokeWidth={SW} />
          </>
        );
      // klassiek lichtpunt = kruis
      return (
        <>
          <line x1={2} y1={15} x2={12} y2={15} strokeWidth={SW} />
          <line x1={8} y1={9} x2={20} y2={21} strokeWidth={SW2} />
          <line x1={8} y1={21} x2={20} y2={9} strokeWidth={SW2} />
        </>
      );
    case 'schakelaar': {
      const wissel = type === 'Wisselschakelaar' || type === 'Wissel + dimmer';
      const kruis = type === 'Kruisschakelaar';
      return (
        <>
          <line x1={2} y1={15} x2={12} y2={15} strokeWidth={SW} />
          <circle cx={12} cy={15} r={3} strokeWidth={SW} fill="#fff" />
          <line x1={12} y1={15} x2={22} y2={6} strokeWidth={SW} />
          {wissel || kruis ? <line x1={12} y1={15} x2={2} y2={24} strokeWidth={SW} /> : null}
          {kruis ? (
            <>
              <line x1={12} y1={15} x2={22} y2={24} strokeWidth={SW} />
              <line x1={12} y1={15} x2={2} y2={6} strokeWidth={SW} />
            </>
          ) : null}
        </>
      );
    }
    case 'toestel':
      return (
        <>
          <line x1={2} y1={15} x2={8} y2={15} strokeWidth={SW} />
          <rect x={8} y={7} width={16} height={16} strokeWidth={SW} fill="#fff" />
          <circle cx={16} cy={15} r={4} strokeWidth={SW} fill="none" />
        </>
      );
    case 'aansluitpunt':
      return (
        <>
          <line x1={2} y1={15} x2={12} y2={15} strokeWidth={SW} />
          <circle cx={15} cy={15} r={3} strokeWidth={SW} fill="#fff" />
        </>
      );
    case 'aftakdoos':
      return (
        <>
          <line x1={2} y1={15} x2={8} y2={15} strokeWidth={SW} />
          <circle cx={16} cy={15} r={6} strokeWidth={SW} fill="#fff" />
          <circle cx={16} cy={15} r={3} fill="currentColor" stroke="none" />
        </>
      );

    /* ------------------------------------------------------------ rest */
    default:
      return <rect x={8} y={9} width={12} height={12} strokeWidth={SW} fill="none" />;
  }
};

export const TreeGlyph = ({ kind, type, className }: Props) => (
  <svg
    viewBox="0 0 28 30"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <Body kind={kind} type={type} />
  </svg>
);
