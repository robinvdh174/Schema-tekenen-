import { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Layer, Line, Rect, Stage, Text } from 'react-konva';
import type Konva from 'konva';
import { Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import { layoutTree } from '@/edt/layout';
import { buildLabelSpecs } from '@/edt/labels';
import { labelOffset } from '@/edt/model';
import { computePlanNumbering, UNASSIGNED_GROUP, VOEDING_GROUP } from '@/edt/plan';
import { registerExporter, registerFitView } from '@/edt/exporter';
import { useSchemaStore } from '@/store/schemaStore';
import { useContainerSize } from '@/hooks/useContainerSize';
import { NodeGlyph } from './NodeGlyph';
import { DraggableLabel } from './DraggableLabel';

const INK = '#111827';
const FONT = 'Arial, Helvetica, sans-serif';
const MARGIN = 70;
const TITLE_W = 250;
const TITLE_H = 58;
const MIN_SCALE = 0.15;
const MAX_SCALE = 4;

export const SchemaCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const { width, height } = useContainerSize(containerRef);
  const [scale, setScale] = useState(1);
  const didInitialFit = useRef(false);

  const doc = useSchemaStore((s) => s.doc);
  const selectedId = useSchemaStore((s) => s.selectedId);
  const select = useSchemaStore((s) => s.select);
  const setLabelOffset = useSchemaStore((s) => s.setLabelOffset);

  const layout = useMemo(() => layoutTree(doc.tree), [doc.tree]);
  const numbering = useMemo(() => computePlanNumbering(doc.tree), [doc.tree]);

  const paper = useMemo(() => {
    const w = Math.max(layout.maxX - layout.minX + MARGIN * 2, 720);
    const h = layout.maxY - layout.minY + MARGIN * 2 + TITLE_H;
    return { x: layout.minX - MARGIN, y: layout.minY - MARGIN, w, h };
  }, [layout]);

  const applyScale = (next: number, center?: { x: number; y: number }) => {
    const stage = stageRef.current;
    if (!stage) return;
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    const old = stage.scaleX();
    const pivot = center ?? { x: width / 2, y: height / 2 };
    const pointTo = {
      x: (pivot.x - stage.x()) / old,
      y: (pivot.y - stage.y()) / old,
    };
    stage.scale({ x: clamped, y: clamped });
    stage.position({ x: pivot.x - pointTo.x * clamped, y: pivot.y - pointTo.y * clamped });
    stage.batchDraw();
    setScale(clamped);
  };

  const fit = () => {
    const stage = stageRef.current;
    if (!stage || width === 0 || height === 0) return;
    const s = Math.min(width / paper.w, height / paper.h) * 0.94;
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
    stage.scale({ x: clamped, y: clamped });
    stage.position({
      x: (width - paper.w * clamped) / 2 - paper.x * clamped,
      y: (height - paper.h * clamped) / 2 - paper.y * clamped,
    });
    stage.batchDraw();
    setScale(clamped);
  };

  // Eerste keer passend zoomen zodra de container een maat heeft; daarna
  // opnieuw passend maken wanneer de beschikbare ruimte sterk verandert (bv.
  // een zijpaneel in- of uitklappen of het venster fors herschalen), zodat het
  // tekenblad de vrije ruimte blijft benutten.
  const prevWidth = useRef(0);
  useEffect(() => {
    if (width === 0 || height === 0) return;
    if (!didInitialFit.current) {
      didInitialFit.current = true;
      prevWidth.current = width;
      fit();
      return;
    }
    if (Math.abs(width - prevWidth.current) > 80) {
      prevWidth.current = width;
      fit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // Export- en fitfuncties beschikbaar maken voor de werkbalk
  useEffect(() => {
    registerFitView(fit);
    registerExporter(() => {
      const stage = stageRef.current;
      if (!stage) return null;
      const prev = {
        scale: stage.scaleX(),
        x: stage.x(),
        y: stage.y(),
        w: stage.width(),
        h: stage.height(),
      };
      stage.size({ width: paper.w, height: paper.h });
      stage.scale({ x: 1, y: 1 });
      stage.position({ x: -paper.x, y: -paper.y });
      const pixelRatio = Math.min(3, Math.max(1.5, 2600 / paper.w));
      const dataUrl = stage.toDataURL({ x: 0, y: 0, width: paper.w, height: paper.h, pixelRatio });
      stage.size({ width: prev.w, height: prev.h });
      stage.scale({ x: prev.scale, y: prev.scale });
      stage.position({ x: prev.x, y: prev.y });
      stage.batchDraw();
      return { dataUrl, width: paper.w, height: paper.h };
    });
    return () => {
      registerExporter(null);
      registerFitView(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper.w, paper.h, paper.x, paper.y, width, height]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const factor = e.evt.deltaY > 0 ? 1 / 1.08 : 1.08;
    applyScale(stage.scaleX() * factor, pointer);
  };

  // Knijpen met twee vingers om in/uit te zoomen (iPad/tablet). Tijdens het
  // knijpen zetten we het slepen (draggable) uit, zodat de één-vinger-pan niet
  // met het zoomen vecht — dat maakte het knijpen schokkerig en onbetrouwbaar.
  const [pinching, setPinching] = useState(false);
  const pinchRef = useRef<{ dist: number; center: { x: number; y: number } } | null>(null);

  const touchDist = (t1: Touch, t2: Touch) =>
    Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
  const touchCenter = (t1: Touch, t2: Touch) => {
    const rect = stageRef.current!.container().getBoundingClientRect();
    return {
      x: (t1.clientX + t2.clientX) / 2 - rect.left,
      y: (t1.clientY + t2.clientY) / 2 - rect.top,
    };
  };

  const handleTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
    if (e.evt.touches.length < 2) return;
    const stage = stageRef.current;
    if (!stage) return;
    if (stage.isDragging()) stage.stopDrag();
    setPinching(true);
    const [t1, t2] = [e.evt.touches[0], e.evt.touches[1]];
    pinchRef.current = { dist: touchDist(t1, t2), center: touchCenter(t1, t2) };
  };

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length < 2) return;
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    if (stage.isDragging()) stage.stopDrag();

    const [t1, t2] = [touches[0], touches[1]];
    const dist = touchDist(t1, t2);
    const center = touchCenter(t1, t2);
    const prev = pinchRef.current;
    if (!prev) {
      pinchRef.current = { dist, center };
      return;
    }
    // In/uit zoomen rond het midden van beide vingers.
    applyScale(stage.scaleX() * (dist / prev.dist), center);
    // Tegelijk meeschuiven wanneer beide vingers samen bewegen.
    const dx = center.x - prev.center.x;
    const dy = center.y - prev.center.y;
    if (dx || dy) {
      stage.position({ x: stage.x() + dx, y: stage.y() + dy });
      stage.batchDraw();
    }
    pinchRef.current = { dist, center };
  };

  const handleTouchEnd = (e: Konva.KonvaEventObject<TouchEvent>) => {
    if (e.evt.touches.length < 2) {
      pinchRef.current = null;
      setPinching(false);
    }
  };

  const datum = new Date(doc.updatedAt).toLocaleDateString('nl-BE');
  const titleX = paper.x + paper.w - 16 - TITLE_W;
  const titleY = paper.y + paper.h - 16 - TITLE_H;

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-slate-200">
      {width > 0 && height > 0 ? (
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          draggable={!pinching}
          onWheel={handleWheel}
          onClick={(e) => {
            if (e.target === e.target.getStage() || e.target.name() === 'paper') select(null);
          }}
          onTap={(e) => {
            if (e.target === e.target.getStage() || e.target.name() === 'paper') select(null);
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDragEnd={() => undefined}
        >
          <Layer>
            {/* Papier */}
            <Rect
              name="paper"
              x={paper.x}
              y={paper.y}
              width={paper.w}
              height={paper.h}
              fill="#ffffff"
              shadowColor="rgba(15, 23, 42, 0.35)"
              shadowBlur={18}
              shadowOffsetY={6}
              cornerRadius={2}
            />
            <Rect
              x={paper.x + 12}
              y={paper.y + 12}
              width={paper.w - 24}
              height={paper.h - 24}
              stroke="#94a3b8"
              strokeWidth={0.75}
              listening={false}
            />

            {/* Stijglijnen en bordlijnen */}
            <Group listening={false}>
              {layout.lines.map((line, i) => (
                <Line key={i} points={line.points} stroke={INK} strokeWidth={line.heavy ? 3 : 1.3} />
              ))}
            </Group>

            {/* Componenten */}
            {layout.placed.map((placed) => (
              <NodeGlyph
                key={placed.node.id}
                placed={placed}
                selected={placed.node.id === selectedId}
                onSelect={select}
              />
            ))}

            {/* Versleepbare tekstlabels (kringnummer, omschrijving, kabel,
                waarde-aanduidingen, adres/lokaal). Bovenop de symbolen zodat
                ze altijd vast te pakken zijn. */}
            {layout.placed.map((placed) =>
              buildLabelSpecs(placed.node, placed.orient, placed.kringnr).map((spec) => (
                <DraggableLabel
                  key={`${placed.node.id}-${spec.key}`}
                  placed={placed}
                  spec={spec}
                  offset={labelOffset(placed.node, spec.key)}
                  selected={placed.node.id === selectedId}
                  onSelect={select}
                  onMove={setLabelOffset}
                />
              ))
            )}

            {/* Componentnummers (zelfde nummering als op het foto-plan) —
                ook versleepbaar, net als de andere tekstlabels. */}
            {layout.placed.map((placed) => {
              const entry = numbering.byId.get(placed.node.id);
              if (!entry || entry.kring === VOEDING_GROUP || entry.kring === UNASSIGNED_GROUP) {
                return null;
              }
              const spec = {
                key: 'nummer',
                label: 'Componentnummer',
                content: (
                  <Text
                    x={placed.box.x + 2 - placed.x}
                    y={placed.box.y - 4 - placed.y}
                    text={entry.label}
                    fontFamily={FONT}
                    fontSize={8}
                    fontStyle="bold"
                    fill={entry.color}
                  />
                ),
              };
              return (
                <DraggableLabel
                  key={`nr-${placed.node.id}`}
                  placed={placed}
                  spec={spec}
                  offset={labelOffset(placed.node, 'nummer')}
                  selected={placed.node.id === selectedId}
                  onSelect={select}
                  onMove={setLabelOffset}
                />
              );
            })}

            {/* Titelblok */}
            <Group listening={false}>
              <Rect x={titleX} y={titleY} width={TITLE_W} height={TITLE_H} stroke={INK} strokeWidth={1} fill="#ffffff" />
              <Line points={[titleX, titleY + 20, titleX + TITLE_W, titleY + 20]} stroke={INK} strokeWidth={0.75} />
              <Line points={[titleX, titleY + 39, titleX + TITLE_W, titleY + 39]} stroke={INK} strokeWidth={0.75} />
              <Text x={titleX + 8} y={titleY + 5} text="EENDRAADSCHEMA" fontFamily={FONT} fontSize={11} fontStyle="bold" fill={INK} />
              <Text x={titleX + 8} y={titleY + 25} width={TITLE_W - 16} text={doc.name} fontFamily={FONT} fontSize={10} fill={INK} ellipsis wrap="none" />
              <Text
                x={titleX + 8}
                y={titleY + 43}
                width={TITLE_W - 16}
                text={`${datum}${doc.installateur ? ` — ${doc.installateur}` : ''}`}
                fontFamily={FONT}
                fontSize={8.5}
                fill="#475569"
                ellipsis
                wrap="none"
              />
            </Group>
          </Layer>
        </Stage>
      ) : null}

      {/* Zoomknoppen */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-lg border border-slate-300 bg-white/95 p-1 shadow-lg">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
          title="Uitzoomen"
          onClick={() => applyScale(scale / 1.25)}
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-xs font-medium text-slate-600">{Math.round(scale * 100)}%</span>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
          title="Inzoomen"
          onClick={() => applyScale(scale * 1.25)}
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
          title="Passend zoomen"
          onClick={fit}
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
