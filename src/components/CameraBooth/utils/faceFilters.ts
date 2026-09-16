// Types for Face Mesh
export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface FaceMeshResults {
  multiFaceLandmarks?: Landmark[][];
}

export interface Filter {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  angle: number;
}

// ── GDG PUP-themed sticker filters ──
export const STICKER_FILTERS: Filter[] = [
  { id: "none",           name: "None",         emoji: "❌",  description: "No sticker" },
  { id: "astronaut",      name: "Astronaut",    emoji: "🧑‍🚀", description: "Space helmet" },
  { id: "alien_antennae", name: "Alien",        emoji: "👽",  description: "Alien antennae" },
  { id: "alien_ears",     name: "Alien Ears",   emoji: "🖖",  description: "Pointy alien ears" },
  { id: "space_visor",    name: "Space Visor",  emoji: "🕶️",  description: "Futuristic visor" },
  { id: "gdg_text",       name: "GDG PUP",      emoji: "✨",  description: "Arced GDG PUP text" },
  { id: "stars",          name: "Stars",        emoji: "⭐",  description: "Falling stars" },
  { id: "binary_rain",    name: "Binary Rain",  emoji: "💻",  description: "Matrix-style 0s and 1s" },
  { id: "hacker_visor",   name: "Hacker Visor", emoji: "👁️",  description: "Green terminal HUD visor" },
  { id: "hacker_scan",    name: "Face Scan",    emoji: "🔬",  description: "Wireframe face scan" },
  { id: "hacker_glitch",  name: "Glitch",       emoji: "⚡",  description: "RGB glitch chromatic shift" },
];

