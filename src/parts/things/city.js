import { rng } from "../../core/random.js";
import { area, build, dot, flat, line, loop, oval, ovalRing, poly, segment, spline, straight } from "../kit.js";
import { arch, box, rounded, shape } from "./draw.js";

export const CITY = {
  house: {
    label: "House",
    main: "Walls",
    parts: { roof: "Roof", door: "Door", windows: "Windows" },
    words: "home cottage suburb",
    zone: "floor",
    build() {
      const b = build();
      const walls = box(-200, -300, 400, 300);
      shape(b, walls, { tone: 0.08 });
      const roof = [
        [-236, -296],
        [0, -470],
        [236, -296],
      ];
      shape(b, roof, { tone: 0.42, weight: 1.05, part: "roof" });
      shape(b, box(110, -460, 44, 110), { tone: 0.3, part: "roof" });
      b.lines.push(
        line(
          [
            [122, -480],
            [112, -510],
            [130, -540],
            [118, -580],
          ],
          { weight: 0.5 },
        ),
      );
      shape(b, box(-38, -160, 76, 160), { tone: 0.32, part: "door" });
      b.solids.push(dot(24, -80, 4));
      for (const x of [-160, 84]) {
        shape(b, box(x, -240, 76, 70), { tone: 0.4, weight: 0.85, part: "windows" });
        b.lines.push(segment([x + 38, -240], [x + 38, -170], { weight: 0.55 }), segment([x, -205], [x + 76, -205], { weight: 0.55 }));
      }
      for (const x of [-160, 84]) shape(b, box(x, -118, 76, 60), { tone: 0.4, weight: 0.8, part: "windows" });
      for (let y = -280; y < 0; y += 22) b.lines.push(segment([-196, y], [-178, y], { weight: 0.35 }), segment([178, y + 11], [196, y + 11], { weight: 0.35 }));
      b.lines.push(segment([-44, 0], [44, 0], { weight: 0.6 }), segment([-60, 8], [60, 8], { weight: 0.5 }));
      return b;
    },
  },
  castle: {
    label: "Castle",
    words: "king queen fortress tower medieval",
    zone: "floor",
    build() {
      const b = build();
      const tower = (x, w, h) => {
        const top = -h;
        const pts = [
          [x - w / 2, 0],
          [x - w / 2, top],
        ];
        const n = 4;
        for (let i = 0; i < n; i++) {
          const x0 = x - w / 2 + (i * w) / n;
          const x1 = x0 + w / n;
          pts.push([x0, top - 24], [x0 + (x1 - x0) * 0.5, top - 24], [x0 + (x1 - x0) * 0.5, top]);
          if (i < n - 1) pts.push([x1, top]);
        }
        pts.push([x + w / 2, top], [x + w / 2, 0]);
        shape(b, pts, { tone: 0.2 });
        shape(b, rounded(x - 12, top + 60, 24, 46, 12), { tone: 0.62, weight: 0.8 });
        for (let y = top + 30; y < -10; y += 34)
          b.lines.push(
            segment([x - w / 2 + 8, y], [x - w / 2 + 30, y], { weight: 0.35 }),
            segment([x + w / 2 - 34, y + 17], [x + w / 2 - 10, y + 17], { weight: 0.35 }),
          );
      };
      shape(
        b,
        [
          [-150, 0],
          [-150, -260],
          [-130, -260],
          [-130, -280],
          [-100, -280],
          [-100, -260],
          [-70, -260],
          [-70, -280],
          [-40, -280],
          [-40, -260],
          [-10, -260],
          [-10, -280],
          [20, -280],
          [20, -260],
          [50, -260],
          [50, -280],
          [80, -280],
          [80, -260],
          [110, -260],
          [110, -280],
          [140, -280],
          [140, -260],
          [150, -260],
          [150, 0],
        ],
        { tone: 0.16 },
      );
      shape(b, [[-50, 0], ...arch(0, -100, 50, 12).reverse(), [50, 0]], { tone: 0.6, weight: 0.9 });
      for (const x of [-30, -10, 10, 30]) b.lines.push(segment([x, -140], [x, 0], { weight: 0.45, color: "chalk" }));
      tower(-180, 90, 420);
      tower(180, 90, 420);
      tower(0, 70, 520);
      b.lines.push(segment([0, -544], [0, -640], { weight: 0.8 }));
      shape(
        b,
        [
          [0, -640],
          [56, -624],
          [0, -606],
        ],
        { tone: 0.45, weight: 0.8 },
      );
      return b;
    },
  },
  pyramid: {
    label: "Pyramid",
    words: "egypt desert pharaoh",
    zone: "floor",
    build() {
      const b = build();
      shape(
        b,
        [
          [-340, 0],
          [0, -330],
          [340, 0],
        ],
        { tone: 0.12 },
      );
      shape(
        b,
        [
          [0, -330],
          [120, 0],
          [340, 0],
        ],
        { tone: 0.32, knock: false },
      );
      for (let y = -300; y < 0; y += 34) {
        const k = (330 + y) / 330;
        b.lines.push(segment([-340 * k, y], [120 * k, y], { weight: 0.35 }));
      }
      b.lines.push(
        line(
          [
            [-420, 2],
            [0, 6],
            [420, 2],
          ],
          { weight: 0.6 },
        ),
      );
      return b;
    },
  },
  column: {
    label: "Greek column",
    words: "ancient ruins temple statue",
    zone: "floor",
    build() {
      const b = build();
      shape(b, box(-70, -30, 140, 30), { tone: 0.12 });
      shape(b, box(-50, -440, 100, 410), { tone: 0.08 });
      for (const x of [-30, -10, 10, 30]) b.lines.push(segment([x, -436], [x, -34], { weight: 0.45 }));
      shape(
        b,
        [
          [-80, -440],
          [80, -440],
          [80, -470],
          [-80, -470],
        ],
        { tone: 0.12 },
      );
      for (const d of [-1, 1]) b.lines.push({ pts: oval(d * 76, -456, 14, 14, { start: 0.4 }), weight: 0.8 });
      return b;
    },
  },
  factory: {
    label: "Factory",
    zone: "floor",
    build() {
      const b = build();
      const roof = [
        [-240, 0],
        [-240, -110],
        [-180, -150],
        [-180, -110],
        [-120, -150],
        [-120, -110],
        [-60, -150],
        [-60, -110],
        [0, -150],
        [0, -110],
        [60, -110],
        [60, 0],
      ];
      b.lines.push(poly(roof, { weight: 1 }));
      b.washes.push({ rings: [flat(roof.concat([[-240, 0]]), 6)], tone: 0.38 });
      for (let x = -226; x < 50; x += 34) b.lines.push(poly(box(x, -90, 18, 26), { closed: true, weight: 0.5 }));
      const stacks = [
        [110, -330],
        [170, -390],
        [226, -300],
      ];
      for (const [x, top] of stacks) {
        const s = [
          [x - 18, 0],
          [x - 12, top],
          [x + 12, top],
          [x + 18, 0],
        ];
        b.lines.push(poly(s, { weight: 1 }));
        b.lines.push(
          poly(
            [
              [x - 15, top + 12],
              [x + 15, top + 12],
            ],
            { weight: 0.5 },
          ),
          poly(
            [
              [x - 16, top + 30],
              [x + 16, top + 30],
            ],
            { weight: 0.5 },
          ),
        );
        b.washes.push({ rings: [flat(s, 5)], tone: 0.46 });
        b.knock.push(flat(s));
        const len = 260 + (x % 3) * 30;
        const upper = [];
        const lower = [];
        for (let k = 0; k <= 24; k++) {
          const t = k / 24;
          const cx = x + t * len;
          const cy = top - 30 - Math.sin(t * Math.PI * 0.6) * 90 + t * t * 40;
          const half = 9 + t * 34;
          const wave = Math.sin(t * 19 + x) * (2 + t * 6);
          upper.push([cx, cy - half + wave]);
          lower.push([cx + 6, cy + half * 0.7 - wave * 0.4]);
        }
        upper.unshift([x - 9, top]);
        lower.unshift([x + 9, top]);
        const plume = spline(upper.concat(lower.reverse()), { closed: true, step: 3 });
        b.lines.push({ pts: spline(upper, { step: 3 }), weight: 0.7 }, { pts: spline(lower.slice().reverse(), { step: 3 }), weight: 0.45 });
        b.washes.push({ rings: [plume], tone: 0.5 });
      }
      b.lines.push(
        poly(
          [
            [60, 0],
            [60, -60],
            [250, -60],
            [250, 0],
          ],
          { weight: 0.9 },
        ),
      );
      b.washes.push({
        rings: [
          flat(
            [
              [60, 0],
              [60, -60],
              [250, -60],
              [250, 0],
            ],
            6,
          ),
        ],
        tone: 0.3,
      });
      b.knock.push(
        flat(roof.concat([[-240, 0]])),
        flat([
          [60, 0],
          [60, -60],
          [250, -60],
          [250, 0],
        ]),
      );
      return b;
    },
  },
  ruins: {
    label: "Ruined city",
    zone: "floor",
    build() {
      const b = build();
      const r = rng(66);
      let x = -500;
      while (x < 500) {
        const w = 70 + r() * 70;
        const hgt = 160 + r() * 240;
        const top = -hgt;
        const jag = [];
        const steps = 5;
        for (let k = 0; k <= steps; k++) jag.push([x + (w * k) / steps, top + (k % 2 ? 18 + r() * 40 : r() * 14)]);
        const outline = [[x, 0], ...jag, [x + w, 0]];
        b.lines.push(poly(outline, { weight: 1 }));
        b.washes.push({ rings: [flat([[x, 0], ...jag, [x + w, 0]], 6)], tone: 0.28 + r() * 0.2 });
        for (let wy = top + 40; wy < -16; wy += 30) {
          for (let wx = x + 10; wx < x + w - 16; wx += 20) {
            if (r() < 0.5) b.lines.push(poly(box(wx, wy, 9, 14), { closed: true, weight: 0.4 }));
            else if (r() < 0.3) b.solids.push(flat(box(wx, wy, 9, 14), 3));
          }
        }
        if (r() < 0.5) {
          const bx = x + w * (0.3 + r() * 0.4);
          b.lines.push(
            segment([bx, top + 10], [bx + (r() - 0.5) * 40, top - 30], { weight: 0.7 }),
            segment([bx + 10, top + 14], [bx + 24 + r() * 10, top - 20], { weight: 0.6 }),
          );
        }
        x += w + 4 + r() * 10;
      }
      b.lines.push(
        line(
          [
            [-520, 0],
            [-200, 4],
            [100, -2],
            [520, 2],
          ],
          { weight: 1 },
        ),
      );
      for (let i = 0; i < 18; i++) {
        const cx = -480 + r() * 960;
        const s = 6 + r() * 14;
        b.lines.push(
          poly(
            [
              [cx - s, 2],
              [cx - s * 0.4, -s * 0.8],
              [cx + s * 0.6, -s * 0.6],
              [cx + s, 2],
            ],
            { weight: 0.6 },
          ),
        );
      }
      return b;
    },
  },
  rubble: {
    label: "Rubble",
    zone: "floor",
    build() {
      const b = build();
      const r = rng(77);
      for (let i = 0; i < 14; i++) {
        const cx = -110 + r() * 220;
        const s = 8 + r() * 18;
        const cy = -r() * 30;
        const chunk = [
          [cx - s, cy],
          [cx - s * 0.5, cy - s * 0.9],
          [cx + s * 0.6, cy - s * 0.7],
          [cx + s, cy],
        ];
        b.lines.push(poly(chunk, { closed: true, weight: 0.7 }));
        b.washes.push({ rings: [flat(chunk, 3)], tone: 0.2 + r() * 0.3 });
        b.knock.push(flat(chunk));
      }
      b.lines.push(segment([-40, -20], [20, -60], { weight: 0.9 }), segment([-30, -16], [30, -56], { weight: 0.6 }));
      return b;
    },
  },
  skyline: {
    label: "Skyline",
    zone: "wall",
    build() {
      const b = build();
      const r = rng(12);
      let x = -260;
      const outline = [[-260, 0]];
      while (x < 260) {
        const w = 40 + r() * 50;
        const h = 80 + r() * 170;
        outline.push([x, -h], [Math.min(260, x + w), -h]);
        for (let wy = -h + 16; wy < -12; wy += 22) {
          for (let wx = x + 9; wx < x + w - 12; wx += 16) {
            if (r() < 0.55) b.lines.push(segment([wx, wy], [wx + 5, wy], { weight: 0.55 }));
          }
        }
        x += w;
      }
      outline.push([260, 0]);
      b.lines.push({ pts: outline.flatMap((p, i) => (i ? straight(outline[i - 1], p, 6) : [])), weight: 0.95 });
      b.washes.push({ rings: [flat(outline)], tone: 0.18 });
      return b;
    },
  },
  capitol: {
    label: "The Capitol",
    zone: "wall",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-260, 0],
            [-260, -90],
            [-80, -90],
            [-80, -120],
            [80, -120],
            [80, -90],
            [260, -90],
            [260, 0],
          ],
          { weight: 0.8 },
        ),
      );
      for (let x = -250; x <= 250; x += 20) b.lines.push(segment([x, -86], [x, -10], { weight: 0.4 }));
      b.lines.push(
        poly(
          [
            [-70, -120],
            [-70, -180],
            [70, -180],
            [70, -120],
          ],
          { weight: 0.8 },
        ),
      );
      for (let x = -60; x <= 60; x += 12) b.lines.push(segment([x, -176], [x, -124], { weight: 0.4 }));
      b.lines.push(
        line(
          [
            [-64, -180],
            [-58, -230],
            [-30, -270],
            [0, -280],
            [30, -270],
            [58, -230],
            [64, -180],
          ],
          { weight: 0.85 },
        ),
      );
      for (const x of [-40, -16, 16, 40])
        b.lines.push(
          line(
            [
              [x, -184],
              [x * 0.85, -230],
              [x * 0.5, -268],
            ],
            { weight: 0.35 },
          ),
        );
      b.lines.push(
        poly(
          [
            [-10, -280],
            [-10, -306],
            [10, -306],
            [10, -280],
          ],
          { weight: 0.7 },
        ),
        line(
          [
            [-4, -306],
            [0, -326],
            [4, -306],
          ],
          { weight: 0.7 },
        ),
      );
      b.washes.push({
        rings: [
          area([
            [-260, 0],
            [-260, -90],
            [-80, -90],
            [-70, -180],
            [-58, -230],
            [0, -280],
            [58, -230],
            [70, -180],
            [80, -90],
            [260, -90],
            [260, 0],
          ]),
        ],
        tone: 0.12,
      });
      return b;
    },
  },
  crowd: {
    label: "Crowd",
    zone: "floor",
    build() {
      const b = build();
      const r = rng(41);
      const rows = [
        { y: -150, s: 0.7, tone: 0.3 },
        { y: -96, s: 0.85, tone: 0.42 },
        { y: -40, s: 1, tone: 0.55 },
      ];
      for (const row of rows) {
        let x = -440 + r() * 30;
        while (x < 440) {
          const s = row.s * (0.9 + r() * 0.2);
          const head = ovalRing(x, row.y - 50 * s, 15 * s, 18 * s);
          const shoulders = area([
            [x - 34 * s, row.y + 20 * s],
            [x - 30 * s, row.y - 20 * s],
            [x - 12 * s, row.y - 32 * s],
            [x + 12 * s, row.y - 32 * s],
            [x + 30 * s, row.y - 20 * s],
            [x + 34 * s, row.y + 20 * s],
          ]);
          b.washes.push({ rings: [head, shoulders], tone: row.tone });
          if (row.y > -60)
            b.lines.push({ pts: head.concat(head.slice(0, 2)), weight: 0.5 }, { pts: shoulders.slice(0, Math.floor(shoulders.length * 0.8)), weight: 0.5 });
          x += 44 * s + r() * 14;
        }
      }
      return b;
    },
  },
  bunting: {
    label: "Podium & bunting",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-360, -220],
            [360, -220],
            [360, -206],
            [-360, -206],
          ],
          { closed: true, weight: 1 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-360, -206],
            [-360, 0],
          ],
          { weight: 0.9 },
        ),
        poly(
          [
            [360, -206],
            [360, 0],
          ],
          { weight: 0.9 },
        ),
      );
      for (let i = 0; i < 6; i++) {
        const cx = -300 + i * 120;
        const fan = [];
        for (let k = 0; k <= 16; k++) {
          const a = (k / 16) * Math.PI;
          fan.push([cx + Math.cos(a) * 58, -206 + Math.sin(a) * 54]);
        }
        b.lines.push(line(fan, { weight: 0.85 }));
        b.washes.push({
          rings: [
            area([
              [cx - 58, -206],
              [cx - 38, -168],
              [cx, -160],
              [cx + 38, -168],
              [cx + 58, -206],
            ]),
          ],
          tone: 0.55,
        });
        for (let s = 0; s < 4; s++) b.lines.push(segment([cx - 30 + s * 20, -198], [cx - 33 + s * 22, -192], { weight: 0.5, color: "chalk" }));
        for (const k of [-0.6, -0.2, 0.2, 0.6]) b.lines.push(segment([cx, -206], [cx + Math.sin(k) * 50, -206 + Math.cos(k) * 48], { weight: 0.4 }));
      }
      for (let x = -340; x < 360; x += 40) {
        b.lines.push(segment([x, -140], [x, 0], { weight: 0.5 }));
        b.washes.push({
          rings: [
            flat(
              [
                [x, -140],
                [x + 20, -140],
                [x + 20, 0],
                [x, 0],
              ],
              6,
            ),
          ],
          tone: 0.42,
        });
      }
      b.knock.push(
        flat([
          [-360, -220],
          [360, -220],
          [360, 0],
          [-360, 0],
        ]),
      );
      return b;
    },
  },
  subway: {
    label: "Subway car",
    zone: "back",
    build() {
      const b = build();
      const wall = [
        [-500, -640],
        [500, -640],
        [500, -120],
        [-500, -120],
      ];
      b.washes.push({ rings: [flat(wall, 10)], tone: 0.08 });
      b.lines.push(segment([-500, -640], [500, -640], { weight: 1 }), segment([-500, -120], [500, -120], { weight: 1 }));
      for (let x = -470; x < 300; x += 180) {
        const ad = [
          [x, -604],
          [x + 150, -604],
          [x + 150, -566],
          [x, -566],
        ];
        b.lines.push(poly(ad, { closed: true, weight: 0.6 }));
        b.washes.push({ rings: [flat(ad, 4)], tone: 0.16 });
      }
      b.lines.push(segment([-500, -622], [330, -622], { weight: 0.9 }));
      for (let x = -440; x < 320; x += 95) {
        b.lines.push(
          line(
            [
              [x, -622],
              [x + 2, -600],
              [x, -586],
            ],
            { weight: 0.5 },
          ),
        );
        b.lines.push({ pts: oval(x, -574, 10, 13), weight: 0.6 });
      }
      for (const [x0, x1] of [
        [-462, -258],
        [-226, -22],
        [10, 214],
      ]) {
        const win = rounded(x0, -540, x1 - x0, 190, 24);
        b.lines.push(loop(win, { weight: 0.95, overlap: 0.03 }));
        b.washes.push({ rings: [area(win)], tone: 0.55 });
        for (const [y, k] of [
          [-500, 0.5],
          [-430, 0.3],
        ])
          b.lines.push(segment([x0 + 30, y], [x0 + 30 + (x1 - x0) * k, y], { weight: 0.4, color: "chalk" }));
      }
      const door = [
        [300, -600],
        [480, -600],
        [480, -120],
        [300, -120],
      ];
      b.lines.push(poly(door, { closed: true, weight: 1 }), segment([390, -600], [390, -120], { weight: 0.8 }));
      b.washes.push({ rings: [flat(door, 8)], tone: 0.14 });
      for (const x of [314, 404]) {
        const glass = rounded(x, -540, 72, 170, 14);
        b.lines.push(loop(glass, { weight: 0.75, overlap: 0.03 }));
        b.washes.push({ rings: [area(glass)], tone: 0.55 });
      }
      const cushion = rounded(-490, -312, 770, 52, 12);
      b.lines.push(poly(cushion, { closed: true, weight: 1 }));
      b.washes.push({ rings: [flat(cushion, 6)], tone: 0.34 });
      for (let x = -360; x < 280; x += 128) b.lines.push(segment([x, -308], [x, -264], { weight: 0.5 }));
      const base = [
        [-480, -260],
        [270, -260],
        [262, -150],
        [-472, -150],
      ];
      b.lines.push(poly(base, { closed: true, weight: 0.85 }));
      b.washes.push({ rings: [flat(base, 6)], tone: 0.24 });
      b.washes.push({
        rings: [
          flat(
            [
              [-500, -120],
              [500, -120],
              [500, 0],
              [-500, 0],
            ],
            10,
          ),
        ],
        tone: 0.12,
      });
      for (const x of [-300, -30, 240]) {
        const pole = [
          [x - 7, -622],
          [x + 7, -622],
          [x + 7, 0],
          [x - 7, 0],
        ];
        b.lines.push(poly(pole, { closed: true, weight: 0.8 }));
        b.washes.push({ rings: [flat(pole, 6)], paper: true });
      }
      return b;
    },
  },
  stanchions: {
    label: "Velvet rope",
    zone: "floor",
    build() {
      const b = build();
      for (const x of [-220, 220]) {
        b.lines.push(
          poly(
            [
              [x - 5, 0],
              [x - 4, -190],
              [x + 4, -190],
              [x + 5, 0],
            ],
            { weight: 0.9 },
          ),
        );
        b.lines.push({ pts: oval(x, -196, 10, 9), weight: 0.85 }, { pts: oval(x, -2, 26, 6), weight: 0.8 });
        b.knock.push(
          flat([
            [x - 6, 0],
            [x - 6, -200],
            [x + 6, -200],
            [x + 6, 0],
          ]),
        );
      }
      const rope = spline([
        [-212, -180],
        [-100, -110],
        [0, -96],
        [100, -110],
        [212, -180],
      ]);
      b.lines.push({ pts: rope, weight: 1.6 });
      return b;
    },
  },
  easel: {
    label: "Chart on an easel",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        segment([-70, 0], [-30, -330], { weight: 0.9 }),
        segment([70, 0], [30, -330], { weight: 0.9 }),
        segment([0, -60], [0, -340], { weight: 0.7 }),
      );
      const board = [
        [-90, -340],
        [90, -340],
        [90, -140],
        [-90, -140],
      ];
      b.lines.push(poly(board, { closed: true, weight: 1 }));
      b.lines.push(
        poly(
          [
            [-70, -170],
            [-70, -320],
          ],
          { weight: 0.6 },
        ),
        poly(
          [
            [-70, -170],
            [74, -170],
          ],
          { weight: 0.6 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-64, -190],
            [-30, -230],
            [0, -210],
            [30, -270],
            [70, -300],
          ],
          { weight: 1 },
        ),
      );
      b.lines.push(
        poly(
          [
            [56, -300],
            [70, -300],
            [68, -286],
          ],
          { weight: 0.9 },
        ),
      );
      b.knock.push(flat(board));
      return b;
    },
  },
};
