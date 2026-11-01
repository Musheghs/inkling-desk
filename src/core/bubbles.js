import { headGrow } from "../parts/people.js";
import { bounds, clamp, dist, resample, union } from "./geometry.js";
import { sketchLoop } from "./figures.js";
import { rng } from "./random.js";
import { sketchShape } from "./shapes.js";
import { turn } from "./transform.js";
import { blockBaselines, fontFor, textBlock } from "./type.js";

export const BUBBLES = [
  { id: "speech", label: "Speech" },
  { id: "thought", label: "Thought" },
  { id: "shout", label: "Shout" },
  { id: "whisper", label: "Whisper" },
  { id: "box", label: "Box" },
];

const TAU = Math.PI * 2;

const cache = new WeakMap();

function superellipse(rx, ry, n) {
  return (a) => {
    const c = Math.cos(a);
    const s = Math.sin(a);
    return { x: rx * Math.sign(c) * Math.abs(c) ** (2 / n), y: ry * Math.sign(s) * Math.abs(s) ** (2 / n) };
  };
}

function spiky(rx, ry, spikes, seed) {
  const r = rng(seed);
  const jag = Array.from({ length: spikes * 2 }, (_, i) => (i % 2 ? 0.86 + r() * 0.06 : 1.08 + r() * 0.12));
  return (a) => {
    const t = ((((a / TAU) % 1) + 1) % 1) * spikes * 2;
    const i = Math.floor(t);
    const f = t - i;
    const k = jag[i % jag.length] + (jag[(i + 1) % jag.length] - jag[i % jag.length]) * f;
    return { x: Math.cos(a) * rx * k, y: Math.sin(a) * ry * k };
  };
}

function curve(a, b, n, bend, steps = 10) {
  const cx = (a.x + b.x) / 2 + n.x * bend;
  const cy = (a.y + b.y) / 2 + n.y * bend;
  const out = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    out.push({ x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * cx + t * t * b.x, y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * cy + t * t * b.y });
  }
  return out;
}

function ringWithTail(edge, center, tail, { sharp = false, steps = 96, zig = false, seed = 1 } = {}) {
  const rel = tail ? { x: tail.x - center.x, y: tail.y - center.y } : null;
  const theta = rel ? Math.atan2(rel.y, rel.x) : 0;
  const at = (a) => {
    const p = edge(a);
    return { x: center.x + p.x, y: center.y + p.y };
  };
  const rim = Math.hypot(edge(theta).x, edge(theta).y);
  const reach = rel ? Math.hypot(rel.x, rel.y) : 0;
  if (!rel || reach < rim * 1.08) {
    return { ring: Array.from({ length: steps }, (_, i) => at((i / steps) * TAU)), tailFrom: -1 };
  }
  const delta = clamp(0.5 * (rim / Math.max(reach, rim)), 0.12, 0.3);
  const ring = [];
  const span = TAU - delta * 2;
  const n = Math.round((steps * span) / TAU);
  for (let i = 0; i <= n; i++) ring.push(at(theta + delta + (span * i) / n));
  const b1 = ring[ring.length - 1];
  const b2 = ring[0];
  const tip = { x: tail.x, y: tail.y };
  const side = (seed & 1) * 2 - 1;
  const across = { x: (-rel.y / reach) * side, y: (rel.x / reach) * side };
  const bend = (sharp ? 0 : 0.14) * (reach - rim);
  const tailFrom = ring.length;
  if (zig) {
    const r = rng(seed);
    const mid = (p, q, k) => ({ x: p.x + (q.x - p.x) * k + (r() - 0.5) * 10, y: p.y + (q.y - p.y) * k + (r() - 0.5) * 10 });
    ring.push(mid(b1, tip, 0.45), tip, mid(b2, tip, 0.55));
  } else {
    ring.push(...curve(b1, tip, across, bend), ...curve(tip, b2, across, bend * 0.72).slice(0, -1));
  }
  return { ring, tailFrom };
}

function dashes(loop, dash, gap) {
  const pts = resample(loop, 2);
  const out = [];
  let run = [];
  let s = 0;
  for (let i = 1; i < pts.length; i++) {
    s += dist(pts[i - 1], pts[i]);
    const on = s % (dash + gap) < dash;
    if (on) run.push(pts[i]);
    else if (run.length) {
      if (run.length > 1) out.push(run);
      run = [];
    }
  }
  if (run.length > 1) out.push(run);
  return out;
}