// ──────────────────────────────────────────────────────────
//  🧑‍🚀  ASTRONAUT HELMET
// ──────────────────────────────────────────────────────────
export const drawAstronautHelmet = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
) => {
  const forehead   = landmarks[10];
  const chin       = landmarks[152];
  const leftCheek  = landmarks[234];
  const rightCheek = landmarks[454];
  const leftTemple  = landmarks[71];
  const rightTemple = landmarks[301];

  const faceW  = Math.abs((rightCheek.x - leftCheek.x) * width);
  const faceH  = Math.abs((chin.y - forehead.y) * height);
  const cx     = ((leftCheek.x + rightCheek.x) / 2) * width;
  const cy     = ((forehead.y + chin.y) / 2) * height;

  const angle = Math.atan2(
    (rightTemple.y - leftTemple.y) * height,
    (rightTemple.x - leftTemple.x) * width
  );

  const domeW = faceW * 1.75;
  const domeH = faceH * 1.65;
  const domeOffY = -faceH * 0.06;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Shadow
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 20;

  // ── Dome body (metallic) ──
  ctx.beginPath();
  ctx.ellipse(0, domeOffY, domeW / 2, domeH / 2, 0, 0, Math.PI * 2);
  const domeGrad = ctx.createRadialGradient(-domeW * 0.15, domeOffY - domeH * 0.15, 0, 0, domeOffY, domeW / 2);
  domeGrad.addColorStop(0,    "rgba(210, 225, 245, 0.97)");
  domeGrad.addColorStop(0.55, "rgba(155, 180, 210, 0.95)");
  domeGrad.addColorStop(0.85, "rgba(90, 120, 160, 0.97)");
  domeGrad.addColorStop(1,    "rgba(50, 75, 115, 0.97)");
  ctx.fillStyle = domeGrad;
  ctx.fill();

  // ── Visor cutout ──
  const visorW = faceW * 1.25;
  const visorH = faceH * 0.92;
  ctx.shadowColor = "transparent";

  ctx.beginPath();
  ctx.ellipse(0, domeOffY, visorW / 2, visorH / 2, 0, 0, Math.PI * 2);
  const visorGrad = ctx.createLinearGradient(-visorW / 2, -visorH / 2, visorW / 2, visorH / 2);
  visorGrad.addColorStop(0,   "rgba(0, 15, 50, 0.88)");
  visorGrad.addColorStop(0.5, "rgba(0, 8, 30, 0.82)");
  visorGrad.addColorStop(1,   "rgba(0, 15, 50, 0.88)");
  ctx.fillStyle = visorGrad;
  ctx.fill();

  // Visor cyan glow border
  ctx.strokeStyle = "rgba(87, 202, 255, 0.85)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // ── Visor reflection (clipped) ──
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, domeOffY, visorW / 2, visorH / 2, 0, 0, Math.PI * 2);
  ctx.clip();

  const refGrad = ctx.createLinearGradient(-visorW * 0.35, -visorH * 0.35, 0, 0);
  refGrad.addColorStop(0, "rgba(87, 202, 255, 0.22)");
  refGrad.addColorStop(1, "rgba(87, 202, 255, 0)");
  ctx.beginPath();
  ctx.ellipse(-visorW * 0.12, domeOffY - visorH * 0.22, visorW * 0.28, visorH * 0.16, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = refGrad;
  ctx.fill();
  ctx.restore();

  // ── Dome outer ring ──
  ctx.beginPath();
  ctx.ellipse(0, domeOffY, domeW / 2, domeH / 2, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(220, 235, 255, 0.92)";
  ctx.lineWidth = faceW * 0.055;
  ctx.stroke();

  // Cyan inner ring accent
  ctx.beginPath();
  ctx.ellipse(0, domeOffY, domeW / 2 - faceW * 0.038, domeH / 2 - faceH * 0.022, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(87, 202, 255, 0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // ── Collar ──
  const collarY    = domeH / 2 + domeOffY - faceH * 0.06;
  const collarW    = domeW * 0.82;
  const collarH    = faceH * 0.22;

  ctx.beginPath();
  ctx.roundRect(-collarW / 2, collarY, collarW, collarH, 10);
  const collarGrad = ctx.createLinearGradient(0, collarY, 0, collarY + collarH);
  collarGrad.addColorStop(0,   "rgba(185, 205, 225, 0.97)");
  collarGrad.addColorStop(0.5, "rgba(145, 170, 200, 0.95)");
  collarGrad.addColorStop(1,   "rgba(100, 130, 165, 0.97)");
  ctx.fillStyle = collarGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(87, 202, 255, 0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Collar tech lines
  ctx.strokeStyle = "rgba(87, 202, 255, 0.45)";
  ctx.lineWidth = 1.5;
  for (let i = 1; i < 3; i++) {
    const ly = collarY + collarH * (i / 3);
    ctx.beginPath();
    ctx.moveTo(-collarW * 0.38, ly);
    ctx.lineTo( collarW * 0.38, ly);
    ctx.stroke();
  }
  // Center indicator dot
  ctx.beginPath();
  ctx.arc(0, collarY + collarH / 2, 5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(87, 202, 255, 0.8)";
  ctx.fill();

  ctx.restore();
};

// ──────────────────────────────────────────────────────────
//  👽  ALIEN ANTENNAE
// ──────────────────────────────────────────────────────────
export const drawAlienAntennae = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
) => {
  const forehead   = landmarks[10];
  const chin       = landmarks[152];
  const leftCheek  = landmarks[234];
  const rightCheek = landmarks[454];
  const leftTemple  = landmarks[71];
  const rightTemple = landmarks[301];

  const faceW  = Math.abs((rightCheek.x - leftCheek.x) * width);
  const faceH  = Math.abs((chin.y - forehead.y) * height);
  const headX  = forehead.x * width;
  const headY  = forehead.y * height;

  const angle = Math.atan2(
    (rightTemple.y - leftTemple.y) * height,
    (rightTemple.x - leftTemple.x) * width
  );

  const stemH = faceH * 0.7;
  const orbR  = faceW * 0.07;
  const pulse = 0.75 + Math.sin(Date.now() * 0.004) * 0.25;

  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(angle);

  [{ dx: -faceW * 0.22, curve: -faceW * 0.12, delay: 0 },
   { dx:  faceW * 0.22, curve:  faceW * 0.12, delay: 1 }].forEach(({ dx, curve, delay }) => {
    const tipX = dx + curve;
    const tipY = -stemH;

    // Stalk
    ctx.save();
    ctx.shadowColor = "rgba(87, 202, 255, 0.6)";
    ctx.shadowBlur   = 8;
    ctx.beginPath();
    ctx.moveTo(dx, 0);
    ctx.quadraticCurveTo(dx + curve * 0.5, -stemH * 0.5, tipX, tipY);
    ctx.strokeStyle = "rgba(168, 85, 247, 0.85)";
    ctx.lineWidth   = 3;
    ctx.lineCap     = "round";
    ctx.stroke();
    ctx.restore();

    // Orb glow
    const orbPulse = 0.75 + Math.sin(Date.now() * 0.004 + delay * 1.5) * 0.25;
    const glowGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, orbR * 2.5);
    glowGrad.addColorStop(0,   `rgba(87, 202, 255, ${0.5 * orbPulse})`);
    glowGrad.addColorStop(0.5, `rgba(87, 202, 255, ${0.2 * orbPulse})`);
    glowGrad.addColorStop(1,   "rgba(87, 202, 255, 0)");
    ctx.beginPath();
    ctx.arc(tipX, tipY, orbR * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // Orb core
    const orbGrad = ctx.createRadialGradient(tipX - orbR * 0.3, tipY - orbR * 0.3, 0, tipX, tipY, orbR);
    orbGrad.addColorStop(0,   "#AEEEFF");
    orbGrad.addColorStop(0.4, "#57CAFF");
    orbGrad.addColorStop(0.8, "#4285F4");
    orbGrad.addColorStop(1,   "#1a1a5e");
    ctx.beginPath();
    ctx.arc(tipX, tipY, orbR, 0, Math.PI * 2);
    ctx.fillStyle = orbGrad;
    ctx.fill();

    // Orb highlight
    ctx.beginPath();
    ctx.arc(tipX - orbR * 0.3, tipY - orbR * 0.3, orbR * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fill();
  });

  ctx.restore();
};

// ──────────────────────────────────────────────────────────
//  🖖  ALIEN EARS
// ──────────────────────────────────────────────────────────
export const drawAlienEars = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
) => {
  const leftEar   = landmarks[234];
  const rightEar  = landmarks[454];
  const forehead  = landmarks[10];
  const chin      = landmarks[152];
  const leftTemple  = landmarks[71];
  const rightTemple = landmarks[301];

  const faceH   = Math.abs((chin.y - forehead.y) * height);
  const earH    = faceH * 0.52;

  const angle = Math.atan2(
    (rightTemple.y - leftTemple.y) * height,
    (rightTemple.x - leftTemple.x) * width
  );

  [{ landmark: leftEar, side: -1 }, { landmark: rightEar, side: 1 }].forEach(({ landmark, side }) => {
    const earX = landmark.x * width;
    const earY = landmark.y * height;

    ctx.save();
    ctx.translate(earX, earY);
    ctx.rotate(angle);
    ctx.scale(side, 1);

    // Main ear shape
    ctx.beginPath();
    ctx.moveTo(0, -earH * 0.18);
    ctx.quadraticCurveTo(-earH * 0.1, -earH * 0.42, -earH * 0.42, -earH * 0.72);
    ctx.quadraticCurveTo(-earH * 0.52, -earH * 0.88, -earH * 0.3, -earH * 0.78);
    ctx.quadraticCurveTo(0, -earH * 0.43, earH * 0.1, earH * 0.08);
    ctx.closePath();

    const earGrad = ctx.createLinearGradient(-earH * 0.3, -earH * 0.7, earH * 0.1, earH * 0.08);
    earGrad.addColorStop(0,   "#AEEEFF");
    earGrad.addColorStop(0.3, "#57CAFF");
    earGrad.addColorStop(0.7, "#4285F4");
    earGrad.addColorStop(1,   "#1a1a6e");
    ctx.fillStyle = earGrad;
    ctx.fill();

    // Inner vein
    ctx.beginPath();
    ctx.moveTo(-earH * 0.05, -earH * 0.22);
    ctx.quadraticCurveTo(-earH * 0.18, -earH * 0.48, -earH * 0.28, -earH * 0.58);
    ctx.strokeStyle = "rgba(168, 85, 247, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glow outline
    ctx.beginPath();
    ctx.moveTo(0, -earH * 0.18);
    ctx.quadraticCurveTo(-earH * 0.1, -earH * 0.42, -earH * 0.42, -earH * 0.72);
    ctx.quadraticCurveTo(-earH * 0.52, -earH * 0.88, -earH * 0.3, -earH * 0.78);
    ctx.strokeStyle = "rgba(87, 202, 255, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  });
};

// ──────────────────────────────────────────────────────────
//  ✨  GDG PUP TEXT
// ──────────────────────────────────────────────────────────
export const drawGDGPupText = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
) => {
  const forehead   = landmarks[10];
  const chin       = landmarks[152];
  const leftCheek  = landmarks[234];
  const rightCheek = landmarks[454];
  const leftTemple  = landmarks[71];
  const rightTemple = landmarks[301];

  const leftCheekX  = leftCheek.x * width;
  const leftCheekY  = leftCheek.y * height;
  const rightCheekX = rightCheek.x * width;
  const rightCheekY = rightCheek.y * height;
  const faceW       = Math.abs(rightCheekX - leftCheekX);
  const faceH       = Math.abs((chin.y - forehead.y) * height);

  const centerX = (leftCheekX + rightCheekX) / 2;
  const centerY = (leftCheekY + rightCheekY) / 2 + faceH * 0.1;

  const headAngle = Math.atan2(
    (rightTemple.y - leftTemple.y) * height,
    (rightTemple.x - leftTemple.x) * width
  );

  const radius   = faceW * 0.62 + faceH * 0.18;
  const text     = "GDG PUP";
  // Bolder + bigger than before, matching the weight of the wordmark
  // treatment used across the photostrip frame artifacts.
  const fontSize = faceW * 0.16;

  // Same Google-brand four-color lettering as the frame wordmarks:
  // "GDG" in blue, then P-U-P in red/yellow/green. The space (index 3)
  // is skipped — it still occupies a slot in the arc so spacing stays even.
  const colorForIndex = (i: number): string | null => {
    if (i <= 2) return "#4285F4"; // G D G
    if (i === 4) return "#EA4335"; // P
    if (i === 5) return "#FBBC05"; // U
    if (i === 6) return "#34A853"; // P
    return null; // the space
  };

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(headAngle);
  ctx.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";

  const totalAngle  = Math.PI;
  const chars       = text.split("");
  const spacing     = totalAngle / chars.length;

  chars.forEach((char, i) => {
    const color = colorForIndex(i);
    if (!color) return; // skip the space

    const charAngle = spacing * i + spacing / 2;
    const x = Math.cos(charAngle) * radius;
    const y = -Math.sin(charAngle) * radius - faceH * 0.22;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-charAngle + Math.PI / 2);
    ctx.scale(-1, 1);

    // White outline first so bold colors stay crisp against any skin tone
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth   = fontSize * 0.16;
    ctx.lineJoin    = "round";
    ctx.strokeText(char, 0, 0);

    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur  = 6;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = color;
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });

  // Star sparkles along arc
  const nSparkles = 8;
  for (let i = 0; i < nSparkles; i++) {
    const sa = (totalAngle / (nSparkles - 1)) * i;
    const sr = radius + 14 + Math.sin(Date.now() * 0.004 + i * 0.7) * 6;
    const sx = Math.cos(sa) * sr;
    const sy = -Math.sin(sa) * sr - faceH * 0.12;
    const ss = 2.5 + Math.sin(Date.now() * 0.006 + i) * 1.5;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.beginPath();
    for (let j = 0; j < 4; j++) {
      const a = (j * Math.PI / 2) + Date.now() * 0.002;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * ss, Math.sin(a) * ss);
    }
    ctx.strokeStyle = `rgba(230, 203, 241, ${0.6 + Math.sin(Date.now() * 0.008 + i) * 0.3})`;
    ctx.lineWidth   = 1.8;
    ctx.lineCap     = "round";
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
};

// ──────────────────────────────────────────────────────────
//  ⭐  FALLING STARS
// ──────────────────────────────────────────────────────────
const STAR_COLORS = ["#FFFFFF", "#57CAFF", "#FFD700", "#A855F7", "#AEEEFF"];

export const drawStars = (
  ctx: CanvasRenderingContext2D,
  snowflakes: Snowflake[],
  width: number,
  height: number
) => {
  snowflakes.forEach((flake) => {
    // Update position
    flake.y += flake.speed;
    flake.x += Math.sin(flake.angle + Date.now() * 0.001) * 0.0008;
    flake.angle += 0.015;

    if (flake.y > 1.1) {
      flake.y = -0.1;
      flake.x = Math.random();
    }

    const x  = flake.x * width;
    const y  = flake.y * height;
    const s  = flake.size;
    const color = STAR_COLORS[Math.floor(flake.size * 5) % STAR_COLORS.length];

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(flake.angle);
    ctx.globalAlpha = flake.opacity;

    // 4-point star
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = i * (Math.PI / 2);
      const outer = s;
      const inner = s * 0.38;
      ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
      ctx.lineTo(Math.cos(a + Math.PI / 4) * inner, Math.sin(a + Math.PI / 4) * inner);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur  = s * 2;
    ctx.fill();

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    ctx.restore();
  });
};

// Keep the old name as alias for backward compat
export const drawSnowflakes = drawStars;

// ──────────────────────────────────────────────────────────
//  🕶️  SPACE VISOR
// ──────────────────────────────────────────────────────────
export const drawSpaceVisor = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
) => {
  const leftEyeOuter  = landmarks[33];
  const leftEyeInner  = landmarks[133];
  const rightEyeInner = landmarks[362];
  const rightEyeOuter = landmarks[263];
  const leftEyeTop    = landmarks[159];
  const leftEyeBottom = landmarks[145];
  const noseBridge    = landmarks[6];
  const leftTemple    = landmarks[71];
  const rightTemple   = landmarks[301];

  const lensGap = width * 0.018;
  const leftCX  = ((leftEyeOuter.x + leftEyeInner.x) / 2) * width - lensGap;
  const rightCX = ((rightEyeOuter.x + rightEyeInner.x) / 2) * width + lensGap;
  const lensY   = ((leftEyeTop.y + leftEyeBottom.y) / 2) * height;

  const eyeW    = Math.abs(leftEyeInner.x - leftEyeOuter.x) * width * 2.1;
  const eyeH    = eyeW * 0.62;
  const lensR   = eyeH * 0.35;

  const angle = Math.atan2(
    (rightTemple.y - leftTemple.y) * height,
    (rightTemple.x - leftTemple.x) * width
  );

  ctx.save();
  ctx.translate((leftCX + rightCX) / 2, lensY);
  ctx.rotate(angle);
  ctx.translate(-(leftCX + rightCX) / 2, -lensY);

  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur  = 10;
  ctx.shadowOffsetY = 4;

  const drawLens = (cx: number, color1: string, color2: string) => {
    const lGrad = ctx.createRadialGradient(cx, lensY, 0, cx, lensY, eyeW * 0.6);
    lGrad.addColorStop(0,   color1);
    lGrad.addColorStop(0.5, color2);
    lGrad.addColorStop(1,   "rgba(0,0,20,0.9)");
    ctx.beginPath();
    ctx.roundRect(cx - eyeW / 2, lensY - eyeH / 2, eyeW, eyeH, lensR);
    ctx.fillStyle = lGrad;
    ctx.fill();
    // Sheen
    ctx.beginPath();
    ctx.ellipse(cx - eyeW * 0.18, lensY - eyeH * 0.2, eyeW * 0.12, eyeH * 0.08, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fill();
  };

  // Left lens: cyan
  drawLens(leftCX, "rgba(0, 100, 160, 0.78)", "rgba(0, 60, 120, 0.85)");
  // Right lens: purple
  drawLens(rightCX, "rgba(80, 0, 160, 0.78)", "rgba(50, 0, 110, 0.85)");

  // Chrome frame
  ctx.shadowColor = "transparent";
  ctx.lineWidth   = eyeH * 0.13;

  const drawFrame = (cx: number, color: string) => {
    ctx.beginPath();
    ctx.roundRect(cx - eyeW / 2, lensY - eyeH / 2, eyeW, eyeH, lensR);
    ctx.strokeStyle = color;
    ctx.stroke();
  };
  drawFrame(leftCX, "rgba(87, 202, 255, 0.9)");
  drawFrame(rightCX, "rgba(168, 85, 247, 0.9)");

  // Bridge
  ctx.strokeStyle = "rgba(180, 200, 220, 0.9)";
  ctx.lineWidth   = eyeH * 0.15;
  ctx.lineCap     = "round";
  ctx.beginPath();
  ctx.moveTo(leftCX + eyeW / 2, lensY);
  ctx.lineTo(rightCX - eyeW / 2, lensY);
  ctx.stroke();

  // Temple arms (slim chrome)
  ctx.lineWidth = eyeH * 0.09;
  ctx.strokeStyle = "rgba(190, 210, 230, 0.85)";
  ctx.beginPath();
  ctx.moveTo(leftCX - eyeW / 2, lensY);
  ctx.lineTo(leftTemple.x * width - 20, leftTemple.y * height);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rightCX + eyeW / 2, lensY);
  ctx.lineTo(rightTemple.x * width + 20, rightTemple.y * height);
  ctx.stroke();

  ctx.restore();
};

// Keep old name as alias
export const drawGlasses = drawSpaceVisor;

// ──────────────────────────────────────────────────────────
//  �  BINARY RAIN  (Matrix-style 0/1 columns)
// ──────────────────────────────────────────────────────────
// We keep a stable column state in module scope so it persists across frames
interface BinaryCol { x: number; y: number; speed: number; chars: string[] }
let _binaryCols: BinaryCol[] | null = null;

export const drawBinaryRain = (
  ctx: CanvasRenderingContext2D,
  snowflakes: Snowflake[], // reused as per-column state carrier
  width: number,
  height: number,
  facesLandmarks?: Landmark[][] // when provided, the rain is clipped away around each face
) => {
  const colW    = 18;
  const nCols   = Math.ceil(width / colW);
  const fontSize = 14;

  // Init / resize columns
  if (!_binaryCols || _binaryCols.length !== nCols) {
    _binaryCols = Array.from({ length: nCols }, (_, i) => ({
      x:     i * colW + colW / 2,
      y:     Math.random() * height,
      speed: 40 + Math.random() * 80,
      chars: Array.from({ length: Math.ceil(height / fontSize) + 2 }, () =>
        Math.random() > 0.5 ? "1" : "0"
      ),
    }));
  }

  ctx.save();
  ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";

  const now = Date.now() * 0.001;

  _binaryCols.forEach((col) => {
    // Advance head
    col.y += col.speed * 0.016; // ~60fps delta approx
    if (col.y > height + fontSize * 2) col.y = -fontSize * 2;

    const colLen = col.chars.length;
    for (let j = 0; j < colLen; j++) {
      const cy = col.y - j * fontSize;
      if (cy < -fontSize || cy > height + fontSize) continue;

      const t = j / colLen;
      // Head char: bright white
      if (j === 0) {
        ctx.shadowColor = "#00FF41";
        ctx.shadowBlur  = 12;
        ctx.fillStyle   = "#FFFFFF";
      } else {
        ctx.shadowColor = "rgba(0, 255, 65, 0.4)";
        ctx.shadowBlur  = 6;
        // Fade from bright green to dark
        const alpha = Math.max(0.08, 1 - t * 1.1);
        ctx.fillStyle = `rgba(0, ${Math.floor(180 + 75 * (1 - t))}, ${Math.floor(30 * (1 - t))}, ${alpha})`;
      }

      // Randomly mutate a char for the "typing" feel
      if (Math.random() < 0.02) {
        col.chars[j] = Math.random() > 0.5 ? "1" : "0";
      }

      ctx.fillText(col.chars[j], col.x, cy);
    }
  });

  ctx.restore();

  // Punch an oval hole around each detected face so it stays visible
  // through the falling columns instead of being covered by them.
  if (facesLandmarks && facesLandmarks.length > 0) {
    ctx.save();
    ctx.beginPath();

    facesLandmarks.forEach((landmarks) => {
      const forehead   = landmarks[10];
      const chin       = landmarks[152];
      const leftCheek  = landmarks[234];
      const rightCheek = landmarks[454];
      if (!forehead || !chin || !leftCheek || !rightCheek) return;

      const faceW = Math.abs((rightCheek.x - leftCheek.x) * width);
      const faceH = Math.abs((chin.y - forehead.y) * height);
      const cx    = ((leftCheek.x + rightCheek.x) / 2) * width;
      const cy    = ((forehead.y + chin.y) / 2) * height;

      // Padded beyond the raw landmarks so hair/jawline aren't clipped.
      const holeW = faceW * 1.6;
      const holeH = faceH * 1.7;

      ctx.moveTo(cx + holeW / 2, cy);
      ctx.ellipse(cx, cy, holeW / 2, holeH / 2, 0, 0, Math.PI * 2);
    });

    ctx.clip();
    ctx.clearRect(0, 0, width, height);
    ctx.restore();
  }
};

// ──────────────────────────────────────────────────────────
//  👁️  HACKER VISOR  (green terminal HUD over eyes)
// ──────────────────────────────────────────────────────────
export const drawHackerVisor = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
) => {
  const leftEyeOuter  = landmarks[33];
  const leftEyeInner  = landmarks[133];
  const rightEyeInner = landmarks[362];
  const rightEyeOuter = landmarks[263];
  const leftEyeTop    = landmarks[159];
  const leftEyeBottom = landmarks[145];
  const leftTemple    = landmarks[71];
  const rightTemple   = landmarks[301];
  const forehead      = landmarks[10];
  const chin          = landmarks[152];
  const noseBridge    = landmarks[6];

  const faceW   = Math.abs((rightEyeOuter.x - leftEyeOuter.x) * width) * 2.0;
  const faceH   = Math.abs((chin.y - forehead.y) * height);
  const lensGap = width * 0.016;
  const leftCX  = ((leftEyeOuter.x + leftEyeInner.x) / 2) * width - lensGap;
  const rightCX = ((rightEyeOuter.x + rightEyeInner.x) / 2) * width + lensGap;
  const lensY   = ((leftEyeTop.y + leftEyeBottom.y) / 2) * height;

  const eyeW    = Math.abs(leftEyeInner.x - leftEyeOuter.x) * width * 2.1;
  const eyeH    = eyeW * 0.62;
  const lensR   = eyeH * 0.3;

  const angle = Math.atan2(
    (rightTemple.y - leftTemple.y) * height,
    (rightTemple.x - leftTemple.x) * width
  );

  ctx.save();
  ctx.translate((leftCX + rightCX) / 2, lensY);
  ctx.rotate(angle);
  ctx.translate(-(leftCX + rightCX) / 2, -lensY);

  const t = Date.now() * 0.001;
  const scanY = lensY - eyeH / 2 + ((t * 60) % eyeH);

  const drawLens = (cx: number) => {
    // Dark green lens
    const lg = ctx.createRadialGradient(cx, lensY, 0, cx, lensY, eyeW * 0.6);
    lg.addColorStop(0,   "rgba(0, 60, 10, 0.82)");
    lg.addColorStop(0.6, "rgba(0, 30, 5, 0.88)");
    lg.addColorStop(1,   "rgba(0, 10, 0, 0.92)");
    ctx.beginPath();
    ctx.roundRect(cx - eyeW / 2, lensY - eyeH / 2, eyeW, eyeH, lensR);
    ctx.fillStyle = lg;
    ctx.fill();

    // Scan line
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - eyeW / 2, lensY - eyeH / 2, eyeW, eyeH, lensR);
    ctx.clip();
    const sl = ctx.createLinearGradient(cx, scanY - 4, cx, scanY + 4);
    sl.addColorStop(0,   "rgba(0,255,65,0)");
    sl.addColorStop(0.5, "rgba(0,255,65,0.7)");
    sl.addColorStop(1,   "rgba(0,255,65,0)");
    ctx.fillStyle = sl;
    ctx.fillRect(cx - eyeW / 2, scanY - 4, eyeW, 8);
    ctx.restore();

    // HUD grid lines
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - eyeW / 2, lensY - eyeH / 2, eyeW, eyeH, lensR);
    ctx.clip();
    ctx.strokeStyle = "rgba(0,255,65,0.12)";
    ctx.lineWidth   = 0.5;
    for (let gx = cx - eyeW / 2; gx < cx + eyeW / 2; gx += 10) {
      ctx.beginPath(); ctx.moveTo(gx, lensY - eyeH / 2); ctx.lineTo(gx, lensY + eyeH / 2); ctx.stroke();
    }
    for (let gy = lensY - eyeH / 2; gy < lensY + eyeH / 2; gy += 8) {
      ctx.beginPath(); ctx.moveTo(cx - eyeW / 2, gy); ctx.lineTo(cx + eyeW / 2, gy); ctx.stroke();
    }
    ctx.restore();

    // Green glow frame
    ctx.beginPath();
    ctx.roundRect(cx - eyeW / 2, lensY - eyeH / 2, eyeW, eyeH, lensR);
    ctx.shadowColor = "#00FF41";
    ctx.shadowBlur  = 12;
    ctx.strokeStyle = `rgba(0, 255, 65, ${0.7 + Math.sin(t * 3) * 0.2})`;
    ctx.lineWidth   = eyeH * 0.1;
    ctx.stroke();
  };

  drawLens(leftCX);
  drawLens(rightCX);

  // Bridge
  ctx.shadowColor = "#00FF41";
  ctx.shadowBlur  = 8;
  ctx.strokeStyle = "rgba(0,255,65,0.75)";
  ctx.lineWidth   = eyeH * 0.12;
  ctx.lineCap     = "round";
  ctx.beginPath();
  ctx.moveTo(leftCX + eyeW / 2, lensY);
  ctx.lineTo(rightCX - eyeW / 2, lensY);
  ctx.stroke();

  // Temple arms
  ctx.lineWidth   = eyeH * 0.08;
  ctx.strokeStyle = "rgba(0,255,65,0.55)";
  ctx.beginPath();
  ctx.moveTo(leftCX - eyeW / 2, lensY);
  ctx.lineTo(leftTemple.x * width - 18, leftTemple.y * height);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rightCX + eyeW / 2, lensY);
  ctx.lineTo(rightTemple.x * width + 18, rightTemple.y * height);
  ctx.stroke();

  // HUD readout labels
  ctx.shadowBlur  = 6;
  ctx.font        = `bold ${faceH * 0.05}px 'Courier New', monospace`;
  ctx.fillStyle   = `rgba(0,255,65,${0.55 + Math.sin(t * 4) * 0.2})`;
  ctx.textAlign   = "left";
  ctx.fillText("ACQUIRING TARGET", leftCX - eyeW / 2, lensY + eyeH / 2 + faceH * 0.06);
  ctx.textAlign   = "right";
  const hex = (Math.floor(t * 100) % 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
  ctx.fillText(`0x${hex}`, rightCX + eyeW / 2, lensY + eyeH / 2 + faceH * 0.06);

  ctx.restore();
};

