import { useRef, useState, useEffect } from 'react';
import { Group, Rect } from 'react-konva';
import type Konva from 'konva';
import type { PlacedNode } from '@/edt/layout';
import type { LabelSpec } from '@/edt/labels';

const SELECT = '#2563eb';

interface Rect4 {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Props {
  placed: PlacedNode;
  spec: LabelSpec;
  offset: { dx: number; dy: number };
  selected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, key: string, dx: number, dy: number) => void;
}

/**
 * Eén versleepbaar tekstlabel. De inhoud (spec.content) staat op
 * node-lokale coördinaten; deze groep verschuift ze met de bewaarde offset en
 * laat de gebruiker ze vrij verslepen. Bij het loslaten wordt de nieuwe offset
 * (t.o.v. de standaardplaats) opgeslagen.
 */
export const DraggableLabel = ({ placed, spec, offset, selected, onSelect, onMove }: Props) => {
  const ref = useRef<Konva.Group>(null);
  const [box, setBox] = useState<Rect4 | null>(null);

  // Begrenzing van de tekst opmeten zodat we (als de node geselecteerd is) een
  // subtiel kader kunnen tonen dat aangeeft dat het label sleepbaar is. Geen
  // dependency-array: na de eerste stabiele meting bailt setBox uit, dus er is
  // geen oneindige lus.
  useEffect(() => {
    // Het kader is enkel zichtbaar voor de geselecteerde node, dus alleen dan
    // meten we de tekstbegrenzing — scheelt werk op grote schema's.
    if (!selected) return;
    const g = ref.current;
    if (!g) return;
    const r = g.getClientRect({ relativeTo: g, skipShadow: true, skipStroke: true });
    setBox((prev) =>
      prev &&
      Math.abs(prev.x - r.x) < 0.5 &&
      Math.abs(prev.y - r.y) < 0.5 &&
      Math.abs(prev.w - r.width) < 0.5 &&
      Math.abs(prev.h - r.height) < 0.5
        ? prev
        : { x: r.x, y: r.y, w: r.width, h: r.height }
    );
  });

  const setCursor = (e: Konva.KonvaEventObject<unknown>, cursor: string) => {
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = cursor;
  };

  return (
    <Group
      ref={ref}
      x={placed.x + offset.dx}
      y={placed.y + offset.dy}
      draggable
      onMouseDown={(e) => {
        // Belet dat het slepen van een label tegelijk het canvas pant.
        e.cancelBubble = true;
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect(placed.node.id);
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect(placed.node.id);
      }}
      onDragStart={(e) => {
        // Niet selecteren tijdens het slepen: een re-render zou de
        // (gecontroleerde) positie midden in de sleepbeweging terugzetten.
        e.cancelBubble = true;
      }}
      onDragEnd={(e) => {
        e.cancelBubble = true;
        const dx = Math.round(e.target.x() - placed.x);
        const dy = Math.round(e.target.y() - placed.y);
        // Houd Konva's positie gelijk aan de gecontroleerde waarde. Wanneer de
        // (afgeronde) offset niet wijzigt, volgt er geen re-render en zou het
        // label anders op zijn licht versleepte plek blijven hangen i.p.v.
        // terug te springen naar zijn gecontroleerde coördinaat.
        e.target.position({ x: placed.x + dx, y: placed.y + dy });
        onMove(placed.node.id, spec.key, dx, dy);
        onSelect(placed.node.id);
      }}
      onMouseEnter={(e) => setCursor(e, 'move')}
      onMouseLeave={(e) => setCursor(e, '')}
    >
      {selected && box ? (
        <Rect
          x={box.x - 2}
          y={box.y - 2}
          width={box.w + 4}
          height={box.h + 4}
          fill="rgba(37, 99, 235, 0.06)"
          stroke={SELECT}
          strokeWidth={0.6}
          dash={[3, 3]}
          cornerRadius={3}
          listening={false}
        />
      ) : null}
      {spec.content}
    </Group>
  );
};
