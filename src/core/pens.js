import { clamp, dist, relax, resample, smoothstep } from "./geometry.js";
import { outline } from "./outline.js";

export const taper = (d, len, floor) => (len <= 0 ? 1 : floor + (1 - floor) * Math.sqrt(clamp(d / len, 0, 1)));

export const PENS = {
  nib: {
    id: "nib",
    label: "Dip pen",
    hint: "Swells and thins like a steel nib",
    key: "n",
    layer: "ink",
    size: [1.5, 12, 4.4],
    steady: true,
    radius: ({ p, s0, s1, dir, size }) =>
      (size / 2) * (0.36 + 0.64 * p) * (0.74 + 0.26 * Math.abs(Math.sin(dir - Math.PI / 4))) * taper(s0, size * 3, 0.2) * taper(s1, size * 6, 0.06),
  },
  fineliner: {
    id: "fineliner",
    label: "Fineliner",
    hint: "One even line, start to finish",
    key: "f",
    layer: "ink",
    size: [1, 10, 2.8],
    steady: true,
    radius: ({ s0, s1, size }) => (size / 2) * taper(s0, size, 0.82) * taper(s1, size, 0.82),
  },
  brush: {
    id: "brush",
    label: "Brush pen",
    hint: "Bold when slow, a hairline when quick",
    key: "b",
    layer: "ink",
    size: [3, 28, 9],
    steady: true,
    radius: ({ p, s0, s1, size }) => (size / 2) * (0.12 + 0.88 * p ** 1.4) * taper(s0, size * 2.4, 0.1) * taper(s1, size * 4, 0.04),
  },
  pencil: {
    id: "pencil",
    label: "Sketch pencil (only a guide)",
    hint: "For roughing it out. It doesn't show when you save",
    key: "p",
    layer: "pencil",
    size: [1, 8, 2.2],
    steady: true,
    radius: ({ p, s0, s1, size }) => (size / 2) * (0.7 + 0.3 * p) * taper(s0, size * 2, 0.5) * taper(s1, size * 2, 0.5),
  },
  wash: {
    id: "wash",
    label: "Wash",
    hint: "Grey watercolour. Tap inside a shape to fill it",
    key: "w",
    layer: "wash",
    size: [16, 160, 52],
    steady: true,
    tones: true,
    radius: ({ p, s0, size }) => (size / 2) * (0.82 + 0.18 * p) * taper(s0, size * 0.4, 0.6),
  },
  hatch: {
    id: "hatch",
    label: "Hatching",
    hint: "Paint over an area and it fills with hatching",
    key: "h",
    layer: "ink",
    size: [20, 180, 64],
    steady: true,
    tones: true,
    angles: true,
    radius: ({ size }) => size / 2,
  },
  eraser: {
    id: "eraser",
    label: "Eraser",
    hint: "Rubs out part of a line and keeps the rest",
    key: "e",
    layer: "erase",
    size: [6, 140, 30],
    steady: false,
    radius: ({ size }) => size / 2,
  },
};

export const PEN_ORDER = ["nib", "fineliner", "brush", "wash", "hatch", "eraser", "pencil"];

export const INKS = [
  { id: "black", label: "Black", color: "#18181b" },
  { id: "blue", label: "Blue", color: "#1f4c9c" },
  { id: "red", label: "Red", color: "#b3261e" },
  { id: "gold", label: "Gold", color: "#94701a" },
  { id: "green", label: "Green", color: "#2b6a3c" },
  { id: "sepia", label: "Sepia", color: "#5b3a26" },
  { id: "violet", label: "Violet", color: "#5c3a8f" },
];

export const WASHES = [
  { id: "grey", label: "Grey", color: "#34343c" },
  { id: "blue", label: "Blue", color: "#2c68b4" },
  { id: "red", label: "Red", color: "#c4372f" },
  { id: "yellow", label: "Yellow", color: "#dfa324" },
  { id: "green", label: "Green", color: "#4b8c43" },
  { id: "ochre", label: "Ochre", color: "#a6672b" },
  { id: "pink", label: "Pink", color: "#d0668c" },
];

export const PAINTS = [
  { id: "grey", label: "Grey", color: "#b6b5b6" },
  { id: "blue", label: "Blue", color: "#b3c8e1" },
  { id: "red", label: "Red", color: "#eab6b1" },
  { id: "yellow", label: "Yellow", color: "#f3ddad" },
  { id: "green", label: "Green", color: "#bed5b8" },
  { id: "ochre", label: "Ochre", color: "#dfc8af" },
  { id: "pink", label: "Pink", color: "#eec7d2" },
];

export const paintFor = (colour) => PAINTS[WASHES.findIndex((w) => w.color.toLowerCase() === (colour || "").toLowerCase())]?.color || colour;

export const TONES = [
  { id: "light", label: "Light", hatch: 9 },
  { id: "mid", label: "Medium", hatch: 6 },
  { id: "dark", label: "Dark", hatch: 4 },
];

export const ANGLES = [
  { id: "right", label: "Lean right", angles: [-Math.PI / 4] },
  { id: "left", label: "Lean left", angles: [Math.PI / 4] },
  { id: "cross", label: "Cross-hatch", angles: [-Math.PI / 4, Math.PI / 4] },
];

export function pressureFromSpeed(speed) {
  return 1 - smoothstep(0.12, 3.2, speed) * 0.78;
}

export function centerline(points, size, passes = 1, spacing) {
  const step = spacing ?? clamp(size * 0.2, 0.7, 5);
  return relax(resample(points, step), passes);
}

export function widen(pen, line, size) {
  const n = line.length;
  const s = new Float64Array(n);
  for (let i = 1; i < n; i++) s[i] = s[i - 1] + dist(line[i - 1], line[i]);
  const total = s[n - 1] || 0;
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(n - 1, i + 1)];
    out[i] = {
      x: line[i].x,
      y: line[i].y,
      r: pen.radius({
        p: line[i].p ?? 0.7,
        s0: s[i],
        s1: total - s[i],
        dir: Math.atan2(b.y - a.y, b.x - a.x),
        size,
      }),
    };
  }
  for (let i = 1; i < n; i++) {
    const step = s[i] - s[i - 1];
    const max = out[i - 1].r + step * 0.4;
    if (out[i].r > max) out[i].r = max;
  }
  for (let i = n - 2; i >= 0; i--) {
    const step = s[i + 1] - s[i];
    const max = out[i + 1].r + step * 0.4;
    if (out[i].r > max) out[i].r = max;
  }
  return out;
}

export function penShape(penId, points, size, options = {}) {
  const pen = PENS[penId];
  const line = centerline(points, size, options.passes ?? 1);
  return outline(widen(pen, line, size), { round: pen.layer === "wash" });
}