// ──────────────────────────────────────────────────────────
//  🔬  HACKER FACE SCAN  (wireframe landmark overlay)
// ──────────────────────────────────────────────────────────
// Face mesh edge pairs (subset of MediaPipe face tesselation)
const FACE_EDGES: [number, number][] = [
  // Jaw
  [10,338],[338,297],[297,332],[332,284],[284,251],[251,389],[389,356],[356,454],
  [454,323],[323,361],[361,288],[288,397],[397,365],[365,379],[379,378],[378,400],
  [400,377],[377,152],[152,148],[148,176],[176,149],[149,150],[150,136],[136,172],
  [172,58],[58,132],[132,93],[93,234],[234,127],[127,162],[162,21],[21,54],[54,103],
  [103,67],[67,109],[109,10],
  // Left eye
  [33,7],[7,163],[163,144],[144,145],[145,153],[153,154],[154,155],[155,133],
  [33,246],[246,161],[161,160],[160,159],[159,158],[158,157],[157,173],[173,133],
  // Right eye
  [362,382],[382,381],[381,380],[380,374],[374,373],[373,390],[390,249],[249,263],
  [362,398],[398,384],[384,385],[385,386],[386,387],[387,388],[388,466],[466,263],
  // Nose
  [1,2],[2,98],[98,97],[97,2],[2,326],[326,327],[327,2],
  // Lips outer
  [61,185],[185,40],[40,39],[39,37],[37,0],[0,267],[267,269],[269,270],[270,409],
  [409,291],[61,146],[146,91],[91,181],[181,84],[84,17],[17,314],[314,405],
  [405,321],[321,375],[375,291],
];

