import { useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Image as KonvaImage, Layer, Stage, Text } from 'react-konva';
import type Konva from 'konva';
import { ImagePlus, Maximize, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { computePlanNumbering, emptyPlan } from '@/edt/plan';
import type { PlanEntry, PlanMarker, PlanPhoto } from '@/edt/plan';
import { useSchemaStore } from '@/store/schemaStore';
import { useContainerSize } from '@/hooks/useContainerSize';
import { createId } from '@/utils/id';

const MIN_SCALE = 0.1;
const MAX_SCALE = 6;
const MARKER_RADIUS = 14;
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

const MarkerDot = ({
  marker,
  entry,
  selected,
  scale,
}: {
  marker: PlanMarker;
  entry: PlanEntry;
  selected: boolean;
  scale: number;
}) => {
  const selectMarker = useSchemaStore((s) => s.selectMarker);
  const movePlanMarker = useSchemaStore((s) => s.movePlanMarker);

  // Markeringen blijven leesbaar op elk zoomniveau.
  const k = 1 / Math.max(0.35, Math.min(scale, 3));
  const r = MARKER_RADIUS * k;

  return (
    <Group
      x={marker.position.x}
      y={marker.position.y}
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
        const node = e.target as Konva.Group;
        movePlanMarker(marker.id, { x: node.x(), y: node.y() });
      }}
    >
      <Circle
        radius={r}
        fill={entry.color}
        stroke="#ffffff"
        strokeWidth={(selected ? 3 : 1.5) * k}
        shadowColor="#000000"
        shadowBlur={5 * k}
        shadowOpacity={0.4}
      />
      <Text
        text={entry.label}
        width={r * 2}
        height={r * 2}
        offsetX={r}
        offsetY={r}
        align="center"
        verticalAlign="middle"
        fontSize={(entry.label.length > 3 ? 8.5 : 10.5) * k}
        fontStyle="bold"
        fontFamily="Inter, system-ui, sans-serif"
        fill="#ffffff"
        listening={false}
      />
    </Group>
  );
};

/**
 * Foto-plan: een foto van de woning waarop de componenten uit het
 * eendraadschema als genummerde markeringen worden geplaatst.
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

  const plan = doc.plan ?? emptyPlan();
  const photo = plan.photo;
  const image = usePhotoImage(photo?.dataUrl);
  const numbering = useMemo(() => computePlanNumbering(doc.tree), [doc.tree]);
  const pendingEntry = pendingNodeId ? numbering.byId.get(pendingNodeId) : undefined;

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
          draggable={!pendingNodeId}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onTap={handleStageClick}
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
              return entry ? (
                <MarkerDot
                  key={marker.id}
                  marker={marker}
                  entry={entry}
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
              Laad een foto of grondplan van de woning
            </p>
            <p className="mb-4 text-xs leading-relaxed text-slate-500">
              Daarna kies je links een component uit het eendraadschema en klik je op de foto
              om de plaats aan te duiden. De nummering (bv. 2.3) volgt automatisch het schema.
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
              title="Foto verwijderen (markeringen blijven bewaard)"
              onClick={() => {
                if (window.confirm('Foto verwijderen? De markeringen blijven bewaard.')) {
                  setPlanPhoto(null);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>

      {/* Geselecteerde markering */}
      {selectedMarker && selectedEntry ? (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-slate-300 bg-white/95 px-3 py-2 shadow-lg">
          <span
            className="flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ backgroundColor: selectedEntry.color }}
          >
            {selectedEntry.label}
          </span>
          <span className="text-xs text-slate-700">
            {selectedEntry.title}
            {selectedEntry.sub ? <span className="text-slate-400"> — {selectedEntry.sub}</span> : null}
          </span>
          <button
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            title="Markering verwijderen (Delete)"
            onClick={() => removePlanMarker(selectedMarker.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Verwijderen
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
