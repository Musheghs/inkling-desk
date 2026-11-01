import { clamp, dist, mergeShapes, resample } from "./geometry.js";
import { outline } from "./outline.js";
import { centerline, PENS, widen } from "./pens.js";
import { noise, rng } from "./random.js";

export const BRUSHES = [
  { id: "ink", label: "Brush pen" },
  { id: "marker", label: "Marker" },
  { id: "calligraphy", label: "Calligraphy" },
  { id: "dry", label: "Dry brush" },
  { id: "charcoal", label: "Charcoal" },
  { id: "crayon", label: "Crayon" },
  { id: "stars", label: "Stars", scatter: true },
  { id: "hearts", label: "Hearts", scatter: true },
  { id: "dots", label: "Dots", scatter: true },
  { id: "leaves", label: "Leaves", scatter: true },
  { id: "grass", label: "Grass", scatter: true },
  { id: "confetti", label: "Confetti", scatter: true },
  { id: "snow", label: "Snow", scatter: true },
];

export const brushOf = (id) => BRUSHES.find((b) => b.id === id) || BRUSHES[0];

const TAU = Math.PI * 2;

const taper = (d, len, floor) => (len <= 0 ? 1 : floor + (1 - floor) * Math.sqrt(clamp(d / len, 0, 1)));

function signedArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i];
    const q = ring[(i + 1) % ring.length];
    a += p.x * q.y - q.x * p.y;
  }
  return a;
}

const orient = (ring) => (signedArea(ring) > 0 ? ring.slice().reverse() : ring);

function arcLengths(line) {
  const s = new Float64Array(line.length);
  for (let i = 1; i < line.length; i++) s[i] = s[i - 1] + dist(line[i - 1], line[i]);
  return s;
}

function normals(line) {
  return line.map((p, i) => {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(line.length - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: -dy / len, y: dx / len, a: Math.atan2(dy, dx) };
  });
}

function custom(radius, line, size) {
  return outline(widen({ radius }, line, size));
}

function bristles(line, size, { count, spread, thick, dryness, seed, grain = 0 }) {
  const s = arcLengths(line);
  const total = s[s.length - 1] || 1;
  const nrm = normals(line);
  const r = rng(seed);
  const shapes = [];
  for (let j = 0; j < count; j++) {
    const lane = (count === 1 ? 0 : j / (count - 1) - 0.5) * spread * size + (r() - 0.5) * size * 0.08;
    const width = thick * size * (0.6 + r() * 0.7);
    const n = noise(seed + j * 37);
    const wander = noise(seed + j * 91);
    let run = [];
    const flush = () => {
      if (run.length > 2) shapes.push(outline(run));
      run = [];
    };
    for (let i = 0; i < line.length; i++) {
      const t = Math.min(1, s[i] / (size * 60));
      const p = line[i];
      const press = 0.55 + 0.45 * (p.p ?? 0.7);
      const gap = n(s[i] / (size * 0.9) + j * 3.1) < -0.75 + dryness * (0.6 + t * 1.4);
      if (gap) {
        flush();
        continue;
      }
      const off = lane * press + wander(s[i] / (size * 2.4)) * size * 0.05;
      run.push({ x: p.x + nrm[i].x * off, y: p.y + nrm[i].y * off, r: width * taper(s[i], size * 1.2, 0.3) * taper(total - s[i], size * 2, 0.15) });
    }
    flush();
  }
  if (grain) {
    const dots = [];
    const n = Math.round((total / size) * grain);
    for (let k = 0; k < n; k++) {
      const i = Math.floor(r() * line.length);
      const p = line[i];
      const off = (r() - 0.5) * spread * size * 1.1;
      dots.push({ x: p.x + nrm[i].x * off, y: p.y + nrm[i].y * off, r: size * (0.02 + r() * 0.04) });
    }
    shapes.push({ rings: [], dots });
  }
  return mergeShapes(shapes);
}

