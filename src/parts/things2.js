import { rng } from "../core/random.js";
import { area, build, dot, flat, hideUnder, line, loop, oval, ovalRing, poly, scallop, segment, spline } from "./kit.js";

const box = (x, y, w, h) => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

function scribble(b, r, x, y, w, opts = {}) {
  const pts = [];
  const n = Math.max(3, Math.round(w / 9));
  for (let i = 0; i <= n; i++) pts.push([x + (w * i) / n, y + (r() - 0.5) * (opts.amp ?? 6)]);
  b.lines.push(line(pts, { weight: opts.weight ?? 0.5, color: opts.color }));
}

function bricks(b, x0, y0, w, h, row = 18, len = 42) {
  for (let y = y0 + row, k = 0; y < y0 + h; y += row, k++) {
    b.lines.push(segment([x0, y], [x0 + w, y], { weight: 0.42 }));
  }
  for (let y = y0, k = 0; y < y0 + h - 2; y += row, k++) {
    for (let x = x0 + (k % 2 ? len / 2 : len); x < x0 + w - 4; x += len) b.lines.push(segment([x, y], [x, Math.min(y0 + h, y + row)], { weight: 0.38 }));
  }
}

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

export const MORE_THINGS = {
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
  monitor: {
    label: "Old computer",
    zone: "table",
    build() {
      const b = build();
      const face = [
        [-62, -150],
        [50, -150],
        [54, -146],
        [54, -50],
        [50, -46],
        [-62, -46],
        [-66, -50],
        [-66, -146],
      ];
      b.lines.push(poly(face, { closed: true, weight: 1.05 }));
      b.lines.push(
        poly(
          [
            [-52, -138],
            [42, -138],
            [42, -60],
            [-52, -60],
          ],
          { closed: true, weight: 0.7 },
        ),
      );
      b.lines.push(
        line(
          [
            [54, -146],
            [76, -132],
            [78, -60],
            [54, -50],
          ],
          { weight: 0.95 },
        ),
      );
      b.washes.push({
        rings: [
          flat(
            [
              [-52, -138],
              [42, -138],
              [42, -60],
              [-52, -60],
            ],
            4,
          ),
        ],
        tone: 0.72,
      });
      b.washes.push({
        rings: [
          flat(
            [
              [54, -146],
              [76, -132],
              [78, -60],
              [54, -50],
            ],
            4,
          ),
        ],
        tone: 0.3,
      });
      b.lines.push(
        line(
          [
            [-36, -126],
            [-10, -132],
            [20, -128],
          ],
          { weight: 0.5, color: "chalk" },
        ),
      );
      b.lines.push(
        poly(
          [
            [-22, -46],
            [8, -46],
            [14, -24],
            [-28, -24],
          ],
          { closed: true, weight: 0.85 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-90, -10],
            [70, -10],
            [82, 0],
            [-100, 0],
          ],
          { closed: true, weight: 0.9 },
        ),
      );
      for (let x = -86; x < 70; x += 12) b.lines.push(segment([x, -6], [x + 6, -6], { weight: 0.5 }));
      b.knock.push(
        flat([
          [-66, -150],
          [54, -150],
          [78, -132],
          [78, -60],
          [14, -24],
          [82, 0],
          [-100, 0],
          [-28, -24],
          [-66, -46],
        ]),
      );
      return b;
    },
  },
  papers: {
    label: "Stack of papers",
    zone: "table",
    build() {
      const b = build();
      const r = rng(8);
      for (let i = 0; i < 9; i++) {
        const y = -i * 6;
        const s = (r() - 0.5) * 8;
        b.lines.push(
          poly(
            [
              [-60 + s, y],
              [56 + s, y - 1],
              [60 + s, y - 5],
              [-56 + s, y - 4],
            ],
            { weight: 0.5 },
          ),
        );
      }
      b.lines.push(
        poly(
          [
            [-54, -58],
            [52, -60],
            [58, -48],
            [-58, -50],
          ],
          { closed: true, weight: 0.7 },
        ),
      );
      b.knock.push(
        flat([
          [-64, 2],
          [66, 2],
          [64, -62],
          [-60, -62],
        ]),
      );
      return b;
    },
  },
  pencilcup: {
    label: "Pencil cup",
    zone: "table",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-16, -44],
            [16, -44],
            [14, 0],
            [-14, 0],
          ],
          { closed: true },
        ),
      );
      b.lines.push({ pts: oval(0, -44, 16, 3.5, { start: 2.8 }), weight: 0.7 });
      for (const [x, a] of [
        [-8, -0.3],
        [-2, 0.1],
        [5, 0.3],
        [9, -0.1],
      ]) {
        const tip = [x + Math.sin(a) * 52, -44 - Math.cos(a) * 52];
        b.lines.push(segment([x, -44], tip, { weight: 0.75 }));
        b.lines.push(segment([x + 3, -44], [tip[0] + 3, tip[1]], { weight: 0.5 }));
      }
      b.washes.push({
        rings: [
          flat(
            [
              [-16, -44],
              [16, -44],
              [14, 0],
              [-14, 0],
            ],
            3,
          ),
        ],
        tone: 0.3,
      });
      b.knock.push(
        flat([
          [-16, -44],
          [16, -44],
          [14, 0],
          [-14, 0],
        ]),
      );
      return b;
    },
  },
  schoolchair: {
    label: "Classroom chair",
    zone: "floor",
    build() {
      const b = build();
      for (const [x0, x1] of [
        [-44, -40],
        [44, 40],
      ])
        b.lines.push(segment([x0, -50], [x1, -6], { weight: 0.8 }));
      const seat = [
        [-70, -64],
        [70, -64],
        [62, -48],
        [-62, -48],
      ];
      b.lines.push(poly(seat, { closed: true, weight: 0.95 }));
      b.washes.push({ rings: [flat(seat, 4)], tone: 0.3 });
      for (const [x0, x1] of [
        [-64, -70],
        [64, 70],
      ])
        b.lines.push(segment([x0, -48], [x1, 0], { weight: 1 }));
      for (const x of [-34, 34]) b.lines.push(segment([x, -128], [x * 1.06, -62], { weight: 1 }));
      const back = [
        [-56, -198],
        [56, -198],
        [64, -188],
        [60, -134],
        [52, -126],
        [-52, -126],
        [-60, -134],
        [-64, -188],
      ];
      b.lines.push(loop(back, { weight: 1.05, overlap: 0.03 }));
      b.washes.push({ rings: [area(back)], tone: 0.36 });
      const grip = [
        [-24, -178],
        [24, -178],
        [27, -171],
        [24, -164],
        [-24, -164],
        [-27, -171],
      ];
      b.lines.push(loop(grip, { weight: 0.7, overlap: 0.04 }));
      b.washes.push({ rings: [area(grip)], tone: 0.62 });
      b.knock.push(
        area([
          [-64, -200],
          [64, -200],
          [60, -126],
          [36, -126],
          [36, -64],
          [70, -64],
          [70, 0],
          [-70, 0],
          [-70, -64],
          [-36, -64],
          [-36, -126],
          [-60, -126],
        ]),
      );
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
  boxes: {
    label: "File boxes",
    zone: "table",
    build() {
      const b = build();
      const one = (x, y, w, hgt) => {
        b.lines.push(poly(box(x, y, w, hgt), { closed: true, weight: 0.95 }));
        b.lines.push(
          poly(
            [
              [x, y],
              [x + 16, y - 14],
              [x + w + 16, y - 14],
              [x + w, y],
            ],
            { weight: 0.85 },
          ),
          segment([x + w + 16, y - 14], [x + w + 16, y + hgt - 14], { weight: 0.85 }),
          segment([x + w, y + hgt], [x + w + 16, y + hgt - 14], { weight: 0.85 }),
        );
        b.lines.push({ pts: oval(x + w / 2, y + 20, 12, 5), weight: 0.6 });
        b.washes.push({
          rings: [
            flat(
              [
                [x + w, y],
                [x + w + 16, y - 14],
                [x + w + 16, y + hgt - 14],
                [x + w, y + hgt],
              ],
              4,
            ),
          ],
          tone: 0.28,
        });
        b.knock.push(
          flat([
            [x, y],
            [x + 16, y - 14],
            [x + w + 16, y - 14],
            [x + w + 16, y + hgt - 14],
            [x + w, y + hgt],
            [x, y + hgt],
          ]),
        );
      };
      one(-80, -60, 90, 60);
      one(14, -60, 80, 60);
      one(-40, -126, 90, 62);
      return b;
    },
  },
  wastebasket: {
    label: "Wastebasket",
    zone: "floor",
    build() {
      const b = build();
      const r = rng(9);
      b.lines.push(
        poly(
          [
            [-34, -78],
            [34, -78],
            [26, 0],
            [-26, 0],
          ],
          { closed: true, weight: 0.95 },
        ),
      );
      for (let x = -28; x <= 28; x += 8) b.lines.push(segment([x, -76], [x * 0.78, -2], { weight: 0.4 }));
      for (let y = -60; y < 0; y += 14) b.lines.push(segment([-32 + (y + 78) * 0.1, y], [32 - (y + 78) * 0.1, y], { weight: 0.35 }));
      for (let i = 0; i < 4; i++) {
        const cx = -18 + i * 12 + r() * 4;
        const cy = -84 - r() * 10;
        b.lines.push({ pts: scallop(oval(cx, cy, 10, 9, { overlap: 0.1 }), 1.6, 6, i), weight: 0.6 });
        b.knock.push(ovalRing(cx, cy, 10, 9));
      }
      b.knock.push(
        flat([
          [-34, -78],
          [34, -78],
          [26, 0],
          [-26, 0],
        ]),
      );
      return b;
    },
  },
  fireplace: {
    label: "Fireplace",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        poly(
          [
            [-170, -262],
            [170, -262],
            [176, -246],
            [-176, -246],
          ],
          { closed: true, weight: 1.05 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-150, -246],
            [-150, 0],
            [150, 0],
            [150, -246],
          ],
          { weight: 1 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-90, 0],
            [-90, -150],
            [90, -150],
            [90, 0],
          ],
          { weight: 1 },
        ),
      );
      bricks(b, -150, -246, 60, 246, 18, 30);
      bricks(b, 90, -246, 60, 246, 18, 30);
      bricks(b, -90, -246, 180, 96, 18, 36);
      b.washes.push({
        rings: [
          flat(
            [
              [-88, -148],
              [88, -148],
              [88, 0],
              [-88, 0],
            ],
            5,
          ),
        ],
        tone: 0.7,
      });
      b.washes.push({
        rings: [
          flat(
            [
              [-150, -246],
              [150, -246],
              [150, 0],
              [-150, 0],
            ],
            8,
          ),
        ],
        tone: 0.14,
      });
      const flame = [
        [-40, -14],
        [-46, -50],
        [-30, -84],
        [-24, -60],
        [-6, -104],
        [8, -66],
        [24, -92],
        [30, -56],
        [46, -46],
        [40, -14],
      ];
      b.lines.push({ pts: spline(flame, { closed: true, overlap: 0.04 }), weight: 0.85, color: "chalk" });
      b.lines.push(
        line(
          [
            [-60, -10],
            [60, -18],
          ],
          { weight: 1.6 },
        ),
        line(
          [
            [-56, -20],
            [52, -6],
          ],
          { weight: 1.4 },
        ),
      );
      b.knock.push(
        flat([
          [-176, -262],
          [176, -262],
          [176, -246],
          [150, -246],
          [150, 0],
          [-150, 0],
          [-150, -246],
          [-176, -246],
        ]),
      );
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
  shipbottle: {
    label: "Ship in a bottle",
    zone: "table",
    build() {
      const b = build();
      const bottle = [
        [-60, -40],
        [40, -40],
        [56, -32],
        [70, -30],
        [74, -24],
        [70, -18],
        [56, -16],
        [40, -8],
        [-60, -8],
        [-66, -24],
      ];
      b.lines.push(loop(bottle, { weight: 0.9, overlap: 0.03 }));
      b.lines.push(
        line(
          [
            [-40, -16],
            [24, -16],
            [16, -12],
            [-34, -12],
            [-40, -16],
          ],
          { weight: 0.75 },
        ),
      );
      b.lines.push(segment([-12, -16], [-12, -36], { weight: 0.6 }), segment([6, -16], [6, -32], { weight: 0.6 }));
      b.lines.push(
        poly(
          [
            [-12, -34],
            [-2, -26],
            [-12, -20],
          ],
          { closed: true, weight: 0.5 },
        ),
        poly(
          [
            [6, -30],
            [14, -24],
            [6, -20],
          ],
          { closed: true, weight: 0.5 },
        ),
      );
      b.lines.push(
        poly(
          [
            [-40, -8],
            [-34, 0],
            [24, 0],
            [30, -8],
          ],
          { weight: 0.8 },
        ),
      );
      b.washes.push({ rings: [area(bottle)], tone: 0.08 });
      b.knock.push(area(bottle));
      return b;
    },
  },
  barcart: {
    label: "Bar cart",
    zone: "floor",
    build() {
      const b = build();
      const r = rng(19);
      b.lines.push(
        poly(
          [
            [-90, -140],
            [90, -140],
            [90, -130],
            [-90, -130],
          ],
          { closed: true },
        ),
        poly(
          [
            [-90, -60],
            [90, -60],
            [90, -50],
            [-90, -50],
          ],
          { closed: true },
        ),
      );
      b.lines.push(segment([-84, -130], [-84, -20], { weight: 0.9 }), segment([84, -130], [84, -20], { weight: 0.9 }));
      for (const x of [-80, 80]) b.lines.push({ pts: oval(x, -12, 12, 12), weight: 0.85 });
      let x = -78;
      while (x < 70) {
        const h = 40 + r() * 40;
        const w = 9 + r() * 7;
        const pts = [
          [x - w, -140],
          [x - w, -140 - h * 0.6],
          [x - 3, -140 - h * 0.8],
          [x - 3, -140 - h],
          [x + 3, -140 - h],
          [x + 3, -140 - h * 0.8],
          [x + w, -140 - h * 0.6],
          [x + w, -140],
        ];
        b.lines.push(poly(pts, { weight: 0.75 }));
        b.washes.push({ rings: [flat(pts, 3)], tone: 0.2 + r() * 0.4 });
        x += w * 2 + 6;
      }
      for (let gx = -70; gx < 70; gx += 34)
        b.lines.push(
          poly(
            [
              [gx - 8, -88],
              [gx + 8, -88],
              [gx + 6, -60],
              [gx - 6, -60],
            ],
            { closed: true, weight: 0.6 },
          ),
        );
      b.knock.push(
        flat([
          [-92, -142],
          [92, -142],
          [92, -48],
          [-92, -48],
        ]),
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
  sidetable: {
    label: "Side table & decanter",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push({ pts: oval(0, -96, 48, 10, { start: 2.6 }), weight: 1 });
      b.lines.push(
        line(
          [
            [-48, -96],
            [-46, -86],
            [0, -80],
            [46, -86],
            [48, -96],
          ],
          { weight: 0.8 },
        ),
      );
      b.lines.push(segment([-30, -84], [-36, 0], { weight: 0.9 }), segment([30, -84], [36, 0], { weight: 0.9 }), segment([0, -80], [0, -4], { weight: 0.7 }));
      const dec = [
        [-10, -150],
        [-6, -170],
        [-10, -176],
        [10, -176],
        [6, -170],
        [10, -150],
        [22, -130],
        [20, -104],
        [-20, -104],
        [-22, -130],
      ];
      b.lines.push(loop(dec, { weight: 0.85, overlap: 0.04 }));
      b.washes.push({
        rings: [
          area([
            [-20, -132],
            [20, -132],
            [18, -106],
            [-18, -106],
          ]),
        ],
        tone: 0.5,
      });
      b.lines.push(
        poly(
          [
            [24, -124],
            [40, -124],
            [38, -102],
            [26, -102],
          ],
          { closed: true, weight: 0.7 },
        ),
      );
      b.knock.push(
        area(dec),
        ovalRing(0, -92, 50, 14),
        flat([
          [-36, -86],
          [36, -86],
          [36, 0],
          [-36, 0],
        ]),
      );
      return b;
    },
  },
  clubchair: {
    label: "Club chair",
    zone: "floor",
    build() {
      const b = build();
      const r = rng(4);
      const outer = [
        [-104, -10],
        [-110, -100],
        [-96, -118],
        [-74, -116],
        [-70, -190],
        [-40, -214],
        [0, -218],
        [40, -214],
        [70, -190],
        [74, -116],
        [96, -118],
        [110, -100],
        [104, -10],
      ];
      b.lines.push(line(outer, { weight: 1.05 }));
      b.lines.push(
        line([
          [-74, -116],
          [-70, -70],
          [-68, -40],
        ]),
        line([
          [74, -116],
          [70, -70],
          [68, -40],
        ]),
      );
      b.lines.push(
        loop(
          [
            [-70, -46],
            [0, -50],
            [70, -46],
            [72, -24],
            [0, -20],
            [-72, -24],
          ],
          { overlap: 0.03, weight: 0.9 },
        ),
      );
      b.lines.push(
        line([
          [-104, -10],
          [0, -6],
          [104, -10],
        ]),
      );
      for (let i = 0; i < 10; i++) b.solids.push(dot(-46 + (i % 5) * 23 + r() * 3, -186 + Math.floor(i / 5) * 40, 1.8));
      b.washes.push({ rings: [area(outer.concat([[0, -6]]))], tone: 0.62 });
      b.knock.push(
        area(
          outer.concat([
            [80, 4],
            [-80, 4],
          ]),
        ),
      );
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
  flyingcar: {
    label: "Flying car",
    zone: "sky",
    build() {
      const b = build();
      const body = [
        [-120, -6],
        [-112, -30],
        [10, -66],
        [118, -34],
        [122, -6],
        [110, 4],
        [-112, 4],
      ];
      b.lines.push(poly(body, { closed: true, weight: 1.05 }));
      b.lines.push(
        poly(
          [
            [-70, -26],
            [8, -52],
            [70, -32],
            [-66, -14],
          ],
          { closed: true, weight: 0.75 },
        ),
      );
      b.washes.push({
        rings: [
          flat(
            [
              [-70, -26],
              [8, -52],
              [70, -32],
              [-66, -14],
            ],
            4,
          ),
        ],
        tone: 0.62,
      });
      b.washes.push({ rings: [flat(body, 5)], tone: 0.14 });
      b.lines.push(segment([-112, -10], [118, -10], { weight: 0.45 }), segment([0, -16], [2, 2], { weight: 0.5 }));
      for (const x of [-74, 72]) {
        b.lines.push(
          poly(
            [
              [x - 26, 4],
              [x + 26, 4],
              [x + 20, 18],
              [x - 20, 18],
            ],
            { closed: true, weight: 0.85 },
          ),
        );
        b.washes.push({
          rings: [
            flat(
              [
                [x - 26, 4],
                [x + 26, 4],
                [x + 20, 18],
                [x - 20, 18],
              ],
              3,
            ),
          ],
          tone: 0.6,
        });
        b.lines.push(
          line(
            [
              [x - 12, 20],
              [x - 8, 40],
              [x, 30],
              [x + 6, 46],
              [x + 12, 22],
            ],
            { weight: 0.6 },
          ),
        );
      }
      for (const y of [-40, -22, -4]) b.lines.push(segment([-160, y], [-132, y], { weight: 0.45 }));
      b.knock.push(
        flat(body),
        flat([
          [-100, 4],
          [100, 4],
          [92, 20],
          [-94, 20],
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
  fire: {
    label: "Fire",
    zone: "floor",
    build() {
      const b = build();
      const outer = [
        [-40, 0],
        [-50, -40],
        [-30, -80],
        [-24, -50],
        [-6, -120],
        [10, -70],
        [26, -100],
        [32, -52],
        [50, -40],
        [42, 0],
      ];
      const inner = [
        [-20, 0],
        [-24, -30],
        [-10, -54],
        [-2, -30],
        [12, -60],
        [20, -26],
        [20, 0],
      ];
      b.lines.push(loop(outer, { weight: 0.95 }), loop(inner, { weight: 0.7 }));
      b.washes.push({ rings: [area(outer)], tone: 0.3 });
      b.knock.push(area(outer));
      return b;
    },
  },
  deadtree: {
    label: "Bare tree",
    zone: "floor",
    build() {
      const b = build();
      b.lines.push(
        line(
          [
            [-10, 0],
            [-6, -80],
            [-14, -150],
            [-8, -210],
          ],
          { weight: 1.3 },
        ),
        line(
          [
            [10, 0],
            [8, -70],
            [14, -140],
            [6, -200],
          ],
          { weight: 1.1 },
        ),
      );
      const branch = (pts, w) => b.lines.push(line(pts, { weight: w }));
      branch(
        [
          [-6, -120],
          [-50, -160],
          [-80, -170],
        ],
        0.9,
      );
      branch(
        [
          [-40, -150],
          [-50, -200],
        ],
        0.6,
      );
      branch(
        [
          [8, -110],
          [60, -150],
          [90, -150],
        ],
        0.9,
      );
      branch(
        [
          [50, -142],
          [64, -190],
        ],
        0.6,
      );
      branch(
        [
          [-4, -190],
          [-30, -240],
        ],
        0.7,
      );
      branch(
        [
          [4, -186],
          [30, -250],
        ],
        0.7,
      );
      b.washes.push({
        rings: [
          area([
            [-10, 0],
            [-6, -80],
            [-14, -150],
            [-8, -210],
            [6, -200],
            [14, -140],
            [8, -70],
            [10, 0],
          ]),
        ],
        tone: 0.4,
      });
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
  wallpaper: {
    label: "Wallpaper",
    zone: "back",
    build() {
      const b = build();
      const r = rng(2);
      const inRound = (x, y) => {
        const r0 = 90;
        const cx = Math.max(-440 + r0, Math.min(440 - r0, x));
        const cy = Math.max(-560 + r0, y);
        return Math.abs(x) <= 440 && y >= -560 && Math.hypot(x - cx, y - cy) <= r0;
      };
      for (let y = -545; y < -10; y += 40) {
        const shift = (Math.round(y / 40) % 2) * 22;
        for (let x = -430 + shift; x < 430; x += 44) {
          if (!inRound(x, y)) continue;
          const jx = x + (r() - 0.5) * 3;
          const jy = y + (r() - 0.5) * 3;
          b.lines.push(
            line(
              [
                [jx, jy + 8],
                [jx - 5, jy],
                [jx, jy - 7],
                [jx + 5, jy],
                [jx, jy + 8],
              ],
              { weight: 0.42 },
            ),
          );
        }
      }
      return b;
    },
  },
  wainscot: {
    label: "Wainscoting",
    zone: "back",
    build() {
      const b = build();
      b.lines.push(
        line(
          [
            [-462, -150],
            [-200, -151],
            [200, -149],
            [462, -150],
          ],
          { weight: 0.9 },
        ),
        line(
          [
            [-462, -140],
            [462, -140],
          ],
          { weight: 0.5 },
        ),
      );
      for (let x = -440; x < 420; x += 80) b.lines.push(poly(box(x + 8, -126, 62, 110), { closed: true, weight: 0.5 }));
      b.washes.push({
        rings: [
          flat(
            [
              [-462, -150],
              [462, -150],
              [462, 0],
              [-462, 0],
            ],
            10,
          ),
        ],
        tone: 0.14,
      });
      return b;
    },
  },
  floorboards: {
    label: "Floorboards",
    zone: "back",
    build() {
      const b = build();
      const r = rng(6);
      let y = 0;
      let gap = 10;
      while (y < 190) {
        b.lines.push(
          line(
            [
              [-465, y],
              [0, y + (r() - 0.5) * 2],
              [465, y],
            ],
            { weight: 0.5 },
          ),
        );
        for (let x = -440 + r() * 120; x < 440; x += 160 + r() * 120) b.lines.push(segment([x, y], [x, y + gap], { weight: 0.4 }));
        y += gap;
        gap *= 1.22;
      }
      b.washes.push({
        rings: [
          area([
            [-465, 0],
            [465, 0],
            [462, 120],
            [420, 160],
            [0, 166],
            [-420, 160],
            [-462, 120],
          ]),
        ],
        tone: 0.18,
      });
      return b;
    },
  },
};
