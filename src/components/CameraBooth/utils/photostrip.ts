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

interface FrameWindow {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Finds the transparent "photo windows" cut into a frame that has already been
 * drawn onto a transparent canvas of `width`×`height`. A window is a vertical
 * band of rows that are mostly transparent; its horizontal extent is measured
 * at the band's mid-row (robust to rounded corners). Windows are returned
 * top-to-bottom. Returns an empty array for an opaque image used as a frame,
 * which signals the caller to fall back to the fixed slot geometry.
 *
 * This lets any uploaded frame place its photos through its own cut-outs rather
 * than relying on hardcoded slot coordinates that only matched the original
 * built-in cosmic frame.
 */
const detectFrameWindows = (
  data: Uint8ClampedArray,
  width: number,
  height: number
): FrameWindow[] => {
  const ALPHA_THRESHOLD = 128; // below this counts as "transparent"
  const ROW_COVERAGE = 0.3; // a window row is >=30% transparent across its width
  const MIN_WINDOW_HEIGHT = 60; // ignore thin transparent slivers (e.g. logo gaps)
  const minTransparentPerRow = width * ROW_COVERAGE;

  const rowIsWindow: boolean[] = new Array(height);
  for (let y = 0; y < height; y++) {
    let transparent = 0;
    const rowStart = y * width * 4;
    for (let x = 0; x < width; x++) {
      if (data[rowStart + x * 4 + 3] < ALPHA_THRESHOLD) transparent++;
    }
    rowIsWindow[y] = transparent >= minTransparentPerRow;
  }

  const windows: FrameWindow[] = [];
  let bandStart = -1;
  for (let y = 0; y <= height; y++) {
    const inBand = y < height && rowIsWindow[y];
    if (inBand && bandStart < 0) {
      bandStart = y;
    } else if (!inBand && bandStart >= 0) {
      const bandEnd = y - 1;
      if (bandEnd - bandStart + 1 >= MIN_WINDOW_HEIGHT) {
        const midY = (bandStart + bandEnd) >> 1;
        let xMin = width;
        let xMax = -1;
        const midStart = midY * width * 4;
        for (let x = 0; x < width; x++) {
          if (data[midStart + x * 4 + 3] < ALPHA_THRESHOLD) {
            if (x < xMin) xMin = x;
            if (x > xMax) xMax = x;
          }
        }
        if (xMax >= xMin) {
          windows.push({
            x: xMin,
            y: bandStart,
            w: xMax - xMin + 1,
            h: bandEnd - bandStart + 1,
          });
        }
      }
      bandStart = -1;
    }
  }

  return windows;
};

/**
 * Draws an image cover-fit into a rectangle, clipped to it. `bleed` extends the
 * draw area slightly on every side so the photo tucks under the frame's border
 * and leaves no transparent seam at the window edge.
 */
const drawCoverFit = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  rect: FrameWindow,
  bleed = 0
): void => {
  const x = rect.x - bleed;
  const y = rect.y - bleed;
  const w = rect.w + bleed * 2;
  const h = rect.h + bleed * 2;

  const ratio = Math.max(w / img.width, h / img.height);
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  const dx = x - (dw - w) / 2;
  const dy = y - (dh - h) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
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

    // Draw the frame onto the still-transparent canvas and read its alpha to
    // find the transparent photo windows the designer cut into it.
    ctx.drawImage(frame, 0, 0, width, height);
    let windows: FrameWindow[] = [];
    try {
      const { data } = ctx.getImageData(0, 0, width, height);
      windows = detectFrameWindows(data, width, height);
    } catch {
      // getImageData throws on a cross-origin-tainted canvas — fall through to
      // the fixed-slot path below with the frame kept as a background.
      windows = [];
    }

    if (windows.length > 0) {
      // Window-aware compositing: photos fill the frame's own cut-outs, then the
      // frame is painted on top so its art masks the photo edges. An opaque
      // white base keeps any window without a shot white instead of black
      // (the exported JPEG has no alpha channel).
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      const BLEED = 4;
      const count = Math.min(shots.length, windows.length);
      for (let i = 0; i < count; i++) {
        if (!shots[i]) continue;
        const img = await loadImage(shots[i]!);
        drawCoverFit(ctx, img, windows[i], BLEED);
      }

      ctx.drawImage(frame, 0, 0, width, height);
      return finalCanvas.toDataURL("image/jpeg", quality);
    }

    // Opaque frame (no transparent windows): keep it as a full-canvas
    // background and use the fixed slot geometry below. It is already drawn.
  } else {
    // Draw the cosmic Mission Patch frame: sky, nebula glow, stars, mascots, wordmarks
    await drawCosmicFrame(ctx, width, height);
  }

  // Fixed-slot fallback: the built-in cosmic frame, or an opaque uploaded frame.
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
