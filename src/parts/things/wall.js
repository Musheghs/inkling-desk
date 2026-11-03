import { rng } from "../../core/random.js";
import { area, build, dot, flat, line, loop, oval, ovalRing, poly, segment, spline } from "../kit.js";
import { box, boxLine, shape } from "./draw.js";

function scribble(b, r, x, y, w, opts = {}) {
  const pts = [];
  const n = Math.max(3, Math.round(w / 9));
  for (let i = 0; i <= n; i++) pts.push([x + (w * i) / n, y + (r() - 0.5) * (opts.amp ?? 6)]);
  b.lines.push(line(pts, { weight: opts.weight ?? 0.5, color: opts.color }));
}

function lettering(b, text, x, y, size) {
  let cx = x;
  for (const ch of text) {
    if (ch === " ") {
      cx += size * 0.6;
      continue;
    }
    for (const stroke of GLYPHS[ch] || [])
      b.lines.push(
        poly(
          stroke.map(([u, v]) => [cx + u * size * 0.7, y + v * size]),
          { weight: 1.15 },
        ),
      );
    cx += size * 0.86;
  }
  return cx - x;
}

const US = [
  [0, 10],
  [40, 0],
  [110, 8],
  [190, 10],
  [215, 18],
  [235, 30],
  [250, 22],
  [270, 40],
  [290, 30],
  [320, 15],
  [345, 5],
  [360, 25],
  [340, 45],
  [325, 60],
  [318, 80],
  [310, 100],
  [300, 125],
  [285, 150],
  [270, 175],
  [282, 205],
  [270, 215],
  [258, 190],
  [245, 170],
  [210, 172],
  [185, 180],
  [165, 178],
  [140, 200],
  [120, 190],
  [100, 160],
  [80, 150],
  [60, 150],
  [35, 140],
  [20, 110],
  [8, 70],
  [2, 40],
];

const GLYPHS = {
  R: [
    [
      [0, 1],
      [0, 0],
      [0.7, 0],
      [0.88, 0.14],
      [0.88, 0.34],
      [0.7, 0.5],
      [0, 0.5],
    ],
    [
      [0.42, 0.5],
      [0.9, 1],
    ],
  ],
  E: [
    [
      [0.85, 0],
      [0, 0],
      [0, 1],
      [0.85, 1],
    ],
    [
      [0, 0.5],
      [0.62, 0.5],
    ],
  ],
  A: [
    [
      [0, 1],
      [0.45, 0],
      [0.9, 1],
    ],
    [
      [0.2, 0.62],
      [0.7, 0.62],
    ],
  ],
  D: [
    [
      [0, 0],
      [0, 1],
      [0.5, 1],
      [0.86, 0.74],
      [0.86, 0.26],
      [0.5, 0],
      [0, 0],
    ],
  ],
  M: [
    [
      [0, 1],
      [0, 0],
      [0.45, 0.62],
      [0.9, 0],
      [0.9, 1],
    ],
  ],
  O: [
    [
      [0.45, 0],
      [0.82, 0.15],
      [0.9, 0.5],
      [0.82, 0.85],
      [0.45, 1],
      [0.08, 0.85],
      [0, 0.5],
      [0.08, 0.15],
      [0.45, 0],
    ],
  ],
  B: [
    [
      [0, 0],
      [0, 1],
      [0.6, 1],
      [0.84, 0.86],
      [0.84, 0.64],
      [0.6, 0.5],
      [0, 0.5],
    ],
    [
      [0, 0],
      [0.55, 0],
      [0.76, 0.12],
      [0.76, 0.36],
      [0.55, 0.5],
    ],
  ],
  C: [
    [
      [0.85, 0.15],
      [0.6, 0],
      [0.3, 0],
      [0.06, 0.2],
      [0, 0.5],
      [0.06, 0.8],
      [0.3, 1],
      [0.6, 1],
      [0.85, 0.85],
    ],
  ],
  F: [
    [
      [0.85, 0],
      [0, 0],
      [0, 1],
    ],
    [
      [0, 0.5],
      [0.6, 0.5],
    ],
  ],
  G: [
    [
      [0.85, 0.15],
      [0.6, 0],
      [0.3, 0],
      [0.06, 0.2],
      [0, 0.5],
      [0.06, 0.8],
      [0.3, 1],
      [0.6, 1],
      [0.86, 0.84],
      [0.86, 0.56],
      [0.5, 0.56],
    ],
  ],
};

