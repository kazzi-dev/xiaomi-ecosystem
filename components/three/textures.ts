import * as THREE from 'three';

/**
 * Procedural screen content drawn on 2D canvases, so the site ships with zero
 * image assets. Swap any of these for a real screenshot via THREE.TextureLoader.
 */
export type ScreenKind = 'lock' | 'home' | 'cover' | 'fold' | 'tablet' | 'watch';

const SIZES: Record<ScreenKind, [number, number]> = {
  lock: [720, 1560],
  home: [720, 1560],
  cover: [860, 1140],
  fold: [1720, 1140],
  tablet: [1600, 1080],
  watch: [512, 512],
};

const cache = new Map<string, THREE.CanvasTexture>();

function fontFamily() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim();
  return v ? `${v}, system-ui, sans-serif` : 'system-ui, sans-serif';
}

function wallpaper(g: CanvasRenderingContext2D, w: number, h: number) {
  g.fillStyle = '#07060a';
  g.fillRect(0, 0, w, h);
  const blob = (x: number, y: number, r: number, c: string) => {
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, c);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  };
  const m = Math.max(w, h);
  blob(w * 0.15, h * 0.22, m * 0.55, 'rgba(255,105,0,0.95)');
  blob(w * 0.95, h * 0.5, m * 0.5, 'rgba(214,40,120,0.75)');
  blob(w * 0.3, h * 0.95, m * 0.5, 'rgba(70,60,220,0.7)');
  // flowing ribbons
  g.globalCompositeOperation = 'screen';
  for (let i = 0; i < 14; i++) {
    g.beginPath();
    const y0 = h * (0.3 + i * 0.025);
    g.moveTo(-50, y0);
    g.bezierCurveTo(w * 0.3, y0 - h * 0.25, w * 0.65, y0 + h * 0.28, w + 50, y0 - h * 0.05);
    g.strokeStyle = `rgba(255,${150 + i * 6},${90 + i * 8},${0.05 + i * 0.006})`;
    g.lineWidth = Math.max(w, h) * 0.004;
    g.stroke();
  }
  g.globalCompositeOperation = 'source-over';
}

function statusBar(g: CanvasRenderingContext2D, w: number, scale: number, ff: string) {
  g.fillStyle = 'rgba(255,255,255,0.92)';
  g.font = `600 ${28 * scale}px ${ff}`;
  g.textBaseline = 'middle';
  g.fillText('9:41', 48 * scale, 52 * scale);
  // battery
  const bx = w - 100 * scale;
  g.strokeStyle = 'rgba(255,255,255,0.9)';
  g.lineWidth = 2.5 * scale;
  g.beginPath();
  g.roundRect(bx, 40 * scale, 46 * scale, 24 * scale, 6 * scale);
  g.stroke();
  g.fillRect(bx + 4 * scale, 44 * scale, 32 * scale, 16 * scale);
  // signal
  for (let i = 0; i < 4; i++) g.fillRect(bx - 70 * scale + i * 11 * scale, (60 - i * 6) * scale, 7 * scale, (6 + i * 6) * scale);
}

function glassCard(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.fillStyle = 'rgba(255,255,255,0.12)';
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.18)';
  g.lineWidth = 2;
  g.stroke();
}

const APP_COLORS = ['#FF6900', '#2E7BFF', '#22C55E', '#F43F5E', '#A855F7', '#EAB308', '#14B8A6', '#F97316', '#64748B', '#EC4899', '#0EA5E9', '#84CC16'];

