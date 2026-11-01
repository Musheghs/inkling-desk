import { n1 } from "./geometry.js";
import { labelPadding, labelPath } from "./label.js";

export const SHEET = { pad: 0.045, gap: 0.03, font: 0.032, leading: 1.32 };

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let measurer;
function measure(font) {
  measurer ??= document.createElement("canvas").getContext("2d");
  measurer.font = font;
  return (text) => measurer.measureText(text).width;
}

function tokenize(runs) {
  const words = [];
  let word = [];
  for (const run of runs) {
    for (const token of run.text.split(/( +)/)) {
      if (!token) continue;
      if (/^ +$/.test(token)) {
        if (word.length) words.push(word);
        word = [];
      } else word.push({ text: token, b: run.b, u: run.u });
    }
  }
  if (word.length) words.push(word);
  return words;
}

function greedy(words, width, wordWidth, space) {
  const lines = [];
  let line = [];
  let used = 0;
  for (const w of words) {
    const ww = wordWidth(w);
    const next = line.length ? used + space + ww : ww;
    if (line.length && next > width) {
      lines.push(line);
      line = [w];
      used = ww;
    } else {
      line.push(w);
      used = next;
    }
  }
  if (line.length) lines.push(line);
  return lines;
}

export function wrapRuns(runs, fontFor, width) {
  const words = tokenize(runs);
  if (!words.length) return [];
  const widthOf = (piece) => measure(fontFor(piece))(piece.text);
  const wordWidth = (w) => w.reduce((sum, p) => sum + widthOf(p), 0);
  const space = measure(fontFor({}))(" ");
  const lineWidth = (line) => line.reduce((sum, w, i) => sum + wordWidth(w) + (i ? space : 0), 0);
  const plain = greedy(words, width, wordWidth, space);
  let best = plain;
  let lo = width * 0.5;
  let hi = width;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    const tryLines = greedy(words, mid, wordWidth, space);
    if (tryLines.length <= plain.length && tryLines.every((l) => lineWidth(l) <= mid + 0.5)) {
      best = tryLines;
      hi = mid;
    } else lo = mid;
  }
  return best.map((line) => {
    const pieces = [];
    line.forEach((w, wi) => {
      w.forEach((p, pi) => {
        const text = p.text + (pi === w.length - 1 && wi < line.length - 1 ? " " : "");
        const last = pieces[pieces.length - 1];
        if (last && last.b === p.b && last.u === p.u) last.text += text;
        else pieces.push({ text, b: !!p.b, u: !!p.u });
      });
    });
    for (const piece of pieces) piece.w = widthOf(piece);
    return { pieces, width: pieces.reduce((sum, p) => sum + p.w, 0) };
  });
}

export function quoteRuns(runs, quotes) {
  if (!runs.length) return runs;
  const first = runs[0].text;
  if (!quotes || /^["“‘'«]/.test(first)) return runs;
  const out = runs.map((r) => ({ ...r }));
  out[0] = { ...out[0], text: `“${out[0].text}` };
  out[out.length - 1] = { ...out[out.length - 1], text: `${out[out.length - 1].text}”` };
  return out;
}

export function sheetMetrics(board, lines, scale = 1) {
  const sheetW = board.w / (1 - SHEET.pad * 2);
  const pad = sheetW * SHEET.pad;
  const fontSize = sheetW * SHEET.font * scale;
  const lineHeight = fontSize * SHEET.leading;
  const captionH = lines ? lines * lineHeight : 0;
  const gap = lines ? sheetW * SHEET.gap : 0;
  return { sheetW, sheetH: pad * 2 + board.h + gap + captionH, pad, fontSize, lineHeight, gap };
}

export function assemble({
  board,
  defs,
  wash,
  ink,
  pencil,
  paper,
  lines,
  font,
  inkColor,
  prefix,
  background = true,
  sheet = true,
  bleed = false,
  label = true,
  scale = 1,
  italic = false,
}) {
  const m = sheet ? sheetMetrics(board, lines.length, scale) : null;
  const w = sheet ? m.sheetW : board.w;
  const h = sheet ? m.sheetH : board.h;
  const off = sheet ? m.pad : 0;
  let text = "";
  if (sheet && lines.length) {
    const top = m.pad + board.h + m.gap;
    if (bleed && label) {
      const pad = labelPadding(m.fontSize);
      const widest = Math.max(...lines.map((line) => line.width));
      text += `<path d="${labelPath(w / 2 - widest / 2 - pad.x, top - pad.y, widest + pad.x * 2, lines.length * m.lineHeight + pad.y * 2)}" fill="${paper}"/>`;
    }
    const piece = (p) => {
      const attrs = [italic ? ' font-style="italic"' : "", p.b ? ' font-weight="600"' : "", p.u ? ' text-decoration="underline"' : ""].join("");
      return `<tspan${attrs}>${escape(p.text)}</tspan>`;
    };
    text += `<text font-family="${escape(font)}" font-size="${n1(m.fontSize)}" fill="${inkColor}" text-anchor="middle" xml:space="preserve">${lines
      .map((line, i) => `<tspan x="${n1(w / 2)}" y="${n1(top + m.lineHeight * i + m.fontSize * 1.02)}">${line.pieces.map(piece).join("")}</tspan>`)
      .join("")}</text>`;
  }
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${n1(w)} ${n1(h)}" width="${Math.round(w)}" height="${Math.round(h)}">`,
    background ? `<rect width="100%" height="100%" fill="${paper}"/>` : "",
    `<defs>${defs}<clipPath id="${prefix}panel">${bleed && sheet ? `<rect x="${n1(-off)}" y="${n1(-off)}" width="${n1(w)}" height="${n1(h)}"/>` : `<rect width="${board.w}" height="${board.h}"/>`}</clipPath></defs>`,
    `<g transform="translate(${n1(off)} ${n1(off)})"><g clip-path="url(#${prefix}panel)">${wash}${ink}${pencil}</g></g>`,
    text,
    `</svg>`,
  ].join("");
}

export function svgImage(markup) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
