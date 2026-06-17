import { useMemo } from 'react';
import { Circle, Group, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import type { SchemaNode } from '@/edt/model';
import type { PlanEntry, PlanMarker } from '@/edt/plan';
import { useSchemaStore } from '@/store/schemaStore';
import { buildPlanSymbol } from './symbolRender';

/** Gewenste schermgrootte (grootste zijde) van een symbool bij schaal 1. */
const TARGET = 48;

/**
 * Eén component uit het eendraadschema, getekend als zijn echte AREI-symbool op
 * het situatieplan. Versleepbaar en draaibaar; een klein gekleurd badge toont
 * het kringnummer zodat de koppeling met het schema zichtbaar blijft.
 *
 * De tekening wordt rechtstreeks uit de schema-node opgebouwd: wijzigt het
 * schema (bv. type schakelaar of aantal lichtpunten), dan verandert het symbool
 * op het plan automatisch mee.
 */
export const PlanSymbol = ({
  marker,
  entry,
  node,
  selected,
  scale,
}: {
  marker: PlanMarker;
  entry: PlanEntry;
  node: SchemaNode;
  selected: boolean;
  scale: number;
}) => {
  const selectMarker = useSchemaStore((s) => s.selectMarker);
  const movePlanMarker = useSchemaStore((s) => s.movePlanMarker);

  const { element, box } = useMemo(() => buildPlanSymbol(node), [node]);

  // Symbolen blijven leesbaar op elk zoomniveau (zoals de oude markeringen):
  // binnen een redelijk zoombereik houden ze een vaste schermgrootte aan.
  const k = 1 / Math.max(0.35, Math.min(scale, 3));
  const userScale = marker.scale ?? 1;
  const rotation = marker.rotation ?? 0;

  const symScale = (TARGET / Math.max(box.w, box.h)) * k * userScale;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const halfW = (box.w / 2) * symScale;
  const halfH = (box.h / 2) * symScale;

  // Badge-maat hangt enkel van het zoomniveau af (niet van de symboolgrootte),
  // zodat het nummer altijd compact en leesbaar blijft.
  const badgeR = 8.5 * k;
  const pad = 5 * k;

  return (
    <Group
      x={marker.position.x}
      y={marker.position.y}
      rotation={rotation}
      draggable
      onClick={(e) => {
        e.cancelBubble = true;
        selectMarker(marker.id);
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        selectMarker(marker.id);
      }}
      onDragStart={() => selectMarker(marker.id)}
      onDragEnd={(e) => {
        const g = e.target as Konva.Group;
        movePlanMarker(marker.id, { x: g.x(), y: g.y() });
      }}
    >
      {/* Witte achtergrond + selectiekader rond het symbool. */}
      <Rect
        x={-halfW - pad}
        y={-halfH - pad}
        width={halfW * 2 + pad * 2}
        height={halfH * 2 + pad * 2}
        cornerRadius={4 * k}
        fill="rgba(255,255,255,0.82)"
        stroke={selected ? entry.color : 'rgba(15,23,42,0.18)'}
        strokeWidth={(selected ? 2 : 1) * k}
        dash={selected ? [5 * k, 3 * k] : undefined}
        shadowColor="#000000"
        shadowBlur={selected ? 6 * k : 3 * k}
        shadowOpacity={0.25}
      />

      {/* Het echte symbool, gecentreerd op de markering. */}
      <Group
        scaleX={symScale}
        scaleY={symScale}
        x={-cx * symScale}
        y={-cy * symScale}
        listening={false}
      >
        {element}
      </Group>

      {/* Kringnummer-badge (blijft rechtop, ook als het symbool gedraaid is). */}
      <Group x={halfW + pad} y={-halfH - pad} rotation={-rotation} listening={false}>
        <Circle radius={badgeR} fill={entry.color} stroke="#ffffff" strokeWidth={1.2 * k} />
        <Text
          text={entry.label}
          width={badgeR * 2}
          height={badgeR * 2}
          offsetX={badgeR}
          offsetY={badgeR}
          align="center"
          verticalAlign="middle"
          fontSize={(entry.label.length > 3 ? 7.5 : 9.5) * k}
          fontStyle="bold"
          fontFamily="Inter, system-ui, sans-serif"
          fill="#ffffff"
        />
      </Group>
    </Group>
  );
};
