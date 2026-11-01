import { n1 } from "./geometry.js";

const IDENTITY = { x: 0, y: 0, s: 1, r: 0 };

const isIdentity = (t) => !t || (Math.abs(t.x) < 1e-6 && Math.abs(t.y) < 1e-6 && Math.abs((t.s ?? 1) - 1) < 1e-6 && Math.abs(t.r ?? 0) < 1e-6);

export function turn(p, r) {
  if (!r) return p;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}

export const degrees = (r) => (r * 180) / Math.PI;

export const tfString = (t) => {
  if (isIdentity(t)) return null;
  const r = t.r ?? 0;
  return `translate(${n1(t.x)} ${n1(t.y)})${r ? ` rotate(${degrees(r).toFixed(3)})` : ""} scale(${(t.s ?? 1).toFixed(4)})`;
};

export function tfPoint(p, t) {
  if (isIdentity(t)) return p;
  const s = t.s ?? 1;
  const q = turn({ x: p.x * s, y: p.y * s }, t.r ?? 0);
  return { x: q.x + t.x, y: q.y + t.y };
}

export function tfInverse(p, t) {
  if (isIdentity(t)) return p;
  const s = t.s ?? 1;
  const q = turn({ x: p.x - t.x, y: p.y - t.y }, -(t.r ?? 0));
  return { x: q.x / s, y: q.y / s };
}

export function boundsOf(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

export const boxCorners = (box) => [
  { x: box.x, y: box.y },
  { x: box.x + box.w, y: box.y },
  { x: box.x + box.w, y: box.y + box.h },
  { x: box.x, y: box.y + box.h },
];

export function tfBox(box, t) {
  if (!box || isIdentity(t)) return box;
  if (!t.r) {
    const s = t.s ?? 1;
    return { x: box.x * s + t.x, y: box.y * s + t.y, w: box.w * s, h: box.h * s };
  }
  return boundsOf(boxCorners(box).map((p) => tfPoint(p, t)));
}

export function relative(then, now) {
  const a = then || IDENTITY;
  const b = now || IDENTITY;
  const k = (b.s ?? 1) / (a.s ?? 1);
  const r = (b.r ?? 0) - (a.r ?? 0);
  const q = turn({ x: k * a.x, y: k * a.y }, r);
  const out = { x: b.x - q.x, y: b.y - q.y, s: k, r };
  return isIdentity(out) ? null : out;
}

export function scaleAbout(t, c, f) {
  const a = t || IDENTITY;
  return { x: c.x + (a.x - c.x) * f, y: c.y + (a.y - c.y) * f, s: (a.s ?? 1) * f, r: a.r ?? 0 };
}

export function rotateAbout(t, c, angle) {
  const a = t || IDENTITY;
  const q = turn({ x: a.x - c.x, y: a.y - c.y }, angle);
  return { x: c.x + q.x, y: c.y + q.y, s: a.s ?? 1, r: (a.r ?? 0) + angle };
}

export const moveBy = (t, dx, dy) => {
  const a = t || IDENTITY;
  return { x: a.x + dx, y: a.y + dy, s: a.s ?? 1, r: a.r ?? 0 };
};
