import { n1 } from "./geometry.js";

export function labelPath(x, y, w, h) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const wobble = Math.min(6, h * 0.08);
  const pts = [];
  for (let i = 0; i < 96; i++) {
    const t = (i / 96) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const k = wobble * (Math.sin(3 * t + 1.1) * 0.6 + Math.sin(7 * t + 2.3) * 0.4);
    pts.push(`${n1(cx + Math.sign(c) * Math.abs(c) ** 0.4 * (w / 2 + k))} ${n1(cy + Math.sign(s) * Math.abs(s) ** 0.4 * (h / 2 + k))}`);
  }
  return `M${pts.join("L")}Z`;
}

export const labelPadding = (fontSize) => ({ x: fontSize * 0.8, y: fontSize * 0.35 });
