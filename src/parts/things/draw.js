import { rng } from "../../core/random.js";
import { area, flat, line, loop, oval, ovalRing, poly } from "../kit.js";

export const boxLine = (b, x, y, w, h, opts = {}) => {
  b.lines.push(
    poly(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      { closed: true, ...opts },
    ),
  );
};

export const box = (x, y, w, h) => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

export const rounded = (x, y, w, h, r) => [
  [x + r, y],
  [x + w - r, y],
  [x + w, y + r],
  [x + w, y + h - r],
  [x + w - r, y + h],
  [x + r, y + h],
  [x, y + h - r],
  [x, y + r],
];

export function shape(b, pts, { tone = 0, weight = 1, closed = true, smooth = false, knock = true, part } = {}) {
  const ring = smooth ? area(pts) : flat(pts, 4);
  b.lines.push(smooth ? loop(pts, { weight, overlap: 0.03 }) : poly(pts, { closed, weight }));
  if (tone) b.washes.push({ rings: [ring], tone, part });
  if (knock) b.knock.push(ring);
  return ring;
}

export function disc(b, x, y, r, { tone = 0, weight = 0.9, knock = true } = {}) {
  b.lines.push({ pts: oval(x, y, r, r, { start: -1.1 }), weight });
  if (tone) b.washes.push({ rings: [ovalRing(x, y, r, r)], tone });
  if (knock) b.knock.push(ovalRing(x, y, r + 1, r + 1));
}

export function arch(cx, y, r, n = 10) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = -(i / n) * Math.PI;
    pts.push([cx + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  return pts;
}

export function waterline(b, w, y = 0) {
  b.lines.push(
    line(
      [
        [-w, y],
        [-w / 3, y + 1],
        [w / 3, y - 1],
        [w, y],
      ],
      { weight: 0.7 },
    ),
  );
  const r = rng(w);
  for (let i = 0; i < 5; i++) {
    const x = -w * 0.8 + (i / 4) * w * 1.6 + (r() - 0.5) * 30;
    const yy = y + 18 + r() * 26;
    b.lines.push(
      line(
        [
          [x - 18, yy],
          [x - 9, yy - 4],
          [x, yy],
          [x + 9, yy - 4],
          [x + 18, yy],
        ],
        { weight: 0.4 },
      ),
    );
  }
}
