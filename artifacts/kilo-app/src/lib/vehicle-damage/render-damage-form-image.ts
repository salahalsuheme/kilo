import {
  VEHICLE_HANDOVER_MARKER_COLORS,
  type VehicleDamageMarker,
} from "@workspace/contracts-domain";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("تعذر تحميل صورة نموذج الأضرار"));
    img.src = src;
  });
}

function drawMarker(
  ctx: CanvasRenderingContext2D,
  marker: VehicleDamageMarker,
  canvasWidth: number,
  canvasHeight: number,
  kind: "prior" | "new",
): void {
  const colors = VEHICLE_HANDOVER_MARKER_COLORS[kind];
  const x = marker.x * canvasWidth;
  const y = marker.y * canvasHeight;
  const radius = Math.max(2.5, Math.min(canvasWidth, canvasHeight) * 0.005);

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = colors.fill;
  ctx.fill();
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = Math.max(1, radius * 0.35);
  ctx.stroke();
}

export async function renderVehicleDamageFormImage(
  imageSrc: string,
  markers: VehicleDamageMarker[],
): Promise<Blob> {
  return renderVehicleHandoverDiagramImage(imageSrc, [], markers);
}

export async function renderVehicleHandoverDiagramImage(
  imageSrc: string,
  priorMarkers: VehicleDamageMarker[],
  newMarkers: VehicleDamageMarker[],
): Promise<Blob> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("تعذر إنشاء صورة النموذج");

  ctx.drawImage(img, 0, 0);

  for (const marker of priorMarkers) {
    drawMarker(ctx, marker, canvas.width, canvas.height, "prior");
  }
  for (const marker of newMarkers) {
    drawMarker(ctx, marker, canvas.width, canvas.height, "new");
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("تعذر إنشاء ملف الصورة"));
    }, "image/png");
  });
}
