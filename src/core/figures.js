import { bounds, clamp, dist, mergeShapes, ringPath, shapeBounds, shapePath, union } from "./geometry.js";
import { penShape } from "./pens.js";
import { rng } from "./random.js";
import { hand, sketchShape } from "./shapes.js";

export const FIGURES = [
  { id: "rect", label: "Rectangle", icon: "square", key: "r" },
  { id: "ellipse", label: "Ellipse", icon: "circle", key: "o" },
  { id: "line", label: "Line", icon: "slash", key: "l" },
  { id: "arrow", label: "Arrow", icon: "move-up-right", key: "L", shift: true },
  { id: "triangle", label: "Triangle", icon: "triangle" },
  { id: "diamond", label: "Diamond", icon: "diamond" },
  { id: "polygon", label: "Polygon", icon: "hexagon" },
  { id: "star", label: "Star", icon: "star" },
  { id: "heart", label: "Heart", icon: "heart" },
  { id: "cloud", label: "Cloud", icon: "cloud" },
  { id: "burst", label: "Burst", icon: "badge" },
];

export const figureOf = (id) => FIGURES.find((f) => f.id === id) || FIGURES[0];

export const FIGURE_STYLES = [
  { id: "neat", label: "Neat", bow: 0.15, wobble: 0.22, passes: 1 },
  { id: "hand", label: "Hand-drawn", bow: 1, wobble: 1, passes: 1 },
  { id: "sketchy", label: "Sketchy", bow: 1.7, wobble: 1.9, passes: 2 },
];

export const FILLS = [
  { id: "none", label: "No fill" },
  { id: "wash", label: "Wash" },
  { id: "solid", label: "Solid" },
];

const TAU = Math.PI * 2;
const OPEN = new Set(["line", "arrow"]);

export const isOpenFigure = (id) => OPEN.has(id);

export function frameFor(id, a, b, { shift = false, alt = false } = {}) {
  if (OPEN.has(id)) {
    let end = b;
    if (shift) {
      const len = dist(a, b);
      const step = Math.PI / 4;
      const angle = Math.round(Math.atan2(b.y - a.y, b.x - a.x) / step) * step;
      end = { x: a.x + Math.cos(angle) * len, y: a.y + Math.sin(angle) * len };
    }
    return { a: { x: a.x, y: a.y }, b: { x: end.x, y: end.y } };
  }
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  if (shift) {
    const m = Math.max(Math.abs(dx), Math.abs(dy));
    dx = Math.sign(dx || 1) * m;
    dy = Math.sign(dy || 1) * m;
  }
  const x0 = alt ? a.x - dx : a.x;
  const y0 = alt ? a.y - dy : a.y;
  const x1 = a.x + dx;
  const y1 = a.y + dy;
  return { x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) };
}

function regular(n, box, inner = null, phase = -Math.PI / 2, jitter = null) {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const out = [];
  const count = inner == null ? n : n * 2;
  for (let i = 0; i < count; i++) {
    const a = phase + (i * TAU) / count;
    let r = inner != null && i % 2 ? inner : 1;
    if (jitter) r *= jitter(i);
    out.push({ x: cx + (Math.cos(a) * r * box.w) / 2, y: cy + (Math.sin(a) * r * box.h) / 2 });
  }
  return out;
}

function roundedRing(box, radius) {
  const r = Math.min(radius, box.w / 2, box.h / 2);
  const out = [];
  const corner = (cx, cy, a0) => {
    for (let k = 0; k <= 6; k++) {
      const a = a0 + (k / 6) * (Math.PI / 2);
      out.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
  };
  corner(box.x + box.w - r, box.y + r, -Math.PI / 2);
  corner(box.x + box.w - r, box.y + box.h - r, 0);
  corner(box.x + r, box.y + box.h - r, Math.PI / 2);
  corner(box.x + r, box.y + r, Math.PI);
  return out;
}

function ellipseRing(box, n = 64) {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * TAU;
    return { x: cx + (Math.cos(a) * box.w) / 2, y: cy + (Math.sin(a) * box.h) / 2 };
  });
}

function heartRing(box, n = 72) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    out.push({ x: box.x + box.w / 2 + (x / 32) * box.w, y: box.y + box.h * 0.36 + (y / 29) * box.h });
  }
  return out;
}

function cloudRing(box, seed) {
  const r = rng(seed);
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const bumps = clamp(Math.round((box.w + box.h) / 70) + 5, 7, 13);
  const out = [];
  const per = 9;
  for (let k = 0; k < bumps; k++) {
    const a0 = (k / bumps) * TAU;
    const a1 = ((k + 1) / bumps) * TAU;
    const lift = 0.16 + r() * 0.1;
    for (let j = 0; j < per; j++) {
      const t = j / per;
      const a = a0 + (a1 - a0) * t;
      const swell = 1 - lift + Math.sin(t * Math.PI) * lift * 1.9;
      out.push({ x: cx + (Math.cos(a) * box.w * swell) / 2.3, y: cy + (Math.sin(a) * box.h * swell) / 2.3 });
    }
  }
  return out;
}