export const drawHackerScan = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
) => {
  const t      = Date.now() * 0.001;
  const pulse  = 0.5 + Math.sin(t * 2.5) * 0.4;
  const glitch = Math.random() < 0.04; // occasional glitch flash

  ctx.save();

  // Wireframe mesh
  ctx.lineWidth   = 1;
  ctx.shadowBlur  = 4;
  ctx.shadowColor = "#00FF41";
  FACE_EDGES.forEach(([a, b]) => {
    if (a >= landmarks.length || b >= landmarks.length) return;
    const ax = landmarks[a].x * width;
    const ay = landmarks[a].y * height;
    const bx = landmarks[b].x * width;
    const by = landmarks[b].y * height;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = glitch
      ? `rgba(255, ${Math.floor(Math.random() * 255)}, 0, 0.7)`
      : `rgba(0, 255, 65, ${0.35 + pulse * 0.3})`;
    ctx.stroke();
  });

  // Landmark dots (key points only)
  const keyPts = [10, 152, 234, 454, 1, 33, 133, 362, 263, 61, 291];
  keyPts.forEach((idx) => {
    if (idx >= landmarks.length) return;
    const x = landmarks[idx].x * width;
    const y = landmarks[idx].y * height;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle   = `rgba(0, 255, 65, ${0.6 + pulse * 0.35})`;
    ctx.shadowBlur  = 8;
    ctx.shadowColor = "#00FF41";
    ctx.fill();
  });

  // Forehead HUD overlay
  const fX  = landmarks[10].x * width;
  const fY  = landmarks[10].y * height;
  const faceW = Math.abs((landmarks[454].x - landmarks[234].x) * width);

  ctx.font      = `${faceW * 0.07}px 'Courier New', monospace`;
  ctx.textAlign = "center";
  ctx.shadowBlur  = 10;
  ctx.shadowColor = "#00FF41";
  ctx.fillStyle   = `rgba(0, 255, 65, ${0.6 + pulse * 0.3})`;
  ctx.fillText("[ FACE IDENTIFIED ]", fX, fY - faceW * 0.22);

  const conf = (85 + Math.sin(t * 1.3) * 10).toFixed(1);
  ctx.font      = `${faceW * 0.055}px 'Courier New', monospace`;
  ctx.fillStyle = `rgba(0, 255, 65, ${0.5 + pulse * 0.25})`;
  ctx.fillText(`CONF: ${conf}%`, fX, fY - faceW * 0.09);

  ctx.restore();
};

