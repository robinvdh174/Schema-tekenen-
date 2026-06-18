import { useEffect, useMemo, useRef, useState } from 'react';
import { Image as KonvaImage, Layer, Stage } from 'react-konva';
import type Konva from 'konva';
import {
  ImagePlus,
  Maximize,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { computePlanNumbering, emptyPlan } from '@/edt/plan';
import type { PlanPhoto } from '@/edt/plan';
import { walk, type SchemaNode } from '@/edt/model';
import { useSchemaStore } from '@/store/schemaStore';
import { useContainerSize } from '@/hooks/useContainerSize';
import { createId } from '@/utils/id';
import { PlanSymbol } from './PlanSymbol';

const MIN_SCALE = 0.1;
const MAX_SCALE = 6;
/** Foto's groter dan dit worden verkleind om het project klein te houden. */
const MAX_PHOTO_DIMENSION = 1800;

const usePhotoImage = (dataUrl: string | undefined) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!dataUrl) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = dataUrl;
    return () => {
      img.onload = null;
    };
  }, [dataUrl]);
  return image;
};

/**
 * Situatieplan: een foto/grondplan van de woning waarop de componenten uit het
 * eendraadschema als hun echte AREI-symbolen worden geplaatst (zoals het
 * situatieschema in Trikker). De symbolen blijven gekoppeld aan het schema.
 */