function crayon(line, size, seed) {
  const n = noise(seed);
  const base = custom(({ s0, s1, size }) => (size / 2) * 0.9 * taper(s0, size * 0.6, 0.7) * taper(s1, size * 0.6, 0.7), line, size);
  let k = 0;
  base.rings = base.rings.map((ring) => ring.map((p) => ({ x: p.x + n(k++ * 0.9) * size * 0.06, y: p.y + n(k * 0.9 + 50) * size * 0.06 })));
  const s = arcLengths(line);
  const total = s[s.length - 1] || 1;
  const nrm = normals(line);
  const r = rng(seed + 5);
  const count = Math.round((total / size) * 22);
  for (let c = 0; c < count; c++) {
    const i = Math.floor(r() * line.length);
    if (s[i] < size * 0.8 || total - s[i] < size * 0.8) continue;
    const hr = size * (0.025 + r() * 0.05);
    const edge = r() < 0.6;
    const off = (edge ? Math.sign(r() - 0.5) * (0.28 + r() * 0.1) : (r() * 2 - 1) * 0.3) * size;
    const cx = line[i].x + nrm[i].x * off;
    const cy = line[i].y + nrm[i].y * off;
    const a0 = r() * TAU;
    const hole = Array.from({ length: 5 }, (_, j) => {
      const a = a0 + (j / 5) * TAU;
      const rr = hr * (0.6 + r() * 0.7);
      return { x: cx + Math.cos(a) * rr * 1.6, y: cy + Math.sin(a) * rr };
    });
    base.rings.push(signedArea(hole) > 0 ? hole : hole.reverse());
  }
  return base;
}

function stretch(id, points, size, passes, seed) {
  const line = centerline(points, size, passes);
  if (id === "marker") return custom(({ s0, s1, size }) => (size / 2) * 0.92 * taper(s0, size * 0.5, 0.86) * taper(s1, size * 0.5, 0.86), line, size);
  if (id === "calligraphy")
    return custom(
      ({ s0, s1, dir, size }) => (size / 2) * (0.1 + 0.9 * Math.abs(Math.sin(dir - Math.PI / 4))) * taper(s0, size, 0.5) * taper(s1, size, 0.4),
      line,
      size,
    );
  if (id === "dry") return bristles(line, size, { count: clamp(Math.round(size / 2.2) + 4, 6, 14), spread: 0.95, thick: 0.07, dryness: 0.5, seed });
  if (id === "charcoal")
    return bristles(line, size, { count: clamp(Math.round(size / 1.6) + 6, 9, 20), spread: 0.85, thick: 0.045, dryness: 0.7, seed, grain: 9 });
  if (id === "crayon") return crayon(line, size, seed);
  return outline(widen(PENS.brush, line, size));
}

function star(points, inner = 0.45) {
  const out = [];
  for (let i = 0; i < points * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    const r = i % 2 ? inner : 1;
    out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  return out;
}

function heart() {
  const out = [];
  for (let i = 0; i < 40; i++) {
    const t = (i / 40) * TAU;
    out.push({ x: (16 * Math.sin(t) ** 3) / 17, y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17 });
  }
  return out;
}

function leaf() {
  const out = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    out.push({ x: t * 2, y: -Math.sin(t * Math.PI) * 0.42 * (1 - t * 0.25) });
  }
  for (let i = 11; i > 0; i--) {
    const t = i / 12;
    out.push({ x: t * 2, y: Math.sin(t * Math.PI) * 0.38 * (1 - t * 0.25) });
  }
  return out;
}

function blade(height, lean) {
  const out = [];
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    out.push({ x: -0.12 * (1 - t) + lean * t * t, y: -height * t });
  }
  for (let i = steps - 1; i >= 0; i--) {
    const t = i / steps;
    out.push({ x: 0.12 * (1 - t) + lean * t * t, y: -height * t });
  }
  return out;
}