function figureRing(id, frame, { sides = 6, points = 5, corners = "square", seed = 1 } = {}) {
  const box = frame;
  if (id === "rect") return corners === "round" ? roundedRing(box, Math.min(box.w, box.h) * 0.2) : regular4(box);
  if (id === "ellipse") return ellipseRing(box);
  if (id === "triangle")
    return [
      { x: box.x + box.w / 2, y: box.y },
      { x: box.x + box.w, y: box.y + box.h },
      { x: box.x, y: box.y + box.h },
    ];
  if (id === "diamond")
    return [
      { x: box.x + box.w / 2, y: box.y },
      { x: box.x + box.w, y: box.y + box.h / 2 },
      { x: box.x + box.w / 2, y: box.y + box.h },
      { x: box.x, y: box.y + box.h / 2 },
    ];
  if (id === "polygon") return regular(clamp(sides, 3, 12), box);
  if (id === "star") return regular(clamp(points, 3, 16), box, points > 8 ? 0.62 : 0.46);
  if (id === "heart") return heartRing(box);
  if (id === "cloud") return cloudRing(box, seed);
  if (id === "burst") {
    const r = rng(seed + 9);
    const spikes = clamp(Math.round((box.w + box.h) / 40) + 10, 12, 22);
    return regular(spikes, box, 0.66, -Math.PI / 2 + 0.1, (i) => (i % 2 ? 0.92 + r() * 0.16 : 0.84 + r() * 0.2));
  }
  return regular4(box);
}

function regular4(box) {
  return [
    { x: box.x, y: box.y },
    { x: box.x + box.w, y: box.y },
    { x: box.x + box.w, y: box.y + box.h },
    { x: box.x, y: box.y + box.h },
  ];
}

const SMOOTH = new Set(["ellipse", "heart", "cloud"]);

export function sketchLoop(ring, seed, wobble) {
  const r = rng(seed);
  const n = ring.length;
  const start = Math.floor(r() * n);
  const extra = Math.max(2, Math.round(n * (0.08 + r() * 0.08)));
  const pts = [];
  for (let i = 0; i <= n + extra; i++) {
    const p = ring[(start + i) % n];
    const t = i / (n + extra);
    pts.push({ x: p.x, y: p.y, p: 0.72 + Math.sin(t * Math.PI) * 0.12 });
  }
  return hand(pts, { seed, wobble: 0.55 * wobble });
}

function arrowHead(tip, from, size, seed, style) {
  const angle = Math.atan2(tip.y - from.y, tip.x - from.x);
  const r = rng(seed);
  const len = clamp(dist(tip, from) * 0.22, 10, 26 + size * 3);
  const spread = 0.46 + r() * 0.08;
  const wing = (side) => {
    const a = angle + Math.PI + side * spread;
    const end = { x: tip.x + Math.cos(a) * len, y: tip.y + Math.sin(a) * len };
    return sketchShape({ type: "line", a: end, b: { x: tip.x, y: tip.y } }, seed + (side > 0 ? 3 : 7), { bow: style.bow * 0.4, wobble: style.wobble * 0.6 });
  };
  return [wing(1), wing(-1)];
}

export function figureStrokes(id, frame, opts = {}) {
  const style = FIGURE_STYLES.find((s) => s.id === opts.style) || FIGURE_STYLES[1];
  const seed = opts.seed || 1;
  const strokes = [];
  for (let pass = 0; pass < style.passes; pass++) {
    const s = seed + pass * 101;
    if (OPEN.has(id)) {
      const { a, b } = frame;
      if (dist(a, b) < 1) continue;
      strokes.push(sketchShape({ type: "line", a, b }, s, { bow: style.bow, wobble: style.wobble }));
      if (id === "arrow" && pass === 0) {
        strokes.push(...arrowHead(b, a, opts.size || 3, s + 11, style));
        if (opts.ends === "both") strokes.push(...arrowHead(a, b, opts.size || 3, s + 23, style));
      }
      continue;
    }
    if (frame.w < 1 || frame.h < 1) continue;
    const ring = figureRing(id, frame, { ...opts, seed });
    const round = SMOOTH.has(id) || (id === "rect" && opts.corners === "round");
    if (round) strokes.push(sketchLoop(ring, s, style.wobble));
    else strokes.push(sketchShape({ type: "polygon", corners: ring }, s, { bow: style.bow, wobble: style.wobble }));
  }
  return strokes;
}

const arts = new Map();

const shapeOptions = (item) => ({
  style: item.style,
  sides: item.sides,
  points: item.points,
  corners: item.corners,
  ends: item.ends,
  seed: item.seed,
  size: item.size,
});

export function shapeArt(item) {
  const key = JSON.stringify([item.figure, item.frame, item.style, item.sides, item.points, item.corners, item.ends, item.seed, item.size, item.fill]);
  let art = arts.get(key);
  if (art) return art;
  const opts = shapeOptions(item);
  const strokes = figureStrokes(item.figure, item.frame, opts);
  const outline = strokes.length ? mergeShapes(strokes.map((st) => penShape("nib", st, item.size || 3.4, { passes: 0 }))) : { rings: [], dots: [] };
  const filled = !OPEN.has(item.figure) && item.fill && item.fill !== "none" && item.frame.w > 2 && item.frame.h > 2;
  const ring = filled ? hand(figureRing(item.figure, item.frame, opts), { seed: (item.seed || 1) + 5, wobble: 0.5, closed: true, spacing: 3 }) : null;
  let box = shapeBounds(outline);
  if (ring) box = union(box, bounds(ring));
  if (!box) box = OPEN.has(item.figure) ? bounds([item.frame.a, item.frame.b]) : { ...item.frame };
  art = { ink: shapePath(outline), fill: ring ? ringPath(ring) : "", box };
  arts.set(key, art);
  if (arts.size > 300) arts.delete(arts.keys().next().value);
  return art;
}
