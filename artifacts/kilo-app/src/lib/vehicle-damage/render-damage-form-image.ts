function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("تعذر تحميل صورة نموذج الأضرار"));
    img.src = src;
  });
}

export async function renderVehicleDamageFormImage(
  imageSrc: string,
  markers: Array<{ x: number; y: number }>,
): Promise<Blob> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("تعذر إنشاء صورة النموذج");

  ctx.drawImage(img, 0, 0);
  const radius = Math.max(2.5, Math.min(canvas.width, canvas.height) * 0.005);

  for (const marker of markers) {
    const x = marker.x * canvas.width;
    const y = marker.y * canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#dc2626";
    ctx.fill();
    ctx.strokeStyle = "#991b1b";
    ctx.lineWidth = Math.max(1, radius * 0.35);
    ctx.stroke();
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("تعذر إنشاء ملف الصورة"));
    }, "image/png");
  });
}
