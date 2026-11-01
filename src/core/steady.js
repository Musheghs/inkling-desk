import { dist } from "./geometry.js";

const RADIUS = [0, 4, 11];
const EASE = [1, 0.62, 0.4];
export const PASSES = [1, 2, 4];

export const STEADY_LEVELS = [
  { id: 0, label: "Off" },
  { id: 1, label: "Steady" },
  { id: 2, label: "Steadier" },
];

export class Steady {
  constructor(level, unitsPerPx) {
    this.level = level;
    this.radius = RADIUS[level] * unitsPerPx;
    this.ease = EASE[level];
    this.pen = null;
    this.smooth = null;
  }

  push(point) {
    if (!this.pen) {
      this.pen = { ...point };
      this.smooth = { ...point };
      return { ...point };
    }
    const d = dist(this.pen, point);
    if (d <= this.radius) {
      this.smooth.p = point.p;
      return null;
    }
    const f = this.radius ? (d - this.radius) / d : 1;
    this.pen.x += (point.x - this.pen.x) * f;
    this.pen.y += (point.y - this.pen.y) * f;
    this.smooth.x += (this.pen.x - this.smooth.x) * this.ease;
    this.smooth.y += (this.pen.y - this.smooth.y) * this.ease;
    this.smooth.p = point.p;
    this.smooth.t = point.t;
    return { ...this.smooth };
  }

  finish(point) {
    if (!this.smooth || !point) return [];
    const reach = this.level === 2 ? 0.5 : 1;
    const end = {
      x: this.smooth.x + (point.x - this.smooth.x) * reach,
      y: this.smooth.y + (point.y - this.smooth.y) * reach,
      p: point.p,
    };
    const gap = dist(this.smooth, end);
    const steps = Math.ceil(gap / 2);
    const out = [];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const e = 1 - (1 - t) * (1 - t);
      out.push({
        x: this.smooth.x + (end.x - this.smooth.x) * e,
        y: this.smooth.y + (end.y - this.smooth.y) * e,
        p: end.p,
      });
    }
    return out;
  }
}
