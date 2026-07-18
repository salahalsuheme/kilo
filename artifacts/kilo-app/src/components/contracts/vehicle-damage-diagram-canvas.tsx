import { useCallback, useEffect, useRef, useState } from "react";
import type { VehicleDamageMarker } from "@workspace/contracts-domain";
import { cn } from "@/lib/utils";

interface VehicleDamageDiagramCanvasProps {
  imageSrc: string;
  markers: VehicleDamageMarker[];
  onChange: (markers: VehicleDamageMarker[]) => void;
  className?: string;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DRAG_THRESHOLD_PX = 5;
const MARKER_DOT_CLASS =
  "h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-900 bg-red-600 shadow";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function touchDistance(touches: TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

export function VehicleDamageDiagramCanvas({
  imageSrc,
  markers,
  onChange,
  className,
}: VehicleDamageDiagramCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [cursor, setCursor] = useState<VehicleDamageMarker | null>(null);

  const scaleRef = useRef(scale);
  const panRef = useRef(pan);
  scaleRef.current = scale;
  panRef.current = pan;

  const dragRef = useRef<{
    pointerId: number;
    moved: boolean;
    startX: number;
    startY: number;
    panStartX: number;
    panStartY: number;
  } | null>(null);

  const pinchRef = useRef<{
    initialDistance: number;
    initialScale: number;
    initialPanX: number;
    initialPanY: number;
    centerX: number;
    centerY: number;
  } | null>(null);

  const clientToNormalized = useCallback((clientX: number, clientY: number) => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return null;

    const rect = viewport.getBoundingClientRect();
    const vx = clientX - rect.left;
    const vy = clientY - rect.top;
    const width = content.offsetWidth;
    const height = content.offsetHeight;
    if (width <= 0 || height <= 0) return null;

    const x = (vx - panRef.current.x) / (width * scaleRef.current);
    const y = (vy - panRef.current.y) / (height * scaleRef.current);
    if (x < 0 || x > 1 || y < 0 || y > 1) return null;
    return { x, y };
  }, []);

  const zoomAtPoint = useCallback((clientX: number, clientY: number, nextScale: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const pointX = clientX - rect.left;
    const pointY = clientY - rect.top;
    const clampedScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    const currentScale = scaleRef.current;
    const ratio = clampedScale / currentScale;

    const nextPanX = pointX - (pointX - panRef.current.x) * ratio;
    const nextPanY = pointY - (pointY - panRef.current.y) * ratio;

    setScale(clampedScale);
    setPan({ x: nextPanX, y: nextPanY });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = -event.deltaY * 0.0015;
      zoomAtPoint(event.clientX, event.clientY, scaleRef.current * (1 + delta));
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [zoomAtPoint]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragRef.current = {
      pointerId: event.pointerId,
      moved: false,
      startX: event.clientX,
      startY: event.clientY,
      panStartX: panRef.current.x,
      panStartY: panRef.current.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag && event.pointerId === drag.pointerId) {
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
        drag.moved = true;
        if (scaleRef.current > 1) {
          setPan({
            x: drag.panStartX + dx,
            y: drag.panStartY + dy,
          });
        }
      }
      return;
    }

    const point = clientToNormalized(event.clientX, event.clientY);
    setCursor(point);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;

    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (!drag.moved) {
      const point = clientToNormalized(event.clientX, event.clientY);
      if (point) onChange([...markers, point]);
    }

    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handlePointerLeave = () => {
    setCursor(null);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2 - rect.left;
    const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2 - rect.top;

    pinchRef.current = {
      initialDistance: touchDistance(event.touches),
      initialScale: scaleRef.current,
      initialPanX: panRef.current.x,
      initialPanY: panRef.current.y,
      centerX,
      centerY,
    };
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const pinch = pinchRef.current;
    if (!pinch || event.touches.length !== 2) return;

    event.preventDefault();
    const distance = touchDistance(event.touches);
    if (pinch.initialDistance <= 0) return;

    const nextScale = clamp(
      pinch.initialScale * (distance / pinch.initialDistance),
      MIN_SCALE,
      MAX_SCALE,
    );
    const ratio = nextScale / pinch.initialScale;

    setScale(nextScale);
    setPan({
      x: pinch.centerX - (pinch.centerX - pinch.initialPanX) * ratio,
      y: pinch.centerY - (pinch.centerY - pinch.initialPanY) * ratio,
    });
  };

  const handleTouchEnd = () => {
    if (pinchRef.current) pinchRef.current = null;
  };

  const removeMarker = (index: number) => {
    onChange(markers.filter((_, i) => i !== index));
  };

  return (
    <div
      ref={viewportRef}
      className={cn(
        "relative max-h-[60vh] w-full overflow-hidden rounded-md border bg-muted/30 touch-none",
        scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair",
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      role="presentation"
    >
      <div
        ref={contentRef}
        className="relative w-full origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        <img
          src={imageSrc}
          alt="مخطط أضرار المركبة"
          className="block h-auto w-full pointer-events-none"
          draggable={false}
        />

        {cursor ? (
          <span
            className={cn("pointer-events-none absolute z-20", MARKER_DOT_CLASS)}
            style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
          />
        ) : null}

        {markers.map((marker, index) => (
          <button
            key={`${marker.x}-${marker.y}-${index}`}
            type="button"
            className={cn(
              "absolute z-10 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-red-400",
              MARKER_DOT_CLASS,
            )}
            style={{
              left: `${marker.x * 100}%`,
              top: `${marker.y * 100}%`,
            }}
            title="انقر لحذف النقطة"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              removeMarker(index);
            }}
          />
        ))}
      </div>
    </div>
  );
}
