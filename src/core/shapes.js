import { bounds, dist, distToSegment, length, resample, TAU } from "./geometry.js";
import { noise, rng } from "./random.js";

const SNAP = Math.PI / 4;

function snapAngle(angle, within) {
  const snapped = Math.round(angle / SNAP) * SNAP;
  return Math.abs(angle - snapped) < within ? snapped : angle;
}

function closedRdp(ring, epsilon) {
  const n = ring.length;
  let cx = 0;
  let cy = 0;
  for (const p of ring) {
    cx += p.x;
    cy += p.y;
  }
  cx /= n;
  cy /= n;
  let start = 0;
  let far = -1;
  ring.forEach((p, i) => {
    const d = Math.hypot(p.x - cx, p.y - cy);
    if (d > far) {
      far = d;
      start = i;
    }
  });
  const loop = ring.slice(start).concat(ring.slice(0, start + 1));
  const keep = new Uint8Array(loop.length);
  keep[0] = keep[loop.length - 1] = 1;
  const stack = [[0, loop.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    let best = -1;
    let index = -1;
    for (let i = s + 1; i < e; i++) {
      const d = distToSegment(loop[i], loop[s], loop[e]);
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
  const corners = loop.filter((_, i) => keep[i]);
  corners.pop();
  return corners;
}

function cornerAngle(a, b, c) {
  const ux = a.x - b.x;
  const uy = a.y - b.y;
  const vx = c.x - b.x;
  const vy = c.y - b.y;
  return Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1))));
}

function mergeFlat(corners) {
  let list = corners.slice();
  let changed = true;
  while (changed && list.length > 3) {
    changed = false;
    for (let i = 0; i < list.length; i++) {
      const a = list[(i - 1 + list.length) % list.length];
      const c = list[(i + 1) % list.length];
      if (cornerAngle(a, list[i], c) > (150 * Math.PI) / 180) {
        list.splice(i, 1);
        changed = true;
        break;
      }
    }
  }
  return list;
}

function ringError(points, corners) {
  let total = 0;
  for (const p of points) {
    let best = Infinity;
    for (let i = 0; i < corners.length; i++) {
      const d = distToSegment(p, corners[i], corners[(i + 1) % corners.length]);
      if (d < best) best = d;
    }
    total += best;
  }
  return total / points.length;
}

function fitEllipse(points) {
  const n = points.length;
  let cx = 0;
  let cy = 0;
  for (const p of points) {
    cx += p.x;
    cy += p.y;
  }
  cx /= n;
  cy /= n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const p of points) {
    const dx = p.x - cx;
    const dy = p.y - cy;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  sxx /= n;
  syy /= n;
  sxy /= n;
  const rot = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  let a = 0;
  let b = 0;
  for (const p of points) {
    const dx = p.x - cx;
    const dy = p.y - cy;
    a += (dx * cos + dy * sin) ** 2;
    b += (-dx * sin + dy * cos) ** 2;
  }
  let rx = Math.sqrt((2 * a) / n);
  let ry = Math.sqrt((2 * b) / n);
  let error = 0;
  for (const p of points) {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const u = (dx * cos + dy * sin) / rx;
    const v = (-dx * sin + dy * cos) / ry;
    error += Math.abs(Math.hypot(u, v) - 1);
  }
  error /= n;
  let angle = rot;
  if (Math.min(rx, ry) / Math.max(rx, ry) > 0.86) {
    rx = ry = (rx + ry) / 2;
    angle = 0;
  } else {
    const snapped = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
    if (Math.abs(angle - snapped) < 0.16) angle = snapped;
  }
  return { type: "ellipse", cx, cy, rx, ry, rot: angle, error };
}