function drawLock(g: CanvasRenderingContext2D, w: number, h: number, ff: string, small = false) {
  if (small) petals(g, w, h);
  else wallpaper(g, w, h);
  statusBar(g, w, 1, ff);
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.font = `500 ${34}px ${ff}`;
  g.fillText('Sunday, October 18', w / 2, h * 0.16);
  g.font = `700 ${small ? 200 : 250}px ${ff}`;
  g.fillText('09:41', w / 2, h * (small ? 0.27 : 0.28));
  // widgets
  glassCard(g, 60, h * 0.4, w / 2 - 80, 170, 40);
  glassCard(g, w / 2 + 20, h * 0.4, w / 2 - 80, 170, 40);
  g.font = `700 64px ${ff}`;
  g.fillText('24°', w * 0.27, h * 0.4 + 95);
  g.font = `500 26px ${ff}`;
  g.fillStyle = 'rgba(255,255,255,0.7)';
  g.fillText('Clear night', w * 0.27, h * 0.4 + 140);
  g.fillStyle = '#fff';
  g.font = `700 64px ${ff}`;
  g.fillText('86%', w * 0.73, h * 0.4 + 95);
  g.font = `500 26px ${ff}`;
  g.fillStyle = 'rgba(255,255,255,0.7)';
  g.fillText('Battery', w * 0.73, h * 0.4 + 140);
  // bottom shortcuts
  g.fillStyle = 'rgba(255,255,255,0.15)';
  g.beginPath();
  g.arc(120, h - 150, 52, 0, Math.PI * 2);
  g.arc(w - 120, h - 150, 52, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.6)';
  g.fillRect(w / 2 - 70, h - 40, 140, 8);
  g.textAlign = 'left';
}

function drawHome(g: CanvasRenderingContext2D, w: number, h: number, ff: string) {
  wallpaper(g, w, h);
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.fillRect(0, 0, w, h);
  statusBar(g, w, 1, ff);
  glassCard(g, 50, 120, w - 100, 260, 48);
  g.fillStyle = '#fff';
  g.font = `700 92px ${ff}`;
  g.fillText('09:41', 90, 230);
  g.font = `500 28px ${ff}`;
  g.fillStyle = 'rgba(255,255,255,0.75)';
  g.fillText('Sun 18 Oct · 24° Clear', 92, 300);
  // app grid
  const cols = 4;
  const size = 120;
  const gap = (w - cols * size) / (cols + 1);
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const x = gap + c * (size + gap);
      const y = 470 + r * 190;
      const grd = g.createLinearGradient(x, y, x + size, y + size);
      grd.addColorStop(0, APP_COLORS[i % APP_COLORS.length]);
      grd.addColorStop(1, APP_COLORS[(i + 3) % APP_COLORS.length]);
      g.fillStyle = grd;
      g.beginPath();
      g.roundRect(x, y, size, size, 34);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.beginPath();
      g.arc(x + size / 2, y + size / 2, 18, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.6)';
      g.fillRect(x + 25, y + size + 18, size - 50, 10);
    }
  }
  glassCard(g, 40, h - 200, w - 80, 150, 60);
  for (let c = 0; c < 4; c++) {
    const x = 85 + c * ((w - 170) / 3) - 50;
    g.fillStyle = APP_COLORS[c * 2];
    g.beginPath();
    g.roundRect(x, h - 175, 100, 100, 30);
    g.fill();
  }
}

/** Xiaomi 18 Fold wallpaper: layered glowing petals fanning out from the centre. */
function petals(g: CanvasRenderingContext2D, w: number, h: number) {
  g.fillStyle = '#080404';
  g.fillRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h * 0.62;
  const s = Math.min(w, h);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      g.save();
      g.translate(cx + side * s * (0.06 + i * 0.07), cy - i * s * 0.05);
      g.rotate(side * (0.35 + i * 0.12));
      const rx = s * (0.16 + i * 0.015);
      const ry = s * (0.42 - i * 0.03);
      const grd = g.createLinearGradient(-rx, -ry, rx, ry);
      grd.addColorStop(0, `rgba(255,${150 - i * 18},${70 - i * 10},${0.55 - i * 0.08})`);
      grd.addColorStop(1, 'rgba(60,8,4,0.15)');
      g.fillStyle = grd;
      g.beginPath();
      g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = `rgba(255,190,130,${0.5 - i * 0.08})`;
      g.lineWidth = s * 0.004;
      g.stroke();
      g.restore();
    }
  }
}