function placed(ring, x, y, scale, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return orient(ring.map((p) => ({ x: x + (p.x * c - p.y * s) * scale, y: y + (p.x * s + p.y * c) * scale })));
}

function strokeShape(pts, r) {
  return outline(pts.map((p) => ({ x: p.x, y: p.y, r })));
}

const SPACING = { stars: 1.5, hearts: 1.6, dots: 0.75, leaves: 1.05, grass: 0.38, confetti: 0.85, snow: 1.4 };

function scatter(id, points, size, passes, seed) {
  const line = centerline(points, size, passes);
  const r = rng(seed);
  const path = resample(line, Math.max(1.5, size * SPACING[id]));
  const nrm = normals(path);
  const rings = [];
  const dots = [];
  const shapes = [];
  path.forEach((p, i) => {
    const press = 0.6 + 0.5 * (p.p ?? 0.7);
    const k = size * 0.5 * press * (0.65 + r() * 0.55);
    const jitter = id === "grass" ? 0 : (r() - 0.5) * size * 0.55;
    const x = p.x + nrm[i].x * jitter;
    const y = p.y + nrm[i].y * jitter;
    if (id === "stars") rings.push(placed(star(5, 0.44), x, y, k, r() * TAU));
    else if (id === "hearts") rings.push(placed(heart(), x, y, k, (r() - 0.5) * 0.7));
    else if (id === "dots") dots.push({ x, y, r: k * (0.25 + r() * 0.45) });
    else if (id === "leaves") {
      const side = i % 2 ? 1 : -1;
      rings.push(placed(leaf(), x, y, k * 1.25, nrm[i].a + side * (0.7 + r() * 0.4)));
    } else if (id === "grass") {
      const h = 1.4 + r() * 1.3;
      rings.push(placed(blade(h, (r() - 0.5) * 0.9), x, y, k * 1.1, 0));
    } else if (id === "confetti") {
      const a = r() * TAU;
      if (r() < 0.65)
        rings.push(
          placed(
            [
              { x: -0.5, y: -0.22 },
              { x: 0.5, y: -0.22 },
              { x: 0.5, y: 0.22 },
              { x: -0.5, y: 0.22 },
            ],
            x,
            y,
            k * 1.25,
            a,
          ),
        );
      else {
        const pts = [];
        for (let t = 0; t <= 12; t++)
          pts.push({
            x: x + Math.cos(a) * (t / 12 - 0.5) * k * 1.8 - Math.sin(a) * Math.sin(t / 2) * k * 0.26,
            y: y + Math.sin(a) * (t / 12 - 0.5) * k * 1.8 + Math.cos(a) * Math.sin(t / 2) * k * 0.26,
          });
        shapes.push(strokeShape(pts, k * 0.13));
      }
    } else if (id === "snow") {
      const a = r() * TAU;
      for (let arm = 0; arm < 3; arm++) {
        const t = a + (arm * Math.PI) / 3;
        shapes.push(
          strokeShape(
            [
              { x: x - Math.cos(t) * k * 0.6, y: y - Math.sin(t) * k * 0.6 },
              { x: x + Math.cos(t) * k * 0.6, y: y + Math.sin(t) * k * 0.6 },
            ],
            Math.max(0.5, k * 0.06),
          ),
        );
      }
      dots.push({ x, y, r: Math.max(0.6, k * 0.1) });
    }
  });
  return mergeShapes([{ rings, dots }, ...shapes]);
}

export function brushShape(id, points, size, { passes = 1, seed = 1 } = {}) {
  const brush = brushOf(id);
  if (points.length < 2) {
    const p = points[0];
    return p ? { rings: [], dots: [{ x: p.x, y: p.y, r: size * 0.32 }] } : { rings: [], dots: [] };
  }
  return brush.scatter ? scatter(brush.id, points, size, passes, seed) : stretch(brush.id, points, size, passes, seed);
}