function fitRectangle(corners) {
  let angle = 0;
  let weight = 0;
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    const len = dist(a, b);
    let t = Math.atan2(b.y - a.y, b.x - a.x);
    t = ((t % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
    if (t > Math.PI / 4) t -= Math.PI / 2;
    angle += t * len;
    weight += len;
  }
  angle /= weight || 1;
  if (Math.abs(angle) < 0.13) angle = 0;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let cx = 0;
  let cy = 0;
  for (const c of corners) {
    cx += c.x / 4;
    cy += c.y / 4;
  }
  let hw = 0;
  let hh = 0;
  for (const c of corners) {
    const dx = c.x - cx;
    const dy = c.y - cy;
    hw += Math.abs(dx * cos + dy * sin) / 4;
    hh += Math.abs(-dx * sin + dy * cos) / 4;
  }
  const at = (u, v) => ({ x: cx + u * cos - v * sin, y: cy + u * sin + v * cos });
  return { type: "polygon", corners: [at(-hw, -hh), at(hw, -hh), at(hw, hh), at(-hw, hh)] };
}

export function recognize(raw) {
  if (raw.length < 4) return null;
  const box = bounds(raw);
  const diag = Math.hypot(box.w, box.h);
  if (diag < 14) return null;
  const pts = resample(raw, diag / 72);
  const total = length(pts);
  const first = pts[0];
  const last = pts[pts.length - 1];
  const chord = dist(first, last);

  if (chord > diag * 0.6) {
    let worst = 0;
    for (const p of pts) worst = Math.max(worst, distToSegment(p, first, last));
    if (total / chord < 1.14 && worst / chord < 0.075) {
      const angle = snapAngle(Math.atan2(last.y - first.y, last.x - first.x), 0.09);
      return {
        type: "line",
        a: { x: first.x, y: first.y },
        b: { x: first.x + Math.cos(angle) * chord, y: first.y + Math.sin(angle) * chord },
      };
    }
  }

  let ring = pts;
  let closed = chord < diag * 0.24;
  if (!closed) {
    for (let i = Math.floor(pts.length * 0.6); i < pts.length; i++) {
      if (dist(pts[i], first) < diag * 0.12) {
        ring = pts.slice(0, i + 1);
        closed = true;
        break;
      }
    }
  }
  if (!closed || total < diag * 1.6) return null;

  const ellipse = fitEllipse(ring);
  const corners = mergeFlat(closedRdp(ring, diag * 0.07));
  const polyError = corners.length >= 3 ? ringError(ring, corners) / diag : Infinity;
  const sharp =
    corners.length >= 3 &&
    corners.every((c, i) => {
      const a = corners[(i - 1 + corners.length) % corners.length];
      const b = corners[(i + 1) % corners.length];
      return cornerAngle(a, c, b) < (128 * Math.PI) / 180;
    });

  if ((corners.length === 3 || corners.length === 4) && sharp && polyError < 0.035 && polyError * 2.4 < ellipse.error) {
    if (corners.length === 4) {
      const right = corners.every((c, i) => {
        const a = corners[(i + 3) % 4];
        const b = corners[(i + 1) % 4];
        return Math.abs(cornerAngle(a, c, b) - Math.PI / 2) < 0.42;
      });
      if (right) return fitRectangle(corners);
    }
    return { type: "polygon", corners: corners.map((c) => ({ x: c.x, y: c.y })) };
  }
  if (ellipse.error < 0.1) return ellipse;
  return null;
}

export function scaleShape(shape, anchor, factor) {
  const s = (p) => ({ x: anchor.x + (p.x - anchor.x) * factor, y: anchor.y + (p.y - anchor.y) * factor });
  if (shape.type === "line") return { ...shape, b: s(shape.b) };
  if (shape.type === "ellipse") {
    const c = s({ x: shape.cx, y: shape.cy });
    return { ...shape, cx: c.x, cy: c.y, rx: shape.rx * factor, ry: shape.ry * factor };
  }
  return { ...shape, corners: shape.corners.map(s) };
}

export function centroid(shape) {
  if (shape.type === "line") return shape.a;
  if (shape.type === "ellipse") return { x: shape.cx, y: shape.cy };
  const c = { x: 0, y: 0 };
  for (const p of shape.corners) {
    c.x += p.x / shape.corners.length;
    c.y += p.y / shape.corners.length;
  }
  return c;
}

export function hand(points, { seed = 1, wobble = 1, closed = false, spacing = 2, weight = 0.78 } = {}) {
  const source = points.map((p) => ({ x: p.x, y: p.y, p: p.p ?? weight }));
  const line = resample(closed ? source.concat([source[0]]) : source, spacing);
  const n1 = noise(seed);
  const n2 = noise(seed + 17);
  const out = [];
  let s = 0;
  for (let i = 0; i < line.length; i++) {
    if (i) s += dist(line[i - 1], line[i]);
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(line.length - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const off = n1(s / 64) * wobble;
    out.push({
      x: line[i].x - (dy / len) * off,
      y: line[i].y + (dx / len) * off,
      p: Math.max(0.2, Math.min(1, line[i].p + n2(s / 40) * 0.16)),
    });
  }
  return out;
}

function edge(a, b, r, bow) {
  const len = dist(a, b);
  bow = Math.max(-1, Math.min(1, bow)) * Math.min(1, 220 / Math.max(len, 1));
  const steps = Math.max(2, Math.ceil(len / 6));
  const nx = -(b.y - a.y) / (len || 1);
  const ny = (b.x - a.x) / (len || 1);
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const sag = Math.sin(t * Math.PI) * bow * len * 0.012;
    out.push({ x: a.x + (b.x - a.x) * t + nx * sag, y: a.y + (b.y - a.y) * t + ny * sag, p: r() * 0.1 + 0.72 });
  }
  return out;
}

export function sketchShape(shape, seed, { bow = 1, wobble = 1 } = {}) {
  const r = rng(seed);
  if (shape.type === "line") {
    const pts = edge(shape.a, shape.b, r, (r() * 2 - 1) * bow);
    return hand(pts, { seed, wobble: Math.min(1.4, dist(shape.a, shape.b) * 0.004 + 0.3) * wobble });
  }
  if (shape.type === "ellipse") {
    const { cx, cy, rx, ry, rot } = shape;
    const start = r() * TAU;
    const overlap = 0.24 + r() * 0.14;
    const drift = 0.018 + r() * 0.02;
    const perimeter = Math.PI * (rx + ry);
    const steps = Math.max(24, Math.ceil(perimeter / 3));
    const n = noise(seed + 5);
    const pts = [];
    const total = TAU + overlap;
    for (let i = 0; i <= steps * (total / TAU); i++) {
      const t = (i / steps) * TAU;
      const grow = 1 + n(t * 1.3) * 0.022 - (t / total) * drift;
      const u = Math.cos(start + t) * rx * grow;
      const v = Math.sin(start + t) * ry * grow;
      pts.push({
        x: cx + u * Math.cos(rot) - v * Math.sin(rot),
        y: cy + u * Math.sin(rot) + v * Math.cos(rot),
        p: 0.78,
      });
    }
    return hand(pts, { seed, wobble: 0.5 });
  }
  const corners = shape.corners;
  const pts = [];
  for (let i = 0; i < corners.length; i++) {
    const seg = edge(corners[i], corners[(i + 1) % corners.length], r, (r() * 2 - 1) * bow);
    if (i) seg.shift();
    seg[0].p = 0.95;
    pts.push(...seg);
  }
  const a = corners[0];
  const b = corners[1];
  const len = dist(a, b) || 1;
  const run = Math.min(len * 0.12, 14);
  pts.push({ x: a.x + ((b.x - a.x) / len) * run + 1.2, y: a.y + ((b.y - a.y) / len) * run + 1.4, p: 0.5 });
  return hand(pts, { seed, wobble: 0.6 * wobble });
}
