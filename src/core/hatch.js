import { bounds } from "./geometry.js";
import { rng } from "./random.js";

function areaTest(line, radius) {
  const cell = Math.max(radius, 8);
  const grid = new Map();
  const segments = [];
  for (let i = 1; i < line.length; i++) segments.push([line[i - 1], line[i]]);
  if (!segments.length && line.length) segments.push([line[0], line[0]]);
  segments.forEach(([a, b], index) => {
    const x0 = Math.floor((Math.min(a.x, b.x) - radius) / cell);
    const x1 = Math.floor((Math.max(a.x, b.x) + radius) / cell);
    const y0 = Math.floor((Math.min(a.y, b.y) - radius) / cell);
    const y1 = Math.floor((Math.max(a.y, b.y) + radius) / cell);
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        const key = x * 73856093 + y * 19349663;
        let list = grid.get(key);
        if (!list) grid.set(key, (list = []));
        list.push(index);
      }
    }
  });
  const r2 = radius * radius;
  return (px, py) => {
    const list = grid.get(Math.floor(px / cell) * 73856093 + Math.floor(py / cell) * 19349663);
    if (!list) return false;
    for (const index of list) {
      const [a, b] = segments[index];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len2 = dx * dx + dy * dy;
      let t = len2 ? ((px - a.x) * dx + (py - a.y) * dy) / len2 : 0;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = px - (a.x + dx * t);
      const ey = py - (a.y + dy * t);
      if (ex * ex + ey * ey <= r2) return true;
    }
    return false;
  };
}

const hash = (k, salt) => {
  let h = (k * 374761393 + salt * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export function hatchLines(line, radius, { spacing, angles, seed }) {
  const inside = areaTest(line, radius);
  const box = bounds(line, radius);
  const corners = [
    { x: box.x, y: box.y },
    { x: box.x + box.w, y: box.y },
    { x: box.x, y: box.y + box.h },
    { x: box.x + box.w, y: box.y + box.h },
  ];
  const r = rng(seed);
  const strokes = [];
  angles.forEach((angle, set) => {
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const vx = -uy;
    const vy = ux;
    let vMin = Infinity;
    let vMax = -Infinity;
    let uMin = Infinity;
    let uMax = -Infinity;
    for (const c of corners) {
      const v = c.x * vx + c.y * vy;
      const u = c.x * ux + c.y * uy;
      vMin = Math.min(vMin, v);
      vMax = Math.max(vMax, v);
      uMin = Math.min(uMin, u);
      uMax = Math.max(uMax, u);
    }
    const step = 1.5;
    for (let k = Math.ceil(vMin / spacing); k * spacing <= vMax; k++) {
      const v = k * spacing + (hash(k, set + 1) - 0.5) * spacing * 0.32;
      const tilt = (hash(k, set + 7) - 0.5) * 0.05;
      let start = null;
      for (let u = uMin; u <= uMax + step; u += step) {
        const x = u * ux + v * vx;
        const y = u * uy + v * vy;
        const hit = u <= uMax && inside(x, y);
        if (hit && start === null) start = u;
        if (!hit && start !== null) {
          const end = u - step;
          const len = end - start;
          if (len > spacing * 0.9) {
            const a = start + (r() - 0.35) * Math.min(4, len * 0.12);
            const b = end - (r() - 0.35) * Math.min(4, len * 0.12);
            const lean = tilt * (b - a);
            strokes.push([
              { x: a * ux + (v - lean / 2) * vx, y: a * uy + (v - lean / 2) * vy, p: 0.55 },
              { x: ((a + b) / 2) * ux + v * vx, y: ((a + b) / 2) * uy + v * vy, p: 0.85 + r() * 0.15 },
              { x: b * ux + (v + lean / 2) * vx, y: b * uy + (v + lean / 2) * vy, p: 0.5 },
            ]);
          }
          start = null;
        }
      }
    }
  });
  return strokes;
}
