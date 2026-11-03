import { bounds, dist, pointInRing, TAU } from "../core/geometry.js";

const toPoint = (p) => (Array.isArray(p) ? { x: p[0], y: p[1], p: p[2] } : p);

export function spline(points, { closed = false, step = 2.2, overlap = 0 } = {}) {
  const P = points.map(toPoint);
  const n = P.length;
  if (n < 2) return P.slice();
  const get = (i) => (closed ? P[((i % n) + n) % n] : P[Math.max(0, Math.min(n - 1, i))]);
  const segments = closed ? n : n - 1;
  const out = [];
  for (let i = 0; i < segments; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const steps = Math.max(1, Math.ceil(dist(p1, p2) / step));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const x = 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
      const y = 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
      const point = { x, y };
      if (p1.p != null || p2.p != null) point.p = (p1.p ?? 0.78) + ((p2.p ?? 0.78) - (p1.p ?? 0.78)) * t;
      out.push(point);
    }
  }
  if (closed) {
    const extra = Math.round(out.length * overlap);
    for (let i = 0; i <= extra; i++) out.push({ ...out[i % out.length] });
  } else out.push({ ...P[n - 1] });
  return out;
}

export const line = (points, opts = {}) => ({ pts: spline(points, opts), ...opts, closed: false });

export const loop = (points, opts = {}) => ({ pts: spline(points, { closed: true, overlap: opts.overlap ?? 0.05, step: opts.step }), ...opts, closed: false });

export const area = (points, step = 3) => spline(points, { closed: true, step });

export function flat(points, step = 6) {
  const P = points.map(toPoint);
  const out = [];
  for (let i = 0; i < P.length; i++) {
    const seg = straight(P[i], P[(i + 1) % P.length], step);
    seg.pop();
    out.push(...seg);
  }
  return out;
}

export function oval(cx, cy, rx, ry, { start = -2.2, sweep = TAU, overlap = 0.22, rot = 0, step = 2.4 } = {}) {
  const total = sweep + (sweep >= TAU - 1e-6 ? overlap : 0);
  const perimeter = Math.PI * (rx + ry) * (total / TAU);
  const n = Math.max(10, Math.ceil(perimeter / step));
  const pts = [];
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  for (let i = 0; i <= n; i++) {
    const a = start + (total * i) / n;
    const u = Math.cos(a) * rx;
    const v = Math.sin(a) * ry;
    pts.push({ x: cx + u * c - v * s, y: cy + u * s + v * c });
  }
  return pts;
}

export const ovalRing = (cx, cy, rx, ry, rot = 0) => oval(cx, cy, rx, ry, { overlap: 0, rot, step: 4 }).slice(0, -1);

export const straight = (a, b, step = 4) => {
  const n = Math.max(1, Math.ceil(dist(toPoint(a), toPoint(b)) / step));
  const A = toPoint(a);
  const B = toPoint(b);
  return Array.from({ length: n + 1 }, (_, i) => ({ x: A.x + ((B.x - A.x) * i) / n, y: A.y + ((B.y - A.y) * i) / n }));
};

export const segment = (a, b, opts = {}) => ({ pts: straight(a, b), ...opts });

export function poly(points, { closed = false, overshoot = 0.06, ...opts } = {}) {
  const P = points.map(toPoint);
  const list = closed ? P.concat([P[0], { x: P[0].x + (P[1].x - P[0].x) * overshoot, y: P[0].y + (P[1].y - P[0].y) * overshoot }]) : P;
  const pts = [];
  for (let i = 1; i < list.length; i++) {
    const seg = straight(list[i - 1], list[i], 3);
    if (i > 1) seg.shift();
    pts.push(...seg);
  }
  return { pts, ...opts, closed: false };
}

export const dot = (x, y, r) => ovalRing(x, y, r, r);

