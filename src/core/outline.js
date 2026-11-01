import { dist, simplify } from "./geometry.js";

const EMPTY = () => ({ rings: [], dots: [] });

function arc(c, from, r) {
  const steps = Math.max(4, Math.min(16, Math.ceil(r / 1.5)));
  const start = Math.atan2(from.y, from.x);
  const pts = [];
  for (let k = 1; k < steps; k++) {
    const a = start - (Math.PI * k) / steps;
    pts.push({ x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r });
  }
  return pts;
}

function direction(a, b, fallback) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  return len > 1e-6 ? { x: dx / len, y: dy / len } : fallback;
}

export function outline(points, { tolerance = 0.12, round = false } = {}) {
  const n = points.length;
  if (!n) return EMPTY();

  let maxR = 0;
  for (const p of points) if (p.r > maxR) maxR = p.r;

  let span = 0;
  for (let i = 1; i < n; i++) span += dist(points[i - 1], points[i]);
  if (n === 1 || span < maxR * 0.35) {
    const p = points[Math.floor(n / 2)];
    return { rings: [], dots: [{ x: p.x, y: p.y, r: Math.max(maxR, 0.3) }] };
  }

  const dirs = new Array(n - 1);
  let last = { x: 1, y: 0 };
  for (let i = 0; i < n - 1; i++) {
    last = direction(points[i], points[i + 1], last);
    dirs[i] = last;
  }

  const rings = [];
  const dots = [];
  let left = [];
  let right = [];

  let head = null;
  let tail = null;

  const push = (p, nx, ny) => {
    left.push({ x: p.x + nx * p.r, y: p.y + ny * p.r });
    right.push({ x: p.x - nx * p.r, y: p.y - ny * p.r });
    if (!head) head = { p, n: { x: nx, y: ny } };
    tail = { p, n: { x: nx, y: ny } };
  };

  const close = () => {
    if (left.length >= 2) {
      const l = simplify(left, tolerance);
      const r = simplify(right, tolerance).reverse();
      rings.push(round ? l.concat(arc(tail.p, tail.n, tail.p.r), r, arc(head.p, { x: -head.n.x, y: -head.n.y }, head.p.r)) : l.concat(r));
    }
    left = [];
    right = [];
    head = null;
  };

  if (!round) dots.push({ x: points[0].x, y: points[0].y, r: points[0].r });

  for (let i = 0; i < n; i++) {
    const p = points[i];
    const dIn = dirs[Math.max(0, i - 1)];
    const dOut = dirs[Math.min(n - 2, i)];

    if (i > 0 && i < n - 1) {
      const turn = Math.abs(Math.atan2(dIn.x * dOut.y - dIn.y * dOut.x, dIn.x * dOut.x + dIn.y * dOut.y));
      const step = dist(points[i - 1], p);
      const limit = Math.min(0.85, step / (1.25 * Math.max(p.r, 0.01)));
      if (turn > limit) {
        push(p, -dIn.y, dIn.x);
        close();
        if (!round) dots.push({ x: p.x, y: p.y, r: p.r });
        push(p, -dOut.y, dOut.x);
        continue;
      }
    }

    let tx = dIn.x + dOut.x;
    let ty = dIn.y + dOut.y;
    const tl = Math.hypot(tx, ty);
    if (tl < 1e-6) {
      tx = dOut.x;
      ty = dOut.y;
    } else {
      tx /= tl;
      ty /= tl;
    }
    push(p, -ty, tx);
  }

  close();
  const end = points[n - 1];
  if (!round) dots.push({ x: end.x, y: end.y, r: end.r });
  return { rings, dots };
}
