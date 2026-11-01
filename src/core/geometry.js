export const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

export const lerp = (a, b, t) => a + (b - a) * t;

export const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export function length(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += dist(points[i - 1], points[i]);
  return total;
}

export function resample(points, spacing) {
  if (points.length < 2) return points.map((p) => ({ ...p }));
  const out = [{ ...points[0] }];
  let carry = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const seg = dist(a, b);
    if (seg === 0) continue;
    let at = spacing - carry;
    while (at <= seg) {
      const t = at / seg;
      out.push({
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
        p: lerp(a.p ?? 0.5, b.p ?? 0.5, t),
      });
      at += spacing;
    }
    carry = seg - (at - spacing);
  }
  const last = points[points.length - 1];
  const tail = out[out.length - 1];
  if (dist(tail, last) > spacing * 0.2) out.push({ ...last });
  else Object.assign(tail, { x: last.x, y: last.y });
  return out;
}

export function relax(points, passes, closed = false) {
  let pts = points;
  for (let k = 0; k < passes; k++) {
    const n = pts.length;
    if (n < 3) return pts;
    const next = new Array(n);
    for (let i = 0; i < n; i++) {
      const isEnd = !closed && (i === 0 || i === n - 1);
      if (isEnd) {
        next[i] = pts[i];
        continue;
      }
      const a = pts[(i - 1 + n) % n];
      const b = pts[i];
      const c = pts[(i + 1) % n];
      next[i] = {
        ...b,
        x: (a.x + b.x * 2 + c.x) / 4,
        y: (a.y + b.y * 2 + c.y) / 4,
      };
    }
    pts = next;
  }
  return pts;
}

export function simplify(points, epsilon) {
  if (points.length < 3) return points.slice();
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    const a = points[s];
    const b = points[e];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1e-9;
    let best = -1;
    let index = -1;
    for (let i = s + 1; i < e; i++) {
      const p = points[i];
      const d = Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
      if (d > best) {
        best = d;
        index = i;
      }
    }
    if (best > epsilon) {
      keep[index] = 1;
      stack.push([s, index], [index, e]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

export function bounds(points, pad = 0) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    const r = (p.r ?? 0) + pad;
    if (p.x - r < minX) minX = p.x - r;
    if (p.y - r < minY) minY = p.y - r;
    if (p.x + r > maxX) maxX = p.x + r;
    if (p.y + r > maxY) maxY = p.y + r;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function union(a, b) {
  if (!a) return b;
  if (!b) return a;
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    w: Math.max(a.x + a.w, b.x + b.w) - x,
    h: Math.max(a.y + a.h, b.y + b.h) - y,
  };
}

export const overlaps = (a, b) => !!a && !!b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

export const n1 = (v) => {
  const r = Math.round(v * 10) / 10;
  return Object.is(r, -0) ? "0" : String(r);
};

export function ringPath(ring, closed = true) {
  const n = ring.length;
  if (n < 2) return "";
  if (n < 3) return `M${n1(ring[0].x)} ${n1(ring[0].y)}L${n1(ring[1].x)} ${n1(ring[1].y)}${closed ? "Z" : ""}`;
  if (!closed) {
    let d = `M${n1(ring[0].x)} ${n1(ring[0].y)}`;
    for (let i = 1; i < n - 1; i++) {
      const p = ring[i];
      const q = ring[i + 1];
      d += `Q${n1(p.x)} ${n1(p.y)} ${n1((p.x + q.x) / 2)} ${n1((p.y + q.y) / 2)}`;
    }
    const last = ring[n - 1];
    return `${d}L${n1(last.x)} ${n1(last.y)}`;
  }
  const mid = (a, b) => `${n1((a.x + b.x) / 2)} ${n1((a.y + b.y) / 2)}`;
  let d = `M${mid(ring[n - 1], ring[0])}`;
  for (let i = 0; i < n; i++) {
    const p = ring[i];
    d += `Q${n1(p.x)} ${n1(p.y)} ${mid(p, ring[(i + 1) % n])}`;
  }
  return `${d}Z`;
}

const circlePath = ({ x, y, r }) => `M${n1(x + r)} ${n1(y)}A${n1(r)} ${n1(r)} 0 1 0 ${n1(x - r)} ${n1(y)}A${n1(r)} ${n1(r)} 0 1 0 ${n1(x + r)} ${n1(y)}Z`;

export function shapePath(shape) {
  let d = "";
  for (const ring of shape.rings) d += ringPath(ring);
  for (const c of shape.dots) if (c.r > 0.05) d += circlePath(c);
  return d;
}

export function shapeBounds(shape) {
  let box = null;
  for (const ring of shape.rings) box = union(box, bounds(ring));
  if (shape.dots.length) box = union(box, bounds(shape.dots));
  return box;
}

export function mapShape(shape, fn, scale = 1) {
  return {
    rings: shape.rings.map((ring) => ring.map((p) => fn(p))),
    dots: shape.dots.map((c) => ({ ...fn(c), r: c.r * scale })),
  };
}

export const mergeShapes = (shapes) => ({
  rings: shapes.flatMap((s) => s.rings),
  dots: shapes.flatMap((s) => s.dots),
});

export function pointInRing(p, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

export function distToSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2 : 0;
  t = clamp(t, 0, 1);
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}