export function polar(contour) {
  const bins = 720;
  const radius = new Float32Array(bins).fill(-1);
  for (let i = 0; i < contour.length; i++) {
    const a = contour[i];
    const b = contour[(i + 1) % contour.length];
    const steps = Math.max(1, Math.ceil(dist(a, b) / 0.6));
    for (let s = 0; s <= steps; s++) {
      const x = a.x + ((b.x - a.x) * s) / steps;
      const y = a.y + ((b.y - a.y) * s) / steps;
      const angle = Math.atan2(y, x);
      const k = Math.round(((angle + Math.PI) / TAU) * bins) % bins;
      radius[k] = Math.max(radius[k], Math.hypot(x, y));
    }
  }
  for (let pass = 0; pass < 2; pass++) {
    for (let k = 0; k < bins; k++) {
      if (radius[k] >= 0) continue;
      let l = k;
      let r = k;
      while (radius[(l + bins) % bins] < 0 && k - l < bins) l--;
      while (radius[r % bins] < 0 && r - k < bins) r++;
      const a = radius[(l + bins) % bins];
      const b = radius[r % bins];
      radius[k] = a + ((b - a) * (k - l)) / Math.max(1, r - l);
    }
  }
  const R = (angle) => {
    const t = ((((angle + Math.PI) / TAU) % 1) + 1) % 1;
    const f = t * bins;
    const i = Math.floor(f) % bins;
    const j = (i + 1) % bins;
    return radius[i] + (radius[j] - radius[i]) * (f - Math.floor(f));
  };
  R.at = (angle, extra = 0) => {
    const r = R(angle) + extra;
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  };
  return R;
}

export function sweep(from, to, fn, step = 0.03) {
  const n = Math.max(2, Math.ceil(Math.abs(to - from) / step));
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return fn(from + (to - from) * t, t);
  });
}

export const bump = (t, edge = 0.18) => Math.min(1, Math.sin(Math.PI * Math.min(1, Math.max(0, t))) / Math.sin(Math.PI * edge));

export function scallop(points, depth, every, seed = 1, { outward = false } = {}) {
  if (outward) {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      area += a.x * b.y - b.x * a.y;
    }
    if (area > 0) depth = -depth;
  }
  const out = [];
  let s = 0;
  for (let i = 0; i < points.length; i++) {
    if (i) s += dist(points[i - 1], points[i]);
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(points.length - 1, i + 1)];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const phase = (((s / every + seed * 0.37) % 1) + 1) % 1;
    const k = Math.sin(phase * Math.PI) * depth;
    out.push({ ...points[i], x: points[i].x + ((b.y - a.y) / len) * -k, y: points[i].y + ((b.x - a.x) / len) * k });
  }
  return out;
}

export const build = () => ({ lines: [], solids: [], washes: [], knock: [] });

export const layer = () => ({ lines: [], solids: [], washes: [], knock: [], cover: [] });

function runLength(pts) {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return total;
}

export function hideUnder(lines, rings) {
  if (!rings.length) return lines;
  const boxes = rings.map((ring) => bounds(ring));
  const hidden = (p) =>
    rings.some((ring, i) => {
      const box = boxes[i];
      return p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h && pointInRing(p, ring);
    });
  return lines.flatMap((l) => {
    const runs = [];
    let run = [];
    for (const p of l.pts) {
      if (hidden(p)) {
        if (run.length > 1) runs.push(run);
        run = [];
      } else run.push(p);
    }
    if (run.length > 1) runs.push(run);
    if (runs.length === 1 && runs[0].length === l.pts.length) return [l];
    return runs.filter((r) => runLength(r) > 3).map((pts) => ({ ...l, pts, closed: false }));
  });
}

export function paint(b, part) {
  if (part.cover.length) {
    const boxes = part.cover.map((ring) => bounds(ring));
    const hidden = (p) =>
      part.cover.some((ring, i) => {
        const box = boxes[i];
        return p.x > box.x && p.x < box.x + box.w && p.y > box.y && p.y < box.y + box.h && pointInRing(p, ring);
      });
    b.lines = b.lines.flatMap((l) => {
      const runs = [];
      let run = [];
      for (const p of l.pts) {
        if (hidden(p)) {
          if (run.length > 1) runs.push(run);
          run = [];
        } else run.push(p);
      }
      if (run.length > 1) runs.push(run);
      if (runs.length === 1 && runs[0].length === l.pts.length) return [l];
      return runs.filter((r) => runLength(r) > 3).map((pts) => ({ ...l, pts, closed: false }));
    });
    b.solids = b.solids.filter((ring) => {
      const c = bounds(ring);
      return !hidden({ x: c.x + c.w / 2, y: c.y + c.h / 2 });
    });
    const under = (ring) => ring.every((p, i) => i % 4 || hidden(p));
    b.washes = b.washes.map((w) => (w.paper || w.hidden || !w.rings.every(under) ? w : { ...w, hidden: true }));
    b.washes.push({ rings: part.cover, paper: true });
  }
  b.lines.push(...part.lines);
  b.solids.push(...part.solids);
  b.washes.push(...part.washes);
  b.knock.push(...part.knock);
}