export function bubbleGeometry(item, families) {
  const key = families;
  const hit = cache.get(item);
  if (hit && hit.key === key) return hit.value;
  const font = fontFor(item.face || "serif", item.size || 26, families);
  const block = textBlock(item.text || "", font, font.size * 10.5);
  const center = { x: item.x, y: item.y };
  const seed = item.seed || 7;
  const style = item.style || "speech";
  const rx = Math.max(block.width / 2 + font.size * 1.05, font.size * 2.4) * (style === "box" ? 1 : 1.12);
  const ry = Math.max(block.height / 2 + font.size * 0.85, font.size * 1.4) * (style === "box" ? 1 : 1.18);
  const tail = item.tail || null;
  const fills = [];
  const strokes = [];
  const wobble = 0.85;

  if (style === "thought") {
    const bumps = clamp(Math.round((rx + ry) / (font.size * 1.15)), 8, 16);
    const r = rng(seed);
    const lift = Array.from({ length: bumps }, () => 0.12 + r() * 0.08);
    const edge = (a) => {
      const t = ((((a / TAU) % 1) + 1) % 1) * bumps;
      const k = Math.floor(t);
      const f = t - k;
      const l = lift[k % bumps];
      const swell = 1 - l + Math.sin(f * Math.PI) * l * 1.6;
      return { x: Math.cos(a) * rx * 1.04 * swell, y: Math.sin(a) * ry * 1.04 * swell };
    };
    const main = Array.from({ length: bumps * 12 }, (_, i) => {
      const p = edge((i / (bumps * 12)) * TAU);
      return { x: center.x + p.x, y: center.y + p.y };
    });
    fills.push(main);
    strokes.push(sketchLoop(main, seed, wobble));
    if (tail) {
      const theta = Math.atan2(tail.y - center.y, tail.x - center.x);
      const e = edge(theta);
      const start = { x: center.x + e.x, y: center.y + e.y };
      const span = dist(start, tail);
      if (span > font.size) {
        [
          [0.3, 0.42],
          [0.62, 0.3],
          [0.9, 0.19],
        ].forEach(([t, k], i) => {
          const c = { x: start.x + (tail.x - start.x) * t, y: start.y + (tail.y - start.y) * t };
          const rr = Math.max(3, font.size * k * 1.4);
          const ring = Array.from({ length: 28 }, (_, j) => ({ x: c.x + Math.cos((j / 28) * TAU) * rr * 1.15, y: c.y + Math.sin((j / 28) * TAU) * rr }));
          fills.push(ring);
          strokes.push(sketchLoop(ring, seed + 13 * (i + 1), wobble * 0.6));
        });
      }
    }
  } else if (style === "shout") {
    const spikes = clamp(Math.round((rx + ry) / (font.size * 0.9)), 12, 26);
    const edge = spiky(rx * 1.06, ry * 1.1, spikes, seed);
    const { ring } = ringWithTail(edge, center, tail, { sharp: true, steps: spikes * 2, zig: true, seed });
    fills.push(ring);
    strokes.push(sketchShape({ type: "polygon", corners: ring }, seed, { bow: 0.4, wobble: 0.6 }));
  } else {
    const edge = style === "box" ? superellipse(rx, ry, 7) : superellipse(rx, ry, 2);
    const { ring } = ringWithTail(edge, center, tail, { sharp: style === "box", steps: style === "box" ? 120 : 96, seed });
    fills.push(ring);
    const loop = sketchLoop(ring, seed, style === "box" ? 0.5 : wobble);
    if (style === "whisper") strokes.push(...dashes(loop, font.size * 0.8, font.size * 0.42));
    else strokes.push(loop);
  }

  let box = null;
  for (const ring of fills) box = union(box, bounds(ring));
  const value = {
    style,
    fills,
    strokes,
    font,
    lines: blockBaselines(block, center.x, center.y, font),
    block,
    box: box || { x: center.x, y: center.y, w: 1, h: 1 },
  };
  cache.set(item, { key, value });
  return value;
}

export function mouthOf(piece) {
  const part = piece.part;
  if (!part || part.type !== "person") return null;
  const k = headGrow(part);
  const snout = part.kind === "animal" ? 30 : 0;
  const upright = { x: (20 + snout) * k, y: 28 };
  const local = part.body === "lying" ? { x: upright.y, y: -upright.x } : upright;
  const sx = piece.scale * (piece.flip ? -1 : 1);
  const q = turn({ x: local.x * sx, y: local.y * piece.scale }, piece.rot || 0);
  return { x: piece.x + q.x, y: piece.y + q.y };
}
