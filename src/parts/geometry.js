import { mapShape, mergeShapes, n1, ringPath, shapeBounds, shapePath, union, bounds } from "../core/geometry.js";
import { penShape } from "../core/pens.js";
import { hand } from "../core/shapes.js";
import { boundsOf, boxCorners, degrees, turn } from "../core/transform.js";
import { buildPart } from "./index.js";
import { THINGS } from "./things.js";

const keys = new WeakMap();
const local = new Map();
const placed = new WeakMap();

const partKey = (part) => {
  let key = keys.get(part);
  if (!key) keys.set(part, (key = JSON.stringify(part)));
  return key;
};

const GARMENTS = new Set(["outfit", "top", "bottom", "cape", "hat"]);
const PARTS = new Set(["top", "bottom", "cape", "hat", "hair", "held", "aid", "chair"]);

function computeLocal(part, scale, flip, weight) {
  const build = buildPart(part);
  const sx = scale * (flip ? -1 : 1);
  const sy = scale;
  const tf = (p) => ({ x: p.x * sx, y: p.y * sy, p: p.p });
  const seed = part.seed || 1;

  const draw = (line, i) => {
    const pts = line.pts.map(tf);
    const drawn = line.raw ? pts : hand(pts, { seed: seed + i * 131, wobble: line.wobble ?? 0.65, closed: line.closed, weight: line.p ?? 0.78 });
    return penShape(line.pen || "nib", drawn, weight * (line.weight ?? 1), { passes: line.raw ? 1 : 0 });
  };
  const ink = mergeShapes(build.lines.map((line, i) => (line.color === "chalk" ? null : draw(line, i))).filter(Boolean));
  const chalkShapes = build.lines.map((line, i) => (line.color === "chalk" ? draw(line, i) : null)).filter(Boolean);
  const chalk = chalkShapes.length ? shapePath(mergeShapes(chalkShapes)) : "";

  const roughRing = (ring, i, wobble = 0.5) => hand(ring.map(tf), { seed: seed + 977 + i * 53, wobble, closed: true, spacing: 2.5 });

  const solidRings = (build.solids || []).map((ring, i) => roughRing(ring, i, 0.45));
  const solid = solidRings.map((r) => ringPath(r)).join("");

  const washes = [];
  const hairRings = [];
  let hairShown = false;
  let segment = new Map();
  const tintAll = part.type !== "person";
  const named = part.type === "thing" ? THINGS[part.name]?.parts : null;
  (build.washes || []).forEach((w, i) => {
    if (w.role === "hair" && w.tone >= 1) {
      hairRings.push(...w.rings.map((ring, k) => orient(roughRing(ring, i * 7 + k, 0.45))));
      if (!w.hidden) hairShown = true;
      return;
    }
    const rings = w.rings.map((ring, k) => orient(insetRing(roughRing(ring, i * 7 + k, 0.5), w.paper ? 3 : 2.2)));
    if (w.paper) {
      washes.push({ paper: true, rings });
      segment = new Map();
      return;
    }
    const own = named && w.part && named[w.part] ? w.part : null;
    const tint = tintAll ? !own : GARMENTS.has(w.role);
    const skin = w.role === "skin";
    const part = tintAll ? own : w.role === "outfit" ? "top" : PARTS.has(w.role) ? w.role : null;
    const hidden = !!w.hidden;
    const key = `${w.tone}|${tint ? 1 : 0}|${skin ? 1 : 0}|${part}|${hidden ? 1 : 0}`;
    const entry = segment.get(key);
    if (entry) entry.rings.push(...rings);
    else {
      const fresh = { tone: w.tone, tint, skin, part, hidden, rings };
      segment.set(key, fresh);
      washes.push(fresh);
    }
  });
  for (const w of washes) w.d = w.rings.map((r) => ringPath(r)).join("");

  const knockRings = (build.knock || []).map((ring) => orient(ring.map(tf)));
  const knock = knockRings.map((r) => ringPath(r)).join("");

  let box = shapeBounds(ink);
  for (const r of solidRings.concat(hairRings)) box = union(box, bounds(r));
  let knockBox = null;
  for (const r of knockRings) knockBox = union(knockBox, bounds(r));

  const f = build.focus;
  const focus = f ? { x: Math.min(f.x * sx, (f.x + f.w) * sx), y: f.y * sy, w: f.w * Math.abs(sx), h: f.h * sy } : null;

  return {
    focus,
    ink: shapePath(ink),
    solid,
    hair: hairRings.map((r) => ringPath(r)).join(""),
    hairShown,
    chalk,
    washes: washes.map(({ tone, tint, skin, part, hidden, paper, d }) => ({ tone, tint, skin, part, hidden, paper, d })),
    knock,
    knockRings,
    box: box || { x: 0, y: 0, w: 1, h: 1 },
    knockBox,
  };
}

function orient(ring) {
  let area = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area < 0 ? ring.slice().reverse() : ring;
}

function insetRing(ring, d) {
  const n = ring.length;
  if (n < 3) return ring;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % n];
    area += a.x * b.y - b.x * a.y;
  }
  const sign = area > 0 ? 1 : -1;
  return ring.map((p, i) => {
    const a = ring[(i - 1 + n) % n];
    const b = ring[(i + 1) % n];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return { ...p, x: p.x - (dy / len) * d * sign, y: p.y + (dx / len) * d * sign };
  });
}

const place = (b, piece) => (b ? boundsOf(boxCorners(b).map((p) => pieceToBoard(piece, p))) : null);

export function pieceToBoard(piece, p) {
  const q = turn(p, piece.rot || 0);
  return { x: q.x + piece.x, y: q.y + piece.y };
}

export const pieceFromBoard = (piece, p) => turn({ x: p.x - piece.x, y: p.y - piece.y }, -(piece.rot || 0));

export function pieceGeometry(piece) {
  const hit = placed.get(piece);
  if (hit) return hit;
  const key = `${partKey(piece.part)}|${piece.scale.toFixed(4)}|${piece.flip ? 1 : 0}|${piece.weight}`;
  let base = local.get(key);
  if (!base) {
    base = computeLocal(piece.part, piece.scale, piece.flip, piece.weight);
    local.set(key, base);
    if (local.size > 240) local.delete(local.keys().next().value);
  }
  const sx = piece.scale * (piece.flip ? -1 : 1);
  const rotate = piece.rot ? ` rotate(${degrees(piece.rot).toFixed(3)})` : "";
  const g = {
    ...base,
    frame: base.box,
    box: place(base.box, piece),
    knockBox: place(base.knockBox, piece),
    focus: place(base.focus, piece),
    transform: `translate(${n1(piece.x)} ${n1(piece.y)})${rotate}`,
    localTransform: `translate(${n1(piece.x)} ${n1(piece.y)})${rotate} scale(${sx.toFixed(4)} ${piece.scale.toFixed(4)})`,
  };
  placed.set(piece, g);
  return g;
}

export function toPieceLocal(piece, shape) {
  const sx = piece.scale * (piece.flip ? -1 : 1);
  const sy = piece.scale;
  return shapePath(
    mapShape(
      shape,
      (p) => {
        const q = pieceFromBoard(piece, p);
        return { x: q.x / sx, y: q.y / sy };
      },
      1 / piece.scale,
    ),
  );
}

export function partSize(part) {
  const build = buildPart(part);
  let box = null;
  for (const line of build.lines) box = union(box, bounds(line.pts));
  for (const ring of build.solids || []) box = union(box, bounds(ring));
  return box || { x: -50, y: -50, w: 100, h: 100 };
}
