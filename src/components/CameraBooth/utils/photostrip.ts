import { PHOTOSTRIP_CONFIG } from "../constants";
import { drawCosmicFrame } from "./cosmicFrame";

/**
 * Loads an image from a source URL
 */
export const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => resolve(img);
  });

/**
 * Creates a rounded rectangle path on a canvas context
 */
export const roundRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void => {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
};

/**
 * Generates the final photostrip image with all shots, composited onto the
 * given frame image. Falls back to the built-in cosmic Mission Patch frame
 * (drawn live on canvas) when no frame image is available — e.g. the very
 * first run before any frame has been uploaded to the library.
 */
export const generatePhotostrip = async (
  shots: (string | null)[],
  frameImageUrl?: string | null
): Promise<string> => {
  const { width, height, quality, slots, padding, borderRadius } =
    PHOTOSTRIP_CONFIG;

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = width;
  finalCanvas.height = height;
  const ctx = finalCanvas.getContext("2d")!;

  if (frameImageUrl) {
    const frame = await loadImage(frameImageUrl);
    ctx.drawImage(frame, 0, 0, width, height);
  } else {
    // Draw the cosmic Mission Patch frame: sky, nebula glow, stars, mascots, wordmarks
    await drawCosmicFrame(ctx, width, height);
  }

  // Draw each shot
  for (let i = 0; i < shots.length; i++) {
    if (!shots[i]) continue;
    
    const img = await loadImage(shots[i]!);
    const slot = slots[i];
    const sx = slot.x + padding;
    const sy = slot.y + padding;
    const sw = slot.w - padding * 2;
    const sh = slot.h - padding * 2;

    // Clip to rounded rectangle
    ctx.save();
    ctx.beginPath();
    roundRectPath(ctx, sx, sy, sw, sh, borderRadius);
    ctx.clip();

    // Draw image with cover-fit
    const ratio = Math.max(sw / img.width, sh / img.height);
    const dw = img.width * ratio;
    const dh = img.height * ratio;
    const dx = sx - (dw - sw) / 2;
    const dy = sy - (dh - sh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();

    // Draw border
    ctx.save();
    ctx.strokeStyle = "rgba(185,198,218,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    roundRectPath(ctx, sx, sy, sw, sh, borderRadius);
    ctx.stroke();
    ctx.restore();
  }

  return finalCanvas.toDataURL("image/jpeg", quality);
};

/**
 * Triggers a download of the photostrip
 */
export const downloadPhotostrip = async (
  shots: (string | null)[],
  frameImageUrl?: string | null
): Promise<void> => {
  const url = await generatePhotostrip(shots, frameImageUrl);
  const a = document.createElement("a");
  a.href = url;
  a.download = "photostrip.png";
  a.click();
};