export const PlanCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { width, height } = useContainerSize(containerRef);
  const [scale, setScale] = useState(1);
  const needsFit = useRef(true);

  const doc = useSchemaStore((s) => s.doc);
  const pendingNodeId = useSchemaStore((s) => s.pendingPlanNodeId);
  const setPendingPlanNode = useSchemaStore((s) => s.setPendingPlanNode);
  const selectedMarkerId = useSchemaStore((s) => s.selectedMarkerId);
  const selectMarker = useSchemaStore((s) => s.selectMarker);
  const setPlanPhoto = useSchemaStore((s) => s.setPlanPhoto);
  const updatePlanPhoto = useSchemaStore((s) => s.updatePlanPhoto);
  const addPlanMarker = useSchemaStore((s) => s.addPlanMarker);
  const removePlanMarker = useSchemaStore((s) => s.removePlanMarker);
  const rotatePlanMarker = useSchemaStore((s) => s.rotatePlanMarker);
  const scalePlanMarker = useSchemaStore((s) => s.scalePlanMarker);

  const plan = doc.plan ?? emptyPlan();
  const photo = plan.photo;
  const image = usePhotoImage(photo?.dataUrl);
  const numbering = useMemo(() => computePlanNumbering(doc.tree), [doc.tree]);
  const pendingEntry = pendingNodeId ? numbering.byId.get(pendingNodeId) : undefined;

  // Snelle opzoeking van de schema-node per id, zodat elk symbool rechtstreeks
  // uit de actuele boom getekend wordt (en dus automatisch meeverandert).
  const nodeById = useMemo(() => {
    const map = new Map<string, SchemaNode>();
    walk(doc.tree, (node) => map.set(node.id, node));
    return map;
  }, [doc.tree]);

  const applyScale = (next: number, center?: { x: number; y: number }) => {
    const stage = stageRef.current;
    if (!stage) return;
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    const old = stage.scaleX();
    const pivot = center ?? { x: width / 2, y: height / 2 };
    const pointTo = { x: (pivot.x - stage.x()) / old, y: (pivot.y - stage.y()) / old };
    stage.scale({ x: clamped, y: clamped });
    stage.position({ x: pivot.x - pointTo.x * clamped, y: pivot.y - pointTo.y * clamped });
    stage.batchDraw();
    setScale(clamped);
  };

  const fit = () => {
    const stage = stageRef.current;
    if (!stage || !photo || width === 0 || height === 0) return;
    const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min(width / photo.width, height / photo.height) * 0.94));
    stage.scale({ x: s, y: s });
    stage.position({ x: (width - photo.width * s) / 2, y: (height - photo.height * s) / 2 });
    stage.batchDraw();
    setScale(s);
  };

  // Passend zoomen zodra er een foto en een containermaat is.
  useEffect(() => {
    if (needsFit.current && photo && width > 0 && height > 0) {
      needsFit.current = false;
      fit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo?.dataUrl, width, height]);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const ratio = Math.min(1, MAX_PHOTO_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * ratio));
      const h = Math.max(1, Math.round(img.naturalHeight * ratio));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      URL.revokeObjectURL(url);
      const next: PlanPhoto = { dataUrl, width: w, height: h, opacity: 1 };
      needsFit.current = true;
      setPlanPhoto(next);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;
    if (pendingNodeId && photo) {
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      addPlanMarker({
        id: createId('mark'),
        nodeId: pendingNodeId,
        position: {
          x: (pointer.x - stage.x()) / stage.scaleX(),
          y: (pointer.y - stage.y()) / stage.scaleY(),
        },
      });
      return;
    }
    if (e.target === e.target.getStage() || e.target.name() === 'photo') {
      selectMarker(null);
    }
  };

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
    applyScale(stage.scaleX() * (dist / prev.dist), center);
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

  const selectedMarker = plan.markers.find((m) => m.id === selectedMarkerId) ?? null;
  const selectedEntry = selectedMarker ? numbering.byId.get(selectedMarker.nodeId) : undefined;

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-slate-200 ${pendingNodeId ? 'cursor-crosshair' : ''}`}
    >
      {width > 0 && height > 0 && photo ? (
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          draggable={!pendingNodeId && !pinching}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Layer>
            {image ? (
              <KonvaImage
                name="photo"
                image={image}
                x={0}
                y={0}
                width={photo.width}
                height={photo.height}
                opacity={photo.opacity}
                shadowColor="rgba(15, 23, 42, 0.35)"
                shadowBlur={18}
                shadowOffsetY={6}
              />
            ) : null}
            {plan.markers.map((marker) => {
              const entry = numbering.byId.get(marker.nodeId);
              const node = nodeById.get(marker.nodeId);
              return entry && node ? (
                <PlanSymbol
                  key={marker.id}
                  marker={marker}
                  entry={entry}
                  node={node}
                  selected={marker.id === selectedMarkerId}
                  scale={scale}
                />
              ) : null;
            })}
          </Layer>
        </Stage>
      ) : null}

      {/* Lege staat: nog geen foto */}
      {!photo ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="mx-4 max-w-md rounded-xl border border-slate-300 bg-white p-6 text-center shadow-lg">
            <ImagePlus className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <p className="mb-1 text-sm font-semibold text-slate-800">
              Laad een grondplan of foto van de woning
            </p>
            <p className="mb-4 text-xs leading-relaxed text-slate-500">
              Daarna kies je links een component uit het eendraadschema en klik je op het plan
              om het <b>echte symbool</b> te plaatsen. Verslepen, draaien en vergroten kan; de
              symbolen blijven gekoppeld aan het schema en veranderen automatisch mee.
            </p>
            <button className="btn-primary px-4 py-2" onClick={() => fileInputRef.current?.click()}>
              Foto kiezen…
            </button>
          </div>
        </div>
      ) : null}

      {/* Hint tijdens plaatsen */}
      {pendingEntry && photo ? (
        <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-slate-300 bg-white/95 px-4 py-1.5 text-xs font-medium text-slate-700 shadow-lg">
          Klik op de foto om{' '}
          <span
            className="mx-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ backgroundColor: pendingEntry.color }}
          >
            {pendingEntry.label}
          </span>{' '}
          {pendingEntry.title} te plaatsen — Esc om te annuleren
        </div>
      ) : null}

      {/* Fotobediening */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-lg border border-slate-300 bg-white/95 p-1 shadow-lg">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
        <button
          className="flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm text-slate-700 hover:bg-slate-100"
          title={photo ? 'Foto vervangen' : 'Foto laden'}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          <span className="hidden sm:inline">{photo ? 'Foto vervangen' : 'Foto laden'}</span>
        </button>
        {photo ? (
          <>
            <label className="flex items-center gap-1.5 px-1" title="Transparantie van de foto">
              <input
                type="range"
                min={20}
                max={100}
                value={Math.round(photo.opacity * 100)}
                onChange={(e) => updatePlanPhoto({ opacity: Number(e.target.value) / 100 })}
                className="w-20 accent-accent"
              />
            </label>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
              title="Plan/foto verwijderen (geplaatste symbolen blijven bewaard)"
              onClick={() => {
                if (window.confirm('Plan/foto verwijderen? De geplaatste symbolen blijven bewaard.')) {
                  setPlanPhoto(null);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>

      {/* Geselecteerd symbool: verplaatsen, draaien, vergroten, verwijderen */}
      {selectedMarker && selectedEntry ? (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-slate-300 bg-white/95 px-3 py-2 shadow-lg">
          <span
            className="flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ backgroundColor: selectedEntry.color }}
          >
            {selectedEntry.label}
          </span>
          <span className="max-w-[14rem] truncate text-xs text-slate-700">
            {selectedEntry.title}
            {selectedEntry.sub ? <span className="text-slate-400"> — {selectedEntry.sub}</span> : null}
          </span>

          <span className="mx-1 h-5 w-px bg-slate-300" />

          {/* Draaien */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
            title="45° linksom draaien"
            onClick={() => rotatePlanMarker(selectedMarker.id, (selectedMarker.rotation ?? 0) - 45)}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
            title="45° rechtsom draaien"
            onClick={() => rotatePlanMarker(selectedMarker.id, (selectedMarker.rotation ?? 0) + 45)}
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {/* Grootte */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
            title="Kleiner"
            onClick={() => scalePlanMarker(selectedMarker.id, (selectedMarker.scale ?? 1) / 1.2)}
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
            title="Groter"
            onClick={() => scalePlanMarker(selectedMarker.id, (selectedMarker.scale ?? 1) * 1.2)}
          >
            <Plus className="h-4 w-4" />
          </button>

          <span className="mx-1 h-5 w-px bg-slate-300" />

          <button
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            title="Symbool verwijderen (Delete)"
            onClick={() => removePlanMarker(selectedMarker.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Verwijderen</span>
          </button>
        </div>
      ) : null}

      {/* Zoomknoppen */}
      {photo ? (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-lg border border-slate-300 bg-white/95 p-1 shadow-lg">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
            title="Uitzoomen"
            onClick={() => applyScale(scale / 1.25)}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-xs font-medium text-slate-600">
            {Math.round(scale * 100)}%
          </span>
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
      ) : null}

      {/* Annuleren van plaatsing door buiten te klikken regelt Esc; toon kleine knop op touch */}
      {pendingNodeId ? (
        <button
          className="absolute bottom-4 left-4 z-10 rounded-lg border border-slate-300 bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-lg hover:bg-slate-100"
          onClick={() => setPendingPlanNode(null)}
        >
          Annuleren
        </button>
      ) : null}
    </div>
  );
};