export const WALL = {
  window: {
    label: "Window",
    zone: "wall",
    build() {
      const b = build();
      boxLine(b, -100, -130, 200, 250, { weight: 1.05 });
      boxLine(b, -88, -118, 176, 226, { weight: 0.8 });
      b.lines.push(
        line(
          [
            [0, -118],
            [0, 108],
          ],
          { weight: 0.8 },
        ),
        line(
          [
            [-88, -4],
            [88, -4],
          ],
          { weight: 0.8 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-112, 120],
            [112, 120],
            [116, 132],
            [-116, 132],
          ],
          { closed: true },
        ),
      );
      const curtain = (dir) => {
        const x = dir * 104;
        const edge = [
          [x, -150],
          [x + dir * 6, -60],
          [x - dir * 4, 40],
          [x + dir * 10, 150],
        ];
        const inner = [
          [x - dir * 30, -150],
          [x - dir * 44, -40],
          [x - dir * 26, 60],
          [x - dir * 40, 150],
        ];
        b.lines.push(line(edge), line(inner));
        b.lines.push(
          line(
            [
              [x - dir * 14, -144],
              [x - dir * 18, 0],
              [x - dir * 12, 144],
            ],
            { weight: 0.5 },
          ),
        );
        b.lines.push(
          line(
            [
              [x - dir * 40, 150],
              [x - dir * 14, 154],
              [x + dir * 10, 150],
            ],
            { weight: 0.8 },
          ),
        );
        b.washes.push({ rings: [area(edge.concat(inner.slice().reverse()))], tone: 0.26 });
        b.knock.push(area(edge.concat(inner.slice().reverse())));
      };
      curtain(-1);
      curtain(1);
      b.lines.push(
        line(
          [
            [-160, -152],
            [160, -152],
          ],
          { weight: 0.9 },
        ),
      );
      return b;
    },
  },
  drapes: {
    label: "Tall window",
    zone: "wall",
    build() {
      const b = build();
      b.lines.push(poly(box(-170, -260, 340, 520), { closed: true, weight: 1 }));
      b.lines.push(
        segment([-170, -150], [170, -150], { weight: 0.8 }),
        segment([0, -150], [0, 260], { weight: 0.75 }),
        segment([-170, 60], [170, 60], { weight: 0.7 }),
      );
      for (const x of [-85, 85]) b.lines.push(segment([x, -260], [x, -150], { weight: 0.6 }));
      b.washes.push({ rings: [flat(box(-168, -258, 336, 516), 8)], tone: 0.06 });
      for (const side of [-1, 1]) {
        const outer = side * 220;
        const edge = [
          [outer, -290],
          [outer + side * 8, -40],
          [outer - side * 6, 120],
          [outer + side * 4, 290],
        ];
        const inner = [
          [side * 120, -290],
          [side * 150, -120],
          [side * 170, -20],
          [side * 134, 60],
          [side * 150, 180],
          [side * 136, 290],
        ];
        b.lines.push(line(edge, { weight: 1 }), line(inner, { weight: 1 }));
        for (const f of [0.3, 0.55, 0.78])
          b.lines.push(
            line(
              [
                [side * (120 + 100 * f), -280],
                [side * (130 + 90 * f), -40],
                [side * (128 + 92 * f), 280],
              ],
              { weight: 0.45 },
            ),
          );
        b.lines.push(
          line(
            [
              [side * 136, -30],
              [side * 180, -12],
              [side * 222, -26],
            ],
            { weight: 0.9 },
          ),
        );
        b.lines.push({ pts: oval(side * 150, 0, 8, 14), weight: 0.75 });
        const ring = area(edge.concat(inner.slice().reverse()));
        b.washes.push({ rings: [ring], tone: 0.58 });
        b.knock.push(ring);
      }
      b.lines.push(segment([-250, -294], [250, -294], { weight: 1.3 }));
      return b;
    },
  },
  painting: {
    label: "Framed picture",
    zone: "wall",
    build() {
      const b = build();
      boxLine(b, -80, -64, 160, 128, { weight: 1.05 });
      boxLine(b, -66, -50, 132, 100, { weight: 0.75 });
      b.lines.push(
        line(
          [
            [-66, 30],
            [-30, -10],
            [-6, 14],
            [24, -26],
            [66, 22],
          ],
          { weight: 0.7 },
        ),
      );
      b.lines.push({ pts: oval(34, -28, 9, 9), weight: 0.6 });
      b.washes.push({
        rings: [
          area([
            [-66, 30],
            [-30, -10],
            [-6, 14],
            [24, -26],
            [66, 22],
            [66, 50],
            [-66, 50],
          ]),
        ],
        tone: 0.22,
      });
      b.knock.push(
        area([
          [-80, -64],
          [80, -64],
          [80, 64],
          [-80, 64],
        ]),
      );
      return b;
    },
  },
  abstract: {
    label: "Abstract painting",
    zone: "wall",
    build() {
      const b = build();
      b.lines.push(poly(box(-150, -110, 300, 220), { closed: true, weight: 1.05 }), poly(box(-138, -98, 276, 196), { closed: true, weight: 0.6 }));
      b.lines.push({ pts: oval(-50, -10, 50, 50), weight: 0.8 });
      b.washes.push({ rings: [ovalRing(-50, -10, 48, 48)], tone: 0.5 });
      b.lines.push(
        poly(
          [
            [20, 80],
            [70, -70],
            [120, 80],
          ],
          { closed: true, weight: 0.8 },
        ),
      );
      b.washes.push({
        rings: [
          flat(
            [
              [24, 78],
              [70, -64],
              [116, 78],
            ],
            4,
          ),
        ],
        tone: 0.22,
      });
      b.lines.push(segment([-130, 60], [130, 40], { weight: 1.2 }));
      b.knock.push(flat(box(-150, -110, 300, 220)));
      return b;
    },
  },
  mirror: {
    label: "Mirror",
    words: "wall reflection vanity",
    zone: "wall",
    build() {
      const b = build();
      b.lines.push({ pts: oval(0, 0, 90, 120, { start: -1.3 }), weight: 1.05 }, { pts: oval(0, 0, 78, 108, { start: 1.8 }), weight: 0.7 });
      b.washes.push({ rings: [ovalRing(0, 0, 89, 119)], tone: 0.32 });
      b.washes.push({ rings: [ovalRing(0, 0, 76, 106)], tone: 0.08 });
      b.lines.push(
        line(
          [
            [-40, -60],
            [-20, -80],
          ],
          { weight: 0.5 },
        ),
        line(
          [
            [-50, -30],
            [-10, -76],
          ],
          { weight: 0.5 },
        ),
      );
      b.knock.push(ovalRing(0, 0, 91, 121));
      return b;
    },
  },
  diploma: {
    label: "Diploma",
    zone: "wall",
    build() {
      const b = build();
      boxLine(b, -54, -40, 108, 80, { weight: 1 });
      boxLine(b, -44, -30, 88, 60, { weight: 0.6 });
      for (const [y, w] of [
        [-14, 50],
        [-2, 64],
        [10, 40],
      ])
        b.lines.push(segment([-w / 2, y], [w / 2, y], { weight: 0.5 }));
      b.lines.push({ pts: oval(26, 20, 6, 6), weight: 0.6 });
      b.knock.push(
        area([
          [-54, -40],
          [54, -40],
          [54, 40],
          [-54, 40],
        ]),
      );
      return b;
    },
  },
  poster: {
    label: "Poster",
    zone: "wall",
    build() {
      const b = build();
      const r = rng(13);
      const sheet = [
        [-46, -64],
        [48, -66],
        [46, 66],
        [-48, 64],
      ];
      b.lines.push(poly(sheet, { closed: true, weight: 0.9 }));
      b.lines.push({ pts: oval(0, -18, 22, 22), weight: 0.75 });
      b.washes.push({ rings: [ovalRing(0, -18, 20, 20)], tone: 0.3 });
      for (let i = 0; i < 3; i++) scribble(b, r, -34, 18 + i * 13, 68, { weight: 0.45, amp: 4 });
      b.solids.push(dot(0, -60, 3.2));
      b.knock.push(flat(sheet));
      return b;
    },
  },
  clock: {
    label: "Wall clock",
    zone: "wall",
    build() {
      const b = build();
      b.lines.push({ pts: oval(0, 0, 34, 34), weight: 1.05 }, { pts: oval(0, 0, 28, 28), weight: 0.5 });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        b.lines.push(segment([Math.cos(a) * 22, Math.sin(a) * 22], [Math.cos(a) * 26, Math.sin(a) * 26], { weight: 0.5 }));
      }
      b.lines.push(segment([0, 0], [10, -14], { weight: 0.9 }), segment([0, 0], [0, -22], { weight: 0.7 }));
      b.washes.push({ rings: [ovalRing(0, 0, 33, 33)], tone: 0.1 });
      b.knock.push(ovalRing(0, 0, 35, 35));
      return b;
    },
  },
  chalkboard: {
    label: "Chalkboard",
    zone: "wall",
    build() {
      const b = build();
      const r = rng(31);
      b.lines.push(poly(box(-280, -150, 560, 300), { closed: true, weight: 1.1 }));
      b.lines.push(poly(box(-266, -136, 532, 272), { closed: true, weight: 0.7 }));
      b.lines.push(
        poly(
          [
            [-286, 150],
            [286, 150],
            [282, 162],
            [-282, 162],
          ],
          { closed: true, weight: 0.9 },
        ),
      );
      b.washes.push({ rings: [flat(box(-266, -136, 532, 272))], tone: 0.82 });
      for (let row = 0; row < 6; row++) {
        let x = -244;
        while (x < 220) {
          const w = 30 + r() * 70;
          scribble(b, r, x, -110 + row * 42 + r() * 8, Math.min(w, 236 - x), { color: "chalk", weight: 0.55, amp: 9 });
          x += w + 14 + r() * 18;
        }
      }
      b.lines.push({ pts: oval(-150, 70, 30, 26), weight: 0.6, color: "chalk" });
      b.lines.push(
        line(
          [
            [60, 80],
            [100, 40],
            [140, 90],
            [190, 30],
          ],
          { weight: 0.7, color: "chalk" },
        ),
      );
      b.lines.push(segment([-40, 156], [-6, 155], { weight: 1.4 }), segment([30, 156], [48, 156], { weight: 1.4 }));
      b.knock.push(flat(box(-286, -150, 572, 312)));
      return b;
    },
  },
  whiteboard: {
    label: "Whiteboard chart",
    words: "office meeting sales graph presentation",
    zone: "wall",
    build() {
      const b = build();
      shape(b, box(-210, -130, 420, 260), { weight: 1.05 });
      b.lines.push(poly(box(-200, -120, 400, 240), { closed: true, weight: 0.6 }));
      b.lines.push(segment([-160, 90], [170, 90], { weight: 0.8 }), segment([-160, 90], [-160, -100], { weight: 0.8 }));
      b.lines.push(
        poly(
          [
            [-150, -80],
            [-90, -60],
            [-40, -70],
            [10, -20],
            [60, -30],
            [110, 40],
            [160, 76],
          ],
          { weight: 1.1 },
        ),
      );
      b.lines.push(
        poly(
          [
            [140, 62],
            [162, 78],
            [136, 82],
          ],
          { weight: 1.1 },
        ),
      );
      shape(b, box(-200, 120, 400, 12), { tone: 0.3, weight: 0.8 });
      return b;
    },
  },
  banner: {
    label: "Banner",
    zone: "wall",
    build() {
      const b = build();
      const r = rng(5);
      b.lines.push(
        line(
          [
            [-240, -22],
            [-120, -26],
            [0, -24],
            [120, -27],
            [240, -22],
          ],
          { weight: 1 },
        ),
        line(
          [
            [-240, 26],
            [-120, 24],
            [0, 27],
            [120, 24],
            [240, 26],
          ],
          { weight: 1 },
        ),
      );
      b.lines.push(
        line(
          [
            [-240, -22],
            [-246, 0],
            [-240, 26],
          ],
          { weight: 0.9 },
        ),
        line(
          [
            [240, -22],
            [246, 0],
            [240, 26],
          ],
          { weight: 0.9 },
        ),
      );
      b.washes.push({
        rings: [
          area([
            [-240, -22],
            [240, -22],
            [240, 26],
            [-240, 26],
          ]),
        ],
        tone: 0.2,
      });
      lettering(b, "A B C D E F G", -144, -14, 30);
      r();
      b.knock.push(
        area([
          [-246, -26],
          [246, -26],
          [246, 28],
          [-246, 28],
        ]),
      );
      return b;
    },
  },
  wallmap: {
    label: "Wall map",
    zone: "wall",
    build() {
      const b = build();
      const r = rng(3);
      b.lines.push(poly(box(-210, -140, 420, 280), { closed: true, weight: 1.05 }));
      for (const x of [-170, 170])
        b.lines.push(
          poly(
            [
              [x - 10, -150],
              [x + 10, -150],
              [x + 10, -132],
              [x - 10, -132],
            ],
            { closed: true, weight: 0.8 },
          ),
        );
      const shape = US.map(([x, y]) => [x - 180, y - 108]);
      b.lines.push({ pts: spline(shape, { closed: true, overlap: 0.02, step: 2 }), weight: 0.9 });
      b.washes.push({ rings: [area(shape)], tone: 0.18 });
      for (const [x, y] of [
        [-120, -40],
        [-40, -70],
        [30, -20],
        [90, -60],
        [130, 10],
        [-70, 30],
      ]) {
        const jx = x + (r() - 0.5) * 16;
        const jy = y + (r() - 0.5) * 16;
        b.lines.push(segment([jx, jy], [jx + 6, jy + 16], { weight: 0.6 }));
        b.solids.push(ovalRing(jx, jy, 6, 6));
      }
      b.knock.push(flat(box(-212, -152, 424, 294)));
      return b;
    },
  },
  warboard: {
    label: "War board",
    words: "war room map strategy generals battle plan big board",
    zone: "wall",
    build() {
      const b = build();
      const frame = box(-300, -172, 600, 344);
      b.lines.push(poly(frame, { closed: true, weight: 1.2 }));
      b.washes.push({ rings: [flat(frame)], tone: 0.42 });
      const screen = box(-282, -154, 564, 308);
      b.lines.push(poly(screen, { closed: true, weight: 0.8 }));
      b.washes.push({ rings: [flat(screen)], paper: true });
      for (const x of [-188, -94, 0, 94, 188]) b.lines.push(segment([x, -154], [x, 154], { weight: 0.28 }));
      for (const y of [-77, 0, 77]) b.lines.push(segment([-282, y], [282, y], { weight: 0.28 }));
      const lands = [
        [
          [-252, -118],
          [-196, -136],
          [-134, -122],
          [-118, -86],
          [-146, -56],
          [-168, -26],
          [-196, -12],
          [-222, -40],
          [-250, -78],
        ],
        [
          [-170, 4],
          [-138, 14],
          [-122, 46],
          [-136, 92],
          [-156, 128],
          [-170, 92],
          [-184, 42],
        ],
        [
          [-44, -122],
          [-4, -132],
          [28, -114],
          [20, -88],
          [-10, -78],
          [-40, -88],
        ],
        [
          [-44, -62],
          [8, -66],
          [40, -34],
          [36, 18],
          [12, 74],
          [-14, 62],
          [-30, 12],
          [-52, -22],
        ],
        [
          [42, -128],
          [150, -136],
          [238, -112],
          [254, -62],
          [212, -26],
          [150, -12],
          [110, -32],
          [62, -56],
          [38, -92],
        ],
        [
          [170, 52],
          [220, 46],
          [240, 76],
          [216, 102],
          [176, 94],
        ],
      ];
      for (const land of lands) {
        b.lines.push(loop(land, { weight: 0.75, overlap: 0.04 }));
        b.washes.push({ rings: [area(land)], tone: 0.22 });
      }
      const arrow = (pts) => {
        b.lines.push(line(pts, { weight: 1.4 }));
        const a = pts[pts.length - 2];
        const c = pts[pts.length - 1];
        const ang = Math.atan2(c[1] - a[1], c[0] - a[0]);
        b.lines.push(
          line([[c[0] - 18 * Math.cos(ang - 0.5), c[1] - 18 * Math.sin(ang - 0.5)], c, [c[0] - 18 * Math.cos(ang + 0.5), c[1] - 18 * Math.sin(ang + 0.5)]], {
            weight: 1.4,
          }),
        );
      };
      arrow([
        [-196, -70],
        [-110, -128],
        [-22, -104],
      ]);
      arrow([
        [206, -78],
        [122, -116],
        [36, -102],
      ]);
      arrow([
        [-122, 40],
        [-40, 30],
        [24, 6],
      ]);
      for (const [x, y] of [
        [-6, -102],
        [150, -62],
        [-196, -62],
        [20, 30],
      ]) {
        b.lines.push({ pts: oval(x, y, 9, 9), weight: 0.75 });
        b.lines.push(segment([x - 14, y], [x + 14, y], { weight: 0.5 }), segment([x, y - 14], [x, y + 14], { weight: 0.5 }));
      }
      b.knock.push(flat(box(-302, -174, 604, 348)));
      return b;
    },
  },
  pinboard: {
    label: "Pinned papers",
    zone: "wall",
    build() {
      const b = build();
      const r = rng(27);
      const spots = [
        [-110, -110],
        [-20, -130],
        [80, -110],
        [-120, -10],
        [-30, -20],
        [70, 0],
        [-100, 100],
        [0, 90],
        [100, 110],
      ];
      for (const [cx, cy] of spots) {
        const w = 60 + r() * 30;
        const hgt = 70 + r() * 30;
        const tilt = (r() - 0.5) * 12;
        const sheet = [
          [cx - w / 2, cy - hgt / 2 + tilt],
          [cx + w / 2, cy - hgt / 2 - tilt],
          [cx + w / 2 + 3, cy + hgt / 2 - tilt],
          [cx - w / 2 - 2, cy + hgt / 2 + tilt],
        ];
        b.lines.push(poly(sheet, { closed: true, weight: 0.75 }));
        b.knock.push(flat(sheet));
        if (r() < 0.5)
          b.lines.push(
            line(
              [
                [cx - w / 3, cy],
                [cx - w / 6, cy - 14],
                [cx, cy + 6],
                [cx + w / 4, cy - 10],
              ],
              { weight: 0.5 },
            ),
          );
        else for (let k = 0; k < 3; k++) scribble(b, r, cx - w / 3, cy - hgt / 4 + k * 12, w * 0.6, { weight: 0.42, amp: 4 });
        if (r() < 0.4) b.washes.push({ rings: [flat(sheet, 5)], tone: 0.12 });
        b.lines.push(segment([cx - 6, cy - hgt / 2 + 2], [cx + 6, cy - hgt / 2 - 6], { weight: 0.9 }));
      }
      return b;
    },
  },
  bottles: {
    label: "Bottle shelf",
    zone: "wall",
    build() {
      const b = build();
      b.lines.push(
        line(
          [
            [-240, 0],
            [240, 0],
          ],
          { weight: 1 },
        ),
        line(
          [
            [-240, 8],
            [240, 8],
          ],
          { weight: 0.6 },
        ),
      );
      const r = rng(4);
      for (let x = -220; x <= 210; x += 34 + Math.floor(r() * 10)) {
        const h = 60 + r() * 50;
        const w = 9 + r() * 6;
        const neck = 3.5 + r();
        const pts = [
          [x - w, 0],
          [x - w, -h * 0.6],
          [x - neck, -h * 0.78],
          [x - neck, -h],
          [x + neck, -h],
          [x + neck, -h * 0.78],
          [x + w, -h * 0.6],
          [x + w, 0],
        ];
        b.lines.push(poly(pts, { weight: 0.8 }));
        b.washes.push({ rings: [flat(pts, 3)], tone: 0.15 + r() * 0.35 });
      }
      return b;
    },
  },
  antelope: {
    label: "Mounted antelope",
    zone: "wall",
    build() {
      const b = build();
      const plaque = [
        [0, 30],
        [44, 18],
        [56, 60],
        [30, 92],
        [0, 100],
        [-30, 92],
        [-56, 60],
        [-44, 18],
      ];
      b.lines.push(loop(plaque, { weight: 0.95 }));
      b.washes.push({ rings: [area(plaque)], tone: 0.5 });
      const headPts = [
        [-30, 60],
        [-36, 20],
        [-40, -10],
        [-30, -36],
        [-10, -46],
        [14, -40],
        [26, -20],
        [30, 10],
        [44, 32],
        [52, 50],
        [40, 60],
        [20, 56],
        [12, 72],
        [-14, 74],
      ];
      b.lines.push(loop(headPts, { weight: 1 }));
      b.solids.push(
        dot(-4, -6, 2.6),
        dot(20, -6, 2.6),
        area([
          [40, 48],
          [50, 50],
          [46, 58],
          [38, 56],
        ]),
      );
      b.lines.push(
        line(
          [
            [-34, -26],
            [-52, -40],
            [-54, -30],
            [-40, -20],
          ],
          { weight: 0.85 },
        ),
        line(
          [
            [24, -30],
            [44, -44],
            [46, -34],
            [30, -22],
          ],
          { weight: 0.85 },
        ),
      );
      for (const side of [-1, 1]) {
        const pts = [];
        for (let k = 0; k <= 14; k++) pts.push([side * (8 + k * 1.2) + Math.sin(k * 1.4) * 5, -44 - k * 8]);
        b.lines.push(line(pts, { weight: 1.2 }));
      }
      b.knock.push(area(headPts), area(plaque));
      return b;
    },
  },
  bear: {
    label: "Mounted bear",
    zone: "wall",
    build() {
      const b = build();
      const plaque = [
        [0, 40],
        [52, 26],
        [66, 70],
        [36, 104],
        [0, 112],
        [-36, 104],
        [-66, 70],
        [-52, 26],
      ];
      b.lines.push(loop(plaque, { weight: 0.95 }));
      b.washes.push({ rings: [area(plaque)], tone: 0.5 });
      const headPts = [
        [-52, 60],
        [-62, 10],
        [-56, -30],
        [-30, -56],
        [10, -60],
        [44, -46],
        [60, -10],
        [62, 30],
        [48, 70],
        [10, 84],
        [-30, 80],
      ];
      b.lines.push(loop(headPts, { weight: 1.05 }));
      b.washes.push({ rings: [area(headPts)], tone: 0.4 });
      for (const [x, y] of [
        [-44, -46],
        [36, -52],
      ]) {
        b.lines.push({ pts: oval(x, y, 15, 13), weight: 0.95 });
        b.knock.push(ovalRing(x, y, 15, 13));
      }
      b.lines.push(
        loop(
          [
            [-16, 20],
            [16, 18],
            [26, 40],
            [14, 58],
            [-14, 58],
            [-26, 40],
          ],
          { weight: 0.9 },
        ),
      );
      b.washes.push({
        rings: [
          area([
            [-16, 20],
            [16, 18],
            [26, 40],
            [14, 58],
            [-14, 58],
            [-26, 40],
          ]),
        ],
        tone: 0.15,
      });
      b.solids.push(
        area([
          [-10, 22],
          [10, 21],
          [6, 32],
          [-6, 32],
        ]),
        dot(-22, -8, 3),
        dot(20, -10, 3),
      );
      b.knock.push(area(headPts), area(plaque));
      return b;
    },
  },
  deer: {
    label: "Mounted deer",
    zone: "wall",
    build() {
      const b = build();
      const plaque = [
        [0, 34],
        [46, 22],
        [58, 62],
        [32, 94],
        [0, 102],
        [-32, 94],
        [-58, 62],
        [-46, 22],
      ];
      b.lines.push(loop(plaque, { weight: 0.95 }));
      b.washes.push({ rings: [area(plaque)], tone: 0.5 });
      const headPts = [
        [-24, 62],
        [-30, 20],
        [-32, -12],
        [-20, -34],
        [4, -40],
        [22, -30],
        [28, 0],
        [40, 28],
        [48, 50],
        [34, 60],
        [14, 56],
        [8, 70],
        [-12, 72],
      ];
      b.lines.push(loop(headPts, { weight: 1 }));
      b.washes.push({ rings: [area(headPts)], tone: 0.22 });
      b.solids.push(
        dot(-6, -6, 2.6),
        dot(16, -8, 2.6),
        area([
          [38, 46],
          [48, 48],
          [44, 56],
          [36, 54],
        ]),
      );
      for (const side of [-1, 1]) {
        const base = [side * 10, -38];
        b.lines.push(line([base, [side * 24, -70], [side * 48, -96], [side * 62, -118]], { weight: 1.1 }));
        b.lines.push(
          line(
            [
              [side * 22, -66],
              [side * 6, -92],
            ],
            { weight: 0.9 },
          ),
          line(
            [
              [side * 40, -88],
              [side * 34, -118],
            ],
            { weight: 0.9 },
          ),
          line(
            [
              [side * 50, -100],
              [side * 74, -100],
            ],
            { weight: 0.85 },
          ),
        );
        b.lines.push(
          line(
            [
              [side * 26, -26],
              [side * 46, -40],
              [side * 44, -26],
              [side * 30, -20],
            ],
            { weight: 0.8 },
          ),
        );
      }
      b.knock.push(area(headPts), area(plaque));
      return b;
    },
  },
};