// ──────────────────────────────────────────────────────────
//  ⚡  HACKER GLITCH  (RGB chromatic aberration + scanlines)
// ──────────────────────────────────────────────────────────
export const drawHackerGlitch = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number
) => {
  if (!landmarks.length) return;

  const t      = Date.now() * 0.001;
  const faceW  = Math.abs((landmarks[454].x - landmarks[234].x) * width);
  const faceH  = Math.abs((landmarks[152].y - landmarks[10].y) * height);
  const cx     = ((landmarks[234].x + landmarks[454].x) / 2) * width;
  const cy     = ((landmarks[10].y  + landmarks[152].y) / 2) * height;

  ctx.save();

  // ── Chromatic aberration rings ──
  const shift = 4 + Math.sin(t * 6) * 3;
  [
    { dx: -shift, dy: 0,  color: "rgba(255,0,0,0.35)" },
    { dx:  shift, dy: 0,  color: "rgba(0,255,65,0.35)" },
    { dx:  0,     dy: -shift * 0.5, color: "rgba(0,80,255,0.35)" },
  ].forEach(({ dx, dy, color }) => {
    ctx.beginPath();
    ctx.ellipse(cx + dx, cy + dy, faceW * 0.58, faceH * 0.62, 0, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 8;
    ctx.stroke();
  });

  // ── Scanlines over face area ──
  const lineSpacing = 4;
  const top    = cy - faceH * 0.6;
  const bottom = cy + faceH * 0.6;
  const left   = cx - faceW * 0.6;
  const right  = cx + faceW * 0.6;

  ctx.shadowBlur = 0;
  for (let y = top; y < bottom; y += lineSpacing) {
    const alpha = 0.08 + (Math.sin(y * 0.3 + t * 8) > 0.95 ? 0.25 : 0);
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.strokeStyle = `rgba(0,255,65,${alpha})`;
    ctx.lineWidth   = 1;
    ctx.stroke();
  }

  // ── Random glitch blocks ──
  const nBlocks = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < nBlocks; i++) {
    if (Math.random() > 0.35) continue;
    const bx = left + Math.random() * faceW * 1.2;
    const by = top  + Math.random() * faceH * 1.2;
    const bw = 20   + Math.random() * 80;
    const bh = 3    + Math.random() * 12;
    const r  = Math.floor(Math.random() * 3);
    const colors = ["rgba(255,0,80,0.55)", "rgba(0,255,65,0.55)", "rgba(0,100,255,0.55)"];
    ctx.fillStyle = colors[r];
    ctx.fillRect(bx, by, bw, bh);
  }

  // ── HUD corner brackets ──
  const bSize = faceW * 0.18;
  const pad   = faceW * 0.06;
  const bx0   = cx - faceW * 0.58;
  const by0   = cy - faceH * 0.62;
  const bx1   = cx + faceW * 0.58;
  const by1   = cy + faceH * 0.62;
  const bAlpha = 0.55 + Math.sin(t * 4) * 0.3;

  ctx.strokeStyle = `rgba(0,255,65,${bAlpha})`;
  ctx.lineWidth   = 2;
  ctx.shadowColor = "#00FF41";
  ctx.shadowBlur  = 10;
  ctx.lineCap     = "round";

  [[bx0, by0, 1, 1], [bx1, by0, -1, 1], [bx0, by1, 1, -1], [bx1, by1, -1, -1]].forEach(([x, y, sx, sy]) => {
    ctx.beginPath(); ctx.moveTo(x + sx * bSize, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * bSize); ctx.stroke();
  });

  // ── Glitch text label ──
  const label = Math.random() < 0.1
    ? `ERR_0x${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}`
    : "[ SIGNAL CORRUPTED ]";
  ctx.font      = `bold ${faceW * 0.07}px 'Courier New', monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = `rgba(0,255,65,${0.5 + Math.sin(t * 5) * 0.4})`;
  ctx.shadowBlur  = 12;
  ctx.shadowColor = "#00FF41";
  ctx.fillText(label, cx + (Math.random() < 0.1 ? (Math.random() - 0.5) * 8 : 0), by0 - faceH * 0.05);

  ctx.restore();
};
