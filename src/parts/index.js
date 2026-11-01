import { buildPerson } from "./people.js";
import { THINGS } from "./things.js";

const byObject = new WeakMap();
const byKey = new Map();

function buildSignature(part) {
  return {
    lines: (part.strokes || []).map((s) => ({ pts: s.map(([x, y]) => ({ x, y, p: 0.8 })), pen: "fineliner", raw: true })),
    solids: [],
    washes: [],
    knock: [],
  };
}

function make(part) {
  if (part.type === "person") return buildPerson(part);
  if (part.type === "thing") return (THINGS[part.name] || THINGS.cloud).build(part);
  if (part.type === "signature") return buildSignature(part);
  return { lines: [], solids: [], washes: [], knock: [] };
}

export function buildPart(part) {
  let hit = byObject.get(part);
  if (hit) return hit;
  const key = part.type === "signature" ? null : JSON.stringify(part);
  hit = key && byKey.get(key);
  if (!hit) {
    hit = make(part);
    if (key) {
      byKey.set(key, hit);
      if (byKey.size > 400) byKey.delete(byKey.keys().next().value);
    }
  }
  byObject.set(part, hit);
  return hit;
}

const AGE_HEIGHT = { kid: 0.62, teen: 0.86, old: 0.96 };

const BODY_HEIGHT = { head: 0.24, bust: 0.46, standing: 0.74, walking: 0.74, sitting: 0.56, wheelchair: 0.6, ground: 0.46, lying: 0.7 };

export function placement(part, size, board) {
  const { w, h } = board;
  const k = h / 800;
  if (part.type === "person") {
    const grown = part.body !== "head" && part.body !== "bust";
    const fraction = (BODY_HEIGHT[part.body] ?? 0.7) * (grown ? (AGE_HEIGHT[part.age] ?? 1) : 1);
    const lying = part.body === "lying";
    const scale = (h * fraction) / (lying ? size.w : size.h);
    const bottom = part.body === "head" ? h * 0.5 + (size.h * scale) / 2 : lying ? h * 0.74 : h * 0.94;
    return { scale, x: w * 0.5, y: bottom - (size.h * scale) / 2 };
  }
  if (part.type === "signature") {
    const scale = (w * 0.15) / Math.max(1, size.w);
    return { scale, x: w * 0.96 - (size.w * scale) / 2, y: h * 0.955 - (size.h * scale) / 2, select: true };
  }
  if (part.type === "thing") {
    const zone = THINGS[part.name]?.zone;
    let scale = 0.86 * k;
    if (zone === "line") scale = w / 1000;
    if (zone === "table") scale = 0.9 * k;
    if (zone === "sky") scale = 0.7 * k;
    if (zone === "back") scale = w / 1000;
    const sh = size.h * scale;
    const y = zone === "floor" ? h * 0.92 - sh / 2 : zone === "line" ? h * 0.86 : zone === "sky" ? h * 0.22 : zone === "back" ? h - sh / 2 : h * 0.4;
    return { scale, x: w * 0.5, y, back: zone === "line" || zone === "back" };
  }
  return { scale: 1, x: w / 2, y: h / 2 };
}