function drawFold(g: CanvasRenderingContext2D, w: number, h: number, ff: string) {
  petals(g, w, h);
  statusBar(g, w, 1.1, ff);
  const half = w / 2;
  // Left: messages
  glassCard(g, 40, 110, half - 70, h - 150, 40);
  g.fillStyle = '#fff';
  g.font = `700 54px ${ff}`;
  g.fillText('Messages', 80, 190);
  ['Lena', 'Studio team', 'Kai', 'Design crit'].forEach((n, i) => {
    const y = 240 + i * 190;
    g.fillStyle = APP_COLORS[i + 1];
    g.beginPath();
    g.arc(125, y + 60, 46, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff';
    g.font = `600 36px ${ff}`;
    g.fillText(n, 200, y + 48);
    g.fillStyle = 'rgba(255,255,255,0.6)';
    g.font = `400 28px ${ff}`;
    g.fillText(i === 0 ? 'Sending the photos to your Pad' : 'See you at 7, bring sketches', 200, y + 92);
  });
  // Right: photo
  const rx = half + 30;
  const rw = half - 70;
  const photo = g.createLinearGradient(rx, 110, rx + rw, h - 40);
  photo.addColorStop(0, '#ffb27a');
  photo.addColorStop(0.5, '#ff6900');
  photo.addColorStop(1, '#3b1460');
  g.fillStyle = photo;
  g.beginPath();
  g.roundRect(rx, 110, rw, h - 150, 40);
  g.fill();
  g.fillStyle = 'rgba(20,10,40,0.85)';
  g.beginPath();
  g.moveTo(rx, h - 40);
  g.lineTo(rx + rw * 0.25, h * 0.55);
  g.lineTo(rx + rw * 0.45, h * 0.7);
  g.lineTo(rx + rw * 0.7, h * 0.45);
  g.lineTo(rx + rw, h * 0.65);
  g.lineTo(rx + rw, h - 40);
  g.closePath();
  g.fill();
  g.fillStyle = 'rgba(255,240,220,0.9)';
  g.beginPath();
  g.arc(rx + rw * 0.72, h * 0.28, 60, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.5)';
  g.beginPath();
  g.roundRect(half - 6, h / 2 - 60, 12, 120, 6);
  g.fill();
}

/* ---------------------------- Back panels ---------------------------- */
// Drawn in light greys so the material colour tints them (red, black, white…).
export type BackKind = 'clear' | 'matte' | 'fold';
const backCache = new Map<BackKind, THREE.CanvasTexture>();

function drawPhoneBack(g: CanvasRenderingContext2D, w: number, h: number, ff: string, clear: boolean) {
  g.fillStyle = '#ececec';
  g.fillRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h * 0.5;
  if (clear) {
    // Visible internals: boards and traces
    g.strokeStyle = '#c9c9c9';
    g.lineWidth = 3;
    const boxes = [[60, 30, 220, 120], [470, 40, 230, 90], [80, 330, 160, 70], [520, 300, 180, 110], [300, 300, 150, 60]];
    for (const [x, y, bw, bh] of boxes) {
      g.fillStyle = '#e0e0e0';
      g.beginPath();
      g.roundRect(x, y, bw, bh, 10);
      g.fill();
      g.stroke();
    }
    g.fillStyle = '#d6d6d6';
    g.fillRect(cx - 24, cy + 200, 48, h * 0.86 - (cy + 200));
  }
  // Micro-dot texture
  g.fillStyle = clear ? '#cdcdcd' : '#e2e2e2';
  for (let y = 430; y < h * 0.86; y += 15) for (let x = 20; x < w - 20; x += 15) g.fillRect(x, y, 3, 3);
  // MagSafe-style ring
  g.fillStyle = '#e6e6e6';
  g.beginPath();
  g.arc(cx, cy, 160, 0, Math.PI * 2);
  g.fill();
  for (let r = 168; r < 245; r += 7) {
    g.strokeStyle = r % 14 ? '#d2d2d2' : '#dcdcdc';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = '#b4b4b4';
  g.textAlign = 'center';
  g.font = `600 54px ${ff}`;
  g.fillText('xiaomi', cx, cy + 18);
  if (clear) {
    // Bottom board with speaker grille
    const by = h * 0.86;
    g.fillStyle = '#d9d9d9';
    g.strokeStyle = '#bdbdbd';
    g.beginPath();
    g.roundRect(30, by, w - 60, h - by - 30, 18);
    g.fill();
    g.stroke();
    g.fillStyle = '#c4c4c4';
    for (let y = by + 40; y < by + 120; y += 12) for (let x = 200; x < 340; x += 12) g.fillRect(x, y, 7, 7);
    for (let i = 0; i < 3; i++) g.strokeRect(430 + i * 70, by + 60, 50, 50);
    for (const [x, y] of [[60, by + 30], [w - 60, by + 30], [60, h - 60], [w - 60, h - 60]]) {
      g.beginPath();
      g.arc(x, y, 12, 0, Math.PI * 2);
      g.stroke();
    }
    g.font = `500 26px ${ff}`;
    g.fillStyle = '#c2c2c2';
    g.fillText('Limited Edition', w * 0.72, by - 30);
  }
  g.textAlign = 'left';
}

export function getBackTexture(kind: BackKind) {
  const cached = backCache.get(kind);
  if (cached) return cached;
  const [w, h] = kind === 'fold' ? [860, 1140] : [760, 1600];
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  const ff = fontFamily();
  if (kind === 'fold') {
    g.fillStyle = '#ececec';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#c8c8c8';
    g.textAlign = 'center';
    g.font = `600 64px ${ff}`;
    g.fillText('xiaomi', w / 2, h * 0.74);
  } else drawPhoneBack(g, w, h, ff, kind === 'clear');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  backCache.set(kind, tex);
  return tex;
}

function drawTablet(g: CanvasRenderingContext2D, w: number, h: number, ff: string) {
  wallpaper(g, w, h);
  g.fillStyle = 'rgba(5,5,5,0.5)';
  g.fillRect(0, 0, w, h);
  statusBar(g, w, 1, ff);
  glassCard(g, 50, 100, w * 0.3, h - 160, 36);
  g.fillStyle = '#fff';
  g.font = `700 46px ${ff}`;
  g.fillText('Notes', 90, 180);
  for (let i = 0; i < 7; i++) {
    g.fillStyle = 'rgba(255,255,255,0.18)';
    g.fillRect(90, 230 + i * 100, w * 0.3 - 90 - (i % 3) * 60, 18);
    g.fillStyle = 'rgba(255,255,255,0.09)';
    g.fillRect(90, 262 + i * 100, w * 0.2 - (i % 2) * 40, 14);
  }
  const ax = w * 0.3 + 90;
  const aw = w - ax - 50;
  g.fillStyle = '#f4efe8';
  g.beginPath();
  g.roundRect(ax, 100, aw, h - 160, 36);
  g.fill();
  g.lineCap = 'round';
  const strokes: [string, number][] = [
    ['#FF6900', 18],
    ['#1f2937', 6],
    ['#2E7BFF', 12],
  ];
  strokes.forEach(([c, lw], i) => {
    g.strokeStyle = c;
    g.lineWidth = lw;
    g.beginPath();
    for (let t = 0; t <= 1.001; t += 0.02) {
      const x = ax + 80 + t * (aw - 160);
      const y = 300 + i * 220 + Math.sin(t * Math.PI * (2 + i)) * (70 - i * 10);
      if (t === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  });
}

function drawWatch(g: CanvasRenderingContext2D, w: number, h: number, ff: string) {
  g.fillStyle = '#000';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#FF6900';
  g.lineWidth = 22;
  g.lineCap = 'round';
  g.beginPath();
  g.arc(w / 2, h / 2, w * 0.4, -Math.PI / 2, Math.PI * 1.1);
  g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.15)';
  g.beginPath();
  g.arc(w / 2, h / 2, w * 0.32, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.font = `700 120px ${ff}`;
  g.fillText('9:41', w / 2, h / 2 + 40);
  g.font = `500 32px ${ff}`;
  g.fillStyle = 'rgba(255,255,255,0.6)';
  g.fillText('8,412 steps', w / 2, h / 2 + 100);
  g.textAlign = 'left';
}

export function getScreenTexture(kind: ScreenKind) {
  const cached = cache.get(kind);
  if (cached) return cached;
  const [w, h] = SIZES[kind];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d')!;
  const ff = fontFamily();
  g.textBaseline = 'alphabetic';
  if (kind === 'lock') drawLock(g, w, h, ff);
  else if (kind === 'cover') drawLock(g, w, h, ff, true);
  else if (kind === 'home') drawHome(g, w, h, ff);
  else if (kind === 'fold') drawFold(g, w, h, ff);
  else if (kind === 'tablet') drawTablet(g, w, h, ff);
  else drawWatch(g, w, h, ff);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(kind, tex);
  return tex;
}
