import { build, dot, hideUnder, line, oval, ovalRing, scallop, segment, spline } from "../kit.js";
import { disc, shape } from "./draw.js";

export const SKY = {
  cloud: {
    label: "Cloud",
    zone: "sky",
    build() {
      const b = build();
      const base = spline([
        [-110, 0],
        [-60, 4],
        [0, 2],
        [60, 4],
        [110, 0],
      ]);
      const top = scallop(
        spline([
          [110, 0],
          [100, -40],
          [60, -72],
          [10, -88],
          [-40, -76],
          [-86, -48],
          [-110, 0],
        ]),
        9,
        46,
        1,
      );
      b.lines.push({ pts: top, weight: 1 });
      b.lines.push({ pts: base, weight: 0.7 });
      b.knock.push(top.concat(base.slice().reverse()));
      return b;
    },
  },
  sun: {
    label: "Sun",
    zone: "sky",
    build() {
      const b = build();
      b.lines.push({ pts: oval(0, 0, 40, 40), weight: 1 });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + 0.1;
        b.lines.push(segment([Math.cos(a) * 52, Math.sin(a) * 52], [Math.cos(a) * 72, Math.sin(a) * 72], { weight: 0.8 }));
      }
      b.knock.push(ovalRing(0, 0, 42, 42));
      return b;
    },
  },
  moon: {
    label: "Moon",
    words: "night sky crescent",
    zone: "sky",
    build() {
      const b = build();
      const outer = oval(0, 0, 70, 70, { overlap: 0, step: 3 });
      const crescent = [];
      for (let i = 0; i <= 30; i++) {
        const a = -Math.PI / 2 + (i / 30) * Math.PI;
        crescent.push([Math.cos(a) * 70, Math.sin(a) * 70]);
      }
      for (let i = 30; i >= 0; i--) {
        const a = -Math.PI / 2 + (i / 30) * Math.PI;
        crescent.push([Math.cos(a) * 34 + 6, Math.sin(a) * 64]);
      }
      shape(b, crescent, { tone: 0.12, smooth: true });
      return b;
    },
  },
  stars: {
    label: "Stars",
    words: "night sky twinkle",
    zone: "sky",
    build() {
      const b = build();
      const star = (x, y, r) => {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
          const rr = i % 2 ? r * 0.42 : r;
          pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
        }
        shape(b, pts, { weight: 0.7 });
      };
      star(-120, -40, 22);
      star(30, -90, 16);
      star(140, -20, 20);
      star(-30, 30, 12);
      for (const [x, y] of [
        [-60, -100],
        [80, 40],
        [-170, 40],
        [180, -90],
      ])
        b.solids.push(dot(x, y, 3));
      return b;
    },
  },
  planet: {
    label: "Ringed planet",
    words: "space saturn sky",
    zone: "sky",
    build() {
      const b = build();
      disc(b, 0, 0, 70, { tone: 0.26, weight: 1 });
      b.lines.push(
        line(
          [
            [-60, -30],
            [0, -40],
            [60, -26],
          ],
          { weight: 0.45 },
        ),
        line(
          [
            [-66, 10],
            [0, 4],
            [66, 16],
          ],
          { weight: 0.45 },
        ),
      );
      const ring = [];
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * Math.PI;
        ring.push([Math.cos(a) * 140, Math.sin(a) * 30]);
      }
      b.lines.push(
        line(
          ring.map(([x, y]) => [x * Math.cos(-0.2) - y * Math.sin(-0.2), x * Math.sin(-0.2) + y * Math.cos(-0.2)]),
          { weight: 0.95 },
        ),
      );
      b.lines.push(
        line(
          [
            [-138, 28],
            [-110, 6],
            [-70, -6],
          ],
          { weight: 0.95 },
        ),
        line(
          [
            [70, -32],
            [110, -44],
            [136, -58],
          ],
          { weight: 0.95 },
        ),
      );
      return b;
    },
  },
  smoke: {
    label: "Smoke",
    zone: "sky",
    build() {
      const b = build();
      const puffs = [
        [18, -150, 62],
        [-14, -78, 50],
        [12, -18, 40],
        [-6, 34, 30],
        [4, 76, 22],
      ];
      for (const [x, y, rad] of puffs) {
        const ring = scallop(ovalRing(x, y, rad, rad * 0.86), rad * 0.16, rad * 0.62, 3, { outward: true });
        b.lines = hideUnder(b.lines, [ring]);
        b.lines.push({ pts: ring.concat(ring.slice(0, 3)), weight: 0.8 });
        b.washes.push({ rings: [ring], tone: 0.3 });
      }
      return b;
    },
  },
};
