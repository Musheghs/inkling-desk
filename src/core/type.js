import { bounds, dist, resample, union } from "./geometry.js";

export const TYPEFACES = [
  { id: "serif", label: "Serif", family: "serif" },
  { id: "italic", label: "Serif italic", family: "serif", style: "italic" },
  { id: "sans", label: "Sans", family: "sans", weight: 500 },
  { id: "caps", label: "Lettering", family: "sans", weight: 600, upper: true },
];

export const SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

const faceOf = (id) => TYPEFACES.find((f) => f.id === id) || TYPEFACES[0];

export function fontFor(faceId, size, families) {
  const face = faceOf(faceId);
  const family = face.family === "sans" ? families.sans || SANS : families.serif;
  const style = face.style || "normal";
  const weight = face.weight || 400;
  return { family, style, weight, size, upper: !!face.upper, css: `${style === "italic" ? "italic " : ""}${weight} ${size}px ${family}` };
}

export const shown = (text, font) => (font.upper ? text.toUpperCase() : text);

let measurer;
export function measure(text, font) {
  measurer ??= document.createElement("canvas").getContext("2d");
  measurer.font = font.css;
  return measurer.measureText(text).width;
}

export const LEADING = 1.22;

export function wrap(text, font, maxWidth = Infinity) {
  const lines = [];
  for (const para of shown(text, font).split("\n")) {
    const words = para.split(/(\s+)/).filter((w) => w.length);
    let line = "";
    for (const word of words) {
      const next = line + word;
      if (line.trim() && /\S/.test(word) && measure(next.trimEnd(), font) > maxWidth) {
        lines.push(line.trimEnd());
        line = word.trimStart();
      } else line = next;
    }
    lines.push(line.trimEnd());
  }
  return lines.map((t) => ({ text: t, width: measure(t, font) }));
}

export function textBlock(text, font, maxWidth) {
  const lines = wrap(text || "", font, maxWidth);
  const lineHeight = font.size * LEADING;
  const width = Math.max(font.size * 0.5, ...lines.map((l) => l.width));
  return { lines, lineHeight, width, height: lines.length * lineHeight };
}

export function blockBaselines(block, cx, cy, font) {
  const top = cy - block.height / 2;
  return block.lines.map((line, i) => ({ ...line, x: cx, y: top + block.lineHeight * i + block.lineHeight / 2 + font.size * 0.34 }));
}

function guidePath(points) {
  if (points.length < 2) return points;
  return resample(points, 3);
}

function pointAt(path, cum, s) {
  const total = cum[cum.length - 1];
  if (s <= 0) {
    const a = path[0];
    const b = path[1];
    const t = Math.atan2(b.y - a.y, b.x - a.x);
    return { x: a.x + Math.cos(t) * s, y: a.y + Math.sin(t) * s, a: t };
  }
  if (s >= total) {
    const a = path[path.length - 2];
    const b = path[path.length - 1];
    const t = Math.atan2(b.y - a.y, b.x - a.x);
    return { x: b.x + Math.cos(t) * (s - total), y: b.y + Math.sin(t) * (s - total), a: t };
  }
  let lo = 0;
  let hi = cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= s) lo = mid;
    else hi = mid;
  }
  const a = path[lo];
  const b = path[hi];
  const t = (s - cum[lo]) / (cum[hi] - cum[lo] || 1);
  const ahead = path[Math.min(path.length - 1, hi + 2)];
  const behind = path[Math.max(0, lo - 2)];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, a: Math.atan2(ahead.y - behind.y, ahead.x - behind.x) };
}

function pathGlyphs(text, points, font) {
  const path = guidePath(points);
  if (path.length < 2) return { glyphs: [], size: font.size };
  const cum = [0];
  for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + dist(path[i - 1], path[i]));
  const total = cum[cum.length - 1];
  const chars = Array.from(shown(text || "", font).replace(/\n/g, " "));
  let f = font;
  let advances = chars.map((c) => measure(c, f));
  let width = advances.reduce((a, b) => a + b, 0);
  if (width > total && width > 0) {
    const k = Math.max(0.35, total / width);
    f = { ...font, size: font.size * k, css: font.css.replace(/[\d.]+px/, `${(font.size * k).toFixed(2)}px`) };
    advances = advances.map((a) => a * k);
    width *= k;
  }
  let s = Math.max(0, (total - width) / 2);
  const glyphs = chars.map((ch, i) => {
    const mid = pointAt(path, cum, s + advances[i] / 2);
    const g = { ch, x: mid.x - (Math.cos(mid.a) * advances[i]) / 2, y: mid.y - (Math.sin(mid.a) * advances[i]) / 2, a: mid.a };
    s += advances[i];
    return g;
  });
  return { glyphs, size: f.size, font: f };
}

export function textItemLayout(item, families) {
  const font = fontFor(item.face, item.size, families);
  if (item.path) {
    const { glyphs, font: fitted } = pathGlyphs(item.text, item.path, font);
    let box = null;
    const s = fitted?.size || font.size;
    for (const g of glyphs) box = union(box, { x: g.x - s * 0.3, y: g.y - s * 0.9, w: s * 1.2, h: s * 1.2 });
    return { font: fitted || font, glyphs, box: box || bounds(item.path) };
  }
  const block = textBlock(item.text, font, item.width || Infinity);
  const lines = blockBaselines(block, item.x, item.y, font);
  return { font, lines, box: { x: item.x - block.width / 2, y: item.y - block.height / 2, w: block.width, h: block.height } };
}
